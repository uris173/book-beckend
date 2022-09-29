module.exports = (req,res, next)=>{
  if (!req.session.isAuthed){
    return res.redirect('/auth')
  }
  next()
}


// const jwt = require('jsonwebtoken')
// const keys = require('../keys/dev')

// module.exports = function(req, res, next){
//   if(req.method === 'OPTIONS'){
//     next()
//   }
//   try {
//     const token = req.headers.authorization
//     if(!token){
//       return res.status(403)
//     }
//     const decodedData = jwt.verify(token, keys.SESSION_SECRET)
//     req.session = decodedData
//     next()
//   } catch (error) {
//     console.log(error);
//   }
// }