// I coded the entirety of this in school

const { SlashCommandBuilder } = require("discord.js");
const wb = require("../../systems/workbench/wb.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("wb")
        .setDescription("(Utility) Opens up the workbench, where you can craft shards and stuff"),

    contexts: [],

    async execute(interaction) {
        
        const stations = [];
        for(var i = 0; i < wb.stationNames.length; i++) {
            stations.push({});
        }
        
        await interaction.reply({
            embeds: await wb.display(interaction,0,stations),
            components: wb.fetchToolbar(interaction,0,stations)
        });

    }

}

