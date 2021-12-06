from django.http import JsonResponse
from game.models.player.player import Player


# 在acapp端的请求函数
def getinfo_acapp(request):
    user = request.user
    # 找到该用户
    player = Player.objects.get(user=user)
    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
    })


# 在web端的请求函数
def getinfo_web(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': "未登录"
        })
    else:
        player = Player.objects.get(user=user)
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })


# 分类处理不同端发来的请求
def getinfo(request):
    # 通过get请求从前端获取一个参数
    platform = request.GET.get('platform')
    # 判断是哪个端发来的请求
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)
    else:
        return JsonResponse({
            'result': "其他"
        })
