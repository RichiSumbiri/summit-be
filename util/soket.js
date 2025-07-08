
export const setupWebSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("dashboard_machine", (data) => {
            io.emit("dashboard_machine", {
                TYPE: data.TYPE,
                VALUE: data.VALUE
            });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

};