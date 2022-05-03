#! /bin/bash

# 教程：https://blog.csdn.net/woswod/article/details/80353254
# tmux kill-session -t acapp_workspace

USER_PASSWORD=727520
USERNAME=doctao
WORKDIR=/home/$USERNAME/acapp
TMUX_SESSION_NAME=acapp_workspace
#
cd $WORKDIR || exit
#su- $USERNAME

echo $USER_PASSWORD | sudo -S /etc/init.d/nginx start
echo $USER_PASSWORD | sudo -S redis-server /etc/redis/redis.conf

result=$(tmux ls | grep $TMUX_SESSION_NAME)

echo "$result"

  #tmux每开一个窗口，相当于新开了一个bash，每新开一个bash，就会执行整个脚本
  #所以每次执行脚本之前，应该判断一下这个脚本之前是否执行过，即判断tmux是否被创建出来

if [[ $result = "" ]]; then
  #
  cd $WORKDIR || exit
  #su- $USERNAME

  echo $USER_PASSWORD | sudo -S /etc/init.d/nginx start
  echo $USER_PASSWORD | sudo -S redis-server /etc/redis/redis.conf


PROCESS=$(ps -ef | grep uwsgi)
for i in $PROCESS; do
  case "$i" in
  [1-9][0-9]*)
    echo "Kill the process [ $i ]"
    kill -9 $i
    ;;
  *) ;;

  esac

done

#   后台新建一个session
  tmux new-session -d -s $TMUX_SESSION_NAME

  #向选择的窗口发送指令

  tmux send-keys -t $TMUX_SESSION_NAME "uwsgi --ini scripts/uwsgi.ini" C-m

  #该命令会把当前工作区域分成左右两个小窗格，光标会移动到右面的窗口
  tmux split-window -h
  tmux send-keys -t $TMUX_SESSION_NAME "cd $WORKDIR/scripts" C-m
  tmux send-keys -t $TMUX_SESSION_NAME "./compress_game_js.sh" C-m


  #启动`django_channels`服务
  #该命令 -t 后参数[session]:[window].[pane]; -v表示向右分割，-h表示向下分割
  tmux split-window -t $TMUX_SESSION_NAME:0.0 -v
  tmux send-keys -t $TMUX_SESSION_NAME "cd $WORKDIR" C-m
  tmux send-keys -t $TMUX_SESSION_NAME "daphne -b 0.0.0.0 -p 5015 acapp.asgi:application" C-m

  #多次切割后每个小窗口的编号会变化

  #该命令会把当前工作区域分成左右两个小窗格，光标会移动到右面的窗口
  tmux split-window -t $TMUX_SESSION_NAME:0.0 -v

  tmux send-keys -t $TMUX_SESSION_NAME "cd match_system/src/" C-m
  tmux send-keys -t $TMUX_SESSION_NAME "chmod +x main.py" C-m
  tmux send-keys -t $TMUX_SESSION_NAME "./main.py" C-m


  tmux split-window -t $TMUX_SESSION_NAME:0.0 -h
  tmux send-keys -t $TMUX_SESSION_NAME "python3 manage.py shell" C-m
  tmux send-keys -t $TMUX_SESSION_NAME "from django.core.cache import cache" C-m
  tmux send-keys -t $TMUX_SESSION_NAME "cache.keys('*')" C-m
  tmux send-keys -t $TMUX_SESSION_NAME "cache.clear()" C-m
  tmux send-keys -t $TMUX_SESSION_NAME "cache.has_key('')" C-m
  #tmux select-pane -t 2
  #tmux send-keys "mysql -uroot -p123456 --host 192.168.1.221 --sigint-ignore --auto-vertical-output" C-m
  #tmux send-keys "use data" C-m
  #tmux -2 attach-session -t ssh  //挂载到之前运行的session上

  #tmux每开一个窗口，相当于新开了一个bash，每新开一个bash，就会执行整个脚本
  echo "66666666"

fi

#tmux a -t $TMUX_SESSION_NAME