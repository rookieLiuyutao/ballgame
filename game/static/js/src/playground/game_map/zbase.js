class GameMap extends AcGameObject {
    constructor(playground) {
        //super()等价于AcGameObject.prototype.constructor.call(this)
        super();
        this.playground = playground;
        //让canvas可以监听输入事件
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        //这里的playground在定义时时任意值，但在调用时如果传入AcGamePlayground类就指这个类
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        //为了能够让canvas获取输入信息，我们要将其聚焦：
        this.$canvas.focus();
        this.generate_grid();
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        console.log("playground的大小为：" + this.playground.width, this.playground.height)
        console.log("canvas:" + this.ctx.canvas.width, this.ctx.canvas.height)

    }

    update() {
        this.render();
    }

    generate_grid() {
        let width = this.playground.big_map_width;
        let height = this.playground.big_map_height;
        let l = height * 0.1;
        let nx = Math.ceil(width / l);
        let ny = Math.ceil(height / l);
        this.grids = [];
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                this.grids.push(new Grid(this.playground, this.ctx, i, j, l, "black"));
            }
        }
    }

    render() {
        //改变背景的不透明度，以实现移动残影
        this.ctx.fillStyle = gameParameters.background_color;
        //fillRect()绘制矩形的方法
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
