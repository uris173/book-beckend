require('dotenv').config()
const express = require('express');
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const MongoStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
// const path = require('path');
const app = express()

// const csrf = require('csurf') 
// const http = require('http').Server(app);
// const validator = require('express-validator');


// middlewate / dev
const keys = require('./keys/dev')
const varMid = require('./middleware/var')


// import Router file
const api = require('./routers/api');
const pageRouter = require('./routers/route');
const category = require('./routers/caregory')
const subcategory = require('./routers/subcategory')
const genre = require('./routers/genre')
const book = require('./routers/book')
const blog = require('./routers/blog')
const order = require('./routers/order')
const auth = require('./routers/auth')
const users = require('./routers/users')


// app.use('/public', express.static('public'))
// app.get('/layouts/', function(req, res){
  //   res.render('view')
  // })
  // const expressLayouts = require('express-handlebars-layouts');
  // app.set('views', path.join(__dirname, 'views'));
  // app.set('view engine', 'hbs');
  // app.use(expressLayouts)
  
app.use('/image', express.static('image'))
app.use(express.static(__dirname + '/public')) 

const hbs = exphbs.create({
  defaultLayout: 'layout',
  extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')
  
app.use(express.urlencoded({
  extended: true
}))

app.use(express.json())


app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-CSRF-Token');
  // res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const store = new MongoStore({
  collection: 'session',
  uri: keys.MONGODB_URI
})

app.use(session({
  secret: keys.SESSION_SECRET,
  saveUninitialized: false,
  cookie:{
    maxAge: 1000 * 60 * 60 * 5,
    secure: false,
  },
  resave: true,
  store
}))

// const corsOptions = {
//   origin: 'http://localhost:8080',
//   credentials: true,
// }


app.use(cors({
  origin: ['http://192.168.0.109:8080', 'http://localhost:8080'],
  // origin: 'http://localhost:8080',
  credentials: true,
}));

app.use(cookieParser())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json());
app.use(flash());
app.use(varMid)

// Define All Route 
app.use(pageRouter)
app.use('/auth', auth)
app.use('/api', api)
app.use('/category', category)
app.use('/subcategory', subcategory)
app.use('/genres', genre)
app.use('/books', book)
app.use('/blog', blog)
app.use('/order', order)
app.use('/users', users)


const PORT = process.env.PORT || 5000
async function dev() {
  try {
    await mongoose.connect(keys.MONGODB_URI,{useNewUrlParser:true})
    app.listen(PORT,()=>{
      console.log('Server is running on PORT', PORT)
    })
  } catch (error) {
    console.log(error)
  }
}
dev()