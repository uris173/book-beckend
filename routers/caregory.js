const {Router} = require('express')
const Category = require('../models/category')
const router = Router()
const upload = require('../middleware/file')
const fs = require('fs')
const auth = require('../middleware/auth')

router.get('/', auth, async(req, res)=>{
  try {
    const categoryPerPage = 10
    const total = await Category.find().count()
    const pageNum = req.query.page || 0
    let pages = Array.from({length: Math.ceil(total / categoryPerPage)}, (v, idx) =>{
      return{
        queryNum: idx,
        num: idx + 1
      }
    })
    pages = pages.map(pages =>{
      pages.class = pages.queryNum == pageNum ? 'active' : ''
      return pages
    })
    let category = await Category.find()
    .skip(pageNum * categoryPerPage)
    .limit(categoryPerPage)
    .sort({_id: -1})
    .lean()
    if(req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search), 'gi')
      category = await Category.find({
        $or: [
          {title: regex}, {title_uz: regex}
        ]
      })
      .lean()
    }
    category = category.map((cat, index)=>{
      cat.class = cat.status == 0 ? 'badge bg-danger' : 'badge bg-success'
      cat.status = (cat.status == 0) ? 'Отключенный' : 'Активный'
      cat.index = index + 1 
      return cat
    })
    res.render('section/category', {
      category,
      pages, 
      error: req.flash('error'),
      success: req.flash('success'),
    })
  } catch (error) {
    console.log(error);
  }
})

router.post('/add', auth, upload.single('img'), async(req, res)=>{
  try {
    let {title, slug, status, title_uz} = req.body
    const haveCategoy = await Category.findOne({
      $and: [
        {
          $or: [ //false
            {'title': title},
            {'title_uz': title_uz},
            {'slug': slug},
          ]
        }
      ]
    })
    if(haveCategoy){
      req.flash('error', 'Категория с такими значениями уже существует!')
    } else{
      let img = ''
      if(req.file){
        img = req.file.path
      }
      const category = await new Category({title, slug, status, img, title_uz})
      await category.save()
      req.flash('success', 'Категория успешно добавлен!')
    }
    res.redirect('/category')
  } catch (error) {
    console.log(error);
  }
})

router.get('/edit/:id', auth, async(req, res)=>{
  try {
    let _id = req.params.id
    const category = await Category.findOne({_id}).lean()
    res.send(category)
  } catch (error) {
    res.send(error);
  }
})

router.post('/save', auth, upload.single('img'), async(req, res)=>{
  try {
    let _id = req.body._id
    let {title, slug, status,title_uz} = req.body
    const haveCategoy = await Category.findOne({
      $and: [
        {
          $and: [
            {
              $or:[
                {'title': title},
                {'title_uz': title_uz},
                {'slug': slug},
              ]
            },
          ]
        },
        {
          _id: { $nin: _id}
        }
      ]
    })
    if(haveCategoy){
      req.flash('error', 'Категория с такими значениями уже существует!')
    } else{
      let img = ''
      let category = await Category.findOne({_id})
      if(req.file){
        img = req.file.path
        if(fs.existsSync(category.img)){
          fs.unlinkSync(category.img)
        }
        category = {title, slug, status, img, title_uz}
      } else{
        category = {title, slug, status: status || 0, title_uz}
      }
      await Category.findByIdAndUpdate({_id}, category).lean()
      req.flash('success', 'Категория успешно изменен!')
    }
    res.redirect('/category')
  } catch (error) {
    console.log(error);
  }
})

router.get('/delete/:id', auth, async(req, res)=>{
  try {
    const _id = req.params.id
    let category = await Category.findById({_id})
    if(fs.existsSync(category.img)){
      fs.unlinkSync(category.img)
    }
    if(category.img.length > 0){
      if(fs.existsSync(category.img)){
        fs.unlinkSync(category.img)
      }
    }
    await Category.findByIdAndDelete({_id})
    req.flash('success', 'Удалено!')
    res.redirect('/category')
  } catch (error) {
    console.log(error);
  }
})

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router