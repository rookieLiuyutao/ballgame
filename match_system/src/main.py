#! /usr/bin/env python3

import glob
import sys

# 将django中的包导入
sys.path.insert(0, glob.glob('../../')[0])
# 引入自动生成的Match文件
from match_server.match_service import Match
# 引入thrift必要的头文件
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer
#使用python自带的消息队列，是线程安全的
from queue import Queue
from time import sleep
from threading import Thread

from acapp.asgi import channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache

queue = Queue()  # 消息队列


class Player:
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0  # 等待时间


# 实现线程池
class Pool:
    def __init__(self):
        #匹配池
        self.players = []

    def add_player(self, player):
        self.players.append(player)

    def check_match(self, a, b):
        #计算分差
        dt = abs(a.score - b.score)
        #匹配阈值每过一秒扩大50
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif

    def match_success(self, ps):
        print("Match Success: %s %s %s" % (ps[0].username, ps[1].username, ps[2].username))
        room_name = "room-%s-%s-%s" % (ps[0].uuid, ps[1].uuid, ps[2].uuid)
        players = []
        for p in ps:
            async_to_sync(channel_layer.group_add)(room_name, p.channel_name)
            players.append({
                'uuid': p.uuid,
                'username': p.username,
                'photo': p.photo,
                'hp': 100,
            })
        cache.set(room_name, players, 3600)  # 有效时间：1小时
        for p in ps:
            async_to_sync(channel_layer.group_send)(
                room_name,
                {
                    'type': "group_send_event",
                    'event': "create_player",
                    'uuid': p.uuid,
                    'username': p.username,
                    'photo': p.photo,
                }
            )

    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

    def match(self):
        #用while循环实现持续的匹配
        while len(self.players) >= 3:
            #当成功匹配道3个人时，为避免使用多重循环，这里采用贪心原则，将所有玩家按照分数排序，只匹配相邻的3个玩家
            self.players = sorted(self.players, key=lambda p: p.score)
            flag = False
            for i in range(len(self.players) - 2):
                a, b, c = self.players[i], self.players[i + 1], self.players[i + 2]
                if self.check_match(a, b) and self.check_match(a, c) and self.check_match(b, c):
                    self.match_success([a, b, c])
                    #在匹配池中删除这3名玩家
                    self.players = self.players[:i] + self.players[i + 3:]
                    flag = True
                    break
            if not flag:
                break

        self.increase_waiting_time()


class MatchHandler:
    #实现thrift接口中的函数
    def add_player(self, score, uuid, username, photo, channel_name):
        print("Add Player: %s %d" % (username, score))
        player = Player(score, uuid, username, photo, channel_name)
        queue.put(player)
        return 0


def get_player_from_queue():
    try:
        return queue.get_nowait()
    except:
        return None


def worker():
    pool = Pool()
    while True:
        player = get_player_from_queue()
        if player:
            pool.add_player(player)
        else:
            pool.match()
            #实现每隔一秒匹配一次的效果
            sleep(1)


if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    #因为是和本服务器上的进程通信，下面的ip地址和端口号不左改动
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory)

    Thread(target=worker, daemon=True).start()

    print('Starting the server...')
    server.serve()
    print('done.')
