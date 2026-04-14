const { Events } = require("discord.js");
const u = require("../../u.js");
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

    },
    async start(guildId,trustedIP) {

        if((u.sbdb.getGuildProperty(guildId,`minigame`)??{}).stage == 0) {
            await u.sbdb.updateGuildProperty(guildId,`minigame.stage`,1);
            await u.sbdb.updateGuildProperty(guildId,`minigame.trustedIP`,trustedIP);
            await u.sbdb.updateGuildProperty(guildId,`minigame.secret`,newSecret());
        } else
            return;

    },

    host(port,ip) {

        u.adapter.intervals.push(
            setInterval(() => reqCount = {},frameDuration)
        );
        const server = require("http").createServer(request);
        server.listen(port,"0.0.0.0",() => console.log("Website hosted on port " + port + " at ip " + ip));

    }

}

const frameDuration = u.time.minutes(2);
const maximumRequestsEveryFrame = 30;
var reqCount = {};

const allowedFiles = [
    "/assets/ReemKufi-Bold.ttf",
    "/assets/DMSans_18pt-Light.ttf",
    "/assets/DMSans_18pt-ExtraLight.ttf",
    "/assets/DMSans_18pt-Regular.ttf"
];

const hostedDir = "snake-bot/systems/website/public";
async function request(req,res) {

    res.setHeader('Access-Control-Allow-Origin',"*");

    console.log("URL: " + req.url + " Requests: " + reqCount[req.socket.remoteAddress] + " of " + maximumRequestsEveryFrame);;

    if(reqCount[req.socket.remoteAddress] > maximumRequestsEveryFrame) return; // Im not finna respond to alla that
    reqCount[req.socket.remoteAddress] = (reqCount[req.socket.remoteAddress]??0)+1;

    try {

        var contentType = "text/plain";
        var ret = true; // Should I return something?

        // Whitelist
        var returnMsg = await (async () => {

            switch(true) {

                case /\/snake-bot/.test(req.url):

                    contentType = "text/html";
                    return fs.readFileSync(`${hostedDir}/index.html`,"utf-8");

                case /\/\?.+/.test(req.url):


                    const guildId = req?.url?.split("guild_id=")?.[1]?.split("&")?.[0];
                    if(!guildId) return "Failed to get guild id from url.";

                    const minigame = u.sbdb.getGuildProperty(guildId,"minigame");

                    if(!minigame) {
                        contentType = "text/html";
                        return fs.readFileSync(`${hostedDir}/none.html`) ?? "File not found";
                    }

                    const minigameID = minigame.id;
                    if(minigameID == null || minigameID == undefined) return "Failed to fetch new minigame ID.";

                    const amberVars = (v) => {
                        return (v?.toString() ?? v)
                            // Ambervars
                            .replaceAll("s&&","&&") // To make it directly insertable into javascript files without giving errors (s = "safe")
                            .replaceAll("&&playScript",fs.readFileSync(`${hostedDir}/play.js`)) // These scripts files are early decoded so the below variables can work inside them
                            .replaceAll("&&spectateScript",fs.readFileSync(`${hostedDir}/spectate.js`))
                            .replaceAll("&&minigameID",minigameID)
                            .replaceAll("&&guildId",guildId)
                            .replaceAll("&&generalScript",fs.readFileSync(`${hostedDir}/minigames/general.js`))
                            .replaceAll("&&minigameScript",fs.readFileSync(`${hostedDir}/minigames/${minigameID}.js`))
                            .replaceAll("&&cloudflared",u.adapter.config30.cloudflared) // CloudFlared tunnel url
                            .replaceAll("**","&&"); // Escape for escape
                    };


                    const stage = u.sbdb.getGuildProperty(guildId,"minigame.stage");

                    if(stage == 0) {

                        // Set stage to 1
                        await require("./website.js").start(guildId,req.socket.remoteAddress); // Your >PUBLIC< IP!!! You expose this to the internet DAILY. I am !!NOT!! storing your PRIVATE IP    

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

                case /\/secret:\d+/.test(req.url):

                    const guildId_ = req.url.split(":")[req.url.split(":").length-1];
                    const minigame_ = u.sbdb.getGuildProperty(guildId_,"minigame");
                    if(!minigame_) return newSecret(); // Take this
                    if(minigame_.fetchedSecret == null || minigame_.fetchedSecret == undefined || minigame_.fetchedSecret == false) {
                        u.sbdb.updateGuildProperty(guildId_,"minigame.fetchedSecret",true); // Asynchronously writes because why not
                        return minigame_.secret;
                    } else {
                        return newSecret(); // Your welcome
                    }

                case /\/close:\d+/.test(req.url):

                    const data = req.url.split(":");
                    const minigame__ = u.sbdb.getGuildProperty(data[1],"minigame");
                    if(minigame__.secret == data[2] && minigame__.trustedIP == req.socket.remoteAddress)
                        await u.sbdb.updateGuildProperty(data[1],"minigame",null);
                    break;

                case /\/api\/token/.test(req.url): ret = false; discordRequest(req,res);
                
                    return;


                case /\/ping!/.test(req.url):
                    
                    return "pong :)";



                case /\/.+\..+/.test(req.url):

                    const requestedFile = req.url;
                    if(allowedFiles.includes(requestedFile)) {
                        const ext = require("node:path").extname(requestedFile);
                        switch(ext) {
                            case "ttf": contentType = "font/ttf"; break;
                            case "txt": contentType = "text/plain"; break;
                            case "html": contentType = "text/html"; break;
                            case "png": contentType = "image/png"; break;
                            case "json": contentType = "text/json"; break;
                        };
                        if(!fs.existsSync(hostedDir + requestedFile)) {
                            res.writeHead(404,{"Content-Type":"text/plain"});
                            res.end("404 File not found");
                            ret = false;
                            return;
                        }
                        return fs.readFileSync(hostedDir + requestedFile);
                    }

                    res.writeHead(404,{"Content-Type":"text/plain"});
                    res.end("404 File not found"); // It could exist but my security doesn't think so
                    ret = false;
                    return;

                default: 
                    
                    // Ok maybe this was a little harsh
                    // reqCount[req.socket.remoteAddress] = maximumRequestsEveryFrame+1; // Makes it time you out if you do things wrong teehee
                    return null; // If the request is not whitelisted


        }})() ?? "Request sent."; // You'll never really know

        if(!ret) return;

        res.writeHead(200,{"Content-Type":contentType});
        res.end(returnMsg);

    } catch(e) {

        // It was too descriptive for my liking
        // res.writeHead(400,{"Content-Type":"text/plain"});
        // res.end("400 Bad Request\n\nError: "+e.message);

        res.writeHead(200,{"Content-Type":contentType});
        res.end("Request sent.");

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

function newSecret() {
    return Math.floor(Math.random()*16_000_000).toString(16);
}