const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags, ButtonBuilder, ButtonStyle, EmbedBuilder, SeparatorBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, ModalBuilder, ActionRowBuilder, LabelBuilder, StringSelectMenuInteraction } = require("discord.js");
const u = require("../../u");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("trade")
        .setDescription("Trades with another member")
        .addUserOption(option => option
            .setName("person")
            .setDescription("The person to trade with")
            .setRequired(true)
        ),

    contexts: [],

    async execute(interaction) {

        const tradewith = interaction.options.getUser("person");
        const trader = interaction.user;

        // if(trader.id == tradewith.id) {
        //     interaction.reply("schitz ahh");
        //     return;
        // }

        var dels = [];
        const acceptButton =
            u.msgelem.messageElement(
                new ButtonBuilder()
                    .setLabel("Trade")
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success),
                (del,b_interaction,data) => {
                    
                    for(const Del of dels) Del();
                    dels = [];

                    interaction.editReply(tradeUI(interaction,{
                        traderOfferings: [],
                        tradewithOfferings: [],
                    },trader,tradewith));

                },
                [tradewith.id],
                false
            );
        const declineButton =
            u.msgelem.messageElement(
                new ButtonBuilder()
                    .setLabel("No trade")
                    .setEmoji('✖️')
                    .setStyle(ButtonStyle.Danger),
                (del,b_interaction,data) => {

                    for(const Del of dels) Del();
                    dels = [];

                    interaction.editReply({
                        components: [
                            new ContainerBuilder()
                                .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                                    "###" + u.errTitles.newTitle("declinedTradePack")) + "\n" + 
                                    "<@"+tradewith.id+"> has declined your trade request :("
                                )
                                .setAccentColor([255,0,0])
                        ],
                        flags: [MessageFlags.IsComponentsV2],
                        allowedMentions: { users: [trader.id] },
                    });

                },
                [tradewith.id],
                false
            );

        dels.push(acceptButton.del);
        dels.push(declineButton.del);

        await interaction.reply({
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                        "### Trade request\n<@"+trader.id+"> wants to trade with you, <@"+tradewith.id+">")
                    )
                    .addActionRowComponents(
                        [{
                            type: 1,
                            components: [
                                acceptButton.data,
                                declineButton.data
                            ]
                        }]
                    )
                    .setAccentColor(u.color.rgb("#ffff00"))
            ],
            allowedMentions: { users: [tradewith.id] },
            flags: [MessageFlags.IsComponentsV2]
        });

    }

}

