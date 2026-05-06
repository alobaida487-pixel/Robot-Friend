import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("معلومات السيرفر");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "❌ هذا الأمر يشتغل بس داخل السيرفر.", ephemeral: true });
    return;
  }

  await guild.fetch();

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(guild.name)
    .setThumbnail(guild.iconURL())
    .addFields(
      { name: "👑 المالك", value: `<@${guild.ownerId}>`, inline: true },
      { name: "👥 الأعضاء", value: `${guild.memberCount}`, inline: true },
      { name: "📅 تاريخ الإنشاء", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
      { name: "💬 القنوات", value: `${guild.channels.cache.size}`, inline: true },
      { name: "🎭 الرتب", value: `${guild.roles.cache.size}`, inline: true },
      { name: "😀 الإيموجي", value: `${guild.emojis.cache.size}`, inline: true },
    )
    .setFooter({ text: `أيدي السيرفر: ${guild.id}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
