from django.urls import path
from game.consumers.multiplayer.index import MultiPlayer
from game.consumers.globalchat.index import GlobalChat

websocket_urlpatterns = [
    path("wss/multiplayer/", MultiPlayer.as_asgi(), name="wss_multiplayer"),
    path('wss/globalchat/',GlobalChat.as_asgi(),name="wss_globalchat"),
]
