## 项目环境

- Python 3.8.10 
- nginx/1.18.0 (Ubuntu)
- django 3.2.8 



python依赖环境：

- channels_redis (django支持websocket的一个模块)
- Redis server v=5.0.7



## python依赖环境的下载命令

```shell
pip install django_redis

pip install channels_redis
```





## 配置文件位置

- `django`配置文件：
- `nginx`配置文件：
- `uwsgi`配置文件：





## 各种环境启动命令

启动`nginx`服务

```shell
sudo /etc/init.d/nginx start
```

启动`thrift`服务
```bash
cd match_system/src/
chmod +x main.py
./main.py
```

启动`Redis`服务

```shell
sudo redis-server /etc/redis/redis.conf
```





## 项目启动



启动`uwsgi`服务(如果未部署过nginx，不要用此方法)

```shell
uwsgi --ini scripts/uwsgi.ini
```

启动`django_channels`服务
```shell
daphne -b 0.0.0.0 -p 5015 acapp.asgi:application
```


启动前请确保服务器开放`443`,`80`和`项目运行的`端口

启动`django`项目：

```shell
python3 manage.py runserver 0.0.0.0:端口号
```

#### django后台操作redis

1.打开项目的django交互式后台

```
python3 manage.py shell
```



2.导入cache层相关的包

```
from django.core.cache import cache
```


3.操作redis的一些命令

|                       |                               |                                |
| :-------------------: | :---------------------------: | :----------------------------: |
| 列出redis中的所有key  |        cache.keys('*')        | cache.keys()中的表达式支持正则 |
| 向redis中插入一条数据 | cache.set(key,value,passtime) |                                |
|  查询某个key是否存在  |       cache.has_key('')       |                                |
|     删除所有数据      |         cache.clear()         |                                |

                     |

