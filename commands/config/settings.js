const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { execute } = require("../../events/messageUpdate");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("settings")
        .setDescription("(Admin) Gets your server's configurations")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    contexts: [],
    async execute(interaction) {

        

    }
}