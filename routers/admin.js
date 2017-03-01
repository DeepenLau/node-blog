var express = require('express')
var router = express.Router()

var User = require('../models/user')
var Category = require('../models/category')
var Content = require('../models/content')

router.use(function (req, res, next) {
  if (!req.userInfo.isAdmin) {
    res.send('只有管理员能看的页面')
    return
  }
  next()
})
// 首页
router.get('/', function (req, res, next) {
  res.render('admin/index', {
    userInfo: req.userInfo
  })
})

// 用户管理
router.get('/user', function (req, res, next) {
  var page = Number(req.query.page || 1)
  var limit = 1
  var pages = 0
  User.count().then(function (count) {
    // 计算总页数
    pages = Math.ceil(count / limit)
    // page 取值不能超过 pages
    page = Math.min(page, pages)
    // page 取值不能小于 1
    page = Math.max(page, 1)

    var skip = (page - 1) * limit

    User.find().limit(limit).skip(skip).then(function (users) {
      res.render('admin/user_index', {
        userInfo: req.userInfo,
        users: users,
        router: 'user',

        page: page,
        pages: pages,
        limit: limit,
        count: count
      })
    })
  })
})
// 分类首页
router.get('/category', function (req, res, next) {
  var page = Number(req.query.page || 1)
  var limit = 3
  var pages = 0
  Category.count().then(function (count) {
    // 计算总页数
    pages = Math.ceil(count / limit)
    // page 取值不能超过 pages
    page = Math.min(page, pages)
    // page 取值不能小于 1
    page = Math.max(page, 1)

    var skip = (page - 1) * limit

    Category.find().sort({ _id: -1 }).limit(limit).skip(skip).then(function (categories) {
      res.render('admin/category_index', {
        userInfo: req.userInfo,
        categories: categories,
        router: 'category',

        page: page,
        pages: pages,
        limit: limit,
        count: count
      })
    })
  })
})
// 分类添加页面
router.get('/category/add', function (req, res, next) {
  res.render('admin/category_add', {
    userInfo: req.userInfo
  })
})

// 分类添加提交表单路由
router.post('/category/add', function (req, res, next) {
  var categoryName = req.body.categoryName
  var tips
  if (!categoryName) {
    tips = {
      type: 'danger',
      message: '分类名不能为空，请重试~'
    }
    res.render('admin/category_add', {
      userInfo: req.userInfo,
      tips
    })
    return
  }

  Category.findOne({
    categoryName
  }).then(function (oldCategoryName) {
    if (!oldCategoryName) {
      // 数据库中没有该分类，可以保存
      return new Category({
        categoryName: categoryName
      }).save()
    } else {
      // 数据库中有该分类，不能保存
      return Promise.reject()
    }
  }).then(function (newCategoryName) {
    tips = {
      type: 'success',
      message: '操作成功'
    }
    res.render('admin/category_add', {
      userInfo: req.userInfo,
      tips
    })
  }).catch(function (err) {
    tips = {
      type: 'danger',
      message: '该分类已经存在，请重试~'
    }
    res.render('admin/category_add', {
      userInfo: req.userInfo,
      tips
    })
  })

})

// 修改分类名称
router.get('/category/edit', function (req, res, next) {
  var id = req.query.id
  Category.findById(id).then(function (category) {
    if (category) {
      // 有
      res.render('admin/category_edit', {
        userInfo: req.userInfo,
        category: category
      })
    }
  })
})
// 修改分类名称表单提交路由
router.post('/category/edit', function (req, res, next) {
  var newCategoryName = req.body.newCategoryName
  var id = req.query.id
  var oldCategoryName
  Category.findById(id).then(function (category) {
    oldCategoryName = category
    if (newCategoryName === category.categoryName) {
      res.render('admin/category_edit', {
        userInfo: req.userInfo,
        category: category,
        tips: {
          type: 'warning',
          message: '新名称与旧名称相同，不需要修改'
        }
      })
      return Promise.reject()
    } else {
      var sameCategory = Category.findOne({
        _id: { $ne: id },
        categoryName: newCategoryName
      })
      return sameCategory
    }
  }).then(function (sameCategory) {
    if (sameCategory) {
      res.render('admin/category_edit', {
        userInfo: req.userInfo,
        category: oldCategoryName,
        tips: {
          type: 'warning',
          message: '新名称已经被使用'
        }
      })
      return Promise.reject()
    } else {
      var result = Category.update({
        _id: id
      }, {
          categoryName: newCategoryName
        })
      return result
    }
  }).then(function (result) {
    if (result.ok) {
      Category.findById(id).then(function (category) {
        res.render('admin/category_edit', {
          userInfo: req.userInfo,
          category: category,
          tips: {
            type: 'success',
            message: '修改成功~'
          }
        })
      })
    }
  })
})

