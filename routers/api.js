const Router = require('express')
const router = Router()
const Category = require('../models/category')
const Book = require('../models/book')
const User = require('../models/users')
const controller = require('../routers/usercontroller')
const Blog = require('../models/blog')
const {check} = require('express-validator')


router.get('/bestsellers', async(req, res) =>{
  try {
    let book = await Book.find()
    .select(['img'])
    .where({status: 1, type: 1})
    .limit(6)
    .lean()
    res.send(book)
  } catch (error) {
    res.send(error)
  }
})

router.get('/trend', async(req, res) =>{
  try {
    let book = await Book.find()
    .select(['title', 'category', 'author', 'price', 'grade', 'img'])
    .populate('category')
    .where({status: 1, trend: 1})
    .limit(10)
    .lean()
    book = book.map(book =>{
      book.price = book.price.toLocaleString('fr')
      return book
    })
    res.send(book)
  } catch (error) {
    res.send(error)
  }
})

router.get('/categories', async(req, res) =>{
  try {
    let category = await Category.find()
    .where({status: 1})
    .lean()
    res.send(category)
  } catch (error) {
    res.send(error)
  }
})

router.get('/toprate', async(req, res) =>{
  try {
    let book = await Book.find()
    .select(['title', 'category', 'author', 'price', 'grade', 'img'])
    .populate('category')
    .where({status: 1}) //  grade: {$gte: 3} 
    .limit(10)
    .lean() 
    book = book.map(book =>{
      book.price = book.price.toLocaleString('fr')
      return book
    })
    res.send(book)
  } catch (error) {
    res.send(error)
  }
})

router.get('/bestsellerscard', async(req, res) =>{
  try {
    let book = await Book.find()
    .select(['title', 'genre', 'author', 'price', 'grade', 'img'])
    .populate({path: 'genre', select: 'title'})
    .where({status: 1, type: 1})
    .limit(8)
    .lean()
    book = book.map(book =>{
      book.price = book.price.toLocaleString('fr')
      return book
    })
    res.send(book)
  } catch (error) {
    res.send(error)
  }
})

router.get('/allbooks/:next', async(req, res) =>{
  try {
    let next = req.params.next
    let book = await Book.find()
    .where({status: 1})
    .select(['img', 'title', 'genre', 'author', 'grade', 'description', 'price', 'type', 'bookType'])
    .populate({path: 'genre', select: 'title'})
    .sort({createdAt: -1})
    .skip(next)
    .limit(12)
    .lean()
    book = book.map(book =>{
      book.price = book.price.toLocaleString('fr')
      return book
    })
    res.send(book)
  } catch (error) {
    res.send(error)
  }
})

// router.get('/count', async(req, res) =>{
//   try {
//     const bookCount = await Book.find().where({status: 1}).count()
//     res.send({bookCount})
//   } catch (error) {
//     res.send(error)
//   }
// })

router.get('/book/:id', async(req, res) =>{
  try {
    const _id = req.params.id
    let book = await Book.findOne({_id})
    .populate({path: 'category', select: 'title'})
    .select(['img', 'title', 'category', 'author', 'grade', 'description', 'price', 'bookType', 'isbn', 'pages', 'language'])
    .lean()
    book.price = book.price.toLocaleString('fr')
    book.img = book.img.map(images =>{
      return images
    })
    let others = await Book.find({_id: {$ne: _id}})
    .where('category').equals(book.category)
    .where({status: 1})
    .select(['img', 'title', 'grade', 'price'])
    .sort({createdAt: -1})
    .limit(3)
    .lean()
    others = others.map(books =>{
      books.price = books.price.toLocaleString('fr')
      return books
    })
    res.send({book, others})
  } catch (error) {
    res.send(error)
  }
})

router.get('/authors', async(req, res) =>{
  try {
    let book = await Book.find()
    .select(['author'])
    .lean()
    let authors = [...new Set(book.map(book => JSON.stringify(book.author)))].map(book => JSON.parse(book))
    res.send(authors)
  } catch (error) {
    res.send(error);
  }
})

