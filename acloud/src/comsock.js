'use strict';
import Peer from 'peerjs';

export default class comSignal extends Peer {

    constructor(uid,cfg,callbacks) {
        console.log(`Connect to ${cfg.host}:${cfg.port}`)
        // Register with the peer server
        super(uid,cfg)
        this.connecters = {}
        this.constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true, 
                autoGainControl: false
            },
            video: {
                width: { min: 320, ideal: 1280, max: 1920 },
                height: { min: 240, ideal: 720, max: 1080 }
            }            
        }
        this.peerNotify = callbacks || null
        this.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            
            this.listAllPeers((list) => { 
                console.log('Connected peers: ',list);
                if (this.peerNotify && 
                    this.peerNotify.hasOwnProperty('peers')) {
                    this.peerNotify['peers'](list);   
                }                
            })
        });
        this.on('error', (error) => {
            console.error(error);
        });
        // Handle incoming data connection
        this.on('connection', (conn) => {
            console.log('incoming peer connection!');
            conn.on('data', (data) => {
                console.log(`received:`,data);
                if (this.peerNotify && 
                    this.peerNotify.hasOwnProperty('data')) {
                    this.peerNotify['data'](data);   
                }
            });
            conn.on('open', (id) => {
                console.log(`Open connection:`,id);
            });
            conn.on('close', () => {
                console.log(`Close connection:`);
            });
        });
        this.on('disconnected', () => {
            console.log(`Disconected connection:`);
        });
        this.on('close', () => {
            console.log(`Close connection:`);
        });
        // Handle incoming voice/video connection
        this.on('call', (call) => {
            if (!this.connecters.hasOwnProperty(call.peer)) 
                this.connecters[call.peer] = {}
            navigator.mediaDevices.getUserMedia(this.constraints)
            .then((stream) => {
                this.peerNotify['stream'](stream,'localVideo');
                call.answer(stream); // Answer the call with an A/V stream.
                this.peerNotify['call'](call,'answer');
                call
                    .on('stream', (stream) => { this.peerNotify['stream'](stream,'remotevideo'); this.connecters[call.peer].call = call;})
                    .on('close',()=>{ console.log('Media call closed'); this.connecters[call.peer].call = undefined;})
                    .on('error',()=>{ console.error('Failed media call', err); this.connecters[call.peer].call = undefined;})
            })
            .catch((err) => {
                console.error('Failed to get local stream', err);
            });
        });
    }

    connToPeer(peerId) {
        console.log(`Connecting to ${peerId}...`);       
        return (new Promise((resolve,reject) => {
            const conn = this.connect(peerId);
            conn.on('data', (data) => {
                console.log(`received: `,data);
                if (this.peerNotify && 
                    this.peerNotify.hasOwnProperty('data')) {
                    this.peerNotify['data'](data);   
                }
            });
            conn.on('open', () => {
                console.log(`Add ${peerId} connecter to pool`);
                this.connecters[peerId] = {
                    conn: conn
                }
                resolve(conn)
            });
            conn.on('close', () => {
                if (this.connecters.hasOwnProperty(peerId)) {
                    console.log(`Remove ${peerId} connecter from pool`);
                    delete this.connecters[peerId]
                }
            });
            conn.on('error', (error) => {
                reject(error)
            });
        }))
        .then((conn) => { 
            return conn; 
        })
        .catch((err) => {
            console.error('Failed connecting', err);
        });
    }

    msgToPeer(msg, peerId) {
        console.log(`Sending msg => ${peerId}`, msg);
        if (this.connecters.hasOwnProperty(peerId)) {
            this.connecters[peerId].conn.send(msg);
        } else {
            this.connToPeer(peerId)
            .then((conn) => {
                conn.send(msg);
            });
        }
    }

    callToPeer(peerId) {
        console.log(`Calling to ${peerId}`);
        if (this.connecters.hasOwnProperty(peerId)) {
            this.mediaConnection(peerId,this.connecters[peerId].conn)
        } else {
            this.connToPeer(peerId)
            .then((conn) => {
                this.mediaConnection(peerId,conn)
            });
        }
    }

    hangUpPeer(peerId) {
        console.log(`HangUp ${peerId} peer`);
        if (this.connecters.hasOwnProperty(peerId)) {
            if (this.connecters[peerId].conn) {
                this.connecters[peerId].conn.send({
                    author: this.id,
                    type: 'text',
                    data: { cmd: 'hangUp', text: 'HangUp media connection...' }
                })
            } else {
                this.connToPeer(peerId)
                .then((conn) => {
                    this.connecters[peerId].conn = conn     
                    this.connecters[peerId].conn.send({
                        author: this.id,
                        type: 'text',
                        data: { cmd: 'hangUp', text: 'HangUp media connection...' }
                    })                                  
                });                
            }
            this.connecters[peerId].call.close()
        }
    }

    mediaConnection(peerId,conn) {
        conn.send({
            author: this.id,
            type: 'text',
            data: { cmd: 'pickUp', text: 'Request media connection...' }
        })
        navigator.mediaDevices.getUserMedia(this.constraints)
        .then((stream) => {
            this.peerNotify['stream'](stream,'localVideo');
            const call = this.call(peerId, stream);
            this.peerNotify['call'](call,'offer');
            call
                .on('stream', (stream) => { this.peerNotify['stream'](stream,'remotevideo'); this.connecters[call.peer].call = call;})
                .on('close',()=>{ console.log('Media call closed'); this.connecters[call.peer].call = undefined;})
                .on('error',()=>{ console.error('Failed media call', err); this.connecters[call.peer].call = undefined;})
        })
        .catch((err) => {
            console.error('Failed to get local stream', err);
        });
    }

    updatePeers() {
        this.listAllPeers((list) => { 
            console.debug('Connected peers: ',list);
            if (this.peerNotify && 
                this.peerNotify.hasOwnProperty('peers')) {
                this.peerNotify['peers'](list);   
            }                
        })
    }
}