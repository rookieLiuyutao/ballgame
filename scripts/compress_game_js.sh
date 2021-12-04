#! /bin/bash


JS_PATH=~/acapp/game/static/js/
JS_PATH_DIST=${JS_PATH}dist/
JS_PATH_SRC=${JS_PATH}src/

#将JS_PATH_SRC 中的所有js文件中的内容，写入到JS_PATH_DIST下的game.js中
find $JS_PATH_SRC -type f -name '*.js' | sort | xargs cat > ${JS_PATH_DIST}game.js

echo yes | python3 ../manage.py collectstatic
 
