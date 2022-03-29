class MenuTop {
    constructor(root) {
        this.root = root
        this.username = "";
        this.$menu_top = $(`
            <div class="ac-game-menu-top" style="width: 100%;height:2.4vw ">
<!--                <div class="ac-game-menu-top-user">-->
<!--                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-expanded="false">-->
<!--&lt;!&ndash;                    <img class="ac-game-menu-top-user-profile">&ndash;&gt;-->
<!--                    <span class="ac-game-menu-top-user-item "></span>-->
<!--                    </button>-->
<!--                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">-->
<!--                        <li class="dropdown-item ac-game-menu-top-user-username">个人信息</li>-->
<!--                        <div class="dropdown-divider"></div>-->
<!--                        <li class="dropdown-item ac-game-menu-top-user-settings" >设置</li>-->
<!--                        <div class="dropdown-divider"></div>-->
<!--                        <li class="dropdown-item ac-game-menu-top-user-logout" >退出</li>-->
<!--                    </div>-->
<!--                    <i class="bi bi-eye-fill"><span class='ac-game-menu-top-user-tourist-cnt'></span></i>-->
<!--                </div>-->
                <div>
                        <marquee style="width: 100%;">
                            <span class="ac-game-menu-scroll-word" style="font-weight: bolder;font-size: 2vw;color: white;">
    
                            </span>
                        </marquee>
                </div>
            </div>
        `);
        this.$word = this.$menu_top.find(".ac-game-menu-scroll-word");
        console.log(this.$word)
        this.start();

    }

    start() {
        this.getinfo_web();
        this.root.$menu.append(this.$menu_top);
    }

    hide() {
        this.$menu_top.hide();
    }

    getinfo_web() {
        let outer = this;
        $.ajax({
            url: "https://game.liuyutao666.top/settings/getinfo/",
            type: "GET",
            data: {
                platform: "WEB",
            },
            //得到后端参数后执行的函数
            success: function (resp) {
                if (resp.result === "success") {
                    outer.$word.append($(`<span>
                        <img src="${resp.photo}" height="40vh">
                        ${resp.username}欢迎光临。游戏说明：右键移动，q键发射；匹配模式，3人自动匹配一局
                    </span>`))
                }
            }
        });
    }

}
