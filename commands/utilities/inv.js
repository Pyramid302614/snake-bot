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
                files: [u.assets.path("images/misc/son.jpg")],
                flags: !visible?[MessageFlags.Ephemeral]:[]        
            });
            return;
        }

        const snakes = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${person.id}.snakes`) ?? [];
        var snakesList = "";
        for(let i = 0; i < Object.keys(snakes).length; i++) {
            const key = Object.keys(snakes)[i];
            const value = Object.values(snakes)[i];
            const prettyName = u.snakes.types.getTypeData(key).pretty ?? key; // If no pretty name, use key name (e.g., 'rare', 'regular' instead of 'Rare Snake', 'Regular Snake')
            snakesList += `\n${value} ${prettyName}s`;
        }
        if(snakesList.length != 0) snakesList = snakesList.slice(1); // Removes first new line
        else snakesList = interaction.user.id == person.id?"You haven't caught any snakes yet :(":"This person has not collected any snakes yet :(";

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    // .setTitle("Inventory" + (person.id != interaction.user.id?(" of " + person.displayName):""))
                    .setTitle("Inventory")
                    .setAuthor({
                        name: person.displayName,
                        iconURL: await person.avatarURL()
                    })
                    .setDescription(`
                        **Snakes:**
                        ${snakesList}
                    `)
                    .setColor(Object.keys(snakes).length.length != 0 && u.color.rgb(u.errTitles.newTitle("successColorPack")) || [255,0,0])
            ],
            flags: !visible?[MessageFlags.Ephemeral]:[]
        });

    }

}