router.get('/getbookbyauthor/', async(req, res) =>{
  const filters = req.query
  let book = await Book.find()
  .lean()
  book = book.filter(type =>{
    let isValid = true
    for(key in filters) {
      isValid = isValid && type[key] == filters[key]
    }
    type.price = type.price.toLocaleString('fr')
    return isValid
  })
  res.send(book)
})

// const kirlot = (text) =>{
//   let lat = {'a':'а', 'q':'к', 's':'с', 'd':'д', ''}
// }

router.get('/search/:title', async(req, res) =>{
  try {
    const title = req.params.title
    if(title.length > 0){
      let books = await Book.find({
        $or: [
          {
            'title': {$regex: new RegExp(title.toLowerCase(), 'i')}
          }
        ]
      })
      .sort({_id: -1})
      .select(['img', 'title', 'author'])
      .limit(6)
      .lean()
      res.send(books)
    }
  } catch (error) {
    res.send(error);
  }
})

router.get('/news', async(req, res) =>{
  try {
    const blog = await Blog.find()
    .where({status: 1})
    .select(['title', 'img', 'description'])
    .sort({_id: -1})
    res.send(blog)
  } catch (error) {
    res.send(error);
  }
})

router.get('/news/:id', async(req, res) =>{
  try {
    const _id = req.params.id
    const blog = await Blog.findOne({_id})
    const others = await Blog.find({_id: {$ne: _id}})
    .select(['title', 'img', 'description'])
    .where({status: 1})
    .sort({_id: -1})
    .limit(3)
    res.send({blog, others}) 
  } catch (error) {
    res.send(error);
  }
})

router.post('/addcomment', async(req, res) =>{
  try {
    const {_id, user, text} = req.body
    let blog = await Blog.findOne({_id})
    blog.review.push({user, text})
    await Blog.findByIdAndUpdate({_id}, blog).lean()
  } catch (error) {
    console.log(error);
  }
})


// REGISTRATION AND USERS LOGIN

router.post('/registration', [
  check("username", "Имя пользователя не должен быть пустым").notEmpty(),
  check("surname", "Фамилия пользователя не должен быть пустым").notEmpty(),
  check("number", "Номер телефона пользователя не должен быть пустым").notEmpty(),
  check("email", "Email пользователя не должен быть пустым").notEmpty(),
  check("password", "Пароль пользователя не должен быть меньше 4 значений и больше 15").isLength({min: 4, max: 15}),
  ], controller.registration
)

router.post('/login', controller.login)

// END REGISTRATION AND USERS LOGIN

router.post('/favs', async(req, res) =>{
  try {
    let {favs} = req.body
    if(favs.length > 0){
      let book = await Book.find({_id: {$in: favs}, status: 1})
      .select(['img', 'title', 'genre', 'author', 'grade', 'description', 'price', 'grade', 'type'])
      .populate({path: 'genre', select: 'title'})
      .sort({createdAt: -1})
      .lean()
      book = book.map(book =>{
        book.price = book.price.toLocaleString('fr')
        return book
      })
      if(book){
        res.send(book)
      } else{
        res.send('error')
      }
    }
  } catch (error) {
    console.log(error);
  }
})

router.post('/cart', async(req, res) =>{
  try {
    let {cart} = req.body
    if(cart.length > 0){
      let book = await Book.find({_id: {$in: cart}, status: 1})
      .select(['img', 'title', 'author', 'price', 'isbn'])
      .populate({path: 'genre', select: 'title'})
      .sort({createdAt: -1})
      .lean()
      book = book.map(book =>{
        book.price = book.price.toLocaleString('fr')
        return book
      })
      if(book){
        res.send(book)
      } else{
        res.send('error')
      }
    }
  } catch (error) {
    console.log(error);
  }
})




module.exports = router