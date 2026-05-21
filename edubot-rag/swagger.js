import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Chat API",
        description: "Documentacion de la API de autenticacion y chat / Rag",
    },

    host: "localhost:3000",
    basePath: "/api/v1",
    schemes: ["http"],

    securityDefinitions: {
        bearerAuth: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            description: "Enter JWT token",
        },
    },
    //TODO: Agregar en el swagger la opcion de Bearer automatico
    security: [
        {
            bearerAuth: [],
        },
    ],
};

const outputFile = "./swagger-output.json";

const endpointsFiles = [
    "./src/routes/auth.router.js",
    "./src/routes/chat.router.js",
];

swaggerAutogen()(outputFile, endpointsFiles, doc);
