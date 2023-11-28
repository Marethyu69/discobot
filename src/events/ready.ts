import { Events } from "discord.js";
import { ClientWithCommands } from "../client-with-commands";

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client: ClientWithCommands) {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
  },
};
