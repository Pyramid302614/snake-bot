const fs = require("fs");
const u = require("../../../../u.js");

module.exports = {

    request(req,res,url,args,hostedDir) {
        switch(url) {

            case "/":

                if(args.instance_id) {
                    var rawArgs = "";
                    for(let i = 0; i < Object.keys(args).length; i++) {
                        rawArgs += "&" + Object.keys(args)[i] + "=" + Object.values(args)[i];
                    }
                    rawArgs = rawArgs.slice(1); // Removes first &
                    return {
                        type: "text/html",
                        msg: `<html><head></head><body><script>console.log("Redirecting..."); setInterval(() => window.location.href='/$mg/vite/?${rawArgs}', 1000);</script></body></html>`,
                        code: 200
                    };
                }

                return "True root";

            case "/favicon.ico":

                return {
                    code: 404,
                    msg: "No favicon file",
                    type: "text/plain"
                };
                
            default: return {code:404};

        }

    }

}