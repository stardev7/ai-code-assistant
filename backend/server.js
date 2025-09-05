require('dotenv').config()
const app = require("./src/app.js")


app.listen(80, (req, res)=>{
    console.log("Server is running on port 3000")
})