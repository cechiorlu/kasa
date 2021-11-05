const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require('peer');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

app.set('view engine', 'ejs')
app.use(express.static('public'))

const peerServer = ExpressPeerServer(httpServer, {
    debug: true,
    path: '/'
});

app.use('/peerjs', peerServer);

const { v4: uuidv4 } = require('uuid')

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', async (roomId, userId) => {
        await socket.join(roomId)
        try {
            socket.to(roomId).emit('user-connected', userId);
        }
        catch (error) {
            console.error(error)
        }
        // messages
        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message)
        });

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

peerServer.on('connection', client => {

})

peerServer.on('disconnect', client => {

})

httpServer.listen(process.env.PORT || 3000)