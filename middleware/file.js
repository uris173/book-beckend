const multer = require('multer')

const storage = multer.diskStorage({
  destination(req, file, cb){
    cb(null, 'image')
  },
  filename(req, file, cb){
    cb(null, new Date().toISOString().replace(/:/g, '-') +'_'+ file.originalname)
  }
})

const arrTypes = ['imgage/jpg', 'image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']

const fileFilter = (req, file, cb)=>{
  if(arrTypes.includes(file.mimetype)){
    cb(null, true)
  }else{
    cb(null, false)
  }
}


module.exports = multer({storage: storage, fileFilter})