const {Router} = require('express')
const router = Router()
const upload = require('../middleware/file')
const Category = require('../models/category')
const Subcategory = require('../models/subcategory')
const Genre = require('../models/genre')
const Book = require('../models/book')
const fs = require('fs')
const auth = require('../middleware/auth')

router.get('/', auth, async(req, res)=>{
  try {
    const booksPerPage = 10 
    const total = await Book.count()
    const pageNum = req.query.page || 0
    let pages = Array.from({length: Math.ceil(total / booksPerPage)}, (v, idx) =>{
      return {
        queryNum: idx,
        num: idx + 1,
      }
    })
    pages = pages.map(pages =>{
      pages.class = pages.queryNum == pageNum ? 'active' : ''
      return pages
    })
    let book = await Book.find().sort({_id: -1})
    .skip(pageNum * booksPerPage)
    .limit(booksPerPage)
    .populate([
      {path: 'genre', select: 'title'},
      {path: 'subcategory', select: 'title'},
      {path: 'category', select: 'title'},
    ])
    .lean()
    if(req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search), 'gi')
      book = await Book.find({
        $or: [
          {title: regex}, {author: regex}, {isbn: regex}
        ]
      })
      .populate([
        {path: 'genre', select: 'title'},
        {path: 'subcategory', select: 'title'},
        {path: 'category', select: 'title'},
      ])
      .lean()
    }
    const category = await Category.find().where({status: 1}).lean()
    const subcategory = await Subcategory.find().where({status: 1}).lean()
    const genre = await Genre.find().where({status: 1}).lean()
    book = book.map((book, index)=>{
      book.class = book.status == 0 ? 'badge bg-danger' : 'badge bg-success'
      book.classType = book.type == 0 ? 'badge bg-danger' : 'badge bg-success'
      book.classTrend = book.trend == 0 ? 'badge bg-danger' : 'badge bg-success'
      book.status = book.status == 0 ? 'Отключенный' : 'Активный'
      book.type = book.type == 0 ? 'Нет' : 'Да'
      book.trend = book.trend == 0 ? 'Нет' : 'Да'
      book.price = book.price.toLocaleString('fr')
      book.index = index + 1
      return book
    })
    res.render('book/book', {
      book,
      category,
      subcategory,
      genre,
      pages,
      error: req.flash('error'),
      success: req.flash('success')
    })
  } catch (error) {
    console.log(error);
  }
})

router.get('/category/:id', auth, async(req, res) =>{
  try {
    const _id = req.params.id
    const subcategory = await Subcategory.find({category: _id}).where({status: 1})
    res.send(subcategory)
  } catch (error) {
    res.send(error)
  }
})

router.get('/subcategory/:id', auth, async(req, res) =>{
  try {
    const _id = req.params.id
    const genre = await Genre.find({subcategory: _id}).where({status: 1})
    res.send(genre)
  } catch (error) {
    res.send(error)
  }
})

router.post('/add', auth, upload.fields([{name: 'img', maxCount: 12}]), async(req, res)=>{
  try {
    const {category, subcategory, genre, title, author, bookType, date, price, description, status, type, trend, isbn, language, pages} = req.body
    let {img} = req.files
    let image = []
    if(img){
      img.forEach(elements =>{
        image.push(elements.path)
      })
    }
    const data = {category, subcategory, genre, title, author, bookType, date, price, description, status, type, trend, img: image, isbn, language, pages}
    const book = await new Book(data)
    await book.save()
    req.flash('success', 'Книга успешно добавлена!')
    res.redirect('/books')
  } catch (error) {
    console.log(error);
  }
})

router.get('/edit/:id', auth, async(req, res)=>{
  try {
    let _id = req.params.id
    const book = await Book.findOne({_id})
    .populate([
      {path: 'genre', select: 'title'},
      {path: 'subcategory', select: 'title'},
      {path: 'category', select: 'title'},
    ])
    .lean()
    res.send(book)
  } catch (error) {
    res.send(error)
  }
})


router.post('/save', auth, upload.fields([{name: 'img', maxCount: 6}]), async(req, res) =>{
  try {
    let _id = req.body._id
    let {category, subcategory, genre, title, author, bookType, date, price, description, status, type, trend, isbn, language, pages} = req.body
    let book = await Book.findById({_id})
    let image = []
    let {img} = req.files
    if(img){
      img.forEach(elements =>{
        image.push(elements.path)
      })
      book.img.forEach(images =>{
        if(fs.existsSync(images)){
          fs.unlinkSync(images)
        }
      })
      book = {category, subcategory, genre, title, author, bookType, date, price, description, status, type, trend, img: image, isbn, language, pages}
    } else{
      book = {category, subcategory, genre, title, author, bookType, date, price, description, status: status || 0, type: type || 0, trend: trend || 0, isbn, language, pages}
    }
    await Book.findByIdAndUpdate({_id}, book).lean()
    req.flash('success', 'Книга успешно изменена!')
    res.redirect('/books')
  } catch (error) {
    console.log(error);
  }
})

router.get('/delete/:id', auth, async(req, res) =>{
  try {
    const _id = req.params.id
    let book = await Book.findById({_id})
    book.img.forEach(images =>{
      if(fs.existsSync(images)){
        fs.unlinkSync(images)
      }
      if(images.length > 0){
        if(fs.existsSync(images)){
          fs.unlinkSync(images)
        }
      }
    })
    await Book.findByIdAndDelete({_id})
    res.redirect('/books')
} catch (error) {
  console.log(error);
}
})

router.get('/view/:id', auth, async(req, res) =>{
  try {
    const _id = req.params.id
    let book = await Book.findOne({_id})
    .populate([
      {path: 'genre', select: 'title'},
      {path: 'subcategory', select: 'title'},
      {path: 'category', select: 'title'},
    ])
    .lean()
    book.status = book.status == 0 ? 'Отключенный' : 'Активный'
    book.type = book.type == 0 ? 'Нет' : 'Да'
    book.trend = book.trend == 0 ? 'Нет' : 'Да'
    book.price = book.price.toLocaleString('fr')
    firstImage = book.img[0]
    res.render('book/view', {
      book, firstImage
    })
  } catch (error) {
    console.log(error);
  }
})

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router