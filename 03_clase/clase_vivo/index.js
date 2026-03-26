console.log("Soy el primero en el codigo");
setTimeout(function () { console.log("Termine de ejecutarme en 1 segundo") }, 1000) // async libuv  -- callback
console.log("Soy el segundo en el codigo");



function saludar(nombre, callback) {
    console.log(`Hola! ${nombre}`)
    callback()
}



saludar(
    "pepe", () => setTimeout(() => { console.log("Se ejecuto en 2 segundos, pero soy una funcion tipo callback") }, 2000)
)


const { log } = require("console");
// login

// login(user,pass,(user) =>{
//     getProfile( user, profile =>{
//         getPost(profile, comment => {
//             getComment()
//         })
//     })
// } )


// getUser() 
//     .then(user => getProfile(user))
//     .then(profile => getPost(profile))
//     .then(post => getComment(post))
//     .then(comment => getData(comment))
//     .catch(e => console.error({e}))


// async function retrieveUsers(){
//     try {
//         const user = await getUser()
//         const profile = await getProfile(user)
//         const posts = await getPost(profile) 
//     } catch (error) {

//         console.error({e});

//     }
// }


const fs = require("fs")
const fsPromise = require("fs/promises")

const checkDataAndError = (error, data) => {
    if (error) {
        console.error({ error })
        return
    }

    console.log(data.slice(0, 50))
}

const pathText = "./clase_vivo/data/nombres_random.txt"

fs.readFile(pathText, "utf-8", checkDataAndError)


async function lecturaPorPromesa(path) {
    try {
        const data = await fsPromise.readFile(path, "utf-8") // necesita tiempo
        const dataUpper = data.toUpperCase() //

        console.log(dataUpper.slice(0, 50));

        await fsPromise.writeFile("./clase_vivo/data/nombres_modificados.txt", dataUpper)

        return

    } catch (error) {
        console.error({ error })
    }
}

lecturaPorPromesa(pathText)

console.log("Vamos a leer un monton de nombres");
console.log("Aguantia!! que es pesadito");
console.log("Se comio un choripan!");




const taylor = new Promise(
    (resolve, reject) => {
        setTimeout(() => {
            const error = true
            if (error) {
                reject("DT rechazo la colaboracion")
            } else {
                resolve("DT acepto el discazo")
            }
        }
            , 5000)
    }
)



taylor
    .then(mensaje => console.log(mensaje))
    .catch(error => console.error({ error }))


//
