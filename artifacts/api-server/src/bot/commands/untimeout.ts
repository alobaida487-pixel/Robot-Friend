import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type GuildMember,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("untimeout")
  .setDescription("إزالة التكتيم عن عضو")
  .addUserOption((option) =>
    option.setName("العضو").setDescription("العضو اللي تبي ترفع عنه التكتيم").setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getMember("العضو") as GuildMember | null;

  if (!target) {
    await interaction.reply({ content: "❌ ما لقيت العضو.", ephemeral: true });
    return;
  }

  if (!target.isCommunicationDisabled()) {
    await interaction.reply({
      content: "❌ هذا العضو مو مكتوم أصلاً.",
      ephemeral: true,
    });
    return;
  }

  await target.timeout(null);
  await interaction.reply({
    content: `✅ تم رفع التكتيم عن **${target.user.tag}**`,
  });
}
