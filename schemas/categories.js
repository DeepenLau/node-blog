var mongoose = require('mongoose')

var schema = mongoose.Schema

var categories = new schema({
  categoryName: String
})

module.exports = categories