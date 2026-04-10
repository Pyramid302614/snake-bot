const u = require("../../u.js");
const { WebSocket } = require("ws");
const http = require("http");

const servicesDir = u.cache.sbdir + "/systems/website/services";

var requests = {timestamp:Date.now()};
const frameDuration = u.time.minutes(2);
const maxRequestsPerFrame = 30;

module.exports = {

    host(port) {

        const server = http.createServer(this.request);
        server.listen(port,"0.0.0.0",() => console.log("Website hosted at port " + port));

        const wss = new WebSocket.Server({port:port});
        

    },

    request(req,res) {

        const ip = req.socket.remoteAddress;

        // Rate limiting
        if(requests[ip] >= maxRequestsPerFrame) return;
        requests[ip] = (requests[ip] ?? 0) + 1;
        if(Date.now() - frameDuration >= requests.timestamp) requests = {timestamp:Date.now()};


        const response = (() => {
            try {
            
                if(!req.url.startsWith("/$")) req.url = "/$" + req.url; // Fixes syntax (Allows for "/" urls to work)
                const service = `${req.url.slice(1).split("/")[0]}`;
                return require(`${servicesDir}/${service}/gateway.js`).request(req,res,req.url.slice(service.length+1));

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
            
            res.writeHead(response.code ?? 200,{"Content-Type":response.type??"text/plain"});
            res.end(response.msg??(response?.code?.toString()??(response??"Empty response")));

        } catch(ignored) {}

    }

}

require("./gateway.js").host(3000);