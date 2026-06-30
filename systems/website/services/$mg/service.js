const { createProxyServer } = require("http-proxy");
const WebSocket = require("ws");
const http = require("http");
const u = require("../../../../u");

const fs = require("fs");
const { args } = require("../../../../utilities/url");
const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");

var proxy = null;

module.exports = {

    justTrueRoot: false,
    newId: newId,
    async init() {

        if(proxy) return;

        const viteport = u.adapter.config30.ports.vite;
        const vite_target = `http://localhost:${viteport}`;
        
        proxy = createProxyServer({
            target: vite_target,
            changeOrigin: true,
            ws: true
        });
        u.log.log("[ME] Proxy created for target: " + vite_target);

        // wss = new WebSocket.Server({ port: wsport },u.log.log("[ME] Websocket hosted on port " + wsport));
        // wss.on("connection",(ws) => {

        //     console.log("hi")
        //     ws.send("Connected to Websocket :)");
        //     ws.on("message",async (data) => {
        //         const json = JSON.parse(data);
        //         if(json.type == "report") {
        //             const minigame = u.sbdb.getGuildProperty(json.args.guild_id,"minigame");
        //             await u.sbdb.updateGuildProperty(json.args.guild_id,"minigame",{winner:json.args.user_id});
        //             if(u.sbdb.getGuildProperty(json.args.guild_id,"minigame.winner") != json.args.user_id) return;
        //             console.log(json.data[0]);
        //         }
        //     });
        

        // });
        // u.log.log("[ME] WebSocket Server created");

        // wsProxy = createProxyServer({
        //     target: ws_target,
        //     changeOrigin: true,
        //     ws: true
        // });
        // u.log.log("[ME] Proxy created for target: " + ws_target);  

        // wsConnector = http.createServer((req,res) => {}) // nothing brutz 😂😁
        // wsConnector.on("upgrade",(req,socket,head) => {
        //     wsProxy.ws(req,socket,head);
        // });
        // wsConnector.listen(wsconnectorport,"0.0.0.0",() => u.log.log("[ME] WebSocket Connector Server created"));

        // wsConnectorProxy = createProxyServer({
        //     target: ws_connector_target,
        //     changeOrigin: true,
        //     ws: true
        // });
        // u.log.log("[ME] Proxy created for target: " + ws_connector_target);



    },
    async request(req,res,url,args,hostedDir) {

        res.setHeader("Access-Control-Allow-Origin", "*");
        // res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        // res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if(this.justTrueRoot && url.req != "/") return "Sorry, the server is currently idle right now due to an issue. Come back later :)";

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
                    // args.location_id &&
                    // args.launch_id &&
                    // Removed because mobile does not have these parameters (refferer_id and custom_id)
                    // args.referrer_id &&
                    // args.custom_id &&
                    args.guild_id &&
                    // args.channel_id &&
                    // args.frame_id &&
                    args.platform
                ) {

                    await new Promise(resolve => setTimeout(resolve,1000));

                    // Fetches user
                    // const users = u.sbdb.getGuildProperty(args.guild_id,"minigame.users");
                    // var user = users[req.headers["cf-connecting-ip"]] ?? "unknown";
                    // if(user == "unknown") for(let i = 0; i < Object.keys(users).length; i++) {
                    //     if(Object.values(users)[i] == "unknown") {
                    //         user = Object.keys(users)[i];
                    //         break;
                    //     }
                    // }
                    // if(user == "unknown") return {
                    //     type: "text/html",
                    //     msg: fs.readFileSync(hostedDir+"/$mg/lost.html"),
                    //     code: 200
                    // };

                    // Adds you to the whitelist
                    // u.sbdb.updateGuildProperty(args.guild_id,`minigame.users.${user}`,req.headers["cf-connecting-ip"]);
                    
                    // Fetches minigame ID
                    const id = u.sbdb.getGuildProperty(args.guild_id,"minigame.id");

                    // Crafts ambervars
                    // const member = await (await u.cache.client.guilds.fetch(args.guild_id)).members.fetch(user);
                    const s = Math.floor(Math.random()*1000000000);
                    u.sbdb.updateGuildProperty(args.guild_id,"minigame.s",s);
                    const headers = {
                        "id": id,
                        "ip": u.adapter.chip?"https://beetroot.pyramidstudios.xyz":"https://snakebot.pyramidstudios.xyz",
                        "wsip": u.adapter.chip?"wss://beetroot-ws.pyramidstudios.xyz":"wss://snakebot-ws.pyramidstudios.xyz",
                        "guildid": args.guild_id,
                        "instanceid": args.instance_id,
                        // "userid": member.user.id,
                        // "displayname": member.user.displayName,
                        "script": fs.readFileSync(`${hostedDir}/$mg/all/${id}.js`),
                        "clientid": u.adapter.chip?u.adapter.config30.beetroot_client_id:u.adapter.config30.snakebot_client_id,
                        "platform": args.platform,
                        "s_": s
                    }

                    // Adds them to request headers
                    for(let i = 0; i < Object.keys(headers).length; i++) {
                        req.headers["x-ambervar-" + Object.keys(headers)[i]] = Object.values(headers)[i];
                    }

                    req.headers["x-ambervar-test"] = "beantato";
                    
                    // Forwards request to vite client
                    proxy.web(req,res);

                    return "<g>"; // Tells the gateway to not try to respond, because the proxy will itself

                } else return "(!) Missing some URL parameters. Try re-opening the activity.";

            case "/report":

                if(args.s != u.sbdb.getGuildProperty(args.guild_id,"minigame.s") + "") return "<g>";

                try {

                    const minigame = u.sbdb.getGuildProperty(args.guild_id,"minigame") ?? {};
                    
                    const data = JSON.parse(args.data
                        .replaceAll("%22","\"")
                        .replaceAll("%20"," ")
                    );

                    const score = data[2];
                    const entireTime = data[0];
                    const roundTime = data[1];
                    
                    // const user_id = Object.keys(minigame.users)?.[Object.values(minigame.users).indexOf(req.headers["cf-connecting-ip"])] ?? args.user_id;
                    const user_id = args.user_id;

                    const socialCreditAmount = 
                        Math.round(
                            (
                                data.mobile
                                    ?((roundTime/entireTime)+(1-roundTime/entireTime)*0.6)
                                    :((roundTime/entireTime)+(1-roundTime/entireTime)*0.4)
                            ) *score*(require("./minigames.json").minigames[minigame.id].max_sc/3)
                        );

                    if(![0,1,2,3].includes(score)) return "<g>";
                    
                    const type = u.sbdb.getGuildProperty(args.guild_id,"minigame.type");
                    const amount = 1;
                    
                    // Restricts duplicates
                    if(u.sbdb.getGuildProperty(args.guild_id,"minigame.finished")) return;
                    await u.sbdb.updateGuildProperty(args.guild_id,"minigame.finished",true);

                    const guild = (u.cache.client.guilds.cache.get(args.guild_id)) ?? (await u.cache.client.guilds.fetch(args.guild_id));
                    const channel = (guild.channels.cache.get(minigame.channelId)) ?? (await guild.channels.fetch(minigame.channelId));
                    // World's top 10 best variable names
                    const messageWithTheButton = (channel.messages.cache.get(minigame.msdId)) ?? (await channel.messages.fetch(minigame.msgId));

                    const message = await require("../../../spawning/messages/messages.js").catch(
                        u.sbdb.guildSync(args.guild_id),
                        {
                            snake: type,
                            id: u.sbdb.getGuildProperty(args.guild_id,"minigame.id"),
                            winner: user_id,
                            score: score,
                            entireTime: entireTime,
                            roundTime: roundTime,
                            mobile: args.mobile === "true",
                            amount: amount,
                            score: score,
                            socialCredit: socialCreditAmount
                        },
                        guild,
                        channel
                    );
                    if(message.code != 0) {
                        console.log(message);
                        return "<g>";
                    }
                    
                    try {
                        messageWithTheButton.delete();
                        channel.send(message.data);
                    } catch(ignored) {
                        return;
                    }

                    // Updates SBDB
                    u.sbdb.updateGuildProperty(args.guild_id,"minigame",{});
                    u.sbdb.updateGuildProperty(args.guild_id,"spawning.step",-1);
                    await u.sbdb.updateGuildProperty(args.guild_id,"inventories."+user_id+".snakes."+type.name,(u.sbdb.getGuildProperty(args.guild_id,"inventories."+user_id+".snakes."+type.name)??0)+amount);
                    await u.sbdb.updateGuildProperty(args.guild_id,"inventories."+user_id+".socialCredit",(u.sbdb.getGuildProperty(args.guild_id,"inventories."+user_id+".socialCredit")??0)+socialCreditAmount);

                    if(type.name == "blank") {

                        if(!u.sbdb.getGuildProperty(guild.id,"DSAMs."+user_id+".blankSnakeCatch")) {

                            u.sbdb.updateGuildProperty(guild.id,"DSAMs."+user_id+".blankSnakeCatch",true);
                            (await guild.members.cache.get(user_id) ?? guild.members.fetch(user_id)).send({
                                components: [
                                    new ContainerBuilder()
                                        .addTextDisplayComponents(
                                            new TextDisplayBuilder()
                                                .setContent(
`### Wow :o
You have caught your first **blank snake**!

### What is that?
A blank snake is essentially a potential **pet**,
where if you apply snake shards of any type in any order in \`/wb\`,
you can make your own custom **pet snake** to show off in
your inventory!`
                                                )
                                        )
                                        .setAccentColor([255,255,255]) // blanco
                                ],
                                flags: [MessageFlags.IsComponentsV2]
                            });

                        }

                    }

                } catch(ignored) {
                    console.log(ignored);
                }

                return "<g>";

            case "/vite/monologo":
                
                return {
                    type: "image/png",
                    msg: fs.readFileSync(u.cache.sbdir + "/assets/images/profile/pfp/pfp-gen3-2048-mono.png"),
                    code: 200
                }


            // case "/token":

                
                
            
            case "/me":

                var body = "";
                req.on("data", chunk => body += chunk);
                req.on("error", e => {
                    res.writeHead(400, { "Content-Type": "text/plain" });
                    res.end(JSON.stringify(e.message ?? e,null,2));
                });
                await new Promise(resolve => req.on("end",resolve));
                const code = body;

                const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: u.adapter.chip ? u.adapter.config30.beetroot_client_id : u.adapter.config30.snakebot_client_id,
                        client_secret: u.adapter.chip ? u.adapter.config30.beetroot_client_secret : u.adapter.config30.snakebot_client_secret,
                        grant_type: "authorization_code",
                        code,
                        redirect_uri: "http://discord.com"
                    })
                });

                const tokenData = await tokenResponse.json();

                const userRes = await fetch("https://discord.com/api/users/@me", {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`
                    }
                });

                const User = await userRes.json();

                return JSON.stringify(User);
                


            default:

                proxy.web(req,res);
                return "<g>";
                

        }

    },

    async wsMessage(msg) {

        return "<g>";

    }
    
}

function newId(hostedDir) {
    
    const dir = fs.readdirSync(`${hostedDir}/$mg/all`);
    return dir[Math.floor(Math.random()*dir.length)].split(".")[0];

}