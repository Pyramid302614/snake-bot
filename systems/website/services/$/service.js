const fs = require("fs");
const u = require("../../../../u.js");

module.exports = {

    request(req,res,url,args,hostedDir) {
        
        switch(url) {

            case "/":

                if(args.instance_id) {
                    if(args.pop != "true") { // Ghost feature
                        req.url = "/$mg/vite/root"; // For vite proxy
                        require("../$mg/service.js").request(req,res,"/vite/root",args,hostedDir);
                        return "<g>";
                    } else {
                        return {
                            type: "text/html",
                            msg:
    `<html><head></head><body style="background-color:#000000"><div style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);"><img src="/monologo" width="100px" height="100px"</img></div><script>setTimeout(() => window.location.href="${req.url.slice("/$".length)}&pop=true",1000);</script></body></html>`,
                            code: 200
                        }
                    }
                }

                return {
                    type: "text/html",
                    msg: fs.readFileSync(hostedDir + "/$/index.html"),
                    code: 200
                };

            case "/invite":

                return {
                    type: "text/html",
                    msg: "<html><head><title>Snake Bot - compete with friends for snakes</title><meta name=\"theme-color\" content=\"#00ff40\"><meta name=\"description\" content=\"Snake Bot Invite Link - Redirects to https://discord.com/oauth2/authorize?client_id=1481114874343063677\"></head><body><script>window.location.href='https://discord.com/oauth2/authorize?client_id=1481114874343063677';</script></body></html>",
                    code: 200
                };


            case "/server":

                return {
                    type: "text/html",
                    msg: "<html><head><title>Snake Bot Server</title><meta name=\"theme-color\" content=\"#00ff40\"><meta name=\"description\" content=\"Snake Bot Server Invite Link - Redirects to https://discord.gg/yzE8zyPtRx\"></head><body><script>window.location.href='https://discord.gg/yzE8zyPtRx';</script></body></html>",
                    code: 200
                };


            case "/tos":
            case "/terms-of-service":

                return {
                    type: "text/html",
                    msg: fs.readFileSync(hostedDir + "/$/tos.html"),
                    code: 200
                };


            case "/pp":
            case "/privacy-policy":

                return {
                    type: "text/html",
                    msg: fs.readFileSync(hostedDir + "/$/pp.html"),
                    code: 200
                };

            case "/favicon.ico":

                return {
                    code: 404,
                    msg: "No favicon file",
                    type: "text/plain"
                };

            case "/sitemap":

                return {
                    type: "text/plain",
                    msg: fs.readFileSync(hostedDir + "/$/sitemap.txt"),
                    code: 200
                };

            case "/monologo":

                return {
                    type: "image/png",
                    msg: fs.readFileSync(u.cache.sbdir + "/assets/images/profile/pfp/pfp-gen3-2048-mono.png"),
                    code: 200
                }
                
            default: return {code:404};

        }

    }

}