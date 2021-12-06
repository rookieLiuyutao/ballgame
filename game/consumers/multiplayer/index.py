from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache


# 这个类就相当于与所有客户端连接的主机

class MultiPlayer(AsyncWebsocketConsumer):

    # 主机与客户端建立连接时的函数
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = None
        self.ready_player = {}

    async def connect(self):
        print("连接成功")
        await self.accept()

    # 处理主机接收到的消息的函数
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        # 每个事件交给不同函数处理
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)

    # 主机与客户端断开连接时的函数
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))

    async def create_player(self, data):

        await self.assign_room()

        if not self.room_name:
            return

        if not cache.has_key(self.room_name):
            # 在redis中创建一条房间数据{"房间号":[玩家uuid列表]}
            cache.set(self.room_name, [], 3600)  # 有效期1小时

        await self.send_to_room_player()

        await self.channel_layer.group_add(self.room_name, self.channel_name)

        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo'],

        })

        cache.set(self.room_name, players, 3600)  # 有效期1小时
        for i in self.ready_player.keys():
            await self.blink({
                # type为处理这个消息的函数名，是默认必须写的
                'type': "group_send_event",
                'event': "blink",
                'uuid': i,
                'tx': self.ready_player.get(i)[0],
                'ty': self.ready_player.get(i)[1],

            })

        await self.network_room_player(data)

    async def network_room_player(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                # type为处理这个消息的函数名，是默认必须写的
                'type': "group_send_event",
                # 以下为自定义发送的消息
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],

            }
        )

    async def assign_room(self):
        # 遍历所有房间，房间上限暂定为1000
        for i in range(100000000):
            name = "room-%d" % (i)
            # 如果redis中之前没有这个房间，且这个房间未满3人
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                return

    async def send_to_room_player(self):
        # 官网对组的详解：https://channels.readthedocs.io/en/stable/topics/channel_layers.html#groups
        # 将玩家以房间号分组
        # 遍历当前房间中的所有玩家
        for player in cache.get(self.room_name):
            # 向每个客户端广播当前玩家信息
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

    async def move_to(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                # type为处理这个消息的函数名，是默认必须写的
                'type': "group_send_event",
                # 以下为自定义发送的消息
                'event': "move_to",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],

            }
        )
        self.ready_player[data['uuid']] = [data['tx'], data['ty']]
        print(self.ready_player)

    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                # type为处理这个消息的函数名，是默认必须写的
                'type': "group_send_event",
                # 以下为自定义发送的消息
                'event': "shoot_fireball",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
                "ball_uuid": data['ball_uuid'],

            }
        )

    async def attack(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                # type为处理这个消息的函数名，是默认必须写的
                'type': "group_send_event",
                # 以下为自定义发送的消息
                'event': "attack",
                'uuid': data['uuid'],
                'x': data['x'],
                'y': data['y'],
                'attacked_uuid': data['attacked_uuid'],
                'angle': data['angle'],
                'damage': data['damage'],
                'ball_uuid': data['ball_uuid'],

            }
        )

    async def blink(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "blink",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

# 模板来源于官网：https://channels.readthedocs.io/en/stable/topics/consumers.html#websocketconsumer
