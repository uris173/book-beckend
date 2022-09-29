const {Schema, model} = require('mongoose')

const book = new Schema({
  title: String,
  author: String,
  description: String,
  price: Number,
  date: Number,
  isbn: String,
  language: String,
  pages: String,
  img: [String],
  bookType: String,
  status: {
    type: Number,
    default: 0
  },
  type: {
    type: Number,
    default: 0
  },
  trend: {
    type: Number,
    default: 0
  },
  grade: {
    type: Number,
    default: 0,
    $max: 5
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  subcategory: {
    type: Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  genre: {
    type: Schema.Types.ObjectId,
    ref: 'Genre'
  }
})


module.exports = model('Book', book)