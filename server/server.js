const express = require('express')
const exphbs = require('express-handlebars')
const expressFileUpload = require("express-fileupload")
const { dirname } = require('path')
const path = require('path')
const {ingresarSkater, obtenerSkaters, consultarDatosSkater, actualizarDatosSkater, eliminarCuenta} = require("../database/consultas")
const {crearNombreArchivoUnico} = require("../utils/uniquename")
const jwt = require('jsonwebtoken')
const fs = require('fs')
const clavePrivada = fs.readFileSync(__dirname + "/claveprivada.txt")



const app = express()
// **--------CONFIG--------**
const raiz = path.join(__dirname, "..") 

app.set("view engine", "handlebars")
app.engine("handlebars", exphbs({
    layoutsDir: path.join(raiz, "views"),
    partialsDir: path.join(raiz, "views", "partials"),
    helpers: {
        inc: function(index){return parseInt(index)+1}
    }
}))

app.use("/css", express.static(path.join(raiz, "public", "css")))
app.use("/pics", express.static(path.join(raiz, "public", "pics")))
app.use("/sweetalert2", express.static(path.join(raiz, "node_modules", "sweetalert2", "dist")))

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
app.get("/", async (req, res) => {
    const skaters = await obtenerSkaters()
    res.render("index", {layout: "index", skaters: skaters})
})

app.get("/login", (req, res) => {
    res.render("Login", {layout: "Login"})
})

app.post("/login", async (req, res) => {
    const credencialesSkater = req.body
    try {
        const datosSkater = await consultarDatosSkater(credencialesSkater)
        //si el usuario existe creamos el token
        const token = jwt.sign({
            data: datosSkater,
            exp: Math.floor(Date.now()/1000) + 120
        },clavePrivada)
        res.status(200).send(token)
        
    } catch (error) {
        res.status(500).send({error: "No se encontró el usuario en los registros"})
    }
})

app.get("/register", (req, res) => {
    res.render("Registro", {layout: "Registro"})
})

app.post("/register", async (req, res) => {
    const datosSkater = req.body
    const {fotoPerfil} = req.files
    const {name: nombreArchivo} = fotoPerfil

    const nombreArchivoUnico = crearNombreArchivoUnico(nombreArchivo)
    datosSkater.nombreArchivoFotoPerfil = nombreArchivoUnico
    //guardar imagen en servidor
    fotoPerfil.mv(path.join(raiz,"public","pics", nombreArchivoUnico), async (err) => {
        if (err) res.send("Error en la carga de imagen")
        try {
            const ingreso = await ingresarSkater(datosSkater)
            res.redirect("/")
            
        } catch (error) {
           throw({error: "Error en la consulta"})
        }
        
    })

})


app.get("/datos", (req, res) => {
    const {t: token} = req.query
    jwt.verify(token, clavePrivada, (err, decoded) => {
        if (err) return res.status(401).send("Token inválido")
        const {data} = decoded
        const datosSkaterDecodificados = data[0]
        res.render("Datos", {layout: "Datos", datosSkaterDecodificados: datosSkaterDecodificados})

    })

})

app.post("/datos", async (req, res) => {
    const datosSkater = req.body
    const [datosPerfilActualizado] = await actualizarDatosSkater(datosSkater)
    res.send(datosPerfilActualizado)
})

app.delete("/eliminarCuenta", (req, res) => {
    const {t} = req.query
    jwt.verify(t, clavePrivada, async (err, decoded) => {
        const {email} = decoded.data[0]
        await eliminarCuenta(email)
        res.send(email)
    })
})

app.get("/admin", async (req, res) => {
    const skaters = await obtenerSkaters()
    res.render("Admin", {layout: "Admin", skaters: skaters, admin: true})
})

module.exports = {app}