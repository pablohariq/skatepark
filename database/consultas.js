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
    try {
        const respuesta = await client.query(objConsulta)
        client.release()
        return respuesta
    } catch (error) {
        client.release()
        return error
    }
}

const ingresarSkater = async (datosSkater) => {
    delete datosSkater.passwordconfirm
    const valores = Object.values(datosSkater)
    valores.push(false)
    const objConsulta ={
        name: 'agregar-skater',
        text: `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado)
                        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING (email, nombre, anos_experiencia, especialidad, foto, estado); `,
        values: valores,
        rowMode: 'array'
    } 
    try {
        const ingreso = await realizarConsulta(objConsulta)
        return ingreso
        
    } catch (error) {
        return error
    }
}

const obtenerSkaters = async () => {
    const objConsulta = {
        name: 'obtener-skaters',
        text: `SELECT id, email, nombre, anos_experiencia, especialidad, foto, estado FROM skaters;`,
    }
    const {rows: skaters} = await realizarConsulta(objConsulta)
    return skaters
}

const consultarDatosSkater = async (credencialesSkater) => {
    const valores = Object.values(credencialesSkater)
    const objConsulta = {
        name: 'obtener-datos',
        text: `SELECT email, nombre, anos_experiencia, especialidad FROM skaters WHERE email = $1 and password = $2;`,
        values: valores
    }
    const {rows: datosSkater} = await realizarConsulta(objConsulta)
    if (datosSkater.length == 0) throw ({error: "Las credenciales no son válidas"})
    return datosSkater
}

const actualizarDatosSkater = async (nuevosDatosSkater) => {
    const valores = Object.values(nuevosDatosSkater)
    const objConsulta = {
        name: 'actualizar-datos',
        text: `UPDATE skaters SET nombre = $2, password = $3, anos_experiencia = $4, especialidad = $5 WHERE email = $1 RETURNING nombre, email; `,
        values: valores
    }
    const {rows: datosPerfilActualizado} = await realizarConsulta(objConsulta)
    return datosPerfilActualizado
}

const eliminarCuenta = async (email) => {
    const objConsulta = {
        name: 'eliminar-cuenta',
        text: `DELETE FROM skaters WHERE email = $1 RETURNING *;`,
        values: [email]
    }
    const {rows: cuentaEliminada} = await realizarConsulta(objConsulta)
    return cuentaEliminada
}

module.exports = {ingresarSkater, obtenerSkaters, consultarDatosSkater, actualizarDatosSkater, eliminarCuenta}
