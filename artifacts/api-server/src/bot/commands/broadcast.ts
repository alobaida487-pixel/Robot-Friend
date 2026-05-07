import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { logger } from "../../lib/logger";

export const data = new SlashCommandBuilder()
  .setName("broadcast")
  .setDescription("أرسل رسالة لجميع أعضاء السيرفر عبر الخاص 📢")
  .addStringOption((o) =>
    o
      .setName("الرسالة")
      .setDescription("الرسالة اللي تبي ترسلها")
      .setRequired(true),
  )
  .addStringOption((o) =>
    o
      .setName("العنوان")
      .setDescription("عنوان الرسالة (اختياري)")
      .setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  const message = interaction.options.getString("الرسالة", true);
  const title = interaction.options.getString("العنوان") ?? `📢 رسالة من ${interaction.guild?.name}`;

  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  if (!guild) {
    await interaction.editReply({ content: "❌ هذا الأمر يشتغل بس داخل السيرفر." });
    return;
  }

  const members = await guild.members.fetch();
  const humanMembers = members.filter((m) => !m.user.bot);

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle(title)
    .setDescription(message)
    .setFooter({
      text: `أُرسلت من: ${guild.name} • بواسطة: ${interaction.user.tag}`,
      iconURL: guild.iconURL() ?? undefined,
    })
    .setTimestamp();

  let sent = 0;
  let failed = 0;

  for (const [, member] of humanMembers) {
    try {
      await member.send({ embeds: [embed] });
      sent++;
    } catch {
      failed++;
    }
  }

  logger.info({ sent, failed, guild: guild.name }, "Broadcast completed");

  await interaction.editReply({
    content: [
      `✅ **تم إرسال الرسالة!**`,
      `📨 وصلت لـ **${sent}** عضو`,
      failed > 0 ? `❌ فشل الإرسال لـ **${failed}** عضو (أغلقوا الخاص)` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
