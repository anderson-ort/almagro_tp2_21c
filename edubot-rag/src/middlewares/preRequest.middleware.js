const accessPreInfoRequest = (request, response, next) => {
    console.log(
        `Request: ${request.method} ${request.url} >> Soy un middleware`,
    );
    next();
};

export { accessPreInfoRequest };
