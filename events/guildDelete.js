const { Events, Embed, EmbedBuilder } = require("discord.js");
const u = require("../u");

module.exports = {
    data: Events.GuildDelete,
    once: false,
    async execute(guild) {

        u.log.plog("<@801895100443131976> Somebody has removed the bot: " + guild.name);

        const serverCount = u.sbdb.getSync(0)?.server_count;
        
        if(!u.adapter.chip && serverCount !== undefined) {

            u.sbdb.write(0,"server_count",serverCount-1);

            fetch(
                `https://top.gg/api/bots/${u.adapter.config30.snakebot_client_id}/stats`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        server_count: serverCount-1
                    }),
                    headers: {
                        Authorization: `Bearer ${u.adapter.config30.topgg_token}`
                    }
                }
            );

        } else {
            u.log.err("[CODE 40] `server_count` property is missing from Sector 0",new Error(),"code");
        }

    }
}