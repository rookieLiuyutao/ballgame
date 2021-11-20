from django.http import JsonResponse
from django.contrib.auth import logout

def signout(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result':'success',

        })
    #从request中删掉cookie
    logout(request)
    return JsonResponse({
        'result': 'success',
    })