const socket = io();

const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')

myVideo.muted = true

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
});

// let myVideoStream

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    // myVideoStream = stream
    addVideoStream(myVideo, stream)
})

peer.on('open', id => {
    socket.emit('join-room', roomId, id)
})


socket.on('user-connected', async userId => {
    await connectToNewUser(userId)
})

socket.on("connect_error", (err) => {
    console.log(`Connection error due to ${err.message}`);
});

const connectToNewUser = (userId) => {
    console.log('new user connected')
    console.log(userId)
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadmetadata', () => {
        video.play();
    })

    videoGrid.append(video)
}