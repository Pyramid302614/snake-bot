const fs = require("fs");

module.exports = {

    request(req,res,url,args,hostedDir) {

        switch(url) {

            case "/":

                if(args.guild_id) return require("../$mg/service.js").request(req,res,url,args,hostedDir); // Forwards it to mg service

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