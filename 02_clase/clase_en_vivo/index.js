// var let const

// var --> lexical scoping ... variable global {} 
// let  --> block scoping

// const --> 

{

    var pizza = "pizza"

    let topping = "jamon & anana"

}

const propiedad = ["rica", "al molde"]

pizza = "Super Pizza"


console.log(pizza);

propiedad.push("a la piedra")

console.log(propiedad);


// console.log(topping);
 
// falsy thruthy
console.log( "2" + 3);
console.log( 2 + "3");
console.log( 2 - "3");
console.log( 2 / "-1");
console.log( 2 * "-1");
console.log( 2 / "0");


// n params

function  helloWorld( ...nParams) {
    return "Esto es un hello world con los siguientes param:\t" + nParams.join("\t")
}


let resultado = helloWorld(1,2,3, 9,881, "🐣")

console.log(resultado);


function pizzaTradicional(nombreBase){
    return nombreBase + "\tsalsa" + "\tquesito"
}


function aberracionPizza(nombreBase){
    return nombreBase + "\tjamon" + "\tquesito" + "\tanana"

}

// callbacks
function crearPizza( nombre, aggredados){
    return aggredados(nombre)
}


console.log( crearPizza("pizza de:", pizzaTradicional) );
console.log( crearPizza("pizza de:", aberracionPizza) );

// 
console.log( crearPizza("pizza de:", function(nombreBase){
    return nombreBase + ["salchis","queso","peperoni"].join("\t")
}) );


console.log( crearPizza("pizza de:", (nombreBase) => nombreBase + ["salchis","queso","queso", "gato", "💕"].join("\t") ))


// JS en un lenguaje prototipado  ????????  ?????????

const nombres = [
  "Juan",
  "María",
  "Lucas",
  "Sofía",
  "Mateo",
  "Valentina",
  "Nicolás",
  "Camila",
  "Tomás",
  "Martina",
  "Joaquín",
  "Paula",
  "Agustín",
  "Delfina",
  "Santiago",
  "Florencia",
  "Benjamín",
  "Julieta",
  "Lautaro",
  "Abril"
];



console.log(nombres.map( nombre => nombre.toUpperCase() ))

Array.prototype.mostrarArrayDeotraForma = function(){
    console.log("Soy un cambio en el prototipo de informacion");
}

nombres.mostrarArrayDeotraForma()


// syntatic  sugar


// metodos que son del tipo async / await 


const URI = "https://raw.githubusercontent.com/MainakRepositor/Datasets/refs/heads/master/Cryptocurrency/binance-coin.csv"


let HTTP = new Map()
HTTP.GET = "GET"



async function readDataFromGH(uriPath){
        let response = await fetch(uriPath, {method:HTTP.GET})
        console.log((await response.text()).substring(0,200))
}


readDataFromGH(URI)


class Pizza{
    constructor(id,nombre){
        this.id = id,
        this.nombre = nombre
    }
}


// creacion de clases
class PizzaManager {
    constructor(dbPizzas){
        this.db = dbPizzas != null ? dbPizzas : []
        // this.db = dbPizzas ?? []
        // this.db = dbPizzas && []
    }

    // CRUD 
    savePizza(pizza){
        // logica

        this.db.push(pizza)
        console.log({
            status: 200,
            message: "Esta guardad dicha pizza"
        });
        

    }

    getPizza(id){

        const pizzaEncontrada = this.db.find(pizza => pizza.id === id )

        // guard clauses  || early returns
        if (pizzaEncontrada === -1){
            console.log({
                status:403,
                message : "No amigo, existe"
            })   

            return
        }


        console.log(
            {
                status:200,
                payload: pizzaEncontrada
            }
        )

    }

    // deletePizza

    // updatePizza    
}



const pizzeriaDeMario = new PizzaManager();

const fugazzetta = new Pizza(1,"Fugazzetta")
const tradicional = new Pizza(1,"Tradicional")
const carnes = new Pizza(1,"Salchichas")

carnes.precio = 120


pizzeriaDeMario.savePizza(fugazzetta)
pizzeriaDeMario.savePizza(tradicional)
pizzeriaDeMario.savePizza(carnes)



// prototype

PizzaManager.prototype.showAll = function() {
    this.db.forEach(element => {
        console.log(`Tenmos en la pizzeria -> pizza_id ${element.id} -> nombre: ${element.nombre} Precio? ${element?.precio ?? 0}`)
    });
}


pizzeriaDeMario.showAll()