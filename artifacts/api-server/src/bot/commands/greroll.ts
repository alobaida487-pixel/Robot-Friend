import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { giveaways } from "../giveaway-manager";

export const data = new SlashCommandBuilder()
  .setName("greroll")
  .setDescription("أعد السحب على قيفاوي منتهي")
  .addStringOption((o) =>
    o
      .setName("message_id")
      .setDescription("أيدي رسالة القيفاوي")
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction) {
  const messageId = interaction.options.getString("message_id", true);
  const giveaway = giveaways.get(messageId);

  if (!giveaway) {
    await interaction.reply({
      content: "❌ ما لقيت هذا القيفاوي. تأكد من الأيدي.",
      ephemeral: true,
    });
    return;
  }

  if (!giveaway.ended) {
    await interaction.reply({
      content: "❌ القيفاوي لسه ما انتهى.",
      ephemeral: true,
    });
    return;
  }

  const participants = Array.from(giveaway.participants);

  if (participants.length === 0) {
    await interaction.reply({
      content: "❌ ما في مشاركين في هذا القيفاوي.",
      ephemeral: true,
    });
    return;
  }

  const shuffled = participants.sort(() => Math.random() - 0.5);
  const winners = shuffled.slice(0, giveaway.winnersCount);
  const winnerMentions = winners.map((id) => `<@${id}>`).join(", ");

  await interaction.reply(
    `🔄 إعادة السحب! الفائزون الجدد: ${winnerMentions} 🎉 مبروك على **${giveaway.prize}**!`,
  );
}
