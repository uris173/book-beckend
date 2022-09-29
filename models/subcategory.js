const {Schema, model} = require('mongoose')

const subcategory = new Schema({
  title: String,
  title_uz: String,
  slug: String,
  status:{
    type: Number,
    default: 0
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }
})

module.exports = model('Subcategory', subcategory)