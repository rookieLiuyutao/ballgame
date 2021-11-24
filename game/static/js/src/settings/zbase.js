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
                <img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                <br>
                <div>
                    AcWing一键登录
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
                    AcWing一键登录
                </div>
            </div>
            <br>

        </div>
    </div>
</div>
        `);
        //把登录界面加载到DOM树中
        // this.root.$ac_game.append(this.$settings);
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
        this.$register.hide();

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
        console.log(outer.photo)
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
            console.log("666")
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
}