var express = require('express')
var router = express.Router()
var markdown = require('markdown').markdown

var Category = require('../models/category')
var Content = require('../models/content')

var data

// 处理通用数据
router.use(function (req, res, next) {
  data = {
    userInfo: req.userInfo,
    categories: []
  }

  Category.find().then(function (categories) {
    data.categories = categories
    next()
  })
})

router.get('/', function (req, res, next) {
  data.category = req.query.category || '',
  data.contents = [],

  data.page = Number(req.query.page || 1),
  data.limit = 1,
  data.pages = 0,
  data.count = 0

  var where = {}
  if (data.category) {
    where.categoryId = data.category
  }

  // 读取分类
  Content.where(where).count().then(function (count) {
    data.count = count
    // 计算总页数
    data.pages = Math.ceil(data.count / data.limit)
    // page 取值不能超过 pages
    data.page = Math.min(data.page, data.pages)
    // page 取值不能小于 1
    data.page = Math.max(data.page, 1)

    var skip = (data.page - 1) * data.limit

    return Content.where(where).sort({addTime: -1}).limit(data.limit).skip(skip).populate(['categoryId', 'userId'])

  }).then(function (contents) {
    data.contents = contents
  }).then(function () {
    res.render('main/index', data)
  })
})

router.get('/view', function (req, res, next) {
  var contentId = req.query.contentid

  Content.findById(contentId).populate(['categoryId', 'userId']).then(function (content) {
    data.content = content
    data.category = content.categoryId.id
    data.mdContent = markdown.toHTML(content.content)
    content.views++
    content.save()
    res.render('main/view', data)
  })
})

module.exports = router