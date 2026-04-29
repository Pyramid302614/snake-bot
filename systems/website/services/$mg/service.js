const { createProxyServer } = require("http-proxy");
const WebSocket = require("ws");
const http = require("http");
const u = require("../../../../u");

const fs = require("fs");
const { args } = require("../../../../utilities/url");

var proxy = null;

module.exports = {

    newId: newId,
    async init() {

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
                    const s = Math.floor(Math.random()*1000000000);
                    u.sbdb.updateGuildProperty(args.guild_id,"minigame.s",s);
                    const headers = {
                        "id": id,
                        "ip": u.adapter.chip?"https://beetroot.pyramidstudios.xyz":"https://snakebot.pyramidstudios.xyz",
                        "wsip": u.adapter.chip?"wss://beetroot-ws.pyramidstudios.xyz":"wss://snakebot-ws.pyramidstudios.xyz",
                        "guildid": args.guild_id,
                        "instanceid": args.instance_id,
                        "userid": member.user.id,
                        "displayname": member.user.displayName,
                        "script": fs.readFileSync(`${hostedDir}/$mg/all/${id}.js`),
                        "clientid": u.adapter.chip?u.adapter.config30.beetroot_client_id:u.adapter.config30.snakebot_client_id,
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

                } else return "<g>";

            case "/report":

                if(args.s != u.sbdb.getGuildProperty(args.guild_id,"minigame.s")) return "<g>";

                try {
                    
                    const data = JSON.parse(args.data
                        .replaceAll("%22","\"")
                        .replaceAll("%20"," ")
                    );

                    const score = data[0];

                    // u.sbdb.updateGuildProperty(args.guild_id,"minigame.winner",{
                    //     user_id: args.user_id,
                    //     score: score
                    // });
                    
                    await u.sbdb.updateGuildProperty(args.guild_id,"minigame.finished",true);
                    await require("../../../spawning/messages.js").catch(u.sbdb.guildSync(args.guild_id),u.sbdb.getGuildProperty(args.guild_id,"minigame.type"),args.guild_id);

                } catch(ignored) {
                    console.log(ignored);
                }

                return "<g>";


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