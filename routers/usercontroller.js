const User = require('../models/users')
const bcrypt = require('bcrypt')
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')

const generateAccessToken = (id, email) =>{
  const payload = {id, email}
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '24h'})
}

class authController {
  async registration(req, res, next){
    try {
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        return res.status(400).json({message: "Ошибка при регистрации", errors})
      }
      const {username, surname, number, email, password} = req.body
      const condidate = await User.findOne({email, number})
      if(condidate){
        return res.status(400).json({message: `Пользователь с таким ${email} или ${number} уже существуетю.`})
      }
      const hashPass = bcrypt.hashSync(password, 7)
      const user = await new User({username, surname, number, email, password: hashPass})
      await user.save()
      return res.json({message: "Пользователь успешно зарегестрирован!"})
    } catch (error) {
      console.log(error);
    }
  }

  async login(req, res, next){
    try {
      const {email, password} = req.body
      const user = await User.findOne({email})
      if(!user){
        return res.status(400).json({message: `Пользовательс таким ${email} не найден.`})
      }
      const validPass = bcrypt.compareSync(password, user.password)
      if(!validPass){
        return res.status(400).json({message: `Введен неверный пароль.`})
      }
      const token = generateAccessToken(user._id, user.email)
      return res.json({token, user})
    } catch (error) {
      console.log(error);
    }
  }
}


module.exports = new authController()