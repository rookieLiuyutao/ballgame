from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache



def apply_code(request):
    client_id = "62827cb3fecac327351cd1fcf405820124e9340f3e64dca2faf124724303b905"
    redirect_uri = quote("https://game.liuyutao666.top/settings/gitee_info/receive_code")


    apply_code_url = "https://gitee.com/oauth/authorize"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?client_id=%s&redirect_uri=%s&response_type=code&scope=user_info" % (
            client_id, redirect_uri)

    })
