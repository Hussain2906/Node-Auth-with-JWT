const express =  require('express')
const cookieParser = require("cookie-parser");
const authRoutes = require('./routes.auth')

const app = express()

const PORT =process.env.PORT || 8000
// 

app.use(express.json())
app.use(cookieParser())


// using auth routes

app.use('/api', authRoutes)

app.get('/', (req,res)=>{
    res.status(200).send('Server is healthy')
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})