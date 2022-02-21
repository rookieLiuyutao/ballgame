class GlobalChatSocket {
    constructor(menu) {
        this.menu = menu;
        this.ws = new WebSocket("wss://game.liuyutao666.top/wss/globalchat/");
        this.start();
    }
    start() {
        this.receive();
    }
    receive() {
        let outer = this;
        this.ws.onmessage = function (e) {
            let data = JSON.parse(e.data);
            let event = data['event'];
            if (event === 'init') {
                outer.receive_init(data['details']);
            }
            else if (event === 'message') {
                outer.receive_message(data['username'], data['time'], data['message']);
            }
        };
    }
    send_init(username) {
        this.ws.send(JSON.stringify({
            'event': 'init',
            'username': username,
        }))
    }
    receive_init(details) {

        for (let i = 0; i < details.length; i++) {
            let detail = details[i];
            let username = detail['username'];
            let time = detail['time'];
            let text = detail['message'];
            this.menu.global_chat_field.add_message(username, time, text);
        }
    }
    send_message(username, time, text) {
        this.ws.send(JSON.stringify({
            'event': 'send_message',
            'username': username,
            'time': time,
            'message': text,
        }))
    }
    receive_message(username, time, text) {
        if (username !== this.menu.root.settings.username)
            this.menu.global_chat_field.add_message(username, time, text);
    }
}
