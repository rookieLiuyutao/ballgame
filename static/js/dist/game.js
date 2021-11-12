var gameParameters = {

//--------------playground/game_map/zbase.js----------------
    //背景颜色和不透明度(rgba值)
    "background_color": "rgba(0, 0, 0, 0.2)",
//--------------------------------------------------------------


//--------------playground/particle/zbase.js----------------

    //粒子效果的最大粒子半径/玩家半径的比值
    "particle_size_percent": 0.4,

    //粒子速度/其玩家速度，的比值
    "particle_speed_percent": 20,

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

    //最小击退速度
    "damage_speed":10,

    //是否开启互相攻击
    "attack_eachother":true,

    //火球大小/画布高度
    "fireball_size":0.01,

    //火球弹道速度/画布高度
    "fire_speed": 0.5,

    //开场后的冷静时间(多少秒内不能攻击)
    "calm_time": 4,

    //随机粒子数量，20 + Math.random() * 10
    //最小为[0,1]，是无粒子
    "particle_number":[20,10],

    //火球的攻击范围/自己的血量
    "fireball_range" : 10,

    //火球技能的伤害/画布高度
    "fireball_damage": 0.01,

    //火球的颜色
    "fireball_color":"orange",

    //火球技能的伤害(被攻击后减移速的比例)
    "reduce_ratio": 0.8,

    //玩家的死亡大小
    "dead_szie": 10,




//------------------------playground/zbase.js-------------------------
    //玩家初始大小百分比(相对于浏览器的宽)
    "players_size_percent": 0.05,

    //玩家自己的颜色
    "self_color": "white",

    //玩家的移动速度，用每秒移动高度的百分比表示
    "player_speed_percent": 0.15,

    //电脑玩家的数量
    "AIs_number": 5,

    //所有玩家的颜色列表
    "color_select": ["#b3ffbc", "gree", "#e666ff", "#b4a4ca", "#ebd2b8", "#3c374a"]
//------------------------------------------------------------------------
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
                      设置
                  </div>
              </div>
          </div>
        `);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
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
    }

    start() {  // 只会在第一帧执行一次
    }

    update() {  // 每一帧均会执行一次
    }

    on_destroy() {  // 在被销毁前执行一次
    }

    destroy() {  // 删掉该物体
        this.on_destroy();
        //遍历一遍所有对象，找到当前对象并删除
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
//用递归的结构，保证每一帧都调用一次函数
let AC_GAME_ANIMATION = function(timestamp) {
    //每一帧要遍历所有物体，让每个物体执行update函数
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
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
        this.radius = Math.random() * player.radius * gameParameters.particle_size_percent;
        // 释放速度
        this.speed = player.speed * gameParameters.particle_speed_percent;

        // 固定参数，粒子的移动距离
        this.move_length = Math.max(gameParameters.particle_move_length[0], Math.random()) * player.radius * gameParameters.particle_move_length[1];
        // 减速摩擦力
        this.friction = gameParameters.particle_friction;
        // 误差范围
        this.eps = 1;

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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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
     * @param is_me 判断当前角色是自己还是敌人
     */
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
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
        this.eps = 0.1;
        this.friction = 0.9;
        this.spent_time = 0;
        this.nouseX = 0;
        this.mouseY = 0;

        this.cur_skill = null;

    }

    /**
     * 只在第一帧执行
     */
    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            //如果是敌人，则会随机一个目标位置
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);

        }
    }

    /**
     * 每一帧都执行
     */
    update() {
        //实现电脑玩家的自动攻击
        this.spent_time += this.timedelta / 1000;

        if (Math.random() < gameParameters.AIs_attack_frequency) {
            let from_player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let to_player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            if (from_player === to_player || from_player.is_me) {
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
        }
        //实现击退动画
        if (this.damage_speed > gameParameters.damage_speed) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            //保证玩家不会被打出画面
            if (this.x < this.radius || this.x > this.playground.width + this.radius || this.y < this.radius || this.y > this.playground.height + this.radius) {
                this.damage_speed = 0;
            }
            this.damage_speed *= this.friction;

        } else {
            //玩家已经走到了目标地点
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    //如果是电脑玩家，在到达目标位置的帧都随机一个新的目标位置
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                //玩家没有走到目标位置，则计算新的一帧玩家的位置
                //计算出两帧间的移动距离
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                //计算这一帧位置的横纵坐标
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }

        //每一帧都要渲染圆
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
     * 鼠标点击的操作
     */
    add_listening_events() {
        let outer = this;
        const rect = outer.ctx.canvas.getBoundingClientRect();

        //禁用鼠标右键点击显示菜单的事件
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            //
            //e.which === 3，点击鼠标右键的事件
            //e.which === 1，点击鼠标左键的事件
            if (e.which === 3) {
                // console.log(e.clientX, e.clientY);
                //每一次点击都要计算出当前点到点击位置的距离
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);

            }


        });
        //监听键盘事件
        $(window).keydown(function (e) {
            if (e.which === 81) {  // q
                outer.cur_skill = "fireball";
                outer.playground.game_map.$canvas.mousemove(function (e) {
                    //只有当按下键盘选中技能后，点击鼠标才能释放技能
                    if (outer.cur_skill === "fireball") {
                        outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                    }
                    //在释放完技能后取消技能选中
                    outer.cur_skill = null;
                })
                return false;
            }
        });


    /**
     * 创建一个飞行的火球技能
     * @param tx 点击位置的横坐标
     * @param ty 点击位置的纵坐标
     */
    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * gameParameters.fireball_size;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = this.playground.height * gameParameters.fire_speed;
        let mone_length = this.radius * gameParameters.fireball_range;
        if (!this.is_me) {
            mone_length = this.radius * this.playground.height;
        }
        //所有人必须在开局4秒后才能释放火球
        if (this.spent_time > gameParameters.calm_time) {
            this.playground.fireballs.push(
                new FireBall(this.playground, this, x, y, radius, vx, vy, speed, mone_length, this.playground.height * gameParameters.fireball_damage, gameParameters.fireball_color)
            )
        }
    }

    /**
     * 被攻击后的效果
     * @param angle 受到攻击后的角度，用于实现击退效果
     * @param damage 技能的伤害
     */
    is_attacked(angle, damage) {
        //实现被攻击后的粒子效果
        for (let i = 0; i < gameParameters.particle_number[0] + Math.random() * gameParameters.particle_number[1]; i++) {
            //这里参考了大佬的代码，比y总的传参更合理
            new Particle(this.playground, this);
        }
        //受到攻击的玩家，移速变快，体积变小
        this.radius -= damage;
        this.speed = this.playground.height * gameParameters.player_speed_percent + (this.playground.height * gameParameters.players_size_percent - this.radius) * 2;
        if (this.radius < gameParameters.dead_szie) {
            this.destroy();
            return false;
        }
        //计算受到攻击后的击退方向
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = this.playground.height * 2 + (this.radius - this.playground.height * gameParameters.players_size_percent) * 50;


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
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
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
        //实现火球碰撞后相互抵消,将火球从AC_GAME_OBJECTS = [],中删除
        for (let i = 0; i < this.playground.fireballs.length; i++) {
            let fireball = this.playground.fireballs[i];

            if (fireball != this && this.is_collision(fireball)) {
                this.destroy();
                fireball.destroy();
                break;
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
        this.player.radius += this.damage / 2;
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


}class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);



        this.hide();
        this.start();

    }

    start() {
    }

    show() {  // 打开playground界面
        this.$playground.show();
                this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        //创建GameMap对象
        this.game_map = new GameMap(this);
        //创建玩家对象
        this.players = [];
        this.fireballs = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * gameParameters.players_size_percent, "white", this.height * gameParameters.player_speed_percent, true));
        //创建5个电脑玩家
        for (let i = 0; i < gameParameters.AIs_number; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * gameParameters.players_size_percent, this.get_random_color(), this.height * gameParameters.player_speed_percent, false));
        }
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }

    get_random_color(){

        return gameParameters.color_select[Math.floor((Math.random()*gameParameters.color_select.length))];
    }

    /**
     * 某玩家死亡调用的函数
     * @param player Player 对象
     */
    player_is_killed(player){
        for (let i = 0; i < this.players.length; i++) {
            if (this.player[i]===player){
                player.destroy();
                this.players.splice(i,1);
                break;
            }
        }
    }
}
 export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        //为了方便调试，不显示菜单界面
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {
    }
}

