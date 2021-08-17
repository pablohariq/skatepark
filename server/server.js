const express = require('express')
const exphbs = require('express-handlebars')
const expressFileUpload = require("express-fileupload")
const { dirname } = require('path')
const path = require('path')

const app = express()
// **--------CONFIG--------**
const raiz = path.join(__dirname, "..") 

app.set("view engine", "handlebars")
app.engine("handlebars", exphbs({
    layoutsDir: path.join(raiz, "views")
}))

app.use("/css", express.static(path.join(raiz, "css")))
app.use("/pics", express.static(path.join(raiz, "pics")))
const config = {
    limits: {fileSize: 5000000},
    abortOnLimit: true,
    responseOnLimit: "Se ha sobrepasado el límite de tamaño de imagen."
}
app.use(expressFileUpload(config))
app.use(express.urlencoded({extended: true})); 
app.use(express.json())

// **--------CONFIG--------**

//ruta raiz
app.get("/", (req, res) => {
    res.render("index", {layout: "index"})
})

app.get("/login", (req, res) => {
    res.render("Login", {layout: "Login"})
})

app.get("/register", (req, res) => {
    res.render("Registro", {layout: "Registro"})
})

app.post("/register", (req, res) => {
    const datosSkater = req.body
    const {fotoPerfil} = req.files
    const {name: nombreArchivo} = fotoPerfil
    console.log(file)
    res.end()
})
module.exports = {app}