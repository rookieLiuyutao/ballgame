#继承django数据库的基类
from django.db import models
from django.contrib.auth.models import User

#继承的类写在括号中
class Player(models.Model):
    #定义关联关系，每个player对应一个user，player类继承了user的所有属性
    #当user被删除，对应的player也被删除，自带的user类本身的属性有：用户名，密码
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    #---------以下是player类自定义附加的其他属性-------
    #用户头像的图片链接
    photo = models.URLField(max_length=256,blank=True)
    #用于给acwing发送请求
    openid = models.CharField(default="", max_length=50, blank=True, null=True)
    #显示每个player的数据在后台的名字
    def __str__(self):
        return str(self.user)
