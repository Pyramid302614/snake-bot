const u = require("../u");

const fs = require("fs");

module.exports = {

    read(path) {

        const p = u.file.path(path);
        return fs.readdirSync(p);
        
    },

    traverse(path,foreach) {

        var t = (dir) => {

            var dir = fs.readdirSync(dir); 
            
            for(const item of dir) {

                if(item.endsWith(".js")) {

                } else {

                }
                
            }

        };

    }

}