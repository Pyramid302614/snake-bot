const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const u = require("../../u");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("wb")
        .setDescription("(Utility) Opens up the workbench, where you can craft shards and stuff"),

    contexts: [],

    async execute(interaction) {

        var currentStation = 0;
        // 0: Home
        // 1: Shard Crafter

        await interaction.reply({
            embeds:[
                new EmbedBuilder()
                    .setTitle("Workbench")
                    .setAuthor({
                        name: interaction.user.displayName,
                        iconURL: await interaction.user.avatarURL()
                    })
                    .setDescription(`
                        Click the buttons to navigate to a station.    
                    `)
            ],
            components: [
                {
                    type: 1,
                    components: [
                        u.msgelem.messageElement(
                            new ButtonBuilder()
                                .setLabel("< Back")
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            (del,interaction,data) => {
                                if(currentStation != 0) currentStation--;
                                interaction.edit(display(currentStation))
                            }
                        ).data
                    ]
                }
            ]
        })

    }

}

// Gives message data with station stuff
function display(station) {

}