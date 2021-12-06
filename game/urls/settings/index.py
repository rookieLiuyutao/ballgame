from django.urls import path,include
from game.views.settings.getinfo import getinfo
from game.views.settings.login import signin
from game.views.settings.logout import signout
from game.views.settings.register import register


urlpatterns = [
    #参数分别为：地址栏中的路径名；函数名；自己起的名字
    path("getinfo/", getinfo, name="settings_getinfo"),
    path("login/", signin, name="settings_login"),
    path("logout/", signout, name="settings_logout"),
    path("register/", register, name="settings_register"),
    path("acwing_info/",include("game.urls.settings.acwing_info.index")),
    path("gitee_info/",include("game.urls.settings.gitee_info.index")),
]

