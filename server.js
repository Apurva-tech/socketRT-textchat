const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http); 
const path = require('path');
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public'))); 

http.listen(PORT, () => {
    console.log("listening on port " + PORT);
}); 

app.get('/', (req, res) => {
    res.sendFile(__dirname+"/index.html")
})

io.on('connection', function(socket){
    console.log("client is connected " + socket.id );
    socket.on('userMessage', (data) => {
        io.sockets.emit('userMessage' , data);
    }); 

    socket.on('userTyping', (data) =>{
        socket.broadcast.emit('userTyping' , data);
    }); 
})
