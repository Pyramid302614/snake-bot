module.exports = {

    args(url) {

        let b = url.split("?");
        if(b.length == 1) return {};
        const split = b[1].split("&");
        const args = {};
        for(const item of split) args[item.split("=")[0]] = item.split("=")[1];
        return args;

    }

}