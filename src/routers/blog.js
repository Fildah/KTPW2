const express = require('express')
const Blog = require('../models/blog')
const auth = require('../middleware/auth')

const router = new express.Router()

// Create blog
router.post('/blogs/create', auth, async (req, res) => {
    const blog = new Blog({
        ...req.body,
        author: req.user._id
    })
    try {
        await blog.save()
        res.render('blog.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            username: req.user.name,
            status: true,
            blogtitle: blog['blogtitle'],
            blogpost: blog['blogpost']
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

// Get public blogs
router.get('/', async (req, res) => {
    try {
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

// Get all blogs that user can access (public + private of user)
router.get('/blogs/me', auth, async (req, res) => {
    try {
        const blogs = await Blog.find({$and:[{$or:[{author:req.user._id},{private:false}]},{active:true}]})
        if (!blogs) {
            res.render('error.hbs', {
                title: process.env.TITLE,
                notice: process.env.NOTICE,
                error_code: 404
            })
        }
        res.render('index_registered_user.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            username: req.user.name,
            editable: true,
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

// Get detail of blog
router.get('/blogs/:id', auth, async (req, res) =>{
    try {
        const blog = await Blog.findOne({_id:req.params.id, author:req.user._id})
        if (!blog) {
            res.render('error.hbs', {
                title: process.env.TITLE,
                notice: process.env.NOTICE,
                error_code: 404
            })
        }
        res.render('blog.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            username: req.user.name,
            edit: true,
            blogtitle: blog['blogtitle'],
            blogpost: blog['blogpost'],
            private: blog['private']
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

// Update blog
router.patch('/blogs/:id', auth, async (req, res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'blogpost', 'private']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        res.render('error.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            error_code: 404,
            error_message: "Wrong actialization"
        })
    }

    try {
        const blog = await Blog.findByIdAndUpdate({_id:req.params.id, author:req.user._id})
        if (!blog) {
            res.render('error.hbs', {
                title: process.env.TITLE,
                notice: process.env.NOTICE,
                error_code: 404
            })
        }
        updates.forEach((update) => blog[update] = req.body[update])
        await blog.save()
        res.render('blog.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            username: req.user.name,
            status: true,
            blogtitle: blog['blogtitle'],
            blogpost: blog['blogpost'],
            private: blog['private']
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

// Delete blog
router.delete('/blogs/:id', auth, async (req, res) =>{
    try {
        const blog = await Blog.findByIdAndUpdate({_id:req.params.id, author:req.user._id})
        if (!blog) {
            res.render('error.hbs', {
                title: process.env.TITLE,
                notice: process.env.NOTICE,
                error_code: 404
            })
        }
        blog['active'] = false
        await blog.save()
        res.render('blog.hbs', {
            title: process.env.TITLE,
            notice: process.env.NOTICE,
            username: req.user.name,
            status: true,
            blogtitle: blog['blogtitle'],
            blogpost: blog['blogpost'],
            private: blog['private']
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