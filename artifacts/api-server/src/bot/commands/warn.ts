import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type GuildMember,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("تحذير عضو")
  .addUserOption((option) =>
    option.setName("العضو").setDescription("العضو اللي تبي تحذره").setRequired(true),
  )
  .addStringOption((option) =>
    option.setName("السبب").setDescription("سبب التحذير").setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getMember("العضو") as GuildMember | null;
  const reason = interaction.options.getString("السبب", true);

  if (!target) {
    await interaction.reply({ content: "❌ ما لقيت العضو.", ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xffcc00)
    .setTitle("⚠️ تحذير")
    .addFields(
      { name: "العضو", value: `${target.user.tag}`, inline: true },
      { name: "المسؤول", value: `${interaction.user.tag}`, inline: true },
      { name: "السبب", value: reason },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  try {
    await target.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xffcc00)
          .setTitle(`⚠️ تحذير من سيرفر ${interaction.guild?.name}`)
          .addFields({ name: "السبب", value: reason })
          .setTimestamp(),
      ],
    });
  } catch {
    // العضو أغلق الرسائل الخاصة
  }
}
