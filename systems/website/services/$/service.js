const fs = require("fs");

module.exports = {

    request(req,res,url,args,hostedDir) {

        switch(url) {

            case "/":

                if(args.guild_id) return require("../$mg/service.js").request(req,res,url,args,hostedDir); // Forwards it to mg service
                if(args.instance_id) return {
                    type: "text/html",
                    msg: fs.readFileSync(hostedDir+"/$mg/lost.html"),
                    code: 200
                };

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