import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Guild,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides information about the server."),
  async execute(interaction: ChatInputCommandInteraction) {
    // interaction.guild is the object representing the Guild in which the command was run
    const guild = interaction.guild;

    if (guild instanceof Guild) {
      await interaction.reply(
        `This server is ${guild.name} and has ${guild.memberCount} members.`,
      );
    }
  },
};
