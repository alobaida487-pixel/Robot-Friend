import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type GuildMember,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("طرد عضو من السيرفر")
  .addUserOption((option) =>
    option.setName("العضو").setDescription("العضو اللي تبي تطرده").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("السبب").setDescription("سبب الطرد").setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getMember("العضو") as GuildMember | null;
  const reason = interaction.options.getString("السبب") ?? "لم يُذكر سبب";

  if (!target) {
    await interaction.reply({ content: "❌ ما لقيت العضو.", ephemeral: true });
    return;
  }

  if (!target.kickable) {
    await interaction.reply({
      content: "❌ ما أقدر أطرد هذا العضو (صلاحياته أعلى مني).",
      ephemeral: true,
    });
    return;
  }

  await target.kick(`${interaction.user.tag}: ${reason}`);
  await interaction.reply({
    content: `✅ تم طرد **${target.user.tag}**\n📝 السبب: ${reason}`,
  });
}
