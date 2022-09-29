const Router = require('express')
const router = Router()
const Blog = require('../models/blog')
const upload = require('../middleware/file')
const fs = require('fs')
const auth = require('../middleware/auth')

router.get('/', auth, async(req, res) =>{
  try {
    const blogPerPage = 10
    const total = await Blog.find().count()
    const pageNum = req.query.page || 0
    let pages = Array.from({length: Math.ceil(total / blogPerPage)}, (v, idx) =>{
      return{
        queryNum: idx,
        num: idx + 1
      }
    })
    pages = pages.map(pages =>{
      pages.class = pages.queryNum == pageNum ? 'active' : ''
      return pages
    })
    let blog = await Blog.find()
    .skip(pageNum * blogPerPage)
    .limit(blogPerPage)
    .sort({_id: -1})
    .lean()
    if(req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search), 'gi')
      blog = await Blog.find({
        $or: [
          {title: regex}, {title_uz: regex}
        ]
      })
      .lean()
    }
    blog = blog.map((blog, index) =>{
      blog.class = blog.status == 0 ? 'badge bg-danger' : 'badge bg-success'
      blog.status = (blog.status == 0) ?'Отключенный' : 'Активный'
      blog.index = index + 1
      return blog
    })
    res.render('section/blog', {
      blog,
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
    let {title, description, status} = req.body
    const haveBlog = await Blog.findOne({
      $and: [
        {
          $or: [ //false
            {'title': title},
          ]
        }
      ]
    })
    if(haveBlog){
      req.flash('error', 'Блог с такими значениями уже существует!')
    } else{
      let img = ''
      if(req.file){
        img = req.file.path
      }
      const blog = await new Blog({title, description, status, img})
      await blog.save()
      req.flash('success', 'Блог успешно добавлен!')
    }
    res.redirect('/blog')
  } catch (error) {
    console.log(error);
  }
})

router.get('/edit/:id', auth, async(req, res)=>{
  try {
    let _id = req.params.id
    const blog = await Blog.findOne({_id}).lean()
    res.send(blog)
  } catch (error) {
    res.send(error);
  }
})

router.post('/save', auth, upload.single('img'), async(req, res)=>{
  try {
    let _id = req.body._id
    let {title, description, status, img} = req.body
    const haveBlog = await Blog.findOne({
      $and: [
        {
          $and: [
            {
              $or:[
                {'title': title},
              ]
            },
          ]
        },
        {
          _id: { $nin: _id}
        }
      ]
    })
    if(haveBlog){
      req.flash('error', 'Категория с такими значениями уже существует!')
    } else{
      let img = ''
      let blog = await Blog.findOne({_id})
      if(req.file){
        img = req.file.path
        if(fs.existsSync(blog.img)){
          fs.unlinkSync(blog.img)
        }
        blog = {title, description, status, img}
      } else{
        blog = {title, status: status || 0}
      }
      await Blog.findByIdAndUpdate({_id}, blog).lean()
      req.flash('success', 'Категория успешно изменен!')
    }
    res.redirect('/blog')
  } catch (error) {
    console.log(error);
  }
})

router.get('/delete/:id', auth, async(req, res)=>{
  try {
    const _id = req.params.id
    let blog = await Blog.findById({_id})
    if(fs.existsSync(blog.img)){
      fs.unlinkSync(blog.img)
    }
    if(blog.img.length > 0){
      if(fs.existsSync(blog.img)){
        fs.unlinkSync(blog.img)
      }
    }
    await Blog.findByIdAndDelete({_id})
    req.flash('success', 'Удалено!')
    res.redirect('/blog')
  } catch (error) {
    console.log(error);
  }
})

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router