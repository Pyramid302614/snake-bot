module.exports = {

    log_f: null,
    err_f: null,

    log(msg,discordOnly) {
        if(this.log_f) this.log_f(msg,discordOnly);
    },
    err(message,e,flavor) {
        if(this.err_f) this.err_f(message,e,flavor);
    }

}