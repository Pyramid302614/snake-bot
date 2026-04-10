const fs = require("fs");

module.exports = {

    request(req,res,url,hostedDir) {

        switch(url) {

            case "/":

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