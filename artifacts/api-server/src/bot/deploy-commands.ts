import { REST, Routes } from "discord.js";
import { commands } from "./commands/index";
import { logger } from "../lib/logger";

export async function deployCommands() {
  const token = process.env["DISCORD_TOKEN"];
  const clientId = process.env["DISCORD_CLIENT_ID"];

  if (!token || !clientId) {
    logger.error("DISCORD_TOKEN or DISCORD_CLIENT_ID is missing — skipping command registration");
    return;
  }

  const rest = new REST({ version: "10" }).setToken(token);
  const body = commands.map((cmd) => cmd.data.toJSON());

  try {
    logger.info({ count: body.length }, "Registering slash commands (global)…");
    await rest.put(Routes.applicationCommands(clientId), { body });
    logger.info("Slash commands registered successfully");
  } catch (err) {
    logger.error({ err }, "Failed to register slash commands");
  }
}
