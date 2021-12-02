from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None
        #遍历所有房间，房间上限暂定为1000
        for i in range(1000):
            name = "room-%d" % (i)
            #如果redis中之前没有这个房间，且这个房间未满3人
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        if not self.room_name:
            return

        await self.accept()
        #新创立的房间设置1小时有效期
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)  # 有效期1小时
        #遍历当前房间中的所有玩家
        for player in cache.get(self.room_name):
            #向每个客户端广播当前玩家信息
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)


    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo']
        })
        cache.set(self.room_name, players, 3600)  # 有效期1小时
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_create_player",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
        )

    async def group_create_player(self, data):
        await self.send(text_data=json.dumps(data))

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)

#模板来源于官网：https://channels.readthedocs.io/en/stable/topics/consumers.html#websocketconsumer