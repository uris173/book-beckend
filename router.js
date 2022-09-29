const {Router} = require('express')
const router = Router()

// import Router file
const pageRouter = require('./routers/route');
const api = require('./routers/api');
const category = require('./routers/caregory')
const sections = require('./routers/subcategory')
const book = require('./routers/book')
const order = require('./routers/order')
const auth = require('./routers/auth')
const users = require('./routers/users')


// Define All Route 
router.use(pageRouter)
router.use('/api', api)
router.use('/category', category)
router.use('/sections', sections)
router.use('/books', book)
router.use('/order', order)
router.use('/auth', auth)
router.use('/users', users)

module.exports = router