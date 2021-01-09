<template>
  <div>    
    <VideoArea
      v-show="isVideo && isChatOpen && contact"
    >
    </VideoArea>
    <!--
    <SideMenu
      v-show="inCall"
    >
    </SideMenu>
    -->
    <beautiful-chat
      :alwaysScrollToBottom="alwaysScrollToBottom"
      :close="closeChat"
      :colors="colors"
      :isOpen="isChatOpen"
      :messageList="messageList"
      :messageStyling="messageStyling"
      :newMessagesCount="newMessagesCount"
      :onMessageWasSent="onMessageWasSent"
      :open="openChat"
      :title="title"
      :participants="participants"
      :showCloseButton="false"
      :showLauncher="true"
      :showEmoji="true"
      :showFile="true"
      :showHeader="true"
      :showTypingIndicator="showTypingIndicator"
      :showEdition="true"
      :showDeletion="true"
      :showConfirmationDeletion="true"
      :confirmationDeletionMessage="'Are you sure? (you can customize this message)'"
      :titleImageUrl="titleImageUrl"
      :disableUserListToggle="false"
      @onType="handleOnType"
      @edit="editMessage"
      @remove="removeMessage"
    >
      <template v-slot:header>
      <fieldset>
<!--      <img v-if="titleImageUrl" class="sc-header--img" :src="titleImageUrl" alt="" @click="videoShow()"/>-->
        <div class="navigation" 
          @click="inCall ? callOff() : callOn()"
          v-bind:class="{change: (isVideo && contact)}"
          >
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
        </div>
      </fieldset>
      <fieldset>
        <!--<legend>Select contact connection:</legend>-->
        <div class="select">
        <select v-model="contact" :required="true" 
                @change="onSelect($event)">
          <optgroup label="Team contacts">
          </optgroup>  
          <optgroup label="Guest contacts">
          <option 
            v-for="(contact, index) in participants"
            :key="index"
            :value="contact.id"
          > {{ contact.name }} </option>
          </optgroup>
        </select>
        </div>
      </fieldset>
      </template>
      <!--
      <template v-slot:text-message-toolbox="scopedProps">
        <button v-if="!scopedProps.me && scopedProps.message.type==='text'" @click.prevent="like(scopedProps.message.id)">
          👍
        </button>
      </template>
      <template v-slot:text-message-body="scopedProps">
        <p class="sc-message--text-content" v-html="scopedProps.messageText"></p>
        <p v-if="scopedProps.message.data.meta" class='sc-message--meta' :style="{color: scopedProps.messageColors.color}">{{scopedProps.message.data.meta}}</p>
        <p v-if="scopedProps.message.isEdited || scopedProps.message.liked" class='sc-message--edited'>
          <template v-if="scopedProps.message.isEdited">✎</template>
          <template v-if="scopedProps.message.liked">👍</template>
        </p>
      </template>
      <template v-slot:system-message-body="{ message }">
        [System]: {{message.text}}
      </template>
      -->
    </beautiful-chat>
  </div>
</template>

<script>
import VideoArea from '@/components/VideoArea'
import SideMenu from '@/components/SideMenu'
import availableColors from './colors'
import comSignal from './comsock.js'
import json from '../json/config.json'


