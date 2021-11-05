const socket = io('/');
const videoGrid = document.getElementById('video_grid')

const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })

})

let list = document.querySelector('ul')
let text = document.querySelector("input");

window.addEventListener('keydown', (e) => {
    if (e.keyCode === 13 && text.value.length !== 0) {
        socket.emit('message', text.value);
        text.value = ''
        // e.target.blur()
    }
})

socket.on("createMessage", message => {
    console.log(message)
    list.append(`<li class="message"><b>user</b><br/>${message}</li>`);
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', roomId, id)
})

socket.on("connect_error", (err) => {
    console.log(`Connection error due to ${err.message}`);
});

const connectToNewUser = (userId, stream) => {
    var call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    });

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })

    videoGrid.append(video)
}


const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fa fa-microphone" aria-hidden="true"></i>
        <span class="controls_description">Mute</span>
     `
    document.querySelector('.mic_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="fa fa-microphone-slash" aria-hidden="true"></i>
        <span class="controls_description">Unmute</span>
    `
    document.querySelector('.mic_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
        <i class="fa fa-video" aria-hidden="true"></i>
        <span class="controls_description">Stop Video</span>
     `
    document.querySelector('.video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span class="controls_description">Play Video</span>
    `
    document.querySelector('.video_button').innerHTML = html;
}