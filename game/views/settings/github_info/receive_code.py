from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from urllib.parse import quote

from random import randint


def receive_code(request):
    data = request.GET

    code = data.get('code')
    client_id = "b58bb9ab6d25496b859e"
    client_secret = "5a31e4cf5c28fa3f9956b47907b70aae123c0f34"

    redirect_uri = quote("https://app220.acapp.acwing.com.cn/settings/gitee_info/receive_code")
    # if not cache.has_key(state):
    #     return redirect("index")
    # cache.delete(state)

    access_token_res = requests.post(
        "https://https://github.com/login/oauth/access_token?grant_type=authorization_code&code=%s&client_id=%s&redirect_uri=%s"
        "&client_secret=%s" % (
            code, client_id, redirect_uri, client_secret)).json()
    print(access_token_res)

    access_token = access_token_res['access_token']
    print(access_token_res)
    userinfo_res = requests.get("https://api.github.com/user?access_token=%s" % access_token).json()
    # print(userinfo_res)

    openid = str(userinfo_res['id'])

    players = Player.objects.filter(openid=openid)
    # 如果该用户已存在，则无需重新获取信息，直接登录即可
    if players.exists():
        login(request, players[0].user)
        return redirect("index")

    username = userinfo_res['name']
    photo = userinfo_res['avatar_url']

    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)
    login(request, user)

    return redirect("index")