function tradeUI(interaction,data,trader,tradewith) {

    var traderOfferings = (data.traderOfferings.length==0?[" "]:data.traderOfferings).map(i => u.values.parseItem(i)).join("\n");
    var tradewithOfferings = (data.tradewithOfferings.length==0?[" "]:data.tradewithOfferings).map(i => u.values.parseItem(i)).join("\n");

    if(data.traderAccepted && data.tradewithAccepted) {
        
        // Transactions
        for(const offering of traderOfferings) {
            const split = offering.split(":");
            const path = `inventories.${trader.id}.${split[0]}`+(split[0] == "socialCredit"?"":split[1]);
            u.sbdb.updateGuildProperty(interaction.guild.id,path,(u.sbdb.getGuildProperty(interaction.guild.id,path)??0)-parseInt(split[1]));
            u.sbdb.updateGuildProperty(interaction.guild.id,path.replaceAll(trader.id,tradewith.id),(u.sbdb.getGuildProperty(interaction.guild.id,path.replaceAll(trader.id,tradewith.id))??0)+parseInt(split[1]));
        }
        for(const offering of tradewithOfferings) {
            const split = offering.split(":");
            const path = `inventories.${tradewith.id}.${split[0]}`+(split[0] == "socialCredit"?"":split[1]);
            u.sbdb.updateGuildProperty(interaction.guild.id,path,(u.sbdb.getGuildProperty(interaction.guild.id,path)??0)-parseInt(split[1]));
            u.sbdb.updateGuildProperty(interaction.guild.id,path.replaceAll(tradewith.id,trader.id),(u.sbdb.getGuildProperty(interaction.guild.id,path.replaceAll(tradewith.id,trader.id))??0)+parseInt(split[1]));
        }

        // Message
        return {
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(
                                `
### Trade completed!
${trader.displayName} got:
\`\`\`
${tradewithOfferings}
\`\`\`
${tradewith.displayName} got:
\`\`\`
${traderOfferings}
\`\`\``
                            )
                    )
                    .setAccentColor(u.color.rgb(u.errTitles.newTitle("successColorPack")))
            ]
        }

    }

    var dels = [];

    const offerButton =
        u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel("Offer something")
                .setStyle(ButtonStyle.Primary),
            (del,b_interaction,d) => {
                b_interaction.reply(offerUI(b_interaction,{offered:b_interaction.user.id==trader.id?data.traderOfferings:data.tradewithOfferings},(item) => {

                    for(const Del of dels) Del();
                    dels = [];

                    // Adds to offerings
                    if(b_interaction.user.id == trader.id) data.traderOfferings.push(item);
                    else data.tradewithOfferings.push(item);
                    
                    // Resets accepted-s
                    data.traderAccepted = false;
                    data.tradewithAccepted = false;

                    // Message
                    interaction.editReply(tradeUI(interaction,data,trader,tradewith));

                }));
            },
            [trader.id,tradewith.id]
        );
    const removeButton = 
        u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel("Remove something")
                .setStyle(ButtonStyle.Secondary),
            (del,b_interaction,d) => {
                b_interaction.reply(removeUI(b_interaction,{offered:b_interaction.user.id==trader.id?data.traderOfferings:data.tradewithOfferings},(item) => {

                    for(const Del of dels) Del();
                    dels = [];

                    // Removes from offerings
                    if(b_interaction.user.id == trader.id) {
                        const index = data.traderOfferings.indexOf(item);
                        data.traderOfferings = data.traderOfferings.slice(index,index);
                    } else {
                        const index = data.tradewithOfferings.indexOf(item);
                        data.tradewithOfferings = data.tradewithOfferings.slice(index,index);
                    }

                    // Resets accepted-s
                    data.traderAccepted = false;
                    data.tradewithAccepted = false;

                    // Message
                    interaction.editReply(tradeUI(interaction,data,trader,tradewith));

                }));
            },
            [trader.id,tradewith.id]
        );
    const acceptButton =
        u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel("Accept Trade")
                .setStyle(ButtonStyle.Success),
            (del,b_interaction,d) => {
                
                for(const Del of dels) Del();
                dels = [];

                // Inverts accepted value
                if(b_interaction.user.id == trader.id) data.traderAccepted = !data.traderAccepted;
                else data.tradewithAccepted = !data.tradewithAccepted;

                // Message
                b_interaction.update(tradeUI(interaction,data,trader,tradewith));

            },
            [trader.id,tradewith.id]
        );
    const declineButon =
        u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel("Decline Trade")
                .setStyle(ButtonStyle.Danger),
            (del,b_interaction,d) => {

                for(const Del of dels) Del();
                dels = [];

                b_interaction.update({
                    components: [
                        new ContainerBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(
                                        `### ${u.errTitles.newTitle("declinedTradePack")}\n${b_interaction.user.displayName} has declined the trade.`
                                    )
                            )
                            .setAccentColor([255,0,0])
                    ]
                });

            },
            [trader.id,tradewith.id]
        );

    dels.push(offerButton.del);
    dels.push(removeButton.del);
    dels.push(acceptButton.del);
    dels.push(declineButon.del);

    const components = [
        new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `
### <@${trader.id}>'s offerings
\`\`\`
${traderOfferings}
\`\`\``)
                    )
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`
### <@${tradewith.id}>'s offerings
\`\`\`
${tradewithOfferings}
\`\`\``
                    )
            )
            .addSeparatorComponents(new SeparatorBuilder())
            .addActionRowComponents(
                new ActionRowBuilder()
                    .addComponents(
                        offerButton.data,
                        removeButton.data
                    ),
                new ActionRowBuilder()
                    .addComponents(
                        acceptButton.data,
                        declineButon.data
                    )
            )

    ];

    if(data.traderAccepted || data.tradewithAccepted) {
        components.push(
            new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `✅ ${data.traderAccepted?trader.displayName:tradewith.displayName} has accepted the trade.\nPress "Accept Trade" to finish the trade.\n-# To ${data.traderAccepted?trader.displayName:tradewith.displayName}: To de-accept press the button again.`
                        )
                )
                .setAccentColor([0,255,0])
        )
    }
    
    return {

        components: components,
        flags: [MessageFlags.IsComponentsV2]

    };

}

