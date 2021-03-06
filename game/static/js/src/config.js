var gameParameters = {

//--------------playground/game_map/zbase.js----------------
    //背景颜色和不透明度(rgba值)
    "background_color": "rgba(186,231,255)",
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
    "AIs_attack_frequency": 1/360,

    //是否开启狂暴模式
    "is_crazy":false,

    //开启狂暴模式时的最小人数
    "crazy_min_number":8,

    //最小击退速度
    "damage_speed":1,

    //是否开启互相攻击
    "attack_eachother":true,

    //火球大小/画布高度
    "fireball_size":0.01,

    //火球弹道速度/画布高度
    "fire_speed": 0.8,

    //开场后的冷静时间(多少秒内不能攻击)
    "calm_time": 4,

    //随机粒子数量，20 + Math.random() * 10
    //最小为[0,1]，是无粒子
    "particle_number":[20,10],

    "AIs_fireball_range": 100,
    //火球的攻击范围/自己的血量
    "fireball_range" : 10,

    //火球技能的伤害
    "fireball_damage": 0.01,

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

    "AI_speed":0.05,
    //玩家自己的颜色
    "self_color": "white",

    //玩家的移动速度，用每秒移动高度的百分比表示
    "player_speed": 0.20,

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


