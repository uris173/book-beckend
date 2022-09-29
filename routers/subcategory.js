const Router = require('express')
const router = Router()
const Subcategory = require('../models/subcategory')
const auth = require('../middleware/auth')
const Category = require('../models/category')


router.get('/', auth, async(req, res) =>{
  try {
    const subcategoryPerPage = 10
    const total = await Subcategory.count()
    const pageNum = req.query.page || 0
    let pages = Array.from({length: Math.ceil(total / subcategoryPerPage)}, (v, idx) =>{
      return {
        queryNum: idx,
        num: idx + 1,
      }
    })
    pages = pages.map(pages =>{
      pages.class = pages.queryNum == pageNum ? 'active' : ''
      return pages
    })
    let subcategory = await Subcategory.find()
    .sort({_id: -1})
    .skip(pageNum * subcategoryPerPage)
    .limit(subcategoryPerPage)
    .populate('category')
    .lean()
    if(req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search), 'gi')
      subcategory = await Subcategory.find({
        $or: [
          {title: regex}, {title_uz: regex}
        ]
      })
      .populate('category')
      .lean()
    }
    const category = await Category.find().where({status: 1}).lean()
    subcategory = subcategory.map((subcategory, index) =>{
      subcategory.class = subcategory.status == 0 ? 'badge bg-danger' : 'badge bg-success'
      subcategory.status = (subcategory.status == 0) ? 'Отключенный' : 'Активный'
      subcategory.index = index + 1
      return subcategory
    })
    res.render('section/subcategory', {
      subcategory,
      category,
      pages,
      success: req.flash('success'),
      error: req.flash('error'),
    })
  } catch (error) {
    console.log(error);
  }
})

router.post('/add', auth, async(req, res) =>{
  try {
    const {category, title, title_uz, slug, status} = req.body
    const haveSubcategory = await Subcategory.findOne({
      $and: [
        {
          $or: [
            {"title": title},
            {"title_uz": title_uz},
            {"slug": slug},
          ],
        },
        // {'category': category}
      ]
    })
    if(haveSubcategory){
      req.flash('error', 'Субкатегория с такими значениями уже существует!')
    } else{
      const subcategory = await new Subcategory({category, title, title_uz, slug, status})
      req.flash('success', 'Субкатегория успешно добавлен!')
      console.log(req.flash('success'));
      subcategory.save()
    }
    res.redirect('/subcategory')
  } catch (error) {
    console.log(error);
  }
})

router.get('/edit/:id', auth, async(req, res) =>{
  try {
    const _id = req.params.id
    const subcategory = await Subcategory.findOne({_id}).lean()
    res.send(subcategory)
  } catch (error) {
    res.send(error)
  }
})

router.post('/save', auth, async(req, res) =>{
  try {
    const _id = req.body._id
    let {category, title, title_uz, slug, status} = req.body
    status = status || 0
    const haveSubcategory = await Subcategory.findOne({
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
    if(haveSubcategory){
      req.flash('error', 'Субкатегория с такими значениями уже существует!')
    } else{
      const subcategory = {category, title, title_uz, slug, status: status || 0}
      await Subcategory.findByIdAndUpdate({_id}, subcategory).lean()
      req.flash('success', 'Субкатегория успешно изменен!')
    }
    res.redirect('/subcategory')
  } catch (error) {
    console.log(error);
  }
})

router.get('/delete/:id', auth, async(req, res) =>{
  try {
    const _id = req.params.id
    await Subcategory.findByIdAndDelete({_id})
    req.flash('success', 'Удалено!')
    res.redirect('/subcategory')
  } catch (error) {
    console.log(error);
  }
})

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router