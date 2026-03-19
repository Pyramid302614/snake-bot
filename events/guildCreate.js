const { Events, Embed, EmbedBuilder } = require("discord.js");
const u = require("../u");

module.exports = {
    data: Events.GuildCreate,
    once: false,
    async execute(guild) {
        
        if(!u.sbdb.guildSync(guild.id))
        u.sbdb.registerGuild(guild);

    }
}