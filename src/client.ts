import { Client, ClientOptions, Collection } from "discord.js";
import type { Command } from "./commands/types";

export class GnomebotClient extends Client {
    commands: Collection<string, Command> = new Collection();
    constructor(options: ClientOptions, commands: Collection<string, Command>) {
        super(options);
        this.commands = commands;
    }
}
