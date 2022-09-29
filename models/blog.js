const {Schema, model} = require('mongoose')

const blog = new Schema({
  title: String,
  description: String,
  status: {
    type:Number,
    default: 0
  },
  img: String,
  review: [{
    user: {
      type: String,
      // default: 'Пользователь'
    },
    text: String,
    date: {
      type: Date,
      default: Date.now()
    }
  }]
})


module.exports = model('Blog', blog)