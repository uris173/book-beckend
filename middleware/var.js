module.exports = (req, res, next)=>{
  res.locals.isAuthed = req.session.isAuthed
  // res.locals.csrf = req.csrfToken()
  // if (req.session.admin.name)
  // res.locals.admin = req.session.admin
  next()
}