<template>
  <div class="video" ref="vmodule"
    @click="pipVideo()"
    >
<!--
    <ol class="hide" tabindex="0">
        <li class="hide-item">Call</li>
        <li class="hide-item">Hangup</li>
        <li class="hide-item">pipVideo</li>
    </ol>
-->
    <video id="remotevideo" ref="remotevideo" class="remote" autoplay poster="/images/logo.jpg"></video>
    <video id="localVideo" ref="localVideo" 
            class="local" autoplay poster="/images/logo.jpg"
            @click="toggleLocalVideo()"
    ></video>
  </div>
</template>

<script>

export default {
    name: "VideoArea",
    data: () => ({
        vModule: {},
        remVideo: {},
        locVideo: {},
        remStream: undefined,
        locStream: undefined,
    }),
    methods: {
        toggleLocalVideo(kind) {
            if (this.locStream) {
                this.locStream.getTracks().forEach((track)=>{ 
                    switch (kind) {
                        case 'video':
                            if (track.readyState == 'live' && 
                                track.kind === 'video') {
                                track.stop();
                            }
                            break;
                        case 'audio':
                            if (track.readyState == 'live' && 
                                track.kind === 'audio') {
                                track.stop();
                            }
                            break;    
                        default:
                            if (track.readyState == 'live') {
                                track.stop(); 
                            }
                    }
                })
                this.locStream = undefined
            } else if ("mediaDevices" in navigator) {
                navigator.mediaDevices.getUserMedia({video: true, audio: false})
                .then((stream) => {
                    this.locStream = stream;
                    console.log('Got local stream:');
                    document.querySelector('#localVideo').srcObject = stream;
                })
                .catch((err) => {
                    console.log('Failed to get local stream', err);
                });
            }            
        },
        dragModule(elem) {
            this.vModule = elem;
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            this.vModule.onmousedown = (e) => {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = () => {
                    document.onmouseup = null;
                    document.onmousemove = null;
                }
                // call a function whenever the cursor moves:
                document.onmousemove = (e) => {
                    e = e || window.event;
                    e.preventDefault();
                    // calculate the new cursor position:
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    // set the element's new position:
                    this.vModule.style.top = (this.vModule.offsetTop - pos2) + "px";
                    this.vModule.style.left = (this.vModule.offsetLeft - pos1) + "px";
                }
            }
        },
        pipVideo() {
            if (document.pictureInPictureElement) {
                document
                    .exitPictureInPicture()
                    .catch(error => {
                        console.log('Error exitPictureInPicture', error);
                    })
            } else {
                this.remVideo
                    .requestPictureInPicture()
                    .catch(error => {
                        console.log('Error requestPictureInPicture', error);
                    })
            }      
        }
    },
    created() {
        console.log('Created')
    },
    mounted() {
        const self = this
        this.dragModule(this.$refs.vmodule)
        this.remVideo = this.$refs.remotevideo
        this.locVideo = this.$refs.localvideo
        /*
        this.myVideo.addEventListener('enterpictureinpicture', () => {
            console.log('Exit Picture-in-Picture mode');
        });
        this.myVideo.addEventListener('leavepictureinpicture', () => {
            console.log('Enter Picture-in-Picture mode');
        });
        this.myVideo.onloadedmetadata = function() {
            if (document.pictureInPictureElement) {
                document
                    .exitPictureInPicture()
                    .then(()=>{
        //              video.style.display = 'block'
                    })
                    .catch(error => {
                        console.log('Error exitPictureInPicture', error);
                    })
            } else {
                this
                    .requestPictureInPicture()
                    .then(()=>{
        //              video.style.display = 'none'
                    })
                    .catch(error => {
                        console.log('Error requestPictureInPicture', error);
                    })
            }      
        };*/
//        this.$root.$emit('render-video',this.myVideo)
        document.addEventListener("click", (event) => {
//            console.log(`clientX: ${event.clientX} / clientY: ${event.clientY}`)
//            this.$refs.vmodule.style.top = event.clientY+'px'
        });
    },
};

</script>

<style scoped>
.video {
    position: fixed;
    top: 30%;
    right: 30%;
    z-index: 1;
}
.remote {
    position: relative;
    width: 320px;
    height: 240px;    
    border-radius: 10%;
    border: 2px solid black;
}
.local {
    position: relative;
    width: 130px;
    height: 100px;    
    border-radius: 20%;
    border: 2px solid black;    
    top: -4px;
    right: 135px;
}




.hide:hover .hide-item,
.hide:focus .hide-item {
  opacity: 100%;
}
.hide {
  position: relative;
  width: 300px;
  height: 64px;   
  display: flex;
  justify-content: center;
  list-style-type: none;
  padding: 0;
  margin: 0;
  top: 30px;
  z-index: 1;
}
.hide > * {
  flex: 0 0 25%;
  font-size: 1em;
  text-align: center;
  padding: 1em 0;
  margin: 0.2em;
  background-color: #ccc;
  border-radius: 0.5em;
  user-select: none;
}
.hide-item {
  background-color: #f66;
  width: 32px;
  height: 32px; 
  cursor: pointer;
  opacity: 0%;
  background-image: url('~@/assets/phone.png');
  background-repeat: no-repeat;
}



.button {
  padding: 15px 25px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  outline: none;
  color: #fff;
  background-color: #4CAF50;
  border: 1px solid rgba(0, 0, 0, 0.486);
  border-radius: 15px;
  box-shadow: 0 9px #999;
  position: relative;
  top: -50px;
  left: -50%;
}
.button:hover {background-color: #3e8e41}
.button:active {
  background-color: #3e8e41;
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}
.call {
    position: relative;
    top: -50px;
    left: -50%;
    z-index: 1;
    border-radius: 20%;
    border: 2px solid black;
}
.callicon {
    width: 32px;
    height: 32px;
    background-image: url('~@/assets/phone.png');
}
</style>