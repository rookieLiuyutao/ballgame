from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache
from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

from match_system.src.match_server.match_service import Match
from game.models.player.player import Player
from channels.db import database_sync_to_async


# 这个类就相当于与所有客户端连接的主机

class MultiPlayer(AsyncWebsocketConsumer):
    room_name = None
    ready_player = {}

    async def connect(self):
        # print("连接成功")
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
        elif event == "message":
            await self.message(data)

    # 主机与客户端断开连接时的函数
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def group_send_event(self, data):
        if not self.room_name:
            keys = cache.keys('*%s*' % self.uuid)
            if keys:
                self.room_name = keys[0]
        await self.send(text_data=json.dumps(data))

    async def create_player(self, data):
        self.room_name = None
        self.uuid = data['uuid']
        # Make socket
        transport = TSocket.TSocket('127.0.0.1', 9090)
        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)

        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        # Create a client to use the protocol encoder
        client = Match.Client(protocol)

        def db_get_player():
            return Player.objects.get(user__username=data['username'])

        player = await database_sync_to_async(db_get_player)()

        # Connect!
        transport.open()

        client.add_player(player.score, data['uuid'], data['username'], data['photo'], self.channel_name)

        # Close!
        transport.close()

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
        self.ready_player[data['uuid']] = [data['tx'], data['ty'], self.room_name]

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

    async def message(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "message",
                'uuid': data['uuid'],
                'username': data['username'],
                'text': data['text'],
            }
        )
# 模板来源于官网：https://channels.readthedocs.io/en/stable/topics/consumers.html#websocketconsumer
