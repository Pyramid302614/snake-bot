const stationNames = [
    "Home", // Never displayed
    "Snake Shard Crafting"
];


const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const u = require("../../u.js");

module.exports = {

    stationNames: stationNames,
    fetchToolbar: fetchToolbar,
    homeButton: homeButton,
    stationButton: stationButton,
    getContainer: getContainer

};

// Gets message elements for station
function getContainer(interaction,station,stations,dels) {

    switch(station) {

        case 0:
            return require("./stations/home.js").container(interaction,station,stations,dels);

        case 1:
            return require("./stations/shardCrafting.js").container(interaction,station,stations,dels)

    }

}

// Gives components array with buttons based on station
function fetchToolbar(interaction,station,stations,dels) {

    const toolbarComponents = [
        homeButton(interaction,station,stations,dels).data
    ];
    for(let i = 1; i < stationNames.length; i++) { // i = 1 to exlude home station
        toolbarComponents.push(stationButton(interaction,i,stations,dels).data);
    }
    return [{

        type: 1,
        components: toolbarComponents

    }];

}

// Back button (Returns msgelem)
function homeButton(interaction,station,stations,dels) {

    const disabled = station == 0;

    const obj = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("< Home")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(disabled),
        async (del,interaction,data) => {
            for(const Del of dels) Del();
            await interaction.update({
                components: [getContainer(interaction,0,stations,dels)],
                flags: [MessageFlags.IsComponentsV2]
            });
        },
        [interaction.user.id]
    )
    dels.push(obj.del);
    return obj;

}

// Gets msgelem of station button
// Station is # not name btw
function stationButton(interaction,station,stations,dels) {

    const obj = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel(stationNames[station] ?? "?")
            .setStyle(ButtonStyle.Secondary),
        async (del,interaction,data) => {
            for(const Del of dels) Del();
            await interaction.update({
                components: [
                    getContainer(interaction,station,stations,dels)
                ],
                flags: [MessageFlags.IsComponentsV2]
            });
        },
        [interaction.user.id]
    );
    dels.push(obj.del);
    return obj;

}