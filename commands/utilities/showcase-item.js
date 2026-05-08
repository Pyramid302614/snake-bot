const { SlashCommandBuilder, ContainerBuilder, StringSelectMenuBuilder, MessageFlags } = require("discord.js");
const u = require("../../u");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("showcase-item")
        .setDescription("(OPENS SELECTION MENU) Showcases an item (snake type, social credit...) to whoever you are with :)"),

    contexts: ["absent"],

    async execute(interaction) {

        const guilds = [];
        for(const id of u.sbdb.getAllIDs()) {
            try {
                if(u.sbdb.getGuildProperty(id,"inventories."+interaction.user.id)) guilds.push({
                    name: (u.cache.client.guilds.cache.get(id) ?? await u.cache.client.guilds.fetch(id)).name,
                    id: id
                });
            } catch(ignored) {}
        }

        // Menu sending
        await interaction.reply(menu(interaction,{
            guilds: guilds,
            guild: interaction.guild // Will be undefined if it doesn't exist
        }))

    }

}

function menu(interaction,data) {

    // Options
    const snakeSelectOptions = [];
    if(data.guild) {
        const snakes = u.sbdb.getGuildProperty(data.guild.id,"inventories."+interaction.user.id+".snakes") ?? {};
        for(const snake of Object.keys(snakes)) {
            snakeSelectOptions.push({
                value: "snake:"+snakes[snake]+":"+snake, label: (u.snakes.types.getTypeData(snake).pretty ?? snake) + " (Amount: " + snakes[snake] + ")"
            });
        }
    }
    const guildSelectOptions = [];
    for(const guild of data.guilds) {
        guildSelectOptions.push({
            value: guild.id, label: guild.name
        });
    }

    // Selection element
    var dels = [];
    const snakeSelect =
        u.msgelem.messageElement(
            new StringSelectMenuBuilder()
                .setPlaceholder(data.item?("Selected item: " + parseItem(data.item)):"Select item here...")
                .addOptions(snakeSelectOptions)
                .setMinValues(1)
                .setMaxValues(1)
                .setDisabled(snakeSelectOptions.length == 0)
                .setRequired(true),
            async (del,interaction,d) => {
                for(const Del of dels) Del();
                data.item = interaction.values[0];
                await interaction.update(menu(interaction,data));
            },
            [interaction.user.id]
        );
    const guildSelect =
        u.msgelem.messageElement(
            new StringSelectMenuBuilder()
                .setPlaceholder((interaction?.guild?.name?"Selected server: ":"") + (interaction?.guild?.name ?? "Select server here..."))
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(guildSelectOptions),
            async (del,interaction,d) => {
                for(const Del of dels) Del();
                data.guild = u.cache.client.guilds.cache.get(interaction.values[0]) ?? u.cache.client.guilds.fetch(interaction.values[0]);
                await interaction.update(menu(interaction,data));
            },
            [interaction.user.id]
        )
    dels.push(snakeSelect.del);
    dels.push(guildSelect.del);

    return {
        components: [
            new ContainerBuilder()
                .addActionRowComponents([{
                    type: 1,
                    components: [
                        guildSelect.data
                    ]
                },
                {
                    type: 1,
                    components: [
                        snakeSelect.data
                    ]
                }])
        ],
        flags: [
            MessageFlags.IsComponentsV2,
            MessageFlags.Ephemeral
        ]
    };

}

function parseItem(v) { // Value
    let am = v.split(":")[1]; // Amount
    let a = v.split(":")[2]; // After
    switch(v.split(":")[0]) {
        case "snake": return `${am} ${u.snakes.types.getTypeData(a).pretty.toLowerCase()}${am!="1"?"s":""}` 
    }
}