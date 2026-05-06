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
      .setName("المدة")
      .setDescription("المدة بالدقائق")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(43200),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction) {
  const prize = interaction.options.getString("الجائزة", true);
  const winnersCount = interaction.options.getInteger("الفائزين", true);
  const durationMinutes = interaction.options.getInteger("المدة", true);

  const endsAt = new Date(Date.now() + durationMinutes * 60 * 1000);

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle("🎉 Giveaway")
    .addFields(
      { name: "🏆 الجائزة", value: prize, inline: true },
      { name: "👑 عدد الفائزين", value: `${winnersCount}`, inline: true },
      { name: "👥 المشاركين", value: "0", inline: true },
      { name: "⏳ المدة", value: `${durationMinutes} دقيقة`, inline: true },
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

  // Auto-end after duration
  setTimeout(async () => {
    await endGiveaway(msg.id, interaction);
  }, durationMinutes * 60 * 1000);

  logger.info({ prize, durationMinutes, winnersCount }, "Giveaway started");
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

  const disabledButton =
    new ActionRowBuilder<ButtonBuilder>().addComponents(
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
