import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type GuildMember,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("معلومات عضو")
  .addUserOption((option) =>
    option.setName("العضو").setDescription("العضو اللي تبي معلوماته").setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = (interaction.options.getMember("العضو") ?? interaction.member) as GuildMember;

  if (!member) {
    await interaction.reply({ content: "❌ ما لقيت العضو.", ephemeral: true });
    return;
  }

  const roles = member.roles.cache
    .filter((r) => r.id !== interaction.guildId)
    .map((r) => r.toString())
    .join(", ") || "لا يوجد";

  const embed = new EmbedBuilder()
    .setColor(member.displayColor || 0x5865f2)
    .setTitle(member.user.tag)
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      { name: "🆔 الأيدي", value: member.id, inline: true },
      { name: "📅 انضم للديسكورد", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>`, inline: true },
      { name: "📥 انضم للسيرفر", value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : "غير معروف", inline: true },
      { name: "🎭 الرتب", value: roles },
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
