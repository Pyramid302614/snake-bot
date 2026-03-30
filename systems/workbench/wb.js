const stationNames = [
    "Home", // Never displayed
    "Snake Shard Crafting"
];


const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const u = require("../../u.js");

module.exports = {

    stationNames: stationNames,
    display: display,
    getActionRow: getActionRow,
    fetchToolbar: fetchToolbar,
    backButton: backButton,
    stationButton: stationButton

};

// Gives **embed array** with station stuff
async function display(interaction,station,stations) {

    switch(station) {

        case 0: // Shard Crafting

            return [
                new EmbedBuilder()
                    .setTitle("Workbench")
                    .setAuthor({
                        name: interaction.user.displayName,
                        iconURL: await interaction.user.avatarURL()
                    })
                    .setDescription(`
                        Click the buttons to navigate to a station.    
                    `)
                    .setColor(u.color.rgb("#a78355")) // Wooden color
            ]

        case 1:

            return [
                new EmbedBuilder()
                    .setTitle("Hi!")
                    .setDescription("Station data: " + (stations[station].test ?? 0))
            ]

        default:

            return [
                new EmbedBuilder()
                    .setTitle(u.errTitles.newTitle("generalPack"))
                    .setDescription("That workbench station failed to load. Maybe try again?")
                    .setColor([255,0,0])
            ];

    }

}

// Gets message elements for station
function getActionRow(interaction,station,stations) {

    switch(station) {

        case 0:
            return [];

        case 1:
            return require("../../systems/workbench/stations/shardCrafting.js").make(interaction,station,stations);

        default:
            return [];

    }
    
}

// Gives components array with buttons based on station
function fetchToolbar(interaction,station,stations) {

    const components = [
        backButton(interaction,station,stations).data
    ];
    for(let i = 1; i < stationNames.length; i++) { // i = 1 to exlude home station
        components.push(stationButton(interaction,i,stations).data);
    }
    const stationComponents = getActionRow(interaction,station,stations);

    const masterActionRow = [{

        type: 1,
        components: components

    }];
    if(stationComponents.length != 0) masterActionRow.push({
        type: 1,
        components: stationComponents
    });
    return masterActionRow;

}

// Back button (Returns msgelem)
function backButton(interaction,station,stations) {

    const disabled = station == 0;

    return u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("< Back")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(disabled),
        async (del,interaction,data) => {
            await interaction.update({});
            await interaction.message.edit({
                embeds: await display(interaction,0,stations),
                components: fetchToolbar(interaction,0,stations)
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
            await interaction.update({});
            await interaction.message.edit({
                embeds: await display(interaction,station,stations),
                components: fetchToolbar(interaction,station,stations)
            });
            del();
        },
        [interaction.user.id]
    );

}