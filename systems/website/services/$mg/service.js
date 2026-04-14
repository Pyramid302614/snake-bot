const u = require("../../../../u")

module.exports = {

    async request(req,res,url,args,hostedDir) {

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
                    if(!users) return "User cache is empty";
                    const user = users[users.length-1]; // Last joined player
                    
                    await u.sbdb.updateGuildProperty(args.guild_id,"minigame.s",newS());
                    const id = newId(hostedDir);

                    return {
                        type: "text/html",
                        msg: ambervars(
                            require("fs").readFileSync(`${hostedDir}/$mg/container.html`).toString(),
                            {
                                id: id,
                                guild_id: args.guild_id,
                                instance_id: args.instance_id,
                                member: await (await u.cache.client.guilds.fetch(args.guild_id)).members.fetch(user),
                                script: require("fs").readFileSync(`${hostedDir}/$mg/all/${id}.js`)
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
    
    return Math.floor(Math.random()*require("fs").readdirSync(`${hostedDir}/$mg/all`).length);

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