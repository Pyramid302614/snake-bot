const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder } = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Gives you the link to the official Snake Bot server"),

    contexts: ["absent"],

    async execute(interaction) {

        interaction.reply("Join to be a part of the Snake Bot fam:\nhttps://discord.gg/FyP3URTdEqs");

    }

}