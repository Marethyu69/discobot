import { Client, ClientOptions, Collection, BaseInteraction } from "discord.js";
import { Command } from "./command";

export class ClientWithCommands extends Client {
  commands: Collection<string, Command> = new Collection();
  cooldowns: Collection<string, any> = new Collection();

  constructor(options: ClientOptions) {
    super(options);
  }
}
