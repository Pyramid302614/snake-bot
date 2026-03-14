module.exports = {

    log_f: null,
    err_f: null,

    log(msg) {
        if(this.log_f) this.log_f(msg);
    },
    err(message,e,flavor) {
        if(this.err_f) this.err_f(message,e,flavor);
    }

}