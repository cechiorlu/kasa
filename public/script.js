const socket = io();

const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')

myVideo.muted = true

// pass in user id in future versions
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

    peer.on('call', function (call) {
        call.answer(stream);
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    });
    
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

peer.on('open', id => {
    socket.emit('join-room', roomId, id)
})

socket.on("connect_error", (err) => {
    console.log(`Connection error due to ${err.message}`);
});

const connectToNewUser = (userId, stream) => {
    var call = peer.call(userId, stream);
    // const video = document.createElement('video')
    // call.on('stream', userVideoStream => {
    //     addVideoStream(video, userVideoStream)
    // });
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadmetadata', () => {
        video.play();
    })

    videoGrid.append(video)
}