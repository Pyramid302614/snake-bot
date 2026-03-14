const fs = require("fs");
const cache = require("../cache.js");

module.exports = {

    path(path) {

        if(path.includes("../")) return;
        const p = cache.sbdir + "/" + path;

        return p;

    },
    
    read(path) {

        const p = this.path(path);
        return fs.readdirSync(p);
        
    },

    // Goes through folder and executes forEach(file,path) for every .js file found
    traverse(path,forEach) {

        const p = this.path(path);

        var t = (dir) => {
            for(const item of fs.readdirSync(dir)) 
                if(item.endsWith(".js")) forEach(require(dir+"/"+item),dir+"/"+item);
                else t(dir+"/"+item);
        };

        t(p); // Starts the chain

    }

}