function offerUI(interaction,data,offerFunction) {

    // Options
    var itemSelectOptions = [];
    const snakes = u.sbdb.getGuildProperty(interaction.guild.id,"inventories."+interaction.user.id+".snakes") ?? {};
    for(const snake of Object.keys(snakes)) {
        itemSelectOptions.push({
            value: "snake:"+snakes[snake]+":"+snake, label: (u.snakes.types.getTypeData(snake).pretty ?? snake) + " (Available Amount: " + snakes[snake] + ")"
        });
    }
    const shards = u.sbdb.getGuildProperty(interaction.guild.id,"inventories."+interaction.user.id+".shards") ?? {};
    for(const shard of Object.keys(shards)) {
        itemSelectOptions.push({
            value: "shard:"+shards[shard]+":"+shard, label: (u.snakes.types.getTypeData(shard).shardPretty ?? shard) + " (Available Amount: " + shards[shard] + ")"
        });
    }
    const socialCredit = u.sbdb.getGuildProperty(interaction.guild.id,"inventories."+interaction.user.id+".socialCredit");
    itemSelectOptions.push({
        value: "socialCredit:"+socialCredit,
        label: "Social Credit (Available Amount: " + socialCredit + ")"
    });

    // Constant variables
    var itemName = "?";
    var itemAmount = 0;
    let newItemSelectOptions = [];
    for(let i = 0; i < itemSelectOptions.length; i++) {
        const option = itemSelectOptions[i];
        var usedAlready = false;
        data.offered.forEach(e => { // Removes entries that are already offered
            if(e.replaceAll(/:\d+:/g,"") == option.value.replaceAll(/:\d+:/g,"")) {
                usedAlready = true;
            }
        });
        if(!usedAlready) newItemSelectOptions.push(option);
        if(option.value == data.selected) {
            itemName = option.label;
            itemAmount = parseInt(option.value.split(":")[1]);
        }
    }
    if(newItemSelectOptions.length > 0) itemSelectOptions = newItemSelectOptions;

    var itemNameNoNumberPlural = "";
    var itemNameNoNumberNonPlural = "";
    switch(data?.selected?.split(":")?.[0]) {
        case "snake": itemNameNoNumberNonPlural = u.snakes.types.getTypeData(data.selected.split(":")[2]).pretty; itemNameNoNumberPlural = itemNameNoNumberNonPlural+"s"; break;
        case "shard": itemNameNoNumberNonPlural = u.snakes.types.getTypeData(data.selected.split(":")[2]).shardPretty; itemNameNoNumberPlural = itemNameNoNumberNonPlural+"s"; break;
        case "socialCredit": itemNameNoNumberPlural = "Social Credit"; itemNameNoNumberNonPlural = "Social Credit"; break;
    }

    if(itemAmount == 1) {
        data.amount = 1;
    }

    var dels = [];
    
    const amountButton = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("Set Amount > " + (itemAmount==1?"1 (You only have " + itemNameNoNumberNonPlural.toLocaleLowerCase() + " to offer)":(data.amount??(data.amountError??(data.selected?"Click me!":"Select item first")))))
            .setDisabled(data.selected === undefined || itemAmount == 1)
            .setStyle(data.amount?ButtonStyle.Success:(data.amountError?ButtonStyle.Danger:(data.selected?ButtonStyle.Primary:ButtonStyle.Secondary))),
        (del,b_interaction,d) => {
            
            const itemAmountInput = new TextInputBuilder()
                .setCustomId("amountInputBox")
                .setPlaceholder("Enter amount here...")
                .setMaxLength(10)
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            const modal = u.msgelem.messageElement(
                new ModalBuilder()
                    .setTitle("Offer something - Set amount")
                    .addLabelComponents(new LabelBuilder()
                        .setLabel("Amount")
                        .setDescription("Enter how "+((data.selected.split(":")[0]=="socialCredit")?"much":"many")+" of the " + u.values.parseItem(data.selected) + " to offer:")
                        .setTextInputComponent(itemAmountInput)
                    ),
                (del,b_interaction,d) => {
                    
                    for(const Del of dels) Del();
                    dels = [];

                    const stringNumber = b_interaction.fields.getTextInputValue("amountInputBox");

                    data.amount = parseInt(stringNumber);
                    data.amountError = undefined;
                    
                    if(isNaN(data.amount)) {
                        data.amountError = "That's not a number, try again";
                        data.amount = undefined;
                    } else {
                        if(data.amount == 0) {
                            data.amountError = "Man wtf? Why are you trying to offer 0 " + itemNameNoNumberPlural.toLowerCase() + "?";
                            data.amount = undefined;
                        }
                        if(data.amount > itemAmount) {
                            data.amountError = "You don't have enough " + itemNameNoNumberPlural.toLowerCase();
                            data.amount = undefined;
                        }
                    }

                    b_interaction.update(offerUI(interaction,data,offerFunction));

                },
                [interaction.user.id],
            );
            dels.push(modal.del);
            b_interaction.showModal(modal.data);

        }
    )

    const itemSelect =
        u.msgelem.messageElement(
            new StringSelectMenuBuilder()
                .setPlaceholder(itemSelectOptions.length == 0 ? "You do not have anything to trade! /inv" : (data.selected !== undefined? itemName : "Select item to add to offerings..."))
                .addOptions(itemSelectOptions.length == 0 ? [{value:"beantato",label:"Baked beans 2.0"}]:itemSelectOptions)
                .setDisabled(itemSelectOptions.length == 0)
                .setMinValues(1)
                .setMaxValues(1),
            (del,b_interaction,d) => {

                for(const Del of dels) Del();
                dels = [];

                // Resets amount variables
                data.amount = undefined;
                data.amountError = undefined;

                // Adds to selection
                data.selected = b_interaction.values[0];

                // Message
                b_interaction.update(offerUI(interaction,data,offerFunction));

            },
            [interaction.user.id]
        );

    const offerButton =
        u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel(data.amount === undefined?"Offer":("Offer " + u.values.parseItem(data.selected.replace(itemAmount,data.amount))))
                .setDisabled(data.amount === undefined)
                .setStyle(data.amount === undefined?ButtonStyle.Secondary:ButtonStyle.Primary),
            (del,b_interaction,d) => {
                for(const Del of dels) Del();
                dels = [];
                offerFunction(data.selected.replace(itemAmount,data.amount));
                interaction.deleteReply("@original");
            }
        )

    dels.push(itemSelect.del);
    dels.push(amountButton.del);
    dels.push(offerButton.del);
    
    return {

        components: [
            new ContainerBuilder()
                .addActionRowComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            itemSelect.data,
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            amountButton.data,
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            offerButton.data,
                        )
                )
        ],

        flags: [
            MessageFlags.Ephemeral,
            MessageFlags.IsComponentsV2
        ]
        
    };


}
function removeUI(interaction,data,removeFunction) {

    const itemSelectOptions = [];
    var itemName = "?";
    if(data.offered) {
        for(const item of data.offered) {
            itemSelectOptions.push({
                value: item,
                label: u.values.parseItem(item)
            });
        }
    } else {
        itemSelectOptions.push({value:"beantato",label:"brother may i have some oats"});
    }

    var dels = [];

    const itemSelect =
        u.msgelem.messageElement(
            new StringSelectMenuBuilder()
                .setPlaceholder(data.selected?u.values.parseItem(data.selected):(data.offered?"Select item to remove...":"You don't have anything to remove!"))
                .setDisabled(data.offered === undefined)
                .setOptions(itemSelectOptions.length==0?[{value:"beantato",label:"Why hello there again"}]:itemSelectOptions)
                .setMinValues(1)
                .setMaxValues(1),
            (del,b_interaction,d) => {
                for(const Del of dels) Del();
                dels = [];
                data.selected = b_interaction.values[0];
                b_interaction.update(removeUI(interaction,data,removeFunction));
            }
        );
    const removeButton =
        u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel("Remove")
                .setDisabled(data.selected === undefined)
                .setStyle(data.selected === undefined?ButtonStyle.Secondary:ButtonStyle.Danger),
            (del,b_interaction,d) => {

                for(const Del of dels) Del();
                dels = [];
                
                // Calls remove function back at trade ui
                removeFunction(data.selected);

                // Deletes the remove ui
                interaction.deleteReply("@original");
                
            }
        );

    dels.push(itemSelect.del);
    dels.push(removeButton.del);

    return {

        components: [
            new ContainerBuilder()
                .addActionRowComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            itemSelect.data
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            removeButton.data
                        )
                )
        ],
        flags: [MessageFlags.Ephemeral,MessageFlags.IsComponentsV2]

    };

}