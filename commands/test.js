const { SlashCommandBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const u = require("../u");
const { newId, newS } = require("../systems/website/services/$mg/service");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("test"),
    contexts: ["absent"],
    async execute(interaction) {
        await interaction.reply({
            components: [
                {
                    type: 1,
                    components: [
                        new ButtonBuilder()
                            .setLabel("Open")
                            .setStyle(ButtonStyle.Primary)
                            .setCustomId("action:1092")
                    ]
                }
            ]
        });

        await u.sbdb.updateGuildProperty(interaction.guild.id,"minigame",{
            id: newId(u.cache.sbdir + "/systems/website/services"),
            msgId: (await interaction.fetchReply()).id,
            channelId: interaction.channel.id,
            type: u.snakes.types.randomType()
        });
    }
}