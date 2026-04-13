module.exports = {

    connection(ws) {

        ws.send("Connected to websocket as " + ws.socket.remoteAddress);

    },

    message(msg) {

        

    }

}