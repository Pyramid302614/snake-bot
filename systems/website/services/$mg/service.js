const u = require("../../../../u");

const fs = require("fs");

module.exports = {

    async request(req,res,url,args,hostedDir) {

        if(!args.guild_id) {
            return {
                type: "text/html",
                msg: fs.readFileSync(hostedDir+"/$mg/lost.html"),
                code: 200
            };
        }

        if(!args.instance_id || !args.guild_id) return "<g>";
        
        switch(url) {

            case "/":

                if(
                    args.instance_id &&
                    args.location_id &&
                    args.launch_id &&
                    args.referrer_id &&
                    args.custom_id &&
                    args.guild_id &&
                    args.channel_id &&
                    args.frame_id &&
                    args.platform
                ) {

                    await new Promise(resolve => setTimeout(resolve,1000));
                    const users = u.sbdb.getGuildProperty(args.guild_id,"minigame.users");
                    var user = "unknown";
                    if(user) for(let i = 0; i < Object.keys(users).length; i++) {
                        if(Object.values(users)[i] == "unknown") {
                            user = Object.keys(users)[i];
                            break;
                        }
                    }
                    if(user == "unknown") return {
                        type: "text/html",
                        msg: fs.readFileSync(hostedDir+"/$mg/lost.html"),
                        code: 200
                    };
                    u.sbdb.updateGuildProperty(args.guild_id,`minigame.users.${user}`,req.socket.remoteAddress);
                    
                    await u.sbdb.updateGuildProperty(args.guild_id,"minigame.s",newS());
                    const id = newId(hostedDir);

                    return {
                        type: "text/html",
                        msg: ambervars(
                            fs.readFileSync(`${hostedDir}/$mg/container.html`).toString(),
                            {
                                id: id,
                                guild_id: args.guild_id,
                                instance_id: args.instance_id,
                                member: await (await u.cache.client.guilds.fetch(args.guild_id)).members.fetch(user),
                                script: fs.readFileSync(`${hostedDir}/$mg/all/${id}.js`)
                            }
                        ),
                        code: 200
                    };
                } else return "<g>";

            case "/s":

                if(u.sbdb.getGuildProperty(args.guild_id,"minigame.sFetched")) return newS();
                
                await u.sbdb.updateGuildProperty(args.guild_id,"minigame.sFetched",true);
                return u.sbdb.getGuildProperty(args.guild_id,"minigame.s");

        }

    }

}


function newS() {

    return Math.floor(Math.random()*16_000_000).toString(16);

}
function newId(hostedDir) {
    
    return Math.floor(Math.random()*fs.readdirSync(`${hostedDir}/$mg/all`).length);

}

function ambervars(content,data) {
    return content
        .replaceAll("&&id",data.id)
        .replaceAll("&&guildId",data.guild_id)
        .replaceAll("&&instanceId",data.instance_id)
        .replaceAll("&&member.displayName",data.member.displayName)
        .replaceAll("&&user.displayName",data.member.user.displayName)
        .replaceAll("&&script",data.script)
        .replaceAll("**","&&") // Escape for escape
    ;
}