const { SlashCommandBuilder, ContainerBuilder, StringSelectMenuBuilder, MessageFlags, ButtonBuilder, ButtonStyle, TextDisplayBuilder, EmbedBuilder, SeparatorBuilder, SeparatorSpacingSize } = require("discord.js");
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
    const shardSelectOptions = [];
    var socialCreditButton = undefined;
    const socialCredit = u.sbdb.getGuildProperty(data.guild.id,"inventories."+interaction.user.id+".socialCredit");
    if(data.guild) {
        const snakes = u.sbdb.getGuildProperty(data.guild.id,"inventories."+interaction.user.id+".snakes") ?? {};
        for(const snake of Object.keys(snakes)) {
            if(snakes[snake] != 0) snakeSelectOptions.push({
                value: "snake:"+snakes[snake]+":"+snake,
                label: (u.snakes.types.getTypeData(snake).pretty ?? snake),
                description: "Amount: " + snakes[snake]
            });
        }
        const shards = u.sbdb.getGuildProperty(data.guild.id,"inventories."+interaction.user.id+".shards") ?? {};
        for(const shard of Object.keys(shards)) {
            if(shards[shard] != 0) shardSelectOptions.push({
                value: "shard:"+shards[shard]+":"+shard,
                label: (u.snakes.types.getTypeData(shard).shardPretty ?? shard),
                description: "Amount: " + shards[shard]
            });
        }
        if(socialCredit != 0) socialCreditButton = "Social Credit (Amount: " + socialCredit + ")";
    }

    const guildSelectOptions = [];
    for(const guild of data.guilds) {
        guildSelectOptions.push({
            value: guild.id, label: guild.name
        });
    }

    // Ellipsifying them
    for(var i = 0; i < snakeSelectOptions.length; i++) {
        if(snakeSelectOptions[i].label.length > 100) {
            snakeSelectOptions[i].label = snakeSelectOptions[i].label.slice(0,-3)+"...";
        }
    }
    for(var i = 0; i < shardSelectOptions.length; i++) {
        if(shardSelectOptions[i].label.length > 100) {
            shardSelectOptions[i].label = shardSelectOptions[i].label.slice(0,-3)+"...";
        }
    }
    for(var i = 0; i < guildSelectOptions.length; i++) {
        if(guildSelectOptions[i].label.length > 100) {
            guildSelectOptions[i].label = guildSelectOptions[i].label.slice(0,-3)+"...";
        }
    }

    // console.log(snakeSelectOptions);

    // console.log(guildSelectOptions);

    // Selection element
    var dels = [];
    const snakeSelect =
        u.msgelem.messageElement(
            new StringSelectMenuBuilder()
                .setPlaceholder((data?.item?.startsWith?.("snake"))?("Selected item: " + parseItem(data.item)):data.guild?(snakeSelectOptions.length == 0?"Snakes would be selected here if you had any":"Snakes can be selected here"):"Select a server first")
                .addOptions(snakeSelectOptions.length == 0?[{value:"baked freaking beans",label:"With mashes freaking potatoes"}]:snakeSelectOptions)
                .setMinValues(1)
                .setMaxValues(1)
                .setDisabled(!data.guild || snakeSelectOptions.length == 0),
            async (del,interaction) => {
                for(const Del of dels) Del();
                dels = [];
                data.item = interaction.values[0];
                await interaction.update(menu(interaction,data));
            },
            [interaction.user.id]
        );
    const shardSelect =
        u.msgelem.messageElement(
            new StringSelectMenuBuilder()
                .setPlaceholder((data?.item?.startsWith?.("shard"))?("Selected item: " + parseItem(data.item)):data.guild?(shardSelectOptions.length == 0?"Shards would be selected here if you had any":"Shards can be selected here"):"Select a server first")
                .addOptions(shardSelectOptions.length == 0?[{value:"baked freaking beans",label:"With mashes freaking potatoes"}]:shardSelectOptions)
                .setMinValues(1)
                .setMaxValues(1)
                .setDisabled(!data.guild || shardSelectOptions.length == 0),
            async (del,interaction) => {
                for(const Del of dels) Del();
                dels = [];
                data.item = interaction.values[0];
                await interaction.update(menu(interaction,data));
            },
            [interaction.user.id]
        );
    const socialCreditSelect =
        u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel((data?.item?.startsWith?.("socialCredit"))?("Selected item: " + parseItem(data.item)):data.guild?(socialCredit == 0?"Broke ahh dont have social credit 👎":"Social credit can be selected here"):"Select a server first")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!data.guild || socialCredit == 0),
            async (del,interaction) => {
                for(const Del of dels) Del();
                dels = [];
                data.item = "socialCredit:"+socialCredit;
                await interaction.update(menu(interaction,data));
            },
            [interaction.user.id]
        ); 
    const guildSelect =
        u.msgelem.messageElement(
            new StringSelectMenuBuilder()
                .setPlaceholder((data?.guild?.name?"Selected server: ":"") + (data?.guild?.name ?? "Select server here..."))
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(guildSelectOptions.length==0?[{value:"beantato",label:"You haven't collected any items in any servers."}]:guildSelectOptions)
                .setDisabled(guildSelectOptions.length==0),
            async (del,interaction) => {
                for(const Del of dels) Del();
                dels = [];
                data.guild = u.cache.client.guilds.cache.get(interaction.values[0]) ?? u.cache.client.guilds.fetch(interaction.values[0]);
                await interaction.update(menu(interaction,data));
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

                for(const Del of dels) Del();
                dels = [];

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

            }
        )
    dels.push(snakeSelect.del);
    dels.push(shardSelect.del);
    dels.push(socialCreditSelect.del);
    dels.push(guildSelect.del);
    dels.push(showcaseButton.del);

    return {
        components: [
            new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(data.guild?"### What would you like to showcase?":"### Which inventory would you like to showcase from?")
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addActionRowComponents([{
                    type: 1,
                    components: [
                        guildSelect.data
                    ]
                }])
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(data.item?("**Selected item:**\n"+parseItem(data.item)):"**Selected item:**\nYou haven't selected anything yet. Choose any of the 3 select menus below to choose something.")
                )
                .addActionRowComponents([{
                    type: 1,
                    components: [
                        snakeSelect.data
                    ]
                },
                {
                    type: 1,
                    components: [
                        shardSelect.data
                    ]
                },
                {
                    type: 1,
                    components: [
                        socialCreditSelect.data
                    ]
                }])
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
                .addActionRowComponents([{
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

const parseItem = u.values.parseItem;