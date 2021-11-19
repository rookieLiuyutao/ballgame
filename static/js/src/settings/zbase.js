class Settings {
    constructor(root) {
        this.root = root;
        //表明在哪个端的参数
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";
        this.$settings = $(`

        `);
        this.start();
    }

    /**
     * 在对象创建时执行的函数
     */
    start() {
        this.getinfo();
        // this.add_listening_events();
    }

    /**
     * 获得后端信息的函数
     */
    getinfo() {
        let outer = this;

        $.ajax({
            url: "https://app220.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            //得到后端参数后执行的函数
            success: function (resp) {
                console.log(resp);
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
}