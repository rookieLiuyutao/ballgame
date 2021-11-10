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
    "AIs_attack_frequency": 1/360,

    //最小击退速度
    "damage_speed":10,

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

    //火球的攻击范围/画布高度
    "fireball_range" : 5,

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
    "color_select": ["#c66f35", "gree", "#c0d6cb", "#1cce31", "#9fa0d7", "#cc99ff"]
//------------------------------------------------------------------------
}


