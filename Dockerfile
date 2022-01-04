FROM python:3

#更新软件源，必须要执行，否则可能会出错。-y就是要跳过提示直接安装。
RUN apt-get -y update

RUN apt-get install -y python-dev python-pip
RUN apt-get install -y python-setuptools
#MySQL-Python必须得先安装这个库
RUN apt-get install -y libmysqlclient-dev
RUN apt-get install -y sudo

RUN mkdir /acapp
#设置工作目录
WORKDIR /acapp

COPY ./* /acapp

#将当前目录加入到工作目录中


RUN pip install Django
RUN pip install psycopg2

RUN pip install django_redis

RUN pip install channels_redis

RUN apt-get install npm
RUN npm install terser -g
#对外暴露端口
EXPOSE 80 8080 8000 5000
#设置环境变量


#FROM nginx
#
#
##对外暴露端口
#EXPOSE 80 8000
#
#RUN rm /etc/nginx/conf.d/default.conf
#
#ADD nginx.conf  /etc/nginx/conf.d/
#
#RUN mkdir -p /usr/share/nginx/html/static
#RUN mkdir -p /usr/share/nginx/html/media
