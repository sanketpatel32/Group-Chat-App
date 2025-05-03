const io = require('socket.io')(3000);

io.on("connection", socket=>{
    console.log(socket.id, "connected");

    // socket.on("sendMessage", message => {
    //     console.log(message);
    //     io.emit("receiveMessage", message);
    // });

    // socket.on("disconnect", () => {
    //     console.log("User disconnected");
    // });
})