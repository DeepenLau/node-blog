var express = require('express')
var router = express.Router()

var User = require('../models/user')
var Content = require('../models/content')

var responseData
// TODO 为何要把变量定义在 post 外面
router.use(function (req, res, next) {
  responseData = {
    code: 0,
    message: ''
  }
  // TODO 为何要调用 next()
  next()
})

router.post('/user/register', function (req, res, next) {
  var username = req.body.username
  var password = req.body.password
  var repassword = req.body.repassword
  if (!username) {
    responseData.code = 1
    responseData.message = '用户名不能为空'
    res.json(responseData)
    return
  }
  if (!password) {
    responseData.code = 2
    responseData.message = '密码不能为空'
    res.json(responseData)
    return
  }
  if (password != repassword) {
    responseData.code = 3
    responseData.message = '两次密码不一致'
    res.json(responseData)
    return
  }

  User.findOne({
    username: username
  }).then(function (userInfo) {
    console.log(111)
    console.log(userInfo)
    if (userInfo) {
      responseData.code = 4
      responseData.message = '该用户名已被注册'
      res.json(responseData)
      return
    }

    var user = new User({
      username: username,
      password: password
    })
    return user.save()

  }).then(function (newUserInfo) {
    responseData.message = '注册成功'
    res.json(responseData)
  })
})

router.post('/user/login', function (req, res, next) {
  var username = req.body.username
  var password = req.body.password

  if (!username || !password) {
    responseData.code = 1,
    responseData.message = '用户名和密码不能为空'
    res.json(responseData)
    return
  }

  User.findOne({
    username: username,
    password: password
  }).then(function (userInfo) {
    if (!userInfo) {
      responseData.code = 2,
      responseData.message = '用户名或密码错误'
      res.json(responseData)
      return
    }
    responseData.message = '登录成功'
    responseData.userInfo = {
      id: userInfo._id,
      username: userInfo.username
    };
    // res.json(responseData)
    req.cookies.set('userInfo', JSON.stringify({
      id: userInfo._id,
      username: userInfo.username
    }))
    res.json(responseData)
    return
  })
})

router.get('/user/logout', function (req, res, next) {
  req.cookies.set('userInfo', null)
  responseData.message = '退出成功'
  res.json(responseData)
})

// 评论提交
router.post('/comment/post', function (req, res, next) {
  var contentId = req.body.contentid || ''
  var postData = {
    username: req.userInfo.username,
    postTime: new Date(),
    content: req.body.content
  }

  Content.findById(contentId).then(function (content) {
    content.comments.push(postData)
    return content.save()
  }).then(function (newContent) {
    responseData.message = '评论成功'
    responseData.data = newContent
    res.json(responseData)
  })
})

// 获取评论
router.get('/comment', function (req, res, next) {
  var contentId = req.query.contentid || ''
  console.log(contentId)
  Content.findById(contentId).then(function (content) {
    responseData.message = '获取评论成功'
    responseData.data = content.comments
    res.json(responseData)
  })
})

module.exports = router