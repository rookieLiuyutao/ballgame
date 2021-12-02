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



启动`Redis`服务

```shell
sudo redis-server /etc/redis/redis.conf
```





## 项目启动



启动`uwsgi`服务(如果未部署过nginx，不要用此方法)

```shell
uwsgi --ini scripts/uwsgi.ini
```



启动前请确保服务器开放`443`,`80`和`项目运行的`端口

启动`django`项目：

```shell
python3 manage.py runserver 0.0.0.0:端口号
```

