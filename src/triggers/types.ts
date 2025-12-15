import { Message, VoiceState } from 'discord.js';

export type TextTrigger = {
    name: string;
    desc: string;
    test: (message: Message) => Promise<boolean>;
    execute: (message: Message) => Promise<any>;
}

export type VoiceTrigger = {
    name: string;
    desc: string;
    test: (oldVoiceState: VoiceState, newVoiceState: VoiceState) => Promise<boolean>;
    execute: (oldVoiceState: VoiceState, newVoiceState: VoiceState) => Promise<any>;
}
