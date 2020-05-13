const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')

const router = new express.Router()

router.get('/users/create', async (req, res) => {
    try {
        res.render('registration.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE
        })
    } catch (e) {
        console.log(e)
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 400,
            error_message: e
        })
    }
})

router.post('/users/create', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.render('user.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            status: true,
            name: user['name'],
            email: user['email'],
            token: token
        })
    } catch (e) {
        console.log(e)
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 400,
            error_message: e
        })
    }
})


router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.render('user.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            status: true,
            name: user['name'],
            email: user['email'],
            token: token
        })
    } catch (e) {
        console.log(e)
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 400,
            error_message: e
        })
    }
})


router.post('/users/logout', auth, async (req, res) => {   
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        const blogs = await Blog.find({private: false, active:true})
        if (!blogs) {
            res.render('error.hbs', {
                title: process.env.TITLE,
                notice: process.env.NOTICE,
                error_code: 404
            })
        }
        res.render('index.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            blogs: blogs
        })
    } catch (e) {
        console.log(e)
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 500,
            error_message: e
        })
    }
})


router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        const blogs = await Blog.find({private: false, active:true})
        if (!blogs) {
            res.render('error.hbs', {
                title: process.env.TITLE,
                notice: process.env.NOTICE,
                error_code: 404
            })
        }
        res.render('index.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            blogs: blogs
        })
    } catch (e) {
        console.log(e)
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 500,
            error_message: e
        })
    }
})

router.get('/users/me', auth, async (req, res) => {
    const user = await User.findById({_id:req.user._id})
    try {
        res.render('user.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            edit: true,
            name: user['name'],
            email: user['email'],
            token: user['tokens']
        })
    } catch (e) {
        console.log(e)
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 500,
            error_message: e
        })
    }
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        console.log(e)
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 400,
            error_message: 'Neplatná aktualizace!'
        })
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.render('user.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            status: true,
            name: req.user['name'],
            email: req.user['email'],
            token: req.user['tokens']
        })
    } catch (e) {
        console.log(e)
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 400,
            error_message: e
        })
    }
})


router.delete('/users/me', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete({_id:req.user._id})
        if (!user) {
            res.render('error.hbs', {
                title: process.env.TITLE,
                notice: process.env.NOTICE,
                error_code: 404,
                error_message: ''
            })
        }
        await req.user.remove()
        res.render('user.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            status: true,
            name: user['name'],
            email: user['email'],
            token: user['tokens']
        })
    } catch (e) {
        console.log(e)
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 500,
            error_message: e
        })
    }
})

module.exports = router