const {Schema, model} = require('mongoose')

const genre = new Schema({
  title: String,
  title_uz: String,
  slug: String,
  status:{
    type: Number,
    default: 0
  },
  subcategory: {
    type: Schema.Types.ObjectId,
    ref: 'Subcategory'
  }
})

module.exports = model('Genre', genre)