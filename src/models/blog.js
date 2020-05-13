const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    blogtitle: {
        type: String,
        required: true
    },
    blogpost: {
        type: String,
        required: true
    },
    private: {
        type: Boolean,
        default: true,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog