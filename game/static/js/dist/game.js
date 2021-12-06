var gameParameters = {

//--------------playground/game_map/zbase.js----------------
    //背景颜色和不透明度(rgba值)
    "background_color": "rgba(0, 0, 0, 0.2)",
//--------------------------------------------------------------


//--------------playground/particle/zbase.js----------------

    //粒子效果的最大粒子半径/玩家半径的比值
    "particle_size": 0.4,

    //粒子速度/其玩家速度，的比值
    "particle_speed": 20,

    //粒子移动距离参数Math.max(0.5, Math.random()) * player.radius * 4
    "particle_move_length": [0.5, 4],

    //减速摩擦力
    "particle_friction": 0.85,

    //粒子每帧的消失比例
    "particle_feed": 0.98,

//----------------------------------------------------------------------

//--------------playground/player/zbase.js----------------

    //电脑玩家自动攻击的频率
    "AIs_attack_frequency": 1/180,

    //是否开启狂暴模式
    "is_crazy":true,

    //开启狂暴模式时的最小人数
    "crazy_min_number":8,

    //最小击退速度
    "damage_speed":1,

    //是否开启互相攻击
    "attack_eachother":false,

    //火球大小/画布高度
    "fireball_size":0.01,

    //火球弹道速度/画布高度
    "fire_speed": 0.5,

    //开场后的冷静时间(多少秒内不能攻击)
    "calm_time": 4,

    //随机粒子数量，20 + Math.random() * 10
    //最小为[0,1]，是无粒子
    "particle_number":[20,10],

    "AIs_fireball_range": 100,
    //火球的攻击范围/自己的血量
    "fireball_range" : 5,

    //火球技能的伤害
    "fireball_damage": 0.004,

    //火球的颜色
    "fireball_color":"orange",

    //火球技能的伤害(被攻击后减移速的比例)
    "reduce_ratio": 0.8,
    //
    // //玩家的死亡大小
    // "dead_szie": 10,




//------------------------playground/zbase.js-------------------------
    //玩家初始大小百分比
    "players_size": 0.05,

    //玩家自己的颜色
    "self_color": "white",

    //玩家的移动速度，用每秒移动高度的百分比表示
    "player_speed": 0.15,

    //电脑玩家的数量
    "AIs_number": 15,

    //所有玩家的颜色列表
    "color_select": ["#b3ffbc", "gree", "#e666ff", "#b4a4ca", "#ebd2b8", "#3c374a"],
//------------------------------------------------------------------------

//    --------------playground/skill/fireball/zbase.js----------------

    //是否开启火球碰撞后相互抵消机制
    "fireball_offset" : false,

    //是否开启回血机制
    "bloodBack" : true
}



class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
          <div class="ac-game-menu">
              <div class="ac-game-menu-field">
                  <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
                      单人模式
                  </div>
                  <br>
                  <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
                      多人模式
                  </div>
                  <br>
                  <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
                      退出
                  </div>
              </div>
          </div>
        `);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    /**
     * 监听用户选择了什么模式
     */
    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");

        });
        this.$settings.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}

//存放所有对象(物体)的数组
let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        //每创建一个对象都把它加进数组里
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;  // 是否执行过start函数
        this.timedelta = 0;  // 当前帧距离上一帧的时间间隔
        this.uuid = this.create_uuid();//给每个对象生成一个唯一uid
    }

    start() {  // 只会在第一帧执行一次
    }

    update() {  // 每一帧均会执行一次
    }

    on_destroy() {  // 在被销毁前执行一次
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 1)之间的数
            res += x;
        }
        return res;
    }


    destroy() {  // 删掉该物体
        this.on_destroy();
        //遍历一遍所有对象，找到当前对象并删除
        for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
//用递归的结构，保证每一帧都调用一次函数
let AC_GAME_ANIMATION = function (timestamp) {
    //每一帧要遍历所有物体，让每个物体执行update函数
    for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
        let obj = AC_GAME_OBJECTS[i];
        //用has_called_start标记每个物体，保证每一帧，每个物体只执行一次函数
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            //算出2次调用的间隔时间，为计算速度做准备
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);
}


requestAnimationFrame(AC_GAME_ANIMATION);
class GameMap extends AcGameObject {
    constructor(playground) {
        //super()等价于AcGameObject.prototype.constructor.call(this)
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        //这里的playground在定义时时任意值，但在调用时如果传入AcGamePlayground类就指这个类
        this.playground.$playground.append(this.$canvas);
    }

    start() {
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        console.log("playground的大小为：" + this.playground.width, this.playground.height)
        console.log("canvas:"+this.ctx.canvas.width, this.ctx.canvas.height)

    }

    update() {
        this.render();
    }

    render() {
        //改变背景的不透明度，以实现移动残影
        this.ctx.fillStyle = gameParameters.background_color;
        //fillRect()绘制矩形的方法
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class NoticeBoard extends AcGameObject {
    constructor(playground) {
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪：0人";
    }

    start() {
    }

    write(text) {
        this.text = text;
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
    }
}
class Particle extends AcGameObject {
    /**
     * 粒子类
     * @param playground 在哪张地图上
     * @param player 哪个玩家扩散出的粒子
     */
    constructor(playground, player) {
        super();
        this.playground = playground;
        this.player = player;
        //粒子的画布
        this.ctx = this.playground.game_map.ctx;
        //粒子的位置
        this.x = player.x;
        this.y = player.y;
        //粒子的颜色应该和玩家的颜色相等
        this.color = player.color;
        // 粒子半径
        this.radius = Math.random() * player.radius * gameParameters.particle_size;
        // 释放速度
        this.speed = player.speed * gameParameters.particle_speed;

        // 固定参数，粒子的移动距离
        this.move_length = Math.max(gameParameters.particle_move_length[0], Math.random()) * player.radius * gameParameters.particle_move_length[1];
        // 减速摩擦力
        this.friction = gameParameters.particle_friction;
        // 误差范围
        this.eps = 0.01;

        // 随机参数，释放方向
        // 弧度制
        this.angle = Math.PI * 2 * Math.random();
        //粒子的随机移动方向
        this.vx = Math.cos(this.angle);
        this.vy = Math.sin(this.angle);

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
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }

        this.radius *= gameParameters.particle_feed;
        //每一帧都刷新粒子的位置
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;

        this.render();
    }


    /**
     * 在每一帧渲染画面
     */
    render() {
        //渲染一个圆

        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        //--------------------------------------------------------------
    }


}class Player extends AcGameObject {
    /**
     *
     * @param playground 该玩家在哪个地图上
     * @param x 玩家的位置坐标，将来还可能有3d的z轴和朝向坐标
     * @param y
     * @param radius 圆的半径，每个玩家用圆表示
     * @param color 圆的颜色
     * @param speed 玩家的移动速度，用每秒移动高度的百分比表示，因为每个浏览器的像素表示不一样
     * @param character
     * @param username
     * @param photo
     */
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        //玩家所处地图的画布
        this.ctx = this.playground.game_map.ctx;
        //x方向的速度,用于计算玩家的移动
        this.vx = 0;
        //y方向的速度，用于计算玩家的移动
        this.vy = 0;
        //被攻击后的x方向的位置偏移量
        this.damage_x = 0;
        //被攻击后的y方向的位置偏移量
        this.damage_y = 0;
        this.damage_speed = 0;
        //原位置与鼠标点击位置之间的距离
        this.move_length = 0;
        this.radius = radius;
        //表示精度，误差在eps内就算0
        this.eps = 0.01;
        this.friction = 0.9;
        this.spent_time = 0;
        this.status = null;
        this.fireballs = [];
        this.blink_coldtime = 5;
        this.mouseX = 0;
        this.mouseY = 0;
        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }
        if (this.character === "me") {
            this.fireball_coldtime = 3;  // 单位：秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 5;  // 单位：秒
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }

        this.$after_die = $(`<div class = "ac_game_die_animation"></div>`);
        this.cur_skill = null;

    }

    /**
     * 只在第一帧执行
     */
    start() {
        this.check_room_status();
        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            //如果是敌人，则会随机一个目标位置
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);

        }
    }


    check_room_status() {
        this.playground.player_count++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if (this.playground.player_count >= 3   ) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

    }


    /**
     * 每一帧都执行
     */
    update() {
        //实现电脑玩家的自动攻击
        this.spent_time += this.timedelta / 1000;
        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldTime();
        }

        this.update_AI();
        this.update_player_move();
        //每一帧都要渲染圆
        this.render();
    }

    /**
     * 电脑玩家的行为
     */
    update_AI() {
        if (Math.random() < gameParameters.AIs_attack_frequency) {
            let from_player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let to_player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            if (from_player === to_player || from_player.character !== "robot" || from_player.status === "die") {
                return;
            }
            //是否开启相互攻击
            if (!gameParameters.attack_eachother) {
                to_player = this.playground.players[0];
            }
            //实现简单的移动预测
            let tx = to_player.x + to_player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = to_player.y + to_player.speed * this.vy * this.timedelta / 1000 * 0.3;
            from_player.shoot_fireball(tx, ty);
            // from_player.shoot_boss_fireball();
            //人机狂暴模式
            if (gameParameters.is_crazy && this.playground.players.length < gameParameters.crazy_min_number) {
                for (let i = 0; i < 4; i++) {
                    from_player.shoot_fireball(tx, ty);
                }
            }
        }
    }

    /**
     * 渲染每个玩家的移动效果
     */
    update_player_move() {
        //如果击退效果还没有渲染完成
        if (this.damage_speed > gameParameters.damage_speed) {
            this.update_repel_move();
        } else {
            //玩家已经走到了目标地点
            if (this.move_length < this.eps) this.update_after_moved()
            else this.update_moving();
        }
    }

    /**
     * 渲染击退时玩家的位置
     */
    update_repel_move() {
        this.vx = this.vy = 0;
        this.move_length = 0;
        this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
        this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
        // console.log("player在的地图"+this.playground.width,this.playground.height)
        //保证玩家不会被打出画面
        if (this.x < this.radius || this.x > (this.playground.width / this.playground.scale) - this.radius || this.y < this.radius || this.y > (this.playground.height / this.playground.scale) - this.radius) {
            this.damage_speed = 0;
        }
        this.damage_speed *= this.friction;
    }

    /**
     * 渲染玩家移动中的位置
     */
    update_moving() {
        //玩家没有走到目标位置，则计算新的一帧玩家的位置
        //计算出两帧间的移动距离
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        //计算这一帧位置的横纵坐标

        this.x += this.vx * moved;
        this.y += this.vy * moved;

        this.move_length -= moved;
    }

    /**
     * 更新玩家到达目标地点后的状态
     */
    update_after_moved() {
        this.move_length = 0;
        this.vx = this.vy = 0;
        if (this.character === "robot") {
            //如果是电脑玩家，在到达目标位置的帧都随机一个新的目标位置
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    update_coldTime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    /**
     * 在每一帧渲染画面
     */
    render() {
        //渲染用户头像
        if (this.character !== "robot") {
            this.render_photo();
        } else {
            this.render_radius();
        }
        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldTime();
        }
    }

    /**
     * 渲染用户头像
     */
    render_photo() {
        let scale = this.playground.scale;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
        this.ctx.restore();
    }

    /**
     * 渲染一个圆
     */
    render_radius() {
        //渲染一个圆
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    render_skill_coldTime() {

        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.62;
        y = 0.9;
        r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }


    /**
     * 鼠标点击的操作
     */
    add_listening_events() {
        //禁用鼠标右键点击显示菜单的事件
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.game_mouse_operation();
        this.game_keyboard_operation();

    }

    game_mouse_operation() {
        let outer = this;
        this.playground.game_map.$canvas.mousedown(function (e) {
            // if (outer.playground.state !== "fighting")
            //     return false;

            const rect = outer.ctx.canvas.getBoundingClientRect();
            //e.which === 3，点击鼠标右键的事件
            //e.which === 1，点击鼠标左键的事件
            outer.playground.game_map.$canvas.mousemove(function (e) {
                outer.mouseX = (e.clientX - rect.left) / outer.playground.scale;
                outer.mouseY = (e.clientY - rect.top) / outer.playground.scale;
            })
            outer.playground.game_map.$canvas.mousedown(function (e) {
                if (e.which === 3) {
                    outer.move_to(outer.mouseX, outer.mouseY);
                    if (outer.playground.mode === "multi mode") {
                        // console.log("发送了")
                        outer.playground.mps.send_move_to(outer.mouseX, outer.mouseY);
                    }
                }
            })
        });
    }

    game_keyboard_operation() {
        let outer = this;
        //监听键盘事件
        $(window).keydown(function (e) {
            if (outer.playground.state !== "fighting")
                return true;

            if (e.which === 81) {  // q
                outer.cur_skill = "fireball";
                if (outer.fireball_coldtime < outer.eps) {
                    let fireball = outer.shoot_fireball(outer.mouseX, outer.mouseY);
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(outer.mouseX, outer.mouseY, fireball.uuid);
                    }

                }
            } else if (e.which === 70) {
                outer.cur_skill = "blink";
                outer.blink(outer.mouseX, outer.mouseY);
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_blink(outer.mouseX, outer.mouseY);
                }

            }
        });
    }

    /**
     * 创建一个飞行的火球技能
     * @param tx 点击位置的横坐标
     * @param ty 点击位置的纵坐标
     */
    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = gameParameters.fireball_size;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = gameParameters.fire_speed;
        let move_length = this.radius * gameParameters.AIs_fireball_range;
        if (this.character !== "robot") {
            move_length = this.radius * gameParameters.fireball_range;
        }
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, speed, move_length, gameParameters.fireball_damage, gameParameters.fireball_color)
        //所有人必须在开局4秒后才能释放火球

        this.fireballs.push(fireball)

        this.fireball_coldtime = 1

        return fireball;
    }

    shoot_boss_fireball() {
        for (let i = 0; i < 8; i++) {
            let tx = this.x * Math.cos(Math.PI * i / 4) + this.playground.width / this.playground.scale,
                ty = this.y * Math.sin(Math.PI * i / 4) + this.playground.height / this.playground.scale;
            this.shoot_fireball(tx * -1, ty * -1);
        }

    }

    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;
        this.move_length = 0;  // 闪现完停下来
    }


    /**
     * 被攻击后的效果
     * @param angle 受到攻击后的角度，用于实现击退效果
     * @param damage 技能的伤害
     */
    is_attacked(angle, damage) {
        // console.log(this.playground.players)
        //实现被攻击后的粒子效果
        this.is_attacked_particle();
        //受到攻击的玩家，移速变快，体积变小
        this.is_attacked_player_change(damage);
        if (this.radius < this.eps) {
            this.is_attacked_after_die();
            return false;
        }
        //人数小于6时，游戏难度提升，人机攻速提升3倍

        this.is_attacked_player_repel(angle);
        this.is_attacked_game_buff();

    }

    /**
     * 玩家对战时接收到被攻击的信号后执行的函数
     * @param x 被攻击位置的x坐标
     * @param y 被攻击位置的y坐标
     * @param angle 被攻击的方向
     * @param damage 收到的伤害
     * @param skill_name 被哪个技能击中的
     * @param skill_uuid 技能的唯一id
     * @param attacker
     */
    receive_attack(x, y, angle, damage, skill_name, skill_uuid, attacker) {
        attacker.destroy_fireball(skill_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }


    /**
     * 实现了被攻击后的粒子效果
     */
    is_attacked_particle() {
        for (let i = 0; i < gameParameters.particle_number[0] + Math.random() * gameParameters.particle_number[1]; i++) {
            //这里参考了大佬的代码，比y总的传参更合理
            new Particle(this.playground, this);
        }
    }

    /**
     * 玩家被攻击后的属性变化
     */
    is_attacked_player_change(damage) {
        this.radius -= damage;
        // console.log("圆半径：" + this.radius, "伤害:" + damage)
        this.speed = gameParameters.player_speed + (gameParameters.players_size - this.radius) * 2;
    }

    /**
     * 角色死亡后的变化
     */
    is_attacked_after_die() {
        this.status = "die";
        console.log(this.status)

        if (this.character === "me") {
            $("div.ac-game-playground").append(this.$after_die);
        }
        // this.playground.$playground.$("canvas").append(this.$after_die);
        this.destroy();

    }

    /**
     * 玩家受到攻击后的击退效果
     */
    is_attacked_player_repel(angle) {
        //计算受到攻击后的击退方向
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = 1.5 + (this.radius - gameParameters.players_size);
    }

    /**
     * 游戏难度增益
     */
    is_attacked_game_buff() {
        if (gameParameters.is_crazy && this.playground.players.length < gameParameters.crazy_min_number) {
            gameParameters.AIs_attack_frequency = 1 / 60
            if (this.character !== "robot") {
                this.vx *= 2
                this.vy *= 2
            }
        }
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
     * 计算出移动方向的函数
     * @param tx 目标点的横坐标
     * @param ty 目标点的纵坐标
     */
    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);

    }

    on_destroy() {
        this.destroy_player();
    }

    destroy_player() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                return
            }
        }
    }

    destroy_fireball(ball_uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === ball_uuid) {
                fireball.destroy();
                break;
            }
        }
    }
}

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
        //渲染一个圆
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        //--------------------------------------------------------------
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
        if (gameParameters.bloodBack) this.bloodBack();
        player.is_attacked(angle, this.damage);
        if (this.playground.mode === "multi mode") {
            console.log("打中了")
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


}class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        //建立websocket连接
        this.ws = new WebSocket("wss://app220.acapp.acwing.com.cn/wss/multiplayer/");
        this.uuid = null;
        this.start();
    }

    start() {
        this.receive();
    }

    /**
     * 通过每个物体的唯一id去找到对应的对象
     * @param uuid
     * @returns {null|*}
     */
    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            if (players[i].uuid === uuid) {
                return players[i]
            }
        }
        return null
    }

    /**
     * 接收主机发来请求，并控制实现各种业务逻辑
     */
    receive() {
        let outer = this;
        this.ws.onmessage = function (e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            // console.log(data)
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            } else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === "attack") {
                outer.receive_attack(uuid, data.attacked_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty);
            }
        }
    }

    /**
     * 向主机发送有新玩家加入的请求
     * @param username
     * @param photo
     */
    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    /**
     * 接收主机消息，更新房间玩家
     * @param uuid
     * @param username
     * @param photo
     */
    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

    /**
     *
     * @param tx
     * @param ty
     */
    send_move_to(tx, ty) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,

        }))
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid)
        if (player) {
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }


    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let attacker = this.get_player(uuid);
        if (attacker) {
            let fireball = attacker.shoot_fireball(tx, ty)
            fireball.uuid = ball_uuid;
        }

    }

    send_attack(attacked_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attacked_uuid': attacked_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,

        }));
    }


    receive_attack(uuid, attacked_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attacked = this.get_player(attacked_uuid);
        if (attacker && attacked) {
            attacked.receive_attack(x, y, angle, damage, "fireball", ball_uuid, attacker);
        }
    }

    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }


    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.hide();
        this.root.$ac_game.append(this.$playground);
        this.start();

    }

    start() {
        this.add_listening_events();
    }

    /**
     * 实现统一大小的函数
     */
    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        //统一游戏地图比例为16:9，若浏览器窗口比例不符，则按照窗口长宽中的较小者作为地图的长
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        //把地图的高度设为单位1
        this.scale = this.height;
        if (this.game_map) {
            this.game_map.resize();
            console.log("game_map的大小为：" + this.game_map.width, this.game_map.height)
        }
    }

    add_listening_events() {
        let outer = this;
        //$(window).resize()在浏览器窗口大小改变时调用
        $(window).resize(function () {
            outer.resize();
        });
    }

    /**
     * 根据模式打开对应界面
     * @param mode
     */
    show(mode) {
        // 打开playground界面
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        //创建GameMap对象
        this.game_map = new GameMap(this);
        this.resize();

        this.mode = mode;
        this.state = "waiting";  // waiting -> fighting -> over
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;

        this.create_player(mode);

    }

    /**
     * 根据模式在地图中创建玩家
     */
    create_player(mode) {
        //创建玩家对象
        let outer = this;

        this.players = [];
        this.fireballs = [];
        //创建自己
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));
        //单人模式就生成ai
        if (mode === "single mode") {
            for (let i = 0; i < gameParameters.AIs_number; i++) {
                this.players.push(new Player(this, this.width / this.scale / 2, 0.5, gameParameters.players_size, this.get_random_color(), gameParameters.player_speed, "robot"));
            }
        } else if (mode === "multi mode") {
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function () {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }

    get_random_color() {

        return gameParameters.color_select[Math.floor((Math.random() * gameParameters.color_select.length))];
    }

    /**
     * 某玩家死亡调用的函数
     * @param player Player 对象
     */
    player_is_killed(player) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.player[i] === player) {
                player.destroy();
                this.players.splice(i, 1);
                break;
            }
        }
    }
}
class Settings {
    constructor(root) {
        this.root = root;
        //表明在哪个端的参数
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";
        //接收后端参数
        this.username = "";
        this.photo = "";

        this.$settings = $(`
            <div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-title">
            登录
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <input type="button" value="登录">
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        <br>
        <div class="ac-game-settings-quick-login">
            <div class="ac-game-settings-quick-login-acwing">
                <img width="30" height="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                <br>
                <div>
                    Acwing
                </div>
            </div>
             <div class="ac-game-settings-quick-login-gitee">
                <img width="30" height="30" src="https://gitee.com/liuyutaocode/tao-blog-image/raw/master/img/gitee.png" >
                <br>
                <div>
                    gitee
                </div>
            </div>
            <div class="ac-game-settings-quick-login-github">
                <img width="30" src="https://gitee.com/liuyutaocode/tao-blog-image/raw/master/img/github.png" >
                <br>
                <div>
                    github
                </div>
            </div>
        </div>
    </div>
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <input type="button" value="注册">
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            登录
        </div>
        <br>
        <div class="ac-game-settings-quick-login">
            <div class="ac-game-settings-quick-login-acwing">
                <img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png" >
                <div>
                    AcWing
                </div>
            </div>
            <div class="ac-game-settings-quick-login-gitee">
                <img width="30" src="https://gitee.com/liuyutaocode/tao-blog-image/raw/master/img/gitee.png" >
                <div>
                    gitee
                </div>
            </div>
            <div class="ac-game-settings-quick-login-github">
                <img width="30" src="https://gitee.com/liuyutaocode/tao-blog-image/raw/master/img/github.png" >
                <div>
                    github
                </div>
            </div>
            
        </div>
    </div>
