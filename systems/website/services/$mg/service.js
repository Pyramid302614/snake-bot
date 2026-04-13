const u = require("../../../../u")

module.exports = {

    async request(req,res,url,args,hostedDir) {

        if(!args.instance_id || !args.guild_id) return "<g>";
        
        const apiUrl = `https://discord.com/api/applications/${u.adapter.chip?u.adapter.config30.beetroot_client_id:u.adapter.config30.snakebot_client_id}/activity-instances/${args.instance_id}`;
        const apiHeaders = {
            headers: requestHeaders()
        };

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

                    const handlerResponse = JSON.parse(await (await fetch(
                        apiUrl,
                        apiHeaders
                    )).text());
                    if(handlerResponse.message == "404: Not Found") return "<g>";

                    // const opened = u.sbdb.getGuildProperty(args.guild_id,"minigame.opened")??[];
                    // if(opened.includes(req.socket.remoteAddress)) return "<g>";

                    // opened.push(req.socket.remoteAddress);
                    // await u.sbdb.updateGuildProperty(args.guild_id,"minigame.opened",opened);
                    await u.sbdb.updateGuildProperty(args.guild_id,"minigame.s",newS());
                    return {
                        type: "text/html",
                        msg: ambervars(
                            require("fs").readFileSync(`${hostedDir}/$mg/container.html`).toString(),
                            {
                                id: newId(hostedDir),
                                guild_id: args.guild_id,
                                instance_id: args.instance_id,
                                member: JSON.stringify(await (await u.cache.client.guilds.fetch(args.guild_id)).members.fetch(handlerResponse.users[handlerResponse[handlerResponse.users.length-1]]))
                            }
                        ),
                        code: 200
                    };
                } else return "<g>";

            case "/s":

                const handlerResponse = JSON.parse(await (await fetch(
                    apiUrl,
                    apiHeaders
                )).text());
                if(handlerResponse.message == "404: Not Found") return newS();
                if(u.sbdb.getGuildProperty(args.guild_id,"minigame.sFetched")) return newS();
                
                await u.sbdb.updateGuildProperty(args.guild_id,"minigame.sFetched",true);
                return u.sbdb.getGuildProperty(args.guild_id,"minigame.s");

        }

    }

}


// https://github.com/discord/embedded-app-sdk-examples/blob/main/sdk-playground/packages/server/src/lib/request.ts
function requestHeaders() {

    const clientId = u.adapter.chip?u.adapter.config30.beetroot_client_id:u.adapter.config30.snakebot_client_id;
    const clientSecret = u.adapter.chip?u.adapter.config30.beetroot_client_secret:u.adapter.config30.snakebot_client_secret;
    const token = u.adapter.chip?u.adapter.config30.beetroot_token:u.adapter.config30.snakebot_token;

	const headers = new Headers();
    headers.set('CF-Access-Client-Id', clientId);
    headers.set('CF-Access-Client-Secret', clientSecret);
	headers.set('Authorization', `Bot ${token}`);

	return headers;

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
        .replaceAll("&&member",data.member)
        .replaceAll("&&user",data.member.user)
        .replaceAll("**","&&") // Escape for escape
    ;
}