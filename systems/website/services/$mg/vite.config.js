const { defineConfig } = require("vite");

var lastRequestHeaders = null;

const ambervars_parser_plugin = {
    name: "ambervars_parser",
    enforce: "pre",
    configureServer(server) {
        server.middlewares.use((req,res,next) => {
            lastRequestHeaders = req.headers;
            next();
        });
    },
    // transform(code,id) {
    //     console.log("Last: " + lastRequestHeaders["x-ambervar-test"])
    //     console.log("ID: " + id);
    //     return code.replaceAll("&&hi","hi there");
    // },
    transformIndexHtml(html) {
        html = html.replaceAll("**","&&").replaceAll("s&&","&&");
        for(let i = 0; i < Object.keys(lastRequestHeaders).length; i++) {
            const key = Object.keys(lastRequestHeaders)[i];
            const value = Object.values(lastRequestHeaders)[i];
            if(key.startsWith("x-ambervar-"))
                html = html.replaceAll("&&" + key.slice("x-ambervar-".length),value);
        }
        return html;
    }
};

module.exports = defineConfig({
    base: "/$mg/vite/",
    plugins: [
        ambervars_parser_plugin
    ]
});