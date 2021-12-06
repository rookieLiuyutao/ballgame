from django.urls import path

from game.views.settings.gitee_info.apply_code import apply_code as apply_code
from game.views.settings.gitee_info.receive_code import receive_code as receive_code




urlpatterns = [
    path("apply_code/", apply_code, name="settings_gitee_info_apply_code"),
    path("receive_code/", receive_code, name="settings_gitee_receive_code"),
]
