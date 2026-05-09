const { SlashCommandBuilder, ContainerBuilder, StringSelectMenuBuilder, MessageFlags, ButtonBuilder, ButtonStyle, TextDisplayBuilder, EmbedBuilder } = require("discord.js");
const u = require("../../u");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("showcase")
        .setDescription("(OPENS SELECTION MENU) Showcases anything (amount of snake type, social credit...)"),

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
        const shards = u.sbdb.getGuildProperty(data.guild.id,"inventories."+interaction.user.id+".shards") ?? {};
        for(const shard of Object.keys(shards)) {
            snakeSelectOptions.push({
                value: "shard:"+shards[shard]+":"+shard, label: (u.snakes.types.getTypeData(shard).shardPretty ?? shard) + " (Amount: " + shards[shard] + ")"
            });
        }
    }
    const guildSelectOptions = [];
    for(const guild of data.guilds) {
        guildSelectOptions.push({
            value: guild.id, label: guild.name
        });
    }

    for(var i = 0; i < snakeSelectOptions.length; i++) {
        if(snakeSelectOptions[i].value.length > 25) {
            snakeSelectOptions[i].value = snakeSelectOptions[i].value.slice(-3)+"...";
        }
        if(snakeSelectOptions[i].label.length > 25) {
            snakeSelectOptions[i].label = snakeSelectOptions[i].label.slice(-3)+"...";
        }
    }
    for(var i = 0; i < guildSelectOptions.length; i++) {
        if(guildSelectOptions[i].value.length > 25) {
            guildSelectOptions[i].value = guildSelectOptions[i].value.slice(-3)+"...";
        }
        if(guildSelectOptions[i].label.length > 25) {
            guildSelectOptions[i].label = guildSelectOptions[i].label.slice(-3)+"...";
        }
    }

    // console.log(snakeSelectOptions);

    // console.log(guildSelectOptions);

    // Selection element
    var dels = [];
    const snakeSelect =
        u.msgelem.messageElement(
            new StringSelectMenuBuilder()
                .setPlaceholder(data.item?("Selected item: " + parseItem(data.item)):data.guild?"Select item here...":"Select a server first")
                .addOptions(snakeSelectOptions.length == 0?[{value:"baked freaking beans",label:"With mashes freaking potatoes"}]:snakeSelectOptions)
                .setMinValues(1)
                .setMaxValues(1)
                .setDisabled(!data.guild)
                .setRequired(true),
            async (del,interaction) => {
                data.item = interaction.values[0];
                await interaction.update(menu(interaction,data));
                for(const Del of dels) Del();
            },
            [interaction.user.id]
        );
    const guildSelect =
        u.msgelem.messageElement(
            new StringSelectMenuBuilder()
                .setPlaceholder((data?.guild?.name?"Selected server: ":"") + (data?.guild?.name ?? "Select server here..."))
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(guildSelectOptions.length==0?[{value:"beantato",label:"You haven't collected any items in any servers."}]:guildSelectOptions),
            async (del,interaction) => {
                data.guild = u.cache.client.guilds.cache.get(interaction.values[0]) ?? u.cache.client.guilds.fetch(interaction.values[0]);
                await interaction.update(menu(interaction,data));
                for(const Del of dels) Del();
            },
            [interaction.user.id]
        );
    const showcaseButton =
        u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel("Showcase")
                .setStyle(ButtonStyle.Success)
                .setDisabled(!data.item),
            async (del,int) => {

                // Acknowledges button
                int.update({
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(
                                        "✅  Done."
                                    )
                            )
                            .setAccentColor(u.color.rgb("#00ff00"))
                    ]
                    // Flags are carried over
                });

                // Replies to original interaction
                interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: data.guild.name + " - From " + int.user.displayName + "'s inventory",
                                iconURL: data.guild.iconURL({
                                    dynamic: false,
                                    size: 64
                                })
                            })
                            .setDescription(parseItem(data.item))
                            .setColor(u.color.rgb("#snake-bot"))
                    ]
                });

                for(const Del of dels) Del();

            }
        )
    dels.push(snakeSelect.del);
    dels.push(guildSelect.del);
    dels.push(showcaseButton.del);

    return {
        components: [
            new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(data.guild?"### What would you like to showcase?":"### Which inventory would you like to showcase from?")
                )
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
                },
                {
                    type: 1,
                    components: [
                        showcaseButton.data
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
        case "snake": return `${am} ${u.snakes.types.getTypeData(a).pretty.toLowerCase()}${am!="1"?"s":""}`;
        case "shard": return `${am} ${u.snakes.types.getTypeData(a).shardPretty.toLowerCase()}${am!="1"?"s":""}`;
    }
}