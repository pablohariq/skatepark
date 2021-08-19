const express = require('express')
const exphbs = require('express-handlebars')
const expressFileUpload = require("express-fileupload")
const { dirname } = require('path')
const path = require('path')
const {ingresarSkater} = require("../database/consultas")
const {crearNombreArchivoUnico} = require("../utils/uniquename")


const app = express()
// **--------CONFIG--------**
const raiz = path.join(__dirname, "..") 

app.set("view engine", "handlebars")
app.engine("handlebars", exphbs({
    layoutsDir: path.join(raiz, "views")
}))

app.use("/css", express.static(path.join(raiz, "public", "css")))
app.use("/pics", express.static(path.join(raiz, "public", "pics")))
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

app.post("/register", async (req, res) => {
    const datosSkater = req.body
    delete datosSkater.passwordconfirm
    const {fotoPerfil} = req.files
    const {name: nombreArchivo} = fotoPerfil

    const nombreArchivoUnico = crearNombreArchivoUnico(nombreArchivo)
    datosSkater.nombreArchivoFotoPerfil = nombreArchivoUnico
    //guardar imagen en servidor
    fotoPerfil.mv(path.join(raiz,"public","pics", nombreArchivoUnico), async (err) => {
        if (err) res.send("Error en la carga de imagen")
        try {
            const ingreso = await ingresarSkater(datosSkater)
            
        } catch (error) {
            console.log("Error en la consulta")
            res.end()
        }
        
    })
    res.redirect("/")

})
module.exports = {app}