</div>
        `);
        //把登录界面加载到DOM树中
        this.root.$ac_game.append(this.$settings);
        //找到登录窗口节点及其子树
        this.$login = this.$settings.find(".ac-game-settings-login");
        //找到登录窗口的输入用户名表单
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        //找到登录窗口的输入密码表单
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        //找到登录窗口的登录按钮
        this.$login_submit = this.$login.find(".ac-game-settings-submit>div>input");
        //显示错误信息
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        ////找到登录窗口的注册按钮
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit>div>input");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");
        this.$acwing_login = this.$settings.find('.ac-game-settings-quick-login-acwing img');
        this.$gitee_login = this.$settings.find('.ac-game-settings-quick-login-gitee img');
        this.$github_login = this.$settings.find('.ac-game-settings-quick-login-github img');
        this.$register.hide();
        console.log(this.$github_login)
        this.root.$ac_game.append(this.$settings);

        this.start();
    }

    /**
     * 在对象创建时执行的函数
     */
    start() {
        if (this.platform === "ACAPP") {
            this.getinfo_acapp();
        } else {
            this.getinfo_web();
            this.add_listening_events();
        }

    }

    /**
     * 获得后端信息的函数
     */
    getinfo_web() {
        let outer = this;
        $.ajax({
            url: "https://app220.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            //得到后端参数后执行的函数
            success: function (resp) {
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    //登录界面隐藏
                    outer.hide();
                    //显示菜单界面
                    outer.root.menu.show();
                } else {
                    //获取信息失败(即用户未登录)，则继续显示登录界面
                    outer.open_login();
                }
            }
        });
    }

    /**
     * 打开登录界面
     */
    open_login() {
        this.$register.hide();
        this.$login.show();
    }

    /**
     * 打开注册界面
     */
    open_register() {
        this.$login.hide();
        this.$register.show();
    }

    /**
     * 隐藏注册/登录界面
     */
    hide() {
        this.$settings.hide();
    }

    /**
     * 显示注册/登录界面
     */
    show() {
        this.$settings.show();
    }

    /**
     * 鼠标点击后触发的函数
     */
    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$acwing_login.click(function () {
            outer.acwing_login();
        });
        this.$gitee_login.click(function () {
            outer.gitee_login();
        });
        this.$github_login.click(function () {
            outer.github_login();
        });


    }

    /**
     *
     */
    acwing_login() {
        $.ajax({
            url: "https://app220.acapp.acwing.com.cn/settings/acwing_info/web/apply_code/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    gitee_login() {
        $.ajax({
            url: "https://app220.acapp.acwing.com.cn/settings/gitee_info/apply_code/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    github_login() {
        $.ajax({
            url: "https://app220.acapp.acwing.com.cn/settings/github_info/apply_code/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;

        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function (resp) {
            console.log("called from acapp_login function");
            console.log(resp);
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    /**
     * acapp端一键登录
     */
    getinfo_acapp() {
        let outer = this;

        $.ajax({
            url: "https://app220.acapp.acwing.com.cn/settings/acwing_info/acapp/apply_code/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }


    /**
     * 点击登录按钮后触发的函数
     */
    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function () {
            outer.open_register();
        });
        this.$login_submit.click(function () {
            outer.login_on_remote();
        });
    }

    /**
     * 点击注册按钮后触发的函数
     */
    add_listening_events_register() {
        let outer = this;
        this.$register_login.click(function () {
            console.log('666')
            outer.open_login();
        });
        this.$register_submit.click(function () {
            outer.register_on_remote();
        });
    }

    /**
     * 向后端发送填写的账号密码，验证并返回信息
     */
    login_on_remote() {  // 在远程服务器上登录
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "https://app220.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    /**
     * 注册用户
     */
    register_on_remote() {  // 在远程服务器上注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app220.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();  // 刷新页面
                } else {
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    /**
     * 实现用户退出登录
     * @returns {boolean}
     */
    logout_on_remote() {
        if (this.platform === "ACAPP") return false;

        $.ajax({
            url: "https://app220.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    //刷新界面并清空cookie
                    location.reload();
                }
            }
        });
    }
} export class AcGame {
     /**
      *
      * @param id
      * @param AcWiingOs 传入acwnig接口，为了支持多端，用来判断是在哪个端执行的
      */
    constructor(id,AcWingOS) {
        this.id = id;
        this.AcWingOS = AcWingOS
        this.$ac_game = $('#' + id);

        this.settings = new Settings(this);
        //为了方便调试，不显示菜单界面
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {
    }
}

