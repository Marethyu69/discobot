const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('count-votes')
		.setDescription('Counts votes (Reactions with ❤️) since the last "new tourney" message'),
	async execute(interaction) {
		const channel = interaction.channel;

		const reactionCounts = new Map();

		if (channel) {
			const messages = await channel.messages.fetch({ limit: 100, caches: false });
			let currentTourneyExited = false;

			messages.each(msg => {
				if (msg.content === 'new tourney') {
					currentTourneyExited = true;
				}
				if ((!currentTourneyExited) && (msg.createdTimestamp < interaction.createdTimestamp)) {
					msg.reactions.cache.forEach(async (reaction) => {
						if (reaction.emoji.name === '❤️') {
							const user = msg.author;
							if (user) {
								const userId = user.id;
								reactionCounts.set(userId, (reactionCounts.get(userId) || 0) + reaction.count);
							}
						}
					});
				}
			});
		}

		let topUser = null;
		let topCount = 0;
		const leaderBoard = [];

		for (const [userId, reactionCount] of reactionCounts) {
			if (reactionCount > topCount) {
				topUser = userId;
				topCount = reactionCount;
			}
			const obj = {
				userId: userId,
				reactionCount: reactionCount,
			};
			leaderBoard.push(obj);
		}

		leaderBoard.sort((a, b) => {
			return a.reactionCount - b.reactionCount;
		});

		leaderBoard.reverse();

		let leaderBoardString = '\nRanking:';
		let rank = 1;
		for (const userData of leaderBoard) {
			const user = await interaction.client.users.fetch(userData.userId);
			leaderBoardString = leaderBoardString.concat(`\n${rank}. ${user.tag}: ${userData.reactionCount}`);
			rank++;
		}

		if (topUser) {
			let replyString = '';
			if (leaderBoard[0].reactionCount === leaderBoard[1].reactionCount) {
				replyString = 'It\'s a draw!\n';
			}
			else {
				const user = await interaction.client.users.fetch(topUser);
				replyString = `The winner is ${user.tag} with ${topCount} votes!\n`;
			}
			await interaction.reply(replyString + leaderBoardString);
		}
		else {
			await interaction.reply('No ❤️-reactions found');
		}
	},
};