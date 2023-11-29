import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextBasedChannel,
} from "discord.js";

type UserIdWithCount = {
  userId: string;
  reactionCount: number;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("count-votes")
    .setDescription(
      'Counts votes (Reactions with ❤️) since the last "new tourney" message',
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.channel;

    const globalLeaderBoard: UserIdWithCount[] = [];

    if (channel === null) {
      return;
    }
    const channels = await interaction.guild?.channels.fetch();
    const realChannel = channels?.find((c) => {
      return c?.id === channel.id;
    });

    const categoryChannels = realChannel?.parent?.children.cache;
    if (categoryChannels === undefined) {
      return;
    }

    interaction.deferReply();

    for (const [_, categoryChannel] of categoryChannels) {
      if (!categoryChannel.isTextBased()) {
        return;
      }
      const channelspecificLeaderBoard = await doRatingForChannel(
        categoryChannel,
        interaction,
      );

      for (const userIdWithSpecificCount of channelspecificLeaderBoard) {
        const userIndex = globalLeaderBoard.findIndex((uwc) => {
          return uwc.userId === userIdWithSpecificCount.userId;
        });
        if (userIndex > -1) {
          globalLeaderBoard[userIndex].reactionCount =
            globalLeaderBoard[userIndex].reactionCount +
            userIdWithSpecificCount.reactionCount;
        } else {
          globalLeaderBoard.push(userIdWithSpecificCount);
        }
      }
    }

    await outputLeaderBoardToChannel(globalLeaderBoard, channel, interaction);
    interaction.editReply("Done! :3");
  },
};

async function doRatingForChannel(
  channel: TextBasedChannel,
  interaction: ChatInputCommandInteraction,
) {
  const reactionCounts = new Map<string, number>();

  const messages = await channel.messages.fetch({
    limit: 100,
    cache: false,
  });
  let currentTourneyExited = false;

  messages.each((msg) => {
    if (msg.content === "new tourney") {
      currentTourneyExited = true;
    }
    if (
      !currentTourneyExited &&
      msg.createdTimestamp < interaction.createdTimestamp
    ) {
      msg.reactions.cache.forEach(async (reaction) => {
        if (reaction.emoji.name === "❤️") {
          const user = msg.author;
          if (user) {
            const userId = user.id;
            reactionCounts.set(
              userId,
              (reactionCounts.get(userId) || 0) + reaction.count,
            );
          }
        }
      });
    }
  });

  const leaderBoard: UserIdWithCount[] = [];

  for (const [userId, reactionCount] of reactionCounts) {
    const userIdWithCount: UserIdWithCount = {
      userId: userId,
      reactionCount: reactionCount,
    };
    leaderBoard.push(userIdWithCount);
  }

  await outputLeaderBoardToChannel(leaderBoard, channel, interaction, true);

  return leaderBoard;
}

async function outputLeaderBoardToChannel(
  leaderBoard: UserIdWithCount[],
  channel: TextBasedChannel,
  interaction: ChatInputCommandInteraction,
  promptSpecificLeaderBoard: boolean = false,
) {
  leaderBoard.sort((a, b) => {
    return a.reactionCount - b.reactionCount;
  });

  if (leaderBoard.length === 0) {
    if (promptSpecificLeaderBoard) {
      await channel.send("No ❤️-reactions found");
    } else {
      await channel.send("No ❤️-reactions found for the whole tourney! :(");
    }
  } else {
    leaderBoard.reverse();

    const topUser = leaderBoard[0].userId;
    const topCount = leaderBoard[0].reactionCount;

    let leaderBoardString = "\nRanking:";
    let rank = 1;
    for (const userData of leaderBoard) {
      const user = await interaction.client.users.fetch(userData.userId);
      leaderBoardString = leaderBoardString.concat(
        `\n${rank}. ${user}: ${userData.reactionCount}`,
      );
      rank++;
    }

    let scopeString: string = "The overall winner";

    if (promptSpecificLeaderBoard) {
      scopeString = "The winner of this category";
    }

    let replyString = "";
    if (leaderBoard[0].reactionCount === leaderBoard[1].reactionCount) {
      replyString = "It's a draw!\n";
    } else {
      const user = await interaction.client.users.fetch(topUser);
      replyString = `${scopeString} is ${user} with ${topCount} votes!\n`;
    }
    await channel.send(replyString + leaderBoardString);
  }

  await channel.send("new tourney");
}
