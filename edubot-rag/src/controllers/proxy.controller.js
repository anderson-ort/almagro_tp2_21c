export const  pokemonProxy = async (request, response) => {

    const { endpoint } = request.params

    const url = `https://pokeapi.co/api/v2/${endpoint}`

    try {
        const res = await fetch(url)
        const data = await res.json()


        response
            .status(200)
            .json({ data })
        return

    } catch (error) {
        response
            .status(501)
            .json({ errorMsg: error.message })
    }

}