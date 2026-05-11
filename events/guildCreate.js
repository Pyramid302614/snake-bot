const { Events, Embed, EmbedBuilder } = require("discord.js");
const u = require("../u");

module.exports = {
    data: Events.GuildCreate,
    once: false,
    async execute(guild) {

        u.log.log("<@801895100443131976> Somebody has added the bot: " + guild.name);
        if(!u.sbdb.guildExists(guild.id))
            u.sbdb.registerGuild(guild);

    }
}