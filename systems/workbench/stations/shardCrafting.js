const { ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, MessageFlags } = require("discord.js");
const u = require("../../../u");

const wb = require("../../../systems/workbench/wb.js");

module.exports = {

    async embed(interaction,station,stations) {

        const snakes = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.snakes`) ?? [];
        const value = snakes[stations[station].selected]; // Amount
        const key = stations[station].selected; // Amount
        const data = u.snakes.types.getTypeData(key) ?? {};

        let craftable = Math.floor(value/5);

        return new EmbedBuilder()
            .setTitle("Snake Shard Crafting")
            .setAuthor({
                name: interaction.user.displayName + "  -  Workbench",
                iconURL: await interaction.user.avatarURL()
            })
            .setDescription(`
                -# **1.** Pick a snake type from the selection menu\n-# **2.** If you have at least **5** of that snake, you can press\n-# the "Craft" button to obtain a snake shard of that type.
            `+((stations[station].selected)?`
                You have **${value ?? 0}** ${(data.pretty??key).toLowerCase()}${value != 1?"s":""}.
                ${craftable == 0?"You cannot make any":`You can make up to **${craftable}**`} ${(data.shardPretty??key).toLowerCase()}${craftable != 1?"s":""}.
            `:""))
            .setColor(u.color.rgb("#00f8ae"));

    },
    components(interaction,station,stations) {

        const options = [];
        const snakes = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.snakes`) ?? [];
        const data = u.snakes.types.getTypeData(stations[station].selected);

        for(let i = 0; i < Object.keys(snakes).length; i++) {

            var key = Object.keys(snakes)[i];
            var value = Object.values(snakes)[i];
            var prettyName = u.snakes.types.getTypeData(key).pretty;

            options.push({
                label: `${prettyName} (Amount: ${value})`,
                value: key
            });

        }
        const amount = snakes[stations[station].selected];
        var sufficientSnakes = stations[station].selected && (amount ?? 0) >= 5;
        
        return [[
            
            u.msgelem.messageElement(
                new StringSelectMenuBuilder()
                    .setPlaceholder(
                        options.length == 0 ? "Failed to load inventory." : 
                        !stations[station]?.selected ? "Select snake type here..." :
                        (u.snakes.types.getTypeData(stations[station].selected)?.pretty ?? stations[station].selected) // Gives the illusion of it being selected so it can refresh and not revert
                    )
                    .setDisabled(options.length == 0)
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setOptions(options.length == 0?[{label:"hi",value:"hi"}]:options)
                    .setRequired(true),
                async (del,interaction,data) => {
                    stations[station].selected = interaction.values[0]; // Should always be 1 in length
                    await interaction.update({
                        embeds: await wb.display(interaction,station,stations),
                        components: wb.fetchToolbar(interaction,station,stations)
                    })
                    del();
                },
                [interaction.user.id]
            ).data
            
        ],
        [
            
            u.msgelem.messageElement(
                new ButtonBuilder()
                    .setLabel(stations[station].selected?sufficientSnakes?`Craft 1 ${(data.shardPretty??stations[station].selected).toLowerCase()}`:(`Need ${5-amount} more ${data.pretty??stations[station].selected}${5-amount==1?"":"s"}`):"Craft")
                    .setStyle(sufficientSnakes?ButtonStyle.Success:ButtonStyle.Secondary)
                    .setDisabled(!sufficientSnakes),
                async (del,interaction,data) => {

                    const currentAmountOfShards = (u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.shards.${stations[station].selected}`) ?? 0);

                    u.sbdb.updateGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.snakes.${stations[station].selected}`,
                        snakes[stations[station].selected] - 5
                    ); // Asynchronously called that way these two write requests are clumped together in the same heap
                    await u.sbdb.updateGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.shards.${stations[station].selected}`,
                        currentAmountOfShards + 1
                    );

                    await interaction.update({
                        embeds: await wb.display(interaction,station,stations),
                        components: wb.fetchToolbar(interaction,station,stations)
                    });

                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(u.errTitles.newTitle("successPack"))
                                .setDescription("You crafted a shiny new " + (data.pretty??stations[station].selected).toLowerCase()+ "!\nYou now have **"+(currentAmountOfShards + 1)+"** :)")
                                .setColor(u.color.rgb(u.errTitles.newTitle("successColorPack")))
                        ],
                        flags: [MessageFlags.Ephemeral]
                    });
                    
                    del();

                },
                [interaction.user.id] // Almost forgot to do this lmaos
            ).data
            
        ]];

    }

}