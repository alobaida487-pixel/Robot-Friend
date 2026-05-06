import { Collection } from "discord.js";
import type { ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from "discord.js";

import * as ban from "./ban";
import * as kick from "./kick";
import * as timeout from "./timeout";
import * as untimeout from "./untimeout";
import * as clear from "./clear";
import * as warn from "./warn";
import * as unban from "./unban";
import * as serverinfo from "./serverinfo";
import * as userinfo from "./userinfo";

type Command = {
  data: SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const commands = new Collection<string, Command>();

const all: Command[] = [ban, kick, timeout, untimeout, clear, warn, unban, serverinfo, userinfo];

for (const cmd of all) {
  commands.set(cmd.data.name, cmd);
}
