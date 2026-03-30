// I coded the entirety of this in school

const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const u = require("../../u");

const stationNames = [
    "Home", // Never displayed
    "Snake Shard Crafting"
];

module.exports = {

    data: new SlashCommandBuilder()
        .setName("wb")
        .setDescription("(Utility) Opens up the workbench, where you can craft shards and stuff"),

    contexts: [],

    async execute(interaction) {

        var currentStation = 0;
        
        const stations = [];
        for(var i = 0; i < stationNames.length; i++) {
            stations.push({});
        }
        
        await interaction.reply({
            embeds: await display(interaction,currentStation,stations),
            components: fetchToolbar(interaction,currentStation,stations)
        });

    }

}

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
            return [
                u.msgelem.messageElement(
                    new ButtonBuilder()
                        .setLabel("Button!")
                        .setStyle(ButtonStyle.Primary),
                async (del,interaction,data) => {
                    await interaction.reply("Hi");
                    await interaction.message.edit({
                        embeds: await display(interaction,station,stations),
                        components: fetchToolbar(interaction,station,stations)
                    });
                    stations[station].test = (stations[station].test ?? 0) + 1;
                    del();
                },
                [interaction.user.id]
                ).data
            ];

        default:
            return [];

    }
    
}

// Gives components array with buttons based on station
function fetchToolbar(interaction,station,stations) {

    const components = [
        backButton(interaction,station).data
    ];
    for(let i = 1; i < stationNames.length; i++) { // i = 1 to exlude home station
        components.push(stationButton(interaction,i).data);
    }
    const stationComponents = [
        getActionRow(interaction,station,stations)
    ];

    return [{

        type: 1,
        components: components

    },
    {
     
        type: 1,
        components: stationComponents
        
    }];

}

// Back button (Returns msgelem)
function backButton(interaction,station,stations) {

    const disabled = station == 0;

    return u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("< Back")
            .setStyle(ButtonStyle.Secondary)
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
            .setStyle(ButtonStyle.Primary),
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