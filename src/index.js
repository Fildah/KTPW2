const express = require('express')
const path = require('path')
const hbs = require('hbs')
require('./db/mongoose')

// Routers
const userRouter = require('./routers/user')
const blogRouter = require('./routers/blog')

const app = express()
const port = process.env.PORT

// Paths
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Init hbs
hbs.registerPartials(partialsPath)

app.set('view engine', 'hbs')
app.set('views', viewsPath)

app.use(express.json())

app.use(userRouter)
app.use(blogRouter)

app.listen(port, () => {
    console.log('Server poslouchá na portu ' + port)
})