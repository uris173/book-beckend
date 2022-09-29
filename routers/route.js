const {Router} = require('express')
const router = Router()
const auth = require('../middleware/auth')
const Category = require('../models/category')
const Subcategory = require('../models/subcategory')
const Genre = require('../models/genre')
const Book = require('../models/book')
const User = require('../models/users')


router.get('/', auth, async(req, res)=>{
	const categoryCount = await Category.find().where({status: 1}).count()
	const subcategoryCount = await Subcategory.find().where({status: 1}).count()
	const genreCount = await Genre.find().where({status: 1}).count()
	const bookCount = await Book.find().where({status: 1}).count()
	let book = await Book.find().sort({_id: -1}).populate('category').limit(15).lean()
	book = book.map((books, index) =>{
		books.class = books.status == 0 ? 'badge bg-danger' : 'badge bg-success'
    books.status = (books.status == 0) ? 'Отключенный' : 'Активный'
    books.price = books.price.toLocaleString('fr')
    books.index = index + 1
    return books
	})
	res.render('section/index', {
		layout: 'layout',
		categoryCount,
		subcategoryCount,
		genreCount,
		bookCount,
		book
	})
})

// router.post('/search', auth, async(req, res) =>{
// 	const payload = req.body.payload.trim()
// 	const book = await Book.find({
// 		$or: [
// 			{title: {$regex: new RegExp('^'+payload+'.*','i')}},
// 			{author: {$regex: new RegExp('^'+payload+'.*','i')}},
// 			{isbn: {$regex: new RegExp('^'+payload+'.*','i')}},
// 		]
// 	})
// 	.limit(10)
// 	.exec()
// 	const subcategory = await Subcategory.find({
// 		$or: [
// 			{title: {$regex: new RegExp('^'+payload+'.*','i')}},
// 			{title_uz: {$regex: new RegExp('^'+payload+'.*','i')}}
// 		]
// 	})
// 	.limit(10)
// 	.exec()
// 	const genre = await Genre.find({
// 		$or: [
// 			{title: {$regex: new RegExp('^'+payload+'.*','i')}},
// 			{title_uz: {$regex: new RegExp('^'+payload+'.*','i')}}
// 		]
// 	})
// 	.limit(10)
// 	.exec()
// 	// res.send([{payload: book}, {payload: subcategory}, {payload: genre}])
// 	res.send({payload: book, payload: subcategory, payload: genre})
// })


module.exports = router