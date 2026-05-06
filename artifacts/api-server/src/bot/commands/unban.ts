import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unban")
  .setDescription("رفع الحظر عن عضو")
  .addStringOption((option) =>
    option
      .setName("الأيدي")
      .setDescription("الأيدي (ID) للعضو المحظور")
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.options.getString("الأيدي", true);

  if (!interaction.guild) {
    await interaction.reply({ content: "❌ هذا الأمر يشتغل بس داخل السيرفر.", ephemeral: true });
    return;
  }

  try {
    await interaction.guild.members.unban(userId);
    await interaction.reply({ content: `✅ تم رفع الحظر عن العضو بالأيدي: \`${userId}\`` });
  } catch {
    await interaction.reply({
      content: "❌ ما أقدر أرفع الحظر. تأكد إن الأيدي صحيح وإن العضو محظور فعلاً.",
      ephemeral: true,
    });
  }
}
