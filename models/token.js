const {Schema, model} = require('mongoose')

const token = new Schema({
  refreshToken: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  }
})


module.exports = model('Token', token)