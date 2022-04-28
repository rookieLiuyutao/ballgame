from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache


class GlobalChat(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        print('accept')

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard('globalChatWindow', self.channel_name)

    def standard_str(self, username):
        group_name = ""
        for i in username:
            group_name = group_name + str(ord(i))
        return group_name

    async def receive(self, text_data):  # 接收前端发来的请求
        data = json.loads(text_data)  # 变为json格式的字典
        event = data['event']
        username = data['username']
        if not cache.has_key('globalChatWindow'):
            cache.set('globalChatWindow', [], None)
        global_chat_list = cache.get('globalChatWindow')
        #只保留最近的20条消息
        if len(global_chat_list) > 20:
            global_chat_list = global_chat_list[len(global_chat_list) - 20:len(global_chat_list)]
            cache.set('globalChatWindow', global_chat_list, None)
        await self.channel_layer.group_add('globalChatWindow', self.channel_name)
        # await self.channel_layer.group_add(self.standard_str(username), self.channel_name)
        if event == 'init':
            await self.init(username)
        elif event == 'send_message':
            # 保存历史信息
            global_chat_list = cache.get('globalChatWindow')
            global_chat_list.append({
                'username': username,
                'time': data['time'],
                'message': data['message'],
            })
            cache.set('globalChatWindow', global_chat_list, None)
            await self.message(username, data['time'], data['message'])

    async def init(self, username):
        # 向前端广播信息
        await self.channel_layer.group_send(
            self.standard_str(username),
            {
                'type': 'group_send_event',
                'event': 'init',
                'details': cache.get('globalChatWindow'),
            }
        )

    async def message(self, username, time, text):
        # 向前端广播信息
        await self.channel_layer.group_send(
            'globalChatWindow',
            {
                'type': 'group_send_event',
                'event': 'message',
                'username': username,
                'time': time,
                'message': text,
            }
        )

    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))  # json.dumps :将json字典转化为字符串
