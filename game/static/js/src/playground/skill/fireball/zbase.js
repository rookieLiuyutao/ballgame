class FireBall extends AcGameObject {
    /**
     *
     * @param playground
     * @param player
     * @param x
     * @param y
     * @param radius
     * @param vx
     * @param vy
     * @param speed
     * @param move_length 技能范围
     * @param damage 技能伤害
     * @param color
     */
    constructor(playground, player, x, y, radius, vx, vy, speed, move_length, damage, color) {
        super();
        this.playground = playground;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.color = color;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.1;
    }

    /**
     * 只在第一帧执行
     */
    start() {

    }

    /**
     * 每一帧都执行
     */
    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        //每一帧都刷新火球的位置
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        //遍历所有玩家。所有非攻击者且与火球碰撞的玩家都被攻击
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }


    /**
     * 在每一帧渲染画面
     */
    render() {
        //渲染一个圆
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        //--------------------------------------------------------------
    }

    /**
     * 实现碰撞检测
     * @param player
     * @returns {boolean}
     */
    is_collision(player){
        let dis = this.get_dist(this.x,this.y,player.x,player.y);
        return dis<this.radius+player.radius;
    }

    /**
     * 实现攻击效果
     * @param player
     */
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }


    /**
     * 计算2点间的距离
     * @returns 两点间的直线距离
     */
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
}