const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder } = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Gives you the link to the official Snake Bot server"),

    contexts: ["absent"],

    async execute(interaction) {

        interaction.reply({
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                        ""
                    ))
            ]
        })

    }

}