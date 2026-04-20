const u = require("../../../../u");

const fs = require("fs");

module.exports = {

    newId: newId,
    newS: newS,
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
                    // args.referrer_id &&
                    // args.custom_id &&
                    args.guild_id &&
                    args.channel_id &&
                    args.frame_id &&
                    args.platform
                ) {

                    await new Promise(resolve => setTimeout(resolve,1000));
                    const users = u.sbdb.getGuildProperty(args.guild_id,"minigame.users");
                    var user = users[req.socket.remoteAddress] ?? "unknown";
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
                    
                    const id = u.sbdb.getGuildProperty(args.guild_id,"minigame.id");

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

            case "/r":

                const minigame = u.sbdb.getGuildProperty(args.guild_id,"minigame");
                if(minigame.s != args.s) return "<g>";
                await u.sbdb.updateGuildProperty(args.guild_id,"minigame",{winner:args.user_id});
                if(u.sbdb.getGuildProperty(args.guild_id,"minigame.winner") != args.user_id) return;
                // backend win code
                return "<g>";

        }

    }

}


function newS() {

    return Math.floor(Math.random()*16_000_000).toString(16);

}
function newId(hostedDir) {
    
    const dir = fs.readdirSync(`${hostedDir}/$mg/all`);
    return dir[Math.floor(Math.random()*dir.length)].split(".")[0];

}

function ambervars(content,data) {
    return content
        .replaceAll("s&&","&&") // Script-safes
        .replaceAll("&&id",data.id)
        .replaceAll("&&guildId",data.guild_id)
        .replaceAll("&&instanceId",data.instance_id)
        .replaceAll("&&member.displayName",data.member.user.displayName)
        .replaceAll("&&user.displayName",data.member.user.displayName)
        .replaceAll("&&member.userId",data.member.user.id)
        .replaceAll("&&user.userId",data.member.user.id)
        .replaceAll("&&script",data.script)
        .replaceAll("**","&&") // Escape for escape
    ;
}