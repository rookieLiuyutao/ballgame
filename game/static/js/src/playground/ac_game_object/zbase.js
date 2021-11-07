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
