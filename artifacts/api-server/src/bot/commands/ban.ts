import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type GuildMember,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("حظر عضو من السيرفر")
  .addUserOption((option) =>
    option.setName("العضو").setDescription("العضو اللي تبي تحظره").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("السبب").setDescription("سبب الحظر").setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getMember("العضو") as GuildMember | null;
  const reason = interaction.options.getString("السبب") ?? "لم يُذكر سبب";

  if (!target) {
    await interaction.reply({ content: "❌ ما لقيت العضو.", ephemeral: true });
    return;
  }

  if (!target.bannable) {
    await interaction.reply({
      content: "❌ ما أقدر أحظر هذا العضو (صلاحياته أعلى مني).",
      ephemeral: true,
    });
    return;
  }

  await target.ban({ reason: `${interaction.user.tag}: ${reason}` });
  await interaction.reply({
    content: `✅ تم حظر **${target.user.tag}**\n📝 السبب: ${reason}`,
  });
}
