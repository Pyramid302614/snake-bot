const http = require("http");
const fs = require("fs");
const fetch = require("node-fetch");
const express = require("express");
const u = require("../../u");

const dir = "snake-bot/website/";

const app = express();

app.use(express.json());

module.exports = {
    host(port,ip,chip) {

        u.log.log("Configuring website (Chip mode: " + (chip?"ON":"OFF") + ")");

        app.post("/api/token", async (req,res) => {

            console.log(req.url);
            
            // Exchange the code for an access_token
            const response = await fetch(`https://discord.com/api/oauth2/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: chip?u.adapter.config30.beetroot_client_id:u.adapter.config30.snakebot_client_id,
                    client_secret: chip?u.adapter.config30.beetroot_client_secret:u.adapter.config30.snakebot_client_secret,
                    grant_type: "authorization_code",
                    code: req.body.code,
                }),
            });

            // Retrieve the access_token from the response
            const { access_token } = await response.json();

            // Return the access_token to our client as { access_token: "..."}
            res.send({access_token});

        });

        app.use(async (req,res) => {
            if(req.url == "/api/token") return; //nonono
            console.log(req.url);
            res.writeHead(200,{"Content-Type":"text/html"});
            res.end("<html><head></head><body style='background-color:red;'>hi 2.x</body></html>");
        })

        app.listen(port,"0.0.0.0",() => {
            u.log.log(`Website open at http://${ip}:${port}`);
        });

    }


};

function legacyRequest(req,res,port,ip) {

    (req,res) => {

        // Restricting to only /snake-bot/website, which doubles as C:, ~, and ../ security
        req.url = req.url;

        // File path index
        var file = req.url.slice(1).replaceAll(/\/[^\/]+:.+,*/g,"");
        if(file == "minigame") file = "minigame/index.html";
        if(file == "") file = "main.html";

        // Reading
        if(!fs.existsSync(dir+file)) {
            res.writeHead(404,{"content-type":"text/plain"});
            res.end("404: Cannot find file.");
            return;
        }
        var readFile = fs.readFileSync(dir+file,"utf-8");
        
        // Doublesand variables
        if(req.url.includes("/id:")) readFile = readFile.replaceAll("&&minigameID",req.url.replaceAll(/.*\/id:/g,"")).replaceAll("**","&&");
        readFile = readFile.replaceAll("&&ip",ip);

        var type = "text/plain";
        switch(file.split(".")[file.split(".").length-1]) {
            case "html": type = "text/html"; break;
            case "js": type = "text/javascript"; break;
            case "json": type = "text/json"; break;
        }
        res.writeHead(200,{"content-type":type});
        res.end(readFile);

    }

}

