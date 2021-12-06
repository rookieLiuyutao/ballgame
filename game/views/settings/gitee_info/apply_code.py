from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache


def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res


def apply_code(request):
    client_id = "62827cb3fecac327351cd1fcf405820124e9340f3e64dca2faf124724303b905"
    redirect_uri = quote("https://app220.acapp.acwing.com.cn/settings/gitee/receive_code")
    state = get_state()

    cache.set(state, True, 7200)  # 有效期2小时

    apply_code_url = "https://gitee.com/oauth/authorize"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?client_id=%s&redirect_uri=%s&response_type=code&state=%s&scope=user_info" % (
            client_id, redirect_uri, state)

    })
