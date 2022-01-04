class ChatField {
    constructor(playground) {
        this.playground = playground;

        this.$history = $(`<div class="ac-game-chat-field-history">历史记录</div>`);
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`);

        this.$history.hide();
        this.$input.hide();

        this.func_id = null;

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        this.$input.keydown(function (e) {
            if (e.which === 27) {  // ESC
                outer.hide_input();
                return false;
            } else if (e.which === 13) {  // ENTER
                //获取输入区域输入的内容
                let text = outer.$input.val();
                if (text) {
                    let username = outer.playground.root.settings.username;
                    //先清空输入框
                    outer.$input.val("");
                    //再把输入框中的消息展示到信息展示区
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(username, text);
                }else {
                    outer.hide_input();
                    return false;
                }
                return false;
            }
        });
    }

    resize() {
        this.width = this.playground.width * 0.2;
        this.history_height = this.playground.height * 0.3;

        this.margin_left = (this.playground.$playground.width() - this.playground.width) / 2 + 20;
        this.history_top = (this.playground.$playground.height() - this.playground.height) / 2 + this.playground.height / 2;
        this.input_top = this.history_top + 0.02 * this.playground.height + this.history_height;
        this.$history.css({
            "position": "absolute",
            "width": this.width,
            "height": this.history_height,
            "left": this.margin_left,
            "top": this.history_top,
            "transform": "translate(-50 %, -50 %)",
            "color": "white",
            "font-size": "2vh",
            "overflow": "auto",
            "background-color": "rgba(0, 0, 0, 0.3)"
        });

        this.$input.css({
            "position": "absolute",
            "width": this.width,
            "height": "3vh",
            "left": this.margin_left,
            "top": this.input_top,

            "color": "white",
            "font-size": "2vh",
            "background-color": "rgba(0, 0, 0, 0.3)"
        });
    }


    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) {
        this.show_history();
        let message = `[${username}]${text}`;
        //给this.$history添加子元素
        this.$history.append(this.render_message(message));
        //设置滚动条的移动距离
        this.$history.scrollTop(this.$history[0].scrollHeight);
        //API用法请参考：https://www.jianshu.com/p/c59b2ccc963c
    }

    show_history() {
        let outer = this;
        this.$history.fadeIn();

        if (this.func_id) clearTimeout(this.func_id);

        this.func_id = setTimeout(function () {
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);
    }

    show_input() {
        this.show_history();

        this.$input.show();
        this.$input.focus();
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}
