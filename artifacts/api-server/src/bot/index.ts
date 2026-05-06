import {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
} from "discord.js";
import { commands } from "./commands/index";
import { deployCommands } from "./deploy-commands";
import { giveaways } from "./giveaway-manager";
import { logger } from "../lib/logger";

export function startBot(): Client {
  const token = process.env["DISCORD_TOKEN"];

  if (!token) {
    logger.error("DISCORD_TOKEN is not set — bot will not start");
    return new Client({ intents: [] });
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildModeration,
    ],
  });

  client.once(Events.ClientReady, async (c) => {
    logger.info({ tag: c.user.tag }, "✅ البوت شغال");
    await deployCommands();
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    // --- Slash commands ---
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction as ChatInputCommandInteraction);
      } catch (err) {
        logger.error({ err, command: interaction.commandName }, "Error executing command");
        const content = "❌ صار خطأ أثناء تنفيذ الأمر. حاول مرة ثانية.";
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content, ephemeral: true });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      }
      return;
    }

    // --- Button interactions ---
    if (interaction.isButton() && interaction.customId === "giveaway_join") {
      const giveaway = giveaways.get(interaction.message.id);

      if (!giveaway || giveaway.ended) {
        await interaction.reply({ content: "❌ هذا القيفاوي انتهى.", ephemeral: true });
        return;
      }

      const userId = interaction.user.id;

      if (giveaway.participants.has(userId)) {
        // Toggle — remove from giveaway
        giveaway.participants.delete(userId);
        await interaction.reply({
          content: "↩️ تم إلغاء مشاركتك في القيفاوي.",
          ephemeral: true,
        });
      } else {
        giveaway.participants.add(userId);
        await interaction.reply({
          content: "✅ تم تسجيلك في القيفاوي! حظاً موفقاً 🎉",
          ephemeral: true,
        });
      }

      // Update embed participant count
      try {
        const embed = EmbedBuilder.from(interaction.message.embeds[0]);
        const fields = embed.data.fields ?? [];
        const participantsField = fields.find((f) => f.name === "👥 المشاركين");
        if (participantsField) {
          participantsField.value = `${giveaway.participants.size}`;
        }

        const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("giveaway_join")
            .setLabel(`🎉 ${giveaway.participants.size}`)
            .setStyle(ButtonStyle.Primary),
        );

        await interaction.message.edit({ embeds: [embed], components: [button] });
      } catch (err) {
        logger.error({ err }, "Failed to update giveaway message");
      }
    }
  });

  client.login(token).catch((err) => {
    logger.error({ err }, "Failed to login to Discord");
  });

  return client;
}
