// I coded the entirety of this in school

const { SlashCommandBuilder, MessageFlags, ContainerComponent, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder } = require("discord.js");
const wb = require("../../systems/workbench/wb.js");
const u = require("../../u.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("wb")
        .setDescription("(Utility) Opens up the workbench, where you can craft shards and stuff"),

    contexts: [],

    async execute(interaction) {

        // Generates blank stations file
        const stations = [];
        for(var i = 0; i < wb.stationNames.length; i++) {
            stations.push({});
        }
        
        const msg = await interaction.reply({
            components: [
                wb.getContainer(interaction,0,stations)
            ],
            flags: [MessageFlags.IsComponentsV2,MessageFlags.Ephemeral]
        });

    }

}

