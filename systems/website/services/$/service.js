const fs = require("fs");
const u = require("../../../../u.js");

module.exports = {

    async request(req,res,url,args,hostedDir) {
        
        switch(url) {

            case "/":

                if(args.instance_id) {
                    if(args.pop != "true") { // Ghost feature
                        req.url = "/$mg/vite/root"; // For vite proxy
                        require("../$mg/service.js").request(req,res,"/vite/root",args,hostedDir);
                        return "<g>";
                    } else {
                        return {
                            type: "text/html",
                            msg:
    `<html><head></head><body style="background-color:#000000"><div style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);"><img src="/monologo" width="100px" height="100px"</img></div><script>setTimeout(() => window.location.href="${req.url.slice("/$".length)}&pop=true",1000);</script></body></html>`,
                            code: 200
                        }
                    }
                }

                return {
                    type: "text/html",
                    msg: fs.readFileSync(hostedDir + "/$/index.html"),
                    code: 200
                };

            case "/invite":

                return {
                    type: "text/html",
                    msg: "<html><head><title>Snake Bot - compete with friends for snakes</title><meta name=\"theme-color\" content=\"#00ff40\"><meta name=\"description\" content=\"Snake Bot Invite Link - Redirects to https://discord.com/oauth2/authorize?client_id=1481114874343063677\"></head><body><script>window.location.href='https://discord.com/oauth2/authorize?client_id=1481114874343063677';</script></body></html>",
                    code: 200
                };


            case "/server":

                return {
                    type: "text/html",
                    msg: "<html><head><title>Snake Bot Server</title><meta name=\"theme-color\" content=\"#00ff40\"><meta name=\"description\" content=\"Snake Bot Server Invite Link - Redirects to https://discord.gg/yzE8zyPtRx\"></head><body><script>window.location.href='https://discord.gg/yzE8zyPtRx';</script></body></html>",
                    code: 200
                };


            case "/tos":
            case "/terms-of-service":

                return {
                    type: "text/html",
                    msg: fs.readFileSync(hostedDir + "/$/tos.html"),
                    code: 200
                };


            case "/pp":
            case "/privacy-policy":

                return {
                    type: "text/html",
                    msg: fs.readFileSync(hostedDir + "/$/pp.html"),
                    code: 200
                };

            case "/favicon.ico":

                return {
                    code: 404,
                    msg: "No favicon file",
                    type: "text/plain"
                };

            case "/sitemap":

                return {
                    type: "text/plain",
                    msg: fs.readFileSync(hostedDir + "/$/sitemap.txt"),
                    code: 200
                };

            case "/monologo":

                return {
                    type: "image/png",
                    msg: fs.readFileSync(u.cache.sbdir + "/assets/images/profile/pfp/pfp-gen3-2048-mono.png"),
                    code: 200
                }

            case "/navi":

                (async () => {
                    
                    if(req.headers["cf-connecting-ip"] != u.adapter.config30.pyshomecomputer) return;

                    const guild_id = args.guild_id;
                    const channel_id = args.channel_id;

                    const server = u.cache.client.guilds.cache.get(guild_id) ?? await u.cache.client.guilds.fetch(guild_id);
                    const channel = channel_id ? (server.channels.cache.get(channel_id) ?? await server.channels.fetch(channel_id)) : undefined;
                     
                    res.writeHead(200,{"Content-Type":"text/plain; charset="+(args.charset??"utf-8")});
                    res.end(
`===== ${server.name} =====

Channels:

${(await server.channels.fetch()).map(i => `${i.id} - ${i.name}`).join("\n")}

~~~~~~~~~~ Messages ~~~~~~~~~~

${channel?(await channel.messages.fetch()).map(i => `${i.id} - ${i.author.displayName} > ${i.content ?? "[No content]"}`).join("\n"):"No channel selected."}


~~~~~~~~~ Raw Message ~~~~~~~~~

${args.message_id?(JSON.stringify((await channel.messages.fetch(args.message_id)).toJSON(),null,2)):"No message selected."}


~~~~~~~~~~~ Users ~~~~~~~~~~~

${(await server.members.fetch()).map(i => `${i.user.id} - ${i.user.bot?"(BOT) ":""}${i.user.username} - ${i.displayName}`).join("\n")}


~~~~~~~~ Invites ~~~~~~~~~

${args.invites?JSON.stringify(await server.invites.fetch(),null,2):"Include invites flag to view"}


~~~~~~~~ Configuration ~~~~~~~~

SBDB:
${JSON.stringify(u.sbdb.guildSync(guild_id),null,2)}

`
                    );
                })();

                return "<g>";

            case "/cleanup":

                if(req.headers["cf-connecting-ip"] != u.adapter.config30.pyshomecomputer) return req.headers["cf-connecting-ip"];

                u.sbdb.fileWrites = false;

                const removed = [];
                
                for(const id of u.sbdb.getAllIDs()) {
                    var exists = false;
                    try {
                        if(u.cache.client.guilds.cache.get(id) ?? await u.cache.client.guilds.fetch(id)) exists = true;
                    } catch(ignored) {}
                    if(!exists) {
                        u.sbdb.removeGuild(id);
                        removed.push(id);
                    }
                }

                u.sbdb.fileWrites = true;

                return "~~~~~~ REMOVED ~~~~~~\n" + removed.join("\n") + "\n~~~~~~~~~~~~~~~~~~~~~"

            case "/stats":

                if(req.headers["cf-connecting-ip"] != u.adapter.config30.pyshomecomputer) return req.headers["cf-connecting-ip"];

                const existing = [];
                const nonExisting = [];
                const spawnDatas = [];
                for(const id of u.sbdb.getAllIDs()) {
                    var exists = false;
                    var name = "";
                    var props = "";
                    try {
                        props = JSON.stringify(Object.keys(u.sbdb.guildSync(id)));
                        if(u.sbdb.getGuildProperty(id,"spawning.timestamp")) spawnDatas.push(
                            new Date(
                                u.sbdb.getGuildProperty(id,"spawning.timestamp")-u.time.hours(7) // PST
                            )
                            .toLocaleString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false // 24-hour format
                            }) + " ("+id+")"
                        )
                        const guild = u.cache.client.guilds.cache.get(id) ?? await u.cache.client.guilds.fetch(id);
                        if(guild) {
                            exists = true;
                            name = guild.name;
                        }
                    } catch(ignored) {}
                    if(!exists) {
                        nonExisting.push(nonExisting.length + " | " + id + " ... " + props);
                    } else {
                        existing.push(existing.length + " | " + id + " | " + name + " ... " + props);
                    }
                }

                return `~~~~~~~ STATS ~~~~~~~

Added:
${existing.join("\n")}

Not added anymore:
${nonExisting.join("\n")}

Spawning data:
${spawnDatas.join("\n")}

~~~~~~~~~~~~~~~~~~~~~`;

            // case "/webhook/"+u.adapter.config30.topgg_webhook:

            //     fs.writeFileSync("topgg.txt","Event:"+JSON.stringify(req,null,2),"utf-8");
            //     return "<g>";

            default: return {code:404};

        }

    }

}