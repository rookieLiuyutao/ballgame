class NoticeBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "匹配中。。。";
        this.hp = "100/100"
    }

    start() {
    }

    write(text) {
        this.text = text;
    }

    update_hp(hp, max_hp) {
        this.hp ="血量：" +hp + "/" + max_hp;
    }

    update() {
        this.render();
    }

    render() {
        this.render_status()
        if (this.text!=="匹配中。。。") this.rander_boold()
    }

    render_status() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
    }

    rander_boold() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "red";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.hp, (this.playground.width / 3) * 2, 20);
    }
}
