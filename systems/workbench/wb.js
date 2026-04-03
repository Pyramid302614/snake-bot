const stationNames = [
    "Home", // Never displayed
    "Snake Shard Crafting"
];


const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const u = require("../../u.js");

module.exports = {

    stationNames: stationNames,
    fetchToolbar: fetchToolbar,
    backButton: homeButton,
    stationButton: stationButton,
    getContainer: getContainer

};

// Gets message elements for station
function getContainer(interaction,station,stations) {

    switch(station) {

        case 0:
            return require("./stations/home.js").container(interaction,station,stations);

        case 1:
            return require("./stations/shardCrafting.js").container(interaction,station,stations)

    }

}

// Gives components array with buttons based on station
function fetchToolbar(interaction,station,stations) {

    const toolbarComponents = [
        homeButton(interaction,station,stations).data
    ];
    for(let i = 1; i < stationNames.length; i++) { // i = 1 to exlude home station
        toolbarComponents.push(stationButton(interaction,i,stations).data);
    }
    return [{

        type: 1,
        components: toolbarComponents

    }];

}

// Back button (Returns msgelem)
function homeButton(interaction,station,stations) {

    const disabled = station == 0;

    return u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("< Home")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(disabled),
        async (del,interaction,data) => {
            await interaction.update({
                components: [getContainer(interaction,0,stations)],
                flags: [MessageFlags.IsComponentsV2]
            });
            del();
        },
        [interaction.user.id]
    )

}

// Gets msgelem of station button
// Station is # not name btw
function stationButton(interaction,station,stations) {

    return u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel(stationNames[station] ?? "?")
            .setStyle(ButtonStyle.Secondary),
        async (del,interaction,data) => {
            await interaction.update({
                components: [
                    getContainer(interaction,station,stations)
                ],
                flags: [MessageFlags.IsComponentsV2]
            });
            del();
        },
        [interaction.user.id]
    );

}