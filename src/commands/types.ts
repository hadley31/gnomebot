import type { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export type CommandBuilder = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;

export type Command = {
    name: string;
    desc: string;
    help?: string;
    execute: (interaction: ChatInputCommandInteraction) => Promise<any>;
    getSlashCommand: () => CommandBuilder;
}