export default {
  name: 'app',
  components: {
    VideoArea,
    SideMenu
  },
  data() {
    return {
      contact: undefined,
      title: 'Lobby',
      participants: [ ],
      titleImageUrl: 'https://vcomm.github.io/cloudnav/images/eyes-on.png',
      messageList: [
          { type: 'text', author: `Sales`, data: { text: json.welcome } }
      ],
      newMessagesCount: 0,
      isChatOpen: false,
      showTypingIndicator: '',
      colors: null,
      availableColors,
      chosenColor: null,
      alwaysScrollToBottom: true,
      messageStyling: true,
      userIsTyping: false,
      comChannel: null,
      isVideo: false,
      inCall: false,
      locStream: undefined,
    }
  },
  created() {
    this.setColor(json.theme)
    window.addEventListener('beforeunload', 
        (event) => {
          if (this.comChannel) {
              this.comChannel.disconnect()
              this.comChannel.destroy()
          }
          return null 
    })
  },
  methods: {
    callOn() {
      if (this.comChannel) {
          if (!this.inCall) {
              this.isVideo = true
              this.inCall = true 
              this.comChannel.callToPeer(this.contact)          
          }
      }
    },
    callConnect() {
      if (this.comChannel) {
          if (!this.inCall) {
              this.isVideo = true
              this.inCall = true         
          }
      }
    },
    callOff() {
      if (this.comChannel) {
          if (this.inCall) {
              this.comChannel.hangUpPeer(this.contact)
              this.inCall = false
              this.isVideo = false
              this.stopUserMedia()
          }    
      }  
    },
    callClear() {
      if (this.comChannel) {
          if (this.inCall) {
              this.inCall = false
              this.isVideo = false
              this.stopUserMedia()
          }    
      }        
    },
    stopUserMedia() {
      if (this.locStream) {
          this.locStream.getTracks().forEach((track)=> track.stop() )
          this.locStream = undefined
      }
//      document.querySelector('#localVideo').srcObject = null
    },
    videoShow() {
      this.isVideo = !this.isVideo
      console.log(`Show video: ${this.isVideo}`);
    },
    createChannel() {
      console.log(`Private Peer Server:: `,location.origin);

      const self = this
      const uid = (json.type === 'super') ? json.id : json.id+Math.floor(Math.random()*2**18).toString(36).padStart(4,0)
      this.comChannel = new comSignal(uid, json.peer
        ,{
          data: (data) => {
            this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1
            this.onMessageWasSent(data)
            if (data.data.cmd === 'pickUp')
                this.callConnect()
            if (data.data.cmd === 'hangUp')
                this.callClear()
          },
          call: (call,type) => {
            console.log(`Call ${type} to peer:`,call)
            if (this.contact === undefined && 
                type === 'answer') {
                this.contact = call.peer
                this.isVideo = true
            }
          },
          peers: (list) => {
            console.log('Update connection peers',list)
            list.forEach(function(item) {
                self.updateParticipants(item)
            })
          },
          stream: (stream,dir) => {
            console.log(`${dir} peer stream:`,stream)
//            this.isVideo = true
            if (dir === 'localVideo') this.locStream = stream
            document.querySelector(`#${dir}`).srcObject = stream;
          }
        }
      )
      this.ttlUpdate()
    },
    onSelect(event) {
        console.log(`Selected: ${event.target.value}`,this.contact);
    },
    updateParticipants(userID) {
        if (this.comChannel.id !== userID) {
            this.participants = [ ...this.participants, {
                id: userID,
                name: `Guest ${userID}`,
                imageUrl: 'https://vcomm.github.io/cloudnav/images/logo.jpg'
              } 
            ]
        }
    },
    sendMessage (text) {
      if (text.length > 0) {
        this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1
        this.onMessageWasSent({ author: 'Support', type: 'text', data: { text } })
      }
    },
    onMessageWasSent (message) {
      if (!this.comChannel) {
          this.messageList = [ ...this.messageList,
            { type: 'text', author: `Support`, data: { text: `Communication with peer signaling Failed!` } }
          ]
          return
      }
      // called when the user sends a message
      if (message.author === 'me' && this.contact !== undefined) {
          console.log(`Me PeerID: ${this.comChannel.id} was send message:`,message)
          this.comChannel.msgToPeer({
            author: this.comChannel.id,
            type: message.type,
            data: message.data
          }, this.contact)
      } else if (message.author === 'me' && this.contact === undefined) {
          this.messageList = [ ...this.messageList,
            { type: 'text', author: `Support`, data: { text: `Cannot send the msg => ${this.contact}` } }
          ]
          return
      } else if(this.contact === undefined && message.author !== 'me') {
          this.contact = message.author
      } 
      this.messageList = [ ...this.messageList, message ]
    },
    openChat () {
      // called when the user clicks on the fab button to open the chat
      this.isChatOpen = true
      this.newMessagesCount = 0
      if (!this.comChannel) this.createChannel()
      else this.comChannel.reconnect()
    },
    closeChat () {
      // called when the user clicks on the botton to close the chat
      this.isChatOpen = false
      if (this.comChannel) this.comChannel.disconnect()
    },
    setColor(color) {
      this.colors = this.availableColors[color]
      this.chosenColor = color
    },
    handleScrollToTop () {
      // called when the user scrolls message list to top
      // leverage pagination for loading another page of messages
    },
    handleOnType () {
      console.log('Emit typing event =>',this.contact)
    },
    editMessage(message){
      const m = this.messageList.find(m=>m.id === message.id);
      m.isEdited = true;
      m.data.text = message.data.text;
    },
    removeMessage(message){
      const m = this.messageList.find(m => m.id === message.id);
      m.type = 'system';
      m.data.text = 'This message has been removed';
    },
    ttlUpdate() {
      setInterval(()=>{
        if (this.comChannel) {
            this.participants = []
            this.comChannel.updatePeers()
        }
      },10000)
    },
    msgWelcome() {
      setTimeout(() => {  
        this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1
        this.messageList = [ ...this.messageList,
          { type: 'text', author: `Assistant`, data: { text: `Hello! What can I help you?` } }
        ]
      },30000)      
    }
  },
  computed: {
    linkColor() {
      return this.chosenColor === 'dark'
        ? this.colors.sentMessage.text
        : this.colors.launcher.bg
    },
    backgroundColor() {
      return this.chosenColor === 'dark' ? this.colors.messageList.bg : '#fff'
    }
  },
  mounted() {
    this.messageList.forEach(x=>x.liked = false);
    this.msgWelcome()
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

fieldset {
  width: 100%;
  height: 100%;
}

/* Reset Select */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  -ms-appearance: none;
  appearance: none;
  outline: 0;
  box-shadow: none;
  border: 0 !important;
  background: #2c3e50;
  background-image: none;
}
/* Remove IE arrow */
select::-ms-expand {
  display: none;
}
/* Custom Select */
.select {
  position: relative;
  display: flex;
  width: 15em;
  height: 3em;
  line-height: 3;
  background: #1d22279a;
  overflow: hidden;
  border-radius: .25em;
}
select {
  flex: 1;
  padding: 0 .3em;
  color: #fff;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 2px 5px;
}
/* Arrow */
.select::after {
  content: '\25BC';
  position: absolute;
  top: 0;
  right: 0;
  padding: 0 .5em;
  background: #34495e;
  cursor: pointer;
  pointer-events: none;
  -webkit-transition: .25s all ease;
  -o-transition: .25s all ease;
  transition: .25s all ease;
}
/* Transition */
.select:hover::after {
  color: #f39c12;
}

.navigation {
    cursor: pointer;
    display: inline-block;    
    position: absolute;
    left: 30px;	
    top: 20px;
    z-index: 10;
}
.bar1, .bar2, .bar3 {
    top: 10px;
    width: 35px;
    height: 5px;
    background-color: white;
    margin: 6px 0;
    transition: 0.4s;
}
.change .bar1 {
    -webkit-transform: rotate(-45deg) translate(-9px, 6px) ;
    transform: rotate(-45deg) translate(-9px, 6px) ;
    background-color: white;
}
.change .bar2 {opacity: 0;}
.change .bar3 {
    -webkit-transform: rotate(45deg) translate(-8px, -8px) ;
    transform: rotate(45deg) translate(-8px, -8px) ;
    background-color: white;
}

</style>