// 分类删除
router.get('/category/delete', function (req, res, next) {
  var id = req.query.id || ''
  Category.remove({
    _id: id
  }).then(function (result) {
    setTimeout(function () {
      res.redirect('../category')
    }, 2000)
  })
})

// 内容管理首页
router.get('/content', function (req, res, next) {
  var page = Number(req.query.page || 1)
  var limit = 1
  var pages = 0
  Content.count().then(function (count) {
    // 计算总页数
    pages = Math.ceil(count / limit)
    // page 取值不能超过 pages
    page = Math.min(page, pages)
    // page 取值不能小于 1
    page = Math.max(page, 1)

    var skip = (page - 1) * limit

    Content.find().sort({addTime: -1}).limit(limit).skip(skip).populate(['categoryId', 'userId']).then(function (contents) {
      console.log(contents)
      res.render('admin/content_index', {
        userInfo: req.userInfo,
        contents: contents,
        router: 'content',

        page: page,
        pages: pages,
        limit: limit,
        count: count
      })
    })
  })
})

// 内容管理添加首页
router.get('/content/add', function (req, res, next) {
  Category.find().sort({ _id: -1 }).then(function (categories) {
    res.render('admin/content_add', {
      userInfo: req.userInfo,
      categories: categories
    })
  })
})

// 内容添加保存
router.post('/content/add', function (req, res, next) {
  var userId = req.userInfo.id
  var categoryId = req.body.categoryId
  var title = req.body.title
  var description = req.body.description
  var content = req.body.content

  if (!categoryId) {
    Category.find().sort({ _id: -1 }).then(function (categories) {
      res.render('admin/content_add', {
        userInfo: req.userInfo,
        categories: categories,
        tips: {
          type: 'danger',
          message: '分类不能为空'
        }
      })
    })
    return
  }

  if (!title) {
    Category.find().sort({ _id: -1 }).then(function (categories) {
      res.render('admin/content_add', {
        userInfo: req.userInfo,
        categories: categories,
        tips: {
          type: 'danger',
          message: '标题不能为空'
        }
      })
    })
    return
  }

  new Content({
    userId,
    categoryId,
    title,
    description,
    content
  }).save().then(function () {
    Category.find().sort({ _id: -1 }).then(function (categories) {
      res.render('admin/content_add', {
        userInfo: req.userInfo,
        categories: categories,
        tips: {
          type: 'success',
          message: '保存成功~'
        }
      }, function () {
        res.redirect('../content')
      })
    })
  })
})

// 内容管理修改
router.get('/content/edit', function (req, res, next) {
  var id = req.query.id
  var categories = []
  Category.find().sort({ _id: -1 }).then(function (categoriesList) {
    categories = categoriesList
    return Content.findById(id)
  }).then(function (content) {
    if (!content) {
      // 没有
      res.render('admin/content_index', {
        userInfo: req.userInfo,
        tips: {
          type: 'danger',
          message: '没有这条记录'
        }
      })
    }
    if (content) {
      // 有
      res.render('admin/content_edit', {
        userInfo: req.userInfo,
        content: content,
        categories: categories
      })
    }
  })
})

router.post('/content/edit', function (req, res, next) {
  var id = req.query.id
  var categoryId = req.body.categoryId
  var title = req.body.title
  var description = req.body.description
  var content = req.body.content

  if (!categoryId) {
    Category.find().sort({ _id: -1 }).then(function (categories) {
      res.render('admin/content_add', {
        userInfo: req.userInfo,
        categories: categories,
        tips: {
          type: 'danger',
          message: '分类不能为空'
        }
      })
    })
    return
  }

  if (!title) {
    Category.find().sort({ _id: -1 }).then(function (categories) {
      res.render('admin/content_add', {
        userInfo: req.userInfo,
        categories: categories,
        tips: {
          type: 'danger',
          message: '标题不能为空'
        }
      })
    })
    return
  }

  var result = Content.update({
    _id: id
  }, {
    categoryId,
    title,
    description,
    content
  }).then(function (result) {
    if (result.ok) {
      res.redirect('../content')
    }
  })
})

// 内容管理删除
router.get('/content/delete', function (req, res, next) {
  var id = req.query.id || ''
  Content.remove({
    _id: id
  }).then(function (result) {
    setTimeout(function () {
      res.redirect('../content')
    }, 2000)
  })
})

module.exports = router