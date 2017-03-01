var express = require('express')
var swig = require('swig')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var Cookies = require('cookies')
var app = express()

var User = require('./models/user')

// 定义模板引擎
app.engine('html', swig.renderFile)
// 设置模板文件存放的目录，第一个参数必须是 views ，第二个参数是目录
app.set('views', './views')
// 注册模板引擎，第一个参数必须是 view engine ，第二个参数和 app.engine()中设置的第一个参数必须一致
app.set('view engine', 'html')
// 取消模板缓存
swig.setDefaults({ cache: false })

// 设置 body-parser
app.use(bodyParser.urlencoded({extended: true}))
// 设置 cookies
app.use(function (req, res, next) {
  req.cookies = new Cookies(req, res);
  req.userInfo = {}
  if (req.cookies.get('userInfo')) {
    try {
      req.userInfo = JSON.parse(req.cookies.get('userInfo'))

      User.findById(req.userInfo.id).then(function (userInfo) {
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
        next();
      })
    } catch (e) {
      next();
    }
  } else {
    next();
  }
})

// 设置静态文件托管
app.use('/public', express.static(__dirname + '/public'))
// 路由管理
app.use('/', require('./routers/main'))
app.use('/admin', require('./routers/admin'))
app.use('/api', require('./routers/api'))

mongoose.connect('mongodb://localhost:27017/blog', function (err) {
  if (err) {
    console.log('数据库链接失败')
  } else {
    console.log('数据库链接成功')
    app.listen(8400)
  }
})