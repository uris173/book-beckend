const {Schema, model} = require('mongoose')

const user = new Schema({
  username: {
    type: String,
  },
  surname: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    require: true
  },
  number: {
    type: String,
    unique: true,
    require: true
  },
  password: {
    type: String,
    required: true
  },
})


module.exports = model('User', user)