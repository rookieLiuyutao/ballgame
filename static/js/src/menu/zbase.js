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
                   <div class="ac-game-menu-field-item ac-game-menu-field-item-hexgl">
                      HexGL
                  </div>
              </div>
          </div>
        `);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');
        this.$hexgl = this.$menu.find('.ac-game-menu-field-item-hexgl');
        this.menu_top = new MenuTop(this);
        this.global_chat_field = new GlobalChatField(this);
        this.gcs = new GlobalChatSocket(this);
        let outer = this;
        this.gcs.ws.onopen = function () {
            outer.gcs.send_init(outer.root.settings.username);
        }


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
        this.$single_mode.click(function () {
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function () {
            outer.hide();
            outer.root.playground.show("multi mode");

        });
        this.$settings.click(function () {
            outer.root.settings.logout_on_remote();
        });
        this.$hexgl.click(function () {
            window.location.href = "https://game.liuyutao666.top/static/HexGL/index.html";
        });

    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}

