import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(express.json({limit: "10kb"}))
app.use(express.urlencoded({extended: true, limit: "10kb"}))
app.use(cookieParser())

app.listen(PORT, () => {
    console.log(`Surver is running at ${PORT} in ${process.env.NODE_ENV}` );
    
})