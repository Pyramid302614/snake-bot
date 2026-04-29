process.addListener("uncaughtException",(e) => console.error(e));
process.addListener("unhandledRejection",(e) => console.error(e));
require("http").createServer((req,res) => {
    console.log(req.url);
    if(!req.url.startsWith("/$")) req.url = "/$" + req.url;
    if(req.url == "/$/") {
        res.writeHead(200,{"Content-Type":"text/html"});
        res.end(require("fs").readFileSync("snake-bot/systems/website/services/$/index.html"));
    } else if(req.url == "/$/sitemap") {
        res.writeHead(200,{"Content-Type":"text/html"});
        res.end(require("fs").readFileSync("snake-bot/systems/website/services/$/sitemap.txt"));
    } else if(req.url.startsWith("/$fs")) {
        const response = require("../$fs/service.js").request(req,res,req.url.slice("/$fs".length),{},"snake-bot/systems/website/services");
        res.writeHead(response.code??200,{"Content-Type":response.type??"text/plain"});
        res.end((response.msg ?? response) ?? response.code);
    }
}).listen(3000,"0.0.0.0",() => console.log("Server hosted at port 3000."))