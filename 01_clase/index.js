console.log("Hola mundo");

var miVariable = "Ola k ase?"  // es un tipo de dato string JS no le importa si estas usando o no ; por que no soy tu tia! java  ;

console.log(miVariable)

// let y const

let otraVariable = 10 

{

    let otraVariable = "no me falle"
    console.log(otraVariable);
    
    var miVariable = 40

}


console.log(otraVariable);
console.log(miVariable);


const terceraVariable = [ 1,2,3,4,5 ]

terceraVariable.push(6)

// terceraVariable = function(){return "pirulito"}

console.log(terceraVariable);



// functions // class --> 

//  >>> return??? void --> undefined  go  -> nil 
function nombreDeFuncion( a,b ){
    return a/b
}
        

let valorRetorno = nombreDeFuncion(  20,  0)


console.log(valorRetorno);

let objetoValor = {
    valorUno: "soy un valor",
    valorDos: 2000,
    valorTres: function(){return 1}
}


console.log(objetoValor["valorDos"])

const arraynumber = [1,2,3,4,5]

for( let i = 0 ; i < arraynumber.length ; i++ ){
    console.log(arraynumber[i])
}

// function son ciudadanos de primer mundo ///
arraynumber.forEach(
    // callbacks
     function(n) {console.log(n)}
)

function divisionExogena(a,b){return a/b}

const functionsCalculadora = {
    suma : function(a,b){ return a+b},
    // funcion flecha
    resta: (a,b) => a-b, 
    division : divisionExogena,
    multiplicacion: function(a,b){return a*b}
}



function calcular(a,b, cb){
    console.log(
        `El resultado del siguiente calculo es: ${cb(a,b)}`
    )
}


calcular(1,"2", functionsCalculadora.suma)
calcular(1,"2", functionsCalculadora.resta)
calcular(1,"2", functionsCalculadora.division)
calcular(1,"2", functionsCalculadora.multiplicacion)



//CJS --> ES6  --> require() 

// require

