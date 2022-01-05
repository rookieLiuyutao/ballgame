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
        this.eps = 0.01;
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

        if (this.check_is_collision()) return
        //每一帧都刷新火球的位置
        this.update_fireball();
        //遍历所有玩家。所有非攻击者且与火球碰撞的玩家都被攻击

        if (this.player.character !== "enemy") {
            this.update_fireball_attacked();

        }

        // 实现火球碰撞后相互抵消, 将火球从AC_GAME_OBJECTS = [], 中删除
        if (gameParameters.fireball_offset) {
            this.fireball_offset();
        }
        this.render();
    }

    /**
     * 检测两个火球是否碰撞
     * @returns {boolean}
     */
    check_is_collision() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
    }

    /**
     * 实现火球击中后的效果
     */
    update_fireball_attacked() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }
    }

    /**
     * 实现火球碰撞后相互抵消, 将火球从AC_GAME_OBJECTS = [], 中删除
     */
    fireball_offset() {
        //实现火球碰撞后相互抵消, 将火球从AC_GAME_OBJECTS = [], 中删除
        for (let i = 0; i < this.playground.fireballs.length; i++) {
            let fireball = this.playground.fireballs[i];

            if (fireball !== this && this.is_collision(fireball)) {
                this.destroy();
                fireball.destroy();
                break;
            }
        }
    }

    update_fireball() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    /**
     * 在每一帧渲染画面
     */

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy; // 把虚拟地图中的坐标换算成canvas中的坐标
        if (ctx_x < -0.1 * this.playground.width / scale ||
            ctx_x > 1.1 * this.playground.width / scale ||
            ctx_y < -0.1 * this.playground.height / scale ||
            ctx_y > 1.1 * this.playground.height / scale) {
            return;
        }
        this.ctx.beginPath();
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }


    /**
     * 实现碰撞检测
     * @returns {boolean}
     * @param obj
     */
    is_collision(obj) {
        let dis = this.get_dist(this.x, this.y, obj.x, obj.y);
        return dis < this.radius + obj.radius;
    }

    /**
     * 火球击中玩家时
     * @param player
     */
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        //当你的火球击中其他玩家，自己会"回血"，即体积增大，但速度变慢
        // if (gameParameters.bloodBack) this.bloodBack();
        player.is_attacked(angle, this.damage);
        if (this.playground.mode === "multi mode") {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }
        this.destroy();
    }

    /**
     * 回血机制
     */
    bloodBack() {
        //击中敌人的玩家回血
        this.player.radius += this.damage / 2;
    }


    /**
     * 计算2点间的距离
     * @returns number
     */
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 从playground.fireballs中将火球删除
     */
    on_destroy() {
        for (let i = 0; i < this.playground.fireballs.length; i++) {
            if (this.playground.fireballs[i] === this) {
                this.playground.fireballs.splice(i, 1);
            }
        }
    }


}