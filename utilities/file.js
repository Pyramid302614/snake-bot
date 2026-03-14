const fs = require("fs");
const cache = require("../cache.js");

module.exports = {

    path(path) {

        if(path.includes("../")) return;
        const p = cache.sbdir + "/" + path;

        return p;

    },
    async read(path,then) {

        const p = this.path(path);

        fs.readFile(p,"utf-8",then);

    },
    sread(path) {

        const p = this.path(path);
        
        return fs.readFileSync(p);

    },
    write(path,data,then) {

        const p = this.path(path);

        fs.writeFile(p,data,"utf-8",then);

    },
    swrite(path,data) {

        const p = this.path(path);

        fs.writeFileSync(p,data,"utf-8");

    }

}