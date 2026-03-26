import { readFile, writeFile } from 'node:fs/promises';

export class DataManager {
    constructor(filePath) {
        this.path = filePath;
    }

    /**
     * Lee el archivo y devuelve el contenido parseado.
     * @returns {Promise<Array>}
     */
    async read() {
        try {
            const content = await readFile(this.path, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            // Si el archivo no existe (ENOENT), devolvemos un array vacío
            if (error.code === 'ENOENT') return [];
            throw new Error(`No se pudo leer el archivo: ${error.message}`);
        }
    }

    /**
     * Filtra los datos según un criterio.
     * @param {Function} predicate - Función de búsqueda (ej: x => x.nombre === 'Sofia')
     * @returns {Promise<Array>}
     */
    async find(predicate) {
        const data = await this.read();
        return data.filter(predicate);
    }

    /**
     * Sobrescribe el archivo con los nuevos datos.
     * @param {Array} data - El array completo a guardar.
     */
    async write(data) {
        try {
            const json = JSON.stringify(data, null, 2);
            await writeFile(this.path, json, 'utf-8');
            console.log("Datos guardados exitosamente.");
        } catch (error) {
            throw new Error(`Error al escribir en el archivo: ${error.message}`);
        }
    }
}