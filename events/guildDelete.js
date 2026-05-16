const { Events, Embed, EmbedBuilder } = require("discord.js");
const u = require("../u");

module.exports = {
    data: Events.GuildDelete,
    once: false,
    async execute(guild) {

        u.log.log("<@801895100443131976> Somebody has removed the bot: " + guild.name);

    }
}