const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, MessageFlags, Attachment } = require("discord.js");
const u = require("../../u");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("inv")
        .setDescription("(Utility) Opens your inventory with all of your snakes and shards")
        .addUserOption(option => option
            .setName("person")
            .setDescription("The person's inventory to view, which defaults to you 🫵")
            .setRequired(false)
        ),
    
    contexts: [],

    async execute(interaction,visible) {

        const person = interaction.options.getUser("person") ?? interaction.user;

        if(visible && person.id == u.cache.client.user.id) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Inventory")
                        .setAuthor({
                            name: person.displayName,
                            iconURL: await person.avatarURL()
                        })
                        .setDescription("I have all the best loot\nyou'll just have to trust me on that")
                ]
            });
            return;
        }
        if(person.bot) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Inventory")
                        .setAuthor({
                            name: person.displayName,
                            iconURL: await person.avatarURL()
                        })
                        .setImage("attachment://son.jpg")
                ],
                files: [u.assets.path("images/memes/son.jpg")],
                flags: !visible?[MessageFlags.Ephemeral]:[]        
            });
            return;
        }


        // Snakes
        const snakes = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${person.id}.snakes`) ?? {};
        var snakesList = "";
        for(let i = 0; i < Object.keys(snakes).length; i++) {
            const key = Object.keys(snakes)[i];
            const value = Object.values(snakes)[i];
            const prettyName = u.snakes.types.getTypeData(key).pretty ?? key; // If no pretty name, use key name (e.g., 'rare', 'regular' instead of 'Rare Snake', 'Regular Snake')
            snakesList += `\n${value} ${prettyName}${value==1?"":"s"}`;
        }
        if(snakesList.length != 0) snakesList = snakesList.slice(1); // Removes first new line
        else snakesList = interaction.user.id == person.id?"You haven't caught any snakes yet :(":"This person has not collected any snakes yet :(";


        // Shards
        const shards = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${person.id}.shards`) ?? {};
        var shardsList = "";
        for(let i = 0; i < Object.keys(shards).length; i++) {
            const key = Object.keys(shards)[i];
            const value = Object.values(shards)[i];
            const prettyName = u.snakes.types.getTypeData(key).shardPretty ?? key; // If no pretty name, use key name (e.g., 'rare', 'regular' instead of 'Rare Snake', 'Regular Snake')
            shardsList += `\n${value} ${prettyName}${value==1?"":"s"}`;
        }
        if(shardsList.length != 0) shardsList = shardsList.slice(1); // Removes first new line
        else shardsList = interaction.user.id == person.id?"You haven't crafted any shards yet :(\n-# (Protip: `/wb`)":"This person has not crafted any shards yet :(";


        // Social Credit
        const socialCredit = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${person.id}.socialCredit`) ?? 0;

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    // .setTitle("Inventory" + (person.id != interaction.user.id?(" of " + person.displayName):""))
                    .setTitle("Inventory⠀⠀⠀⠀⠀⠀")
                    .setAuthor({
                        name: person.displayName,
                        iconURL: await person.avatarURL()
                    })
                    .setDescription(`

                        **Social Credit:**
                        ${socialCredit}

                        **Snakes:**
                        ${snakesList}

                        **Snake Shards:**
                        ${shardsList}
                    `)
                    .setColor(Object.keys(snakes).length.length != 0 && u.color.rgb(u.errTitles.newTitle("successColorPack")) || [255,0,0]) // Soon to be customizable
            ],
            flags: !visible?[MessageFlags.Ephemeral]:[]
        });

    }

}