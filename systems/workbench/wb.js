const stationNames = [
    "Home", // Never displayed
    "Snake Shard Crafting",
    "Blank Snakes",
    "Pets"
];


const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const u = require("../../u.js");

module.exports = {

    stationNames: stationNames,
    fetchToolbar: fetchToolbar,
    homeButton: homeButton,
    stationButton: stationButton,
    getMessage: getMessage

};

// Gets message elements for station
async function getContainer(interaction,station,stations,dels,data) {

    switch(station) {

        case 0:
            return await require("./stations/home.js").container(interaction,station,stations,dels,data);

        case 1:
            return await require("./stations/shardCrafting.js").container(interaction,station,stations,dels,data);

        case 2:
            return await require("./stations/blankSnakeAdoption.js").container(interaction,station,stations,dels,data);

        case 3:
            return await require("./stations/petEditting.js").container(interaction,station,stations,dels,data);

    }

    

}

// Gives components array with buttons based on station
async function fetchToolbar(interaction,station,stations,dels) {

    const toolbarComponents = [
        (await homeButton(interaction,station,stations,dels)).data
    ];
    for(let i = 1; i < stationNames.length; i++) { // i = 1 to exlude home station
        toolbarComponents.push((await stationButton(interaction,i,stations,dels)).data);
    }
    return [{

        type: 1,
        components: toolbarComponents

    }];

}

// Back button (Returns msgelem)
async function homeButton(interaction,station,stations,dels) {

    const disabled = station == 0;

    const obj = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("< Home")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(disabled),
        async (del,b_interaction,data) => {
            for(const Del of dels) Del();
            dels = [];
            await b_interaction.update(await getMessage(b_interaction,0,stations,dels));
        },
        [interaction.user.id]
    );
    dels.push(obj.del);
    return obj;

}

// Gets msgelem of station button
// Station is # not name btw
async function stationButton(interaction,station,stations,dels) {

    const obj = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel(stationNames[station] ?? "?")
            .setStyle(ButtonStyle.Secondary),
        async (del,b_interaction) => {
            for(const Del of dels) Del();
            dels = [];
            await b_interaction.update(await getMessage(b_interaction,station,stations,dels));
        },
        [interaction.user.id]
    );
    dels.push(obj.del);
    return obj;

}

async function getMessage(interaction,station,stations,dels,Data) {
    Data = Data ?? {};
    const data = {};
    const container = await getContainer(interaction,station,stations,dels,data);
    const flags = [MessageFlags.IsComponentsV2]; for(const flag of Data.flags ?? []) flags.push(flag);
    return {
        components: [
            container
        ],
        files: data.files ?? [],
        flags: flags
    };
}