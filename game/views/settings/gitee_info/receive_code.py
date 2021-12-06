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
    state = data.get('state')
    client_id = "62827cb3fecac327351cd1fcf405820124e9340f3e64dca2faf124724303b905"
    redirect_uri = quote("https://app220.acapp.acwing.com.cn/settings/gitee/receive_code")
    client_secret = "529bef1d272fec9ff428a8e5d9e39aff57a4ad395f93ff1c7c6ce9c239fbd35c"
    if not cache.has_key(state):
        return redirect("index")
    cache.delete(state)

    access_token_res = requests.post(
        "https://gitee.com/oauth/token?grant_type=authorization_code&code=%s&client_id=%s&redirect_uri=%s"
        "&client_secret=%s" % (
            code, client_id, redirect_uri, client_secret)).json()

    access_token = access_token_res['access_token']

    userinfo_res = requests.get("https://gitee.com/api/v5/user?access_token=%s" % access_token).json()

    openid = str(userinfo_res['id'])

    players = Player.objects.filter(openid=openid)
    if players.exists():  # 用户查找是否登录
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
