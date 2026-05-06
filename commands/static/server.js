const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder } = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Gives you the link to the official Snake Bot server"),

    contexts: ["absent"],

    async execute(interaction) {

        interaction.reply("Join the Snake Bot army:\nhttps://discord.gg/FyP3URTdEq");

    }

}