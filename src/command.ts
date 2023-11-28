import {
  ApplicationCommandOption,
  ChatInputCommandInteraction,
} from "discord.js";

export interface Command {
  data: {
    name: string;
    description: string;
    type?: number;
    options?: ApplicationCommandOption;
  };
  cooldown: number | undefined;
  execute(interaction: ChatInputCommandInteraction): any;
}
