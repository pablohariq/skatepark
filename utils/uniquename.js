//unique filename creator
const {v4: uuidv4} = require('uuid')

const crearNombreArchivoUnico = (nombre) => {
    return uuidv4().slice(0-5) +  nombre
}

module.exports = {crearNombreArchivoUnico}