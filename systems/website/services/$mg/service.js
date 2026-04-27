const { createProxyServer } = require("http-proxy");
const u = require("../../../../u");

const fs = require("fs");

var proxy = null;

const vite_target = "http://localhost:5173";

module.exports = {

    newId: newId,
    async init() {

        proxy = createProxyServer({
            target: vite_target,
            changeOrigin: true,
            ws: true
        });
        u.log.log("[ME] Proxy created for target: " + vite_target);

    },
    async request(req,res,url,args,hostedDir) {

        res.setHeader("Access-Control-Allow-Origin", "*");
        // res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        // res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if(!proxy) return "Cannot reach vite client; Proxy is null";
        
        switch(url) {

            case "/vite/root":

                if(!args.guild_id) {
                    return {
                        type: "text/html",
                        msg: fs.readFileSync(hostedDir+"/$mg/lost.html"),
                        code: 200
                    };
                }

                if(
                    args.instance_id &&
                    args.location_id &&
                    args.launch_id &&
                    // Removed because mobile does not have these parameters
                    // args.referrer_id &&
                    // args.custom_id &&
                    args.guild_id &&
                    args.channel_id &&
                    args.frame_id &&
                    args.platform
                ) {

                    await new Promise(resolve => setTimeout(resolve,1000));

                    // Fetches user
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

                    // Adds you to the whitelist
                    u.sbdb.updateGuildProperty(args.guild_id,`minigame.users.${user}`,req.socket.remoteAddress);
                    
                    // Fetches minigame ID
                    const id = u.sbdb.getGuildProperty(args.guild_id,"minigame.id");

                    // Crafts ambervars
                    const member = await (await u.cache.client.guilds.fetch(args.guild_id)).members.fetch(user);
                    const headers = {
                        "id": id,
                        "ip": u.adapter.chip?"https://beetroot.pyramidstudios.xyz":"https://snakebot.pyramidstudios.xyz",
                        "guildid": args.guild_id,
                        "instanceid": args.instance_id,
                        "userid": member.user.id,
                        "displayname": member.user.displayName,
                        "script": fs.readFileSync(`${hostedDir}/$mg/all/${id}.js`),
                        "clientid": u.adapter.chip?u.adapter.config30.beetroot_client_id:u.adapter.config30.snakebot_client_id
                    }

                    // Adds them to request headers
                    for(let i = 0; i < Object.keys(headers).length; i++) {
                        req.headers["x-ambervar-" + Object.keys(headers)[i]] = Object.values(headers)[i];
                    }

                    req.headers["x-ambervar-test"] = "beantato";

                    // Forwards request to vite client
                    proxy.web(req,res);

                    return "<g>"; // Tells the gateway to not try to respond, because the proxy will itself

                } else return "<g>";

            case "/r":

                const minigame = u.sbdb.getGuildProperty(args.guild_id,"minigame");
                await u.sbdb.updateGuildProperty(args.guild_id,"minigame",{winner:args.user_id});
                if(u.sbdb.getGuildProperty(args.guild_id,"minigame.winner") != args.user_id) return;
                console.log(args.r);
                // backend win code
                return "<g>";

            default:
                
                proxy.web(req,res);
                return "<g>";
                

        }

    }
}

function newId(hostedDir) {
    
    const dir = fs.readdirSync(`${hostedDir}/$mg/all`);
    return dir[Math.floor(Math.random()*dir.length)].split(".")[0];

}