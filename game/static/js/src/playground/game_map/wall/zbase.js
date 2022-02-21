class Wall extends AcGameObject {
    constructor(ctx, x, y, l, img_url) {
        super();
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.l = l;
        this.ax = this.x * this.l;
        this.ay = this.y * this.l;
        this.img = new Image();
        this.img.src = img_url;
    }

    start() {
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = this.l * 0.03;
        this.ctx.strokeStyle = "rgba(0,0,0,0)";
        this.ctx.rect(this.ax, this.ay, this.l, this.l);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.img, this.ax, this.ay, this.l, this.l);
        this.ctx.restore();
    }
}
