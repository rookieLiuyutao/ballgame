#! /bin/bash

sudo /etc/init.d/nginx start

sudo redis-server /etc/redis/redis.conf

uwsgi --ini scripts/uwsgi.ini

daphne -b 0.0.0.0 -p 5015 acapp.asgi:application