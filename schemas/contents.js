var mongoose = require('mongoose')

var schema = mongoose.Schema

var contents = new schema({
  // 关联字段 - 内容分类 id
  categoryId: {
    // 类型
    type: mongoose.Schema.Types.ObjectId,
    // 引用
    ref: 'Category'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  views: {
    type: Number,
    default: 0
  },
  addTime: {
    type: Date,
    default: new Date()
  },
  title: String,
  description: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },

  comments: {
    type: Array,
    default: []
  }
})

module.exports = contents