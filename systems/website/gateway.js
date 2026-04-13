// Because I would prefer if nobody knew how the backend worked, I won't comment much

const u = require("../../u.js");
const { WebSocket } = require("ws");
const http = require("http");

const servicesDir = u.cache.sbdir + "/systems/website/services";

var requests = {timestamp:Date.now()};
const frameDuration = u.time.minutes(2);
const maxRequestsPerFrame = 30;

module.exports = {

    host(port,wsport) {

        const server = http.createServer(this.request);
        server.listen(port,"0.0.0.0",() => console.log("Server hosted at port " + port));

        const wss = new WebSocket.Server({port:wsport});
        wss.on("connection",(ws) => {
            try {
                console.log(ws);
                if(processRateLimit(ws.socket.remoteAddress)) return;
                require("./websocket.js").connection(ws);
            } catch(ignored) {}
        });
        wss.on("message",(msg) => {
            try {
                console.log(msg);
            } catch(ignored) {}
        });
        console.log("Websocket server hosted at port " + wsport);

    },

    async request(req,res) {

        const ip = req.socket.remoteAddress;

        if(processRateLimit(ip)) return; // Returns true if it needs to ghost you


        const response = await (async () => {
            try {
            
                if(!req.url.startsWith("/$")) req.url = "/$" + req.url; // Fixes syntax (Allows for "/" urls to work)
                const service = `${req.url.slice(1).split("/")[0]}`;
                let formatted = req.url.slice(service.length+1);
                return await require(`${servicesDir}/${service}/service.js`).request(req,res,formatted.split("?")[0],u.url.args(formatted),servicesDir);

            } catch(e) {

                return {
                    code: 400,
                    msg: "Bad request"+(ip=="127.0.0.1"?`\n${e}`:""),
                    type: "text/plain"
                };

            }
        })() ?? {
            code: 400,
            msg: "Null response",
            type: "text/plain"
        };
        
        try {
            
            if((response.msg??response) == "<g>") return;
            res.writeHead(response.code ?? 200,{"Content-Type":response.type??"text/plain"});
            res.end(response.msg??(response?.code?.toString()??(response??"Empty response")));

        } catch(ignored) {}

    }

}


function processRateLimit(ip) {

    if(requests[ip] >= maxRequestsPerFrame) return true;
    requests[ip] = (requests[ip] ?? 0) + 1;
    if(Date.now() - frameDuration >= requests.timestamp) requests = {timestamp:Date.now()};

}