#! /bin/bash


USER_PASSWORD=727520
USERNAME=doctao
WORKDIR=/home/$USERNAME/acapp
#
cd $WORKDIR || exit
#su- $USERNAME

echo $USER_PASSWORD | sudo -S /etc/init.d/nginx start
echo $USER_PASSWORD | sudo -S redis-server /etc/redis/redis.conf

# 后台新建一个session
tmux new-session -d -s acapp_workspace

#向选择的窗口发送指令

tmux send-keys "uwsgi --ini scripts/uwsgi.ini" C-m

#多次切割后每个小窗口的编号会变化
tmux split-window -v

#启动`django_channels`服务

tmux send-keys "daphne -b 0.0.0.0 -p 5015 acapp.asgi:application" C-m

#多次切割后每个小窗口的编号会变化

#该命令会把当前工作区域分成左右两个小窗格，光标会移动到右面的窗口
tmux split-window -h

tmux send-keys "cd match_system/src/" C-m
tmux send-keys "chmod +x main.py" C-m
tmux send-keys "./main.py" C-m


#tmux select-pane -t 1
#tmux send-keys "command" C-m
#tmux send-keys "cd /home/zcmlc/go/src/zcm_activity" C-m
#tmux select-pane -t 2
#tmux send-keys "mysql -uroot -p123456 --host 192.168.1.221 --sigint-ignore --auto-vertical-output" C-m
#tmux send-keys "use data" C-m
#tmux -2 attach-session -t ssh  //挂载到之前运行的session上
