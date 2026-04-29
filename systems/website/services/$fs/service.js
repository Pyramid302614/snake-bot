const whitelistedFiles = [
    "/$mg/assets/ReemKufi-Bold.ttf",
    "/$mg/assets/DMSans_18pt-Light.ttf",
    "/$mg/assets/DMSans_18pt-Regular.ttf",
    "/$mg/assets/DMSans_18pt-ExtraLight.ttf",
    "/$mg/assets/lost.png",
    "/$mg/assets/lost2.png",
    "/$mg/lost.html",
    "/$mg/script.js",
    "/$mg/script.mjs"
];

module.exports = {

    request(req,res,url,args,hostedDir) {

        const path = hostedDir + url;
        if(!require("fs").existsSync(path)) return {
            type: "text/plain",
            msg: "404 - File not found :P",
            code: 404
        };
        if(!whitelistedFiles.includes(url)) return {
            type: "text/plain",
            msg: "404 - No access",
            code: 404
        };

        var type = "text/plain";
        switch(url.split(".").at(-1)) {
            case "html": type = "text/html"; break;
            case "js": type = "text/javascript"; break;
            case "ttf": type = "font/ttf"; break;
            case "png": type = "image/png"; break;
            case "jpg": type = "image/jpg"; break;
        }
        
        return {
            type: type,
            msg: require("fs").readFileSync(path),
            code: 200
        };
    }

}