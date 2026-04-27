const fs = require("fs");
const u = require("../../../../u.js");

module.exports = {

    request(req,res,url,args,hostedDir) {
        switch(url) {

            case "/":

                if(args.instance_id) {
                    req.url = "/$mg/vite/root";
                    return require("../$mg/service.js").request(req,res,"/vite/root",args,hostedDir);
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