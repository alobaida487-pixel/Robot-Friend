import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";
import { giveaways } from "../giveaway-manager";
import { logger } from "../../lib/logger";

export const data = new SlashCommandBuilder()
  .setName("gstart")
  .setDescription("ابدأ قيفاوي جديد 🎉")
  .addStringOption((o) =>
    o.setName("الجائزة").setDescription("إيش الجائزة؟").setRequired(true),
  )
  .addIntegerOption((o) =>
    o
      .setName("الفائزين")
      .setDescription("عدد الفائزين")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(20),
  )
  .addIntegerOption((o) =>
    o
      .setName("الأيام")
      .setDescription("عدد الأيام")
      .setRequired(false)
      .setMinValue(0)
      .setMaxValue(30),
  )
  .addIntegerOption((o) =>
    o
      .setName("الساعات")
      .setDescription("عدد الساعات")
      .setRequired(false)
      .setMinValue(0)
      .setMaxValue(23),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

function formatDuration(days: number, hours: number): string {
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} يوم`);
  if (hours > 0) parts.push(`${hours} ساعة`);
  return parts.join(" و ") || "أقل من ساعة";
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const prize = interaction.options.getString("الجائزة", true);
  const winnersCount = interaction.options.getInteger("الفائزين", true);
  const days = interaction.options.getInteger("الأيام") ?? 0;
  const hours = interaction.options.getInteger("الساعات") ?? 0;

  const totalMs = (days * 24 * 60 + hours * 60) * 60 * 1000;

  if (totalMs <= 0) {
    await interaction.reply({
      content: "❌ لازم تحدد مدة! حط على الأقل ساعة وحدة أو يوم.",
      ephemeral: true,
    });
    return;
  }

  const endsAt = new Date(Date.now() + totalMs);
  const durationText = formatDuration(days, hours);

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle("🎉 Giveaway")
    .addFields(
      { name: "🏆 الجائزة", value: prize, inline: true },
      { name: "👑 عدد الفائزين", value: `${winnersCount}`, inline: true },
      { name: "👥 المشاركين", value: "0", inline: true },
      { name: "⏳ المدة", value: durationText, inline: true },
      {
        name: "🕐 ينتهي",
        value: `<t:${Math.floor(endsAt.getTime() / 1000)}:R>`,
        inline: true,
      },
    )
    .setFooter({ text: `بدأه: ${interaction.user.tag}` })
    .setTimestamp();

  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("giveaway_join")
      .setLabel("اضغط 🎉 للمشاركة")
      .setStyle(ButtonStyle.Primary),
  );

  await interaction.reply({ content: "✅ تم إنشاء القيفاوي!", ephemeral: true });

  const channel = interaction.channel as TextChannel;
  const msg = await channel.send({ embeds: [embed], components: [button] });

  giveaways.set(msg.id, {
    messageId: msg.id,
    channelId: msg.channelId,
    guildId: interaction.guildId!,
    prize,
    winnersCount,
    hostId: interaction.user.id,
    endsAt,
    participants: new Set(),
    ended: false,
  });

  setTimeout(async () => {
    await endGiveaway(msg.id, interaction);
  }, totalMs);

  logger.info({ prize, days, hours, winnersCount }, "Giveaway started");
}

async function endGiveaway(
  messageId: string,
  interaction: ChatInputCommandInteraction,
) {
  const giveaway = giveaways.get(messageId);
  if (!giveaway || giveaway.ended) return;

  giveaway.ended = true;
  giveaways.set(messageId, giveaway);

  const channel = interaction.client.channels.cache.get(
    giveaway.channelId,
  ) as TextChannel;
  if (!channel) return;

  const participants = Array.from(giveaway.participants);

  const disabledButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("giveaway_join")
      .setLabel("انتهى القيفاوي")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
  );

  if (participants.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle("🎉 Giveaway — انتهى")
      .setDescription("**ما أحد شارك في القيفاوي 😢**")
      .addFields({ name: "🏆 الجائزة", value: giveaway.prize });

    try {
      const msg = await channel.messages.fetch(messageId);
      await msg.edit({ embeds: [embed], components: [disabledButton] });
    } catch {}
    await channel.send("لا يوجد فائزون في هذا القيفاوي 😢");
    return;
  }

  const shuffled = participants.sort(() => Math.random() - 0.5);
  const winners = shuffled.slice(0, giveaway.winnersCount);
  const winnerMentions = winners.map((id) => `<@${id}>`).join(", ");

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle("🎉 Giveaway — انتهى!")
    .addFields(
      { name: "🏆 الجائزة", value: giveaway.prize, inline: true },
      { name: "👥 المشاركين", value: `${participants.length}`, inline: true },
      { name: "🥇 الفائزون", value: winnerMentions },
    )
    .setTimestamp();

  try {
    const msg = await channel.messages.fetch(messageId);
    await msg.edit({ embeds: [embed], components: [disabledButton] });
  } catch {}

  await channel.send(
    `🎊 مبروك ${winnerMentions}! فزتم بـ **${giveaway.prize}** 🎉`,
  );
}
