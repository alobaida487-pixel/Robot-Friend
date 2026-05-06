import {
  Client,
  GatewayIntentBits,
  Events,
  type ChatInputCommandInteraction,
} from "discord.js";
import { commands } from "./commands/index";
import { deployCommands } from "./deploy-commands";
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
    if (!interaction.isChatInputCommand()) return;

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
  });

  client.login(token).catch((err) => {
    logger.error({ err }, "Failed to login to Discord");
  });

  return client;
}
