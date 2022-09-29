const Router = require('express')
const router = Router()
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const keys = require('../keys/dev')

router.get('/', async(req, res) =>{
  res.render('auth/login', {
    layout: 'nohead'
  })
})

router.post('/logIn', async(req, res) =>{
  let {username, password} = req.body
  if(username == 'admin' && password == '123'){
    req.session.isAuthed = true
    res.redirect('/')
  } 
  else{
    console.log('ne tak');
    return res.redirect('/auth')
  }
})

router.get('/logout', async(req, res) =>{
  req.session.destroy(err =>{
    if(err) console.log(err);
    res.redirect('/auth')
  })
})


module.exports = router