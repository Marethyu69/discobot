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
					console.log(msg.content);
				}
				if ((!currentTourneyExited) && (msg.createdTimestamp < interaction.createdTimestamp)) {
					console.log(msg.content);
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

		for (const [userId, reactionCount] of reactionCounts) {
			if (reactionCount > topCount) {
				topUser = userId;
				topCount = reactionCount;
			}


		}

		if (topUser) {
			const user = await interaction.client.users.fetch(topUser);
			await interaction.reply(`The winner is ${user.tag} mit ${topCount} votes!`);
		}
		else {
			await interaction.reply('No ❤️-reactions found');
		}
	},
};