const u = require("../../u");
const fs = require("fs");

module.exports = {

    async init(guildId,userId) {

        await u.sbdb.updateGuildProperty(
            guildId,`minigame`,
            {
                userId: userId,
                stage: 0, // 0 = init
                id: Math.floor(Math.random()*fs.readdirSync(hostedDir + "/minigames").length)
            }
        );
        await new Promise(resolve => setTimeout(resolve,500));

    },
    async start(guildId,trustedIP) {

        if((u.sbdb.getGuildProperty(guildId,`minigame`)??{}).stage == 0) {
            await u.sbdb.updateGuildProperty(guildId,`minigame.stage`,1);
            await u.sbdb.updateGuildProperty(guildId,`minigame.trustedIP`,trustedIP);
        } else
            return;

    },

    host(port,ip) {

        const server = require("http").createServer(request);
        server.listen(port,"0.0.0.0",() => console.log("Minigames hosted on port " + port + " at ip " + ip));

    }

}


const hostedDir = "snake-bot/systems/minigames/public";
async function request(req,res) {

    try {

        var contentType = "text/plain";
        var ret = true; // Should I return something?

        // Whitelist
        var returnMsg = await (async () => {

            // console.log("URL: " + req.url);

            switch(true) {

                case /\/\?.+/.test(req.url):


                    const guildId = req?.url?.split("guild_id=")?.[1]?.split("&")?.[0];
                    if(!guildId) return "Failed to get guild id from url.";

                    if(!u.sbdb.getGuildProperty(guildId,"minigame")) {
                        contentType = "text/html";
                        return fs.readFileSync(`${hostedDir}/none.html`) ?? "File not found";
                    }

                    const minigameID = u.sbdb.getGuildProperty(guildId,"minigame.id");
                    if(minigameID == null || minigameID == undefined) return "Failed to fetch new minigame ID.";

                    const amberVars = (v) => {
                        return (v?.toString() ?? v)
                            // Ambervars
                            .replaceAll("s&&","&&") // To make it directly insertable into javascript files without giving errors (s = "safe")
                            .replaceAll("&&playScript",fs.readFileSync(`${hostedDir}/play.js`)) // These scripts files are early decoded so the below variables can work inside them
                            .replaceAll("&&spectateScript",fs.readFileSync(`${hostedDir}/spectate.js`))
                            .replaceAll("&&minigameID",minigameID)
                            .replaceAll("&&guildId",guildId)
                            .replaceAll("&&minigameScript",fs.readFileSync(`${hostedDir}/minigames/${minigameID}.js`))
                            .replaceAll("&&cloudflared",u.adapter.config30.cloudflared) // CloudFlared tunnel url
                            .replaceAll("**","&&"); // Escape for escape
                    };

                    
                    const stage = u.sbdb.getGuildProperty(guildId,"minigame.stage");

                    if(stage == 0) {

                        // Set stage to 1
                        await require("./minigames.js").start(guildId,req.socket.remoteAddress); // Your >PUBLIC< IP!!! You expose this to the internet DAILY. I am !!NOT!! storing your PRIVATE IP    

                        // Return play file
                        contentType = "text/html";
                        return amberVars(fs.readFileSync(hostedDir + "/play.html") ?? "File not found");
                            
                    } else if(stage == 1) {

                        // Return spectate file
                        contentType = "text/html";
                        return amberVars(fs.readFileSync(hostedDir + "/spectate.html") ?? "File not found");

                    } else {

                        return "Unknown minigame stage: " + stage;

                    }


                case /\/displayname/.test(req.url):

                    const guild = await u.cache.client.guilds.fetch(req.split("guild_id=")[1].split("&")[0]);
                    return (await guild.members.fetch(u.sbdb.getGuildProperty(guild.id,"minigame.userId"))).displayName;


                case /\/close:\d+/.test(req.url):

                    console.log(req.url.split(":")[req.url.split(":").length-1]);
                    await u.sbdb.updateGuildProperty(req.url.split(":")[req.url.split(":").length-1],"minigame",null);
                    break;

                case /\/api\/token/.test(req): ret = false; discordRequest(req,res);
                
                    return;


                case /\/ping!/.test(req.url):
                    
                    return "pong :)";


                default: return null; // If the request is not whitelisted


        }})() ?? "Request sent."; // You'll never really know

        if(!ret) return;

        res.writeHead(200,{"Content-Type":contentType});
        res.end(returnMsg);

    } catch(e) {

        res.writeHead(400,{"Content-Type":"text/plain"});
        res.end("400 Bad Request\n\nError:"+e.message);

    }

}
async function discordRequest(req,res) {

    // var body = "";
    // req.on("data",(chunk) => body += chunk.toString());
    // await new Promise(resolve => res.on("end",resolve));

    // Exchange the code for an access_token
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: u.adapter.chip?u.adapter.config30.beetroot_client_id:u.adapter.config30.snakebot_client_id,
            client_secret: u.adapter.chip?u.adapter.config30.beetroot_client_secret:u.adapter.config30.snakebot_client_secret,
            grant_type: "authorization_code",
            code: req.body.code, // code: JSON.parse(req.body).code
        }),
    });

    // Retrieve the access_token from the response
    const { access_token } = await response.json();

    // Return the access_token to our client as { access_token: "..."}
    res.send({access_token});

}