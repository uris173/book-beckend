const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Subcategory = require('../models/subcategory')
const Genre = require('../models/genre')
const auth = require('../middleware/auth')

router.get('/', auth, async(req, res) =>{
  try {
    const genrePerPage = 10
    const total = await Genre.count()
    const pageNum = req.query.page || 0
    let pages = Array.from({length: Math.ceil(total / genrePerPage)}, (v, idx) =>{
      return{
        queryNum: idx,
        num: idx + 1
      }
    })
    pages = pages.map(pages =>{
      pages.class = pages.queryNum == pageNum ? 'active' : ''
      return pages
    })
    let genre = await Genre.find()
    .sort({_id: -1})
    .skip(pageNum * genrePerPage)
    .limit(genrePerPage)
    .populate({
      path: 'subcategory',
      populate: {
        path: 'category'
      }
    })
    .lean()
    if(req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search), 'gi')
      genre = await Genre.find({
        $or: [
          {title: regex}, {title_uz: regex}
        ]
      })
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category'
        }
      })
      .lean()
    }
    const category = await Category.find().where({status: 1}).lean()
    const subcategory = await Subcategory.find().where({status: 1})
    genre = genre.map((genre, index) =>{
      genre.class = genre.status == 0 ?  'badge bg-danger' : 'badge bg-success'
      genre.status = (genre.status == 0) ? 'Отключенный' : 'Активный'
      genre.index = index + 1
      return genre
    })
    res.render('section/genre', {
      category,
      subcategory,
      genre,
      pages,
      success: req.flash('success'),
      error: req.flash('error')
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
    console.log(error);
  }
})

router.post('/add', auth, async(req, res) =>{
  try {
    const {category, subcategory, title, title_uz, slug, status} = req.body
    const haveGenre = await Genre.findOne({
      $and: [
        {
          $or: [
            {'title': title},
            {'title_uz': title_uz},
            {'slug': slug},
          ]
        }
      ]
    })
    if(haveGenre){
      req.flash('error', 'Жанр с такими значениями уже существует!')
    } else{
      const genre = await new Genre({category, subcategory, title, title_uz, slug, status})
      genre.save()
      req.flash('success', 'Жанр успешно добавлен!')
    }
    res.redirect('/genres')
  } catch (error) {
    console.log(error);
  }
})

router.get('/delete/:id', auth, async(req, res) =>{
  try {
    const _id = req.params.id
    await Genre.findByIdAndDelete({_id})
    req.flash('success', 'Удалено!')
    res.redirect('/genres')
  } catch (error) {
    console.log(error);
  }
})

router.get('/edit/:id', auth, async(req, res) =>{
  try {
    const _id = req.params.id
    const genre = await Genre.findOne({_id})
    .populate({
      path: 'subcategory',
      populate: {
        path: 'category'
      }
    })
    .lean()
    res.send(genre)
  } catch (error) {
    res.send(error);
  }
})

router.post('/save', auth, async(req, res) =>{
  try {
    const _id = req.body._id
    let {category, subcategory, title, title_uz, slug, status} = req.body
    status = status || 0
    const haveGenre = await Genre.findOne({
      $and: [
        {
          $and: [
            {
              $or: [
                {'title': title},
                {'title_uz': title_uz},
                {'slug': slug}
              ]
            }
          ]
        },
        {_id: {$nin: _id}}
      ]
    })
    if(haveGenre){
      req.flash('error', 'Жанр с такими значениями уже существует!')
    } else{
      const genre = {category, subcategory, title, title_uz, slug, status: status || 0}
      await Genre.findByIdAndUpdate({_id}, genre)
      req.flash('success', 'Жанр успешно изменен!')
    }
    res.redirect('/genres')
  } catch (error) {
    console.log(error);
  }
})

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router