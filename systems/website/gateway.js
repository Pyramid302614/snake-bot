// Because I would prefer if nobody knew how the backend worked, I won't comment much

const u = require("../../u.js");
const { WebSocket } = require("ws");
const http = require("http");
const { createProxyServer } = require("http-proxy");

const servicesDir = u.cache.sbdir + "/systems/website/services";

var requests = {timestamp:Date.now()};
const frameDuration = u.time.minutes(2);
const maxRequestsPerFrame = 30;

module.exports = {

    request_untimeout(ip) {
        requests[ip] = 0;
    },
    host() {

        const port = u.adapter.config30.ports.port;
        const wsport = u.adapter.config30.ports.wsport;

        u.log.log("Beginning website initialization process");


        // Service pre-loading

        for(const service of require("fs").readdirSync(servicesDir)) {
            try {
                require(servicesDir + "/" + service + "/service.js")?.init?.();
            } catch(e) {
                u.log.log("Error initializing service: " + service + "\n```" + e.stack + "```");
                process.exit();
            }
            u.log.log("Initialized service: " + service);
        }


        // HTTP server

        const server = http.createServer(this.request);
        server.listen(port,"0.0.0.0",() => console.log("Server hosted at port " + port));


        // Websocket
        
        const wss = new WebSocket.Server({ port: wsport },u.log.log("Websocket hosted on port " + wsport));
        wss.on("connection",(ws,req) => {
            ws.on("message",(m) => {
                if(processRateLimit(req.socket.remoteAddress)) return;
                m = m.toString();
                if(/\$.*:.*/.test(m)) {
                    const service = m.split(":")[0];
                    const response = require(servicesDir + "/" + service + "/service.js")?.wsMessage?.(m.slice(service.length)) ?? "Null response.";
                    if(response == "<g>") return;
                    else ws.send(response);
                } else return;
            });
        });


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
                    msg: "Bad request"+(["127.0.0.1",u.adapter.config30.pyshomecomputer,"::1"].includes(ip)?`\n${e.stack??e.message}`:""),
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