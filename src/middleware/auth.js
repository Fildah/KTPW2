const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            res.render('error.hbs', {
                title: process.env.TITLE,
                notice: process.env.NOTICE,
                error_code: 404 
            })
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        console.log(e)
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 401,
            error_message: e
        })
    }
}

module.exports = auth