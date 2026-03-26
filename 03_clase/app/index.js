import { promises as fs } from 'fs'; //deconstructuring 
import { log } from 'console';
import { DataManager } from './dataManager.js';

const dataMap = new Map()
// enum
dataMap.UTF = "utf-8"
dataMap.URL = "./data/nombres_random.txt"
dataMap.URL_JSON = "./data/nombres.json"

const transformTextToJson = async (path) =>{
    try {
        const text = await fs.readFile(path, dataMap.UTF)
        const [header, ...rows] = text.split("\r\n")
        
        const key = header.split(" ")

        const objectToJson = rows.map(
            row => {
                const values = row.split(" ")
                return Object.fromEntries(
                    key.map( (k,i)  => [k, values[i]])
            )}
        )

        
        await fs.writeFile(dataMap.URL_JSON, JSON.stringify(objectToJson,null,2))
        return 

    } catch (error) {
        console.error({error})
    }
}



transformTextToJson(dataMap.URL)


const jsonReader = new DataManager(dataMap.URL_JSON)

const data =  await jsonReader.read()

console.log(data);
