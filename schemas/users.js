var mongoose = require('mongoose')

var schema = mongoose.Schema

var users = new schema({
  username: String,
  password: String,
  isAdmin: {
    type: Boolean,
    default: false
  }
})

module.exports = users