const Router = require('express')
const router = Router()
const auth = require('../middleware/auth')
const User = require('../models/users')

router.get('/', auth, async(req, res) =>{
  try {
    const userPerPage = 10
    const total = await User.find().count()
    const pageNum = req.query.page || 0
    let pages = Array.from({length: Math.ceil(total / userPerPage)}, (v, idx) =>{
      return{
        queryNum: idx,
        num: idx + 1
      }
    })
    pages = pages.map(pages =>{
      pages.class = pages.queryNum == pageNum ? 'active' : ''
      return pages
    })
    let user = await User.find()
    .skip(pageNum * userPerPage)
    .limit(userPerPage)
    .sort({_id: -1})
    .lean()
    user = user.map((users, index) =>{
      users.index = index + 1 
      return users
    })
    res.render('users/users', {
      user,
      pages
    })
  } catch (error) {
    console.log(error);
  }
})


module.exports = router