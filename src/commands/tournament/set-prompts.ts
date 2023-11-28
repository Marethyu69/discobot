import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

module.exports = {
  cooldown: 1,
  data: new SlashCommandBuilder()
    .setName("set-prompt")
    .setDescription("Sets new tourney prompts"),
  async execute(interaction: ChatInputCommandInteraction) {
    //TODO
    await interaction.reply("Pong!");
  },
};
