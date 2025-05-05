const express = require('express');
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
require("dotenv")

const app = express()

app.use(helmet())
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const routes = require("./routes")
app.use("/", routes)

app.use((err, req, res, next) => {
    console.log(err.stack)
 res.status(500).json({
     message: "Internal Server Error"
     })
})

module.exports = app