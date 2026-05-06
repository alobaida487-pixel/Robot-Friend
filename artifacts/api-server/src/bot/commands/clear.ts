import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("حذف عدد من الرسائل من القناة")
  .addIntegerOption((option) =>
    option
      .setName("العدد")
      .setDescription("عدد الرسائل اللي تبي تحذفها (1-100)")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger("العدد", true);

  if (!(interaction.channel instanceof TextChannel)) {
    await interaction.reply({
      content: "❌ هذا الأمر يشتغل بس في القنوات النصية.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const deleted = await interaction.channel.bulkDelete(amount, true);

  await interaction.editReply({
    content: `✅ تم حذف **${deleted.size}** رسالة.`,
  });
}
