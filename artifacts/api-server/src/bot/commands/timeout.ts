import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type GuildMember,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("timeout")
  .setDescription("تكتيم عضو مؤقتاً")
  .addUserOption((option) =>
    option.setName("العضو").setDescription("العضو اللي تبي تكتمه").setRequired(true),
  )
  .addIntegerOption((option) =>
    option
      .setName("المدة")
      .setDescription("مدة التكتيم بالدقائق (1-40320)")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(40320),
  )
  .addStringOption((option) =>
    option.setName("السبب").setDescription("سبب التكتيم").setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getMember("العضو") as GuildMember | null;
  const minutes = interaction.options.getInteger("المدة", true);
  const reason = interaction.options.getString("السبب") ?? "لم يُذكر سبب";

  if (!target) {
    await interaction.reply({ content: "❌ ما لقيت العضو.", ephemeral: true });
    return;
  }

  if (!target.moderatable) {
    await interaction.reply({
      content: "❌ ما أقدر أكتم هذا العضو (صلاحياته أعلى مني).",
      ephemeral: true,
    });
    return;
  }

  const ms = minutes * 60 * 1000;
  await target.timeout(ms, `${interaction.user.tag}: ${reason}`);

  await interaction.reply({
    content: `✅ تم تكتيم **${target.user.tag}** لمدة **${minutes} دقيقة**\n📝 السبب: ${reason}`,
  });
}
