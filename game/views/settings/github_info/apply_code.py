from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache



def apply_code(request):
    client_id = "b58bb9ab6d25496b859e"
    redirect_uri = quote("https://game.liuyutao666.top/settings/github_info/receive_code")


    apply_code_url = "https://github.com/login/oauth/authorize"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?client_id=%s&redirect_uri=%s&response_type=code&scope=user" % (
            client_id, redirect_uri)

    })
