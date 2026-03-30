const { SlashCommandBuilder } = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("showcase-inv")
        .setDescription("Shows everybody your inventory by making the message non-hidden.")
        .addUserOption(option => option
            .setName("person")
            .setDescription("The person's inventory to showcase, which defaults to you 🫵")
            .setRequired(false)
        ),
    
    contexts: [],

    async execute(interaction) {
        require("./inv.js").execute(interaction,true);
    }

}