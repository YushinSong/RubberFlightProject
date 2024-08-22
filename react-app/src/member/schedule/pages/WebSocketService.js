// src/WebSocketService.js
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.connectPromise = null;
        this.activeSubscriptions = {};
    }

    connect(callback, id) {
        if (this.connected || this.connectPromise) {
            return this.connectPromise;
        }

        const backUrl = process.env.REACT_APP_BACK_URL;
        if (!this.connectPromise) {
            this.connectPromise = new Promise((resolve, reject) => {
                const socket = new SockJS(`${backUrl}/ws/title`);
                this.stompClient = Stomp.over(socket);
                this.stompClient.connect({}, () => {
                    this.connected = true;
                    resolve();
                }, (error) => {
                    console.error('Error connecting to WebSocket:', error);
                    reject(error);
                });
            });
        }
        return this.connectPromise;
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.disconnect(() => {
                console.log("Disconnected");
                this.stompClient = null;
                this.connected = false;
                this.connectPromise = null;
            });
        }
    }

    ensureConnected(id) {
        if (this.connected) {
            return Promise.resolve();
        }
        return this.connect(() => {}, id);
    }

    sendContent(id, title) {
        const payload = {
            id: id,
            title: title
        };
        return this.ensureConnected(id).then(() => {
            if (this.stompClient && this.stompClient.connected) {
                this.stompClient.send(`/app/title/${id}`, {}, JSON.stringify(payload));
            }
        }).catch((error) => {
            console.error('Failed to send content:', error);
        });
    }

    async joinPage(id, userToken) {
        console.log(`${id}번 스케쥴에 유저 접속`);
        return await this.ensureConnected(id).then(() => {
            if (this.stompClient && this.stompClient.connected) {
                const payload = { scheduleId: id, userToken: userToken };
                this.stompClient.send(`/app/join/${id}`, {}, JSON.stringify(payload));
            }
        }).catch((error) => {
            console.error('Failed to join page:', error);
        });
    }

    leavePage(id, userToken) {
        return this.ensureConnected(id).then(() => {
            if (this.stompClient && this.stompClient.connected) {
                const payload = { scheduleId: id, userToken: userToken };
                this.stompClient.send(`/app/leave/${id}`, {}, JSON.stringify(payload));
            }
        }).catch((error) => {
            console.error('Failed to leave page:', error);
        });
    }

    sendDates(id, dates, version, deleteIndex) {
        const payload = {
            scheduleId: id,
            dates: dates,
            editVersion: version,
            deleteIndex: deleteIndex,
        };
        return this.ensureConnected(id).then(() => {
            if (this.stompClient && this.stompClient.connected) {
                this.stompClient.send(`/app/dates/${id}`, {}, JSON.stringify(payload));
            }
        }).catch((error) => {
            console.error('Failed to send content:', error);
        });
    }

    subscribeTo(id, callback, link) {
        // const topic = `/topic/${link}/${id}`;
        // if (this.activeSubscriptions[topic]) {
        //     console.log(`Already subscribed to ${topic}`);
        //     return Promise.resolve();
        // }

        return this.ensureConnected(id).then(() => {
            const subscription = this.stompClient.subscribe(`/topic/${link}/${id}`, (message) => {
                if (message.body) {
                    // console.log(callback(JSON.parse(message.body).title));
                    link==="title" && callback(JSON.parse(message.body).title);
                    link==="users" && callback(JSON.parse(message.body));
                    link==="dates" && callback(JSON.parse(message.body));
                    // link==="dates" && console.log(JSON.parse(message.body));
                }
            });
            // this.activeSubscriptions[topic] = subscription;
        });
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;