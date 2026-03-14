module.exports = {

    set_log(v) {
        require("./log.js").log_f = v;
    },
    set_err(v) {
        require("./log.js").err_f = v;
    },

    started: false,

    client(v) {
        if(!v) return require("../cache.js").client;
        else require("../cache.js").client = v;
    },
    async start(token) {

        if(this.started) return; // Forces no duplicate clients

        this.started = true;
        console.log("Starting : Snake Bot");

        setTimeout(() => this.client({ready:true}),3000);

        // TODO: hook up to client object's .on("clientReady")

        await new Promise(resolve => {
            setInterval(() => {
                if(this.client()?.ready) {
                    resolve();
                }
            },1000);
        });

    },
    async stop() {

        if(!this.started) return; // Forces no killing non-existant clients

        this.started = false;
        console.log("Stopping : Snake Bot");

    }

}