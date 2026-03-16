const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pings Snake Bot"),

    contexts: [ "absent" ],

    async execute(interaction) {

        const sent = await interaction.deferReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Pinging...")
                    .setColor([255,255,0])
            ]
        });

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Pong!")
                    .setDescription("Total time: " + (sent.createdTimestamp-interaction.createdTimestamp) + " ms")
                    .setColor([0,255,0])
            ]
        });
    }
    
}










// pyramid was here - 3/5/26