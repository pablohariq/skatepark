const {Pool} = require('pg')

const config = {
    user: "postgres",
    password: "postgres",
    server: "localhost",
    port: "5432",
    database: "skatepark"
}
const pool = new Pool(config)

const realizarConsulta = async (objConsulta) => {
    const client = await pool.connect()
    const respuesta = await client.query(objConsulta)
    client.release()

    if (respuesta.rows){
        return respuesta
    }
    else{
        return console.log("error de conexion")
    }

}

const ingresarSkater = async (datosSkater) => {
    const {email, nombre, password, anosExperiencia, especialidad, nombreArchivoFotoPerfil} = datosSkater
    const valores = Object.values(datosSkater)
    valores.push(false)
    console.log(valores)
    const objConsulta ={
        name: 'agregar-skater',
        text: `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado)
                        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *; `,
        values: valores,
        rowMode: 'array'
    } 
    const ingreso = await realizarConsulta(objConsulta)
    return ingreso
}

module.exports = {ingresarSkater}
