import express from 'express'

const router = express.Router()


router.get("/", (request, response) => response.status(200).json({ status: "ok", message: "chat activado" }))

router.post(
    "/",
    async (request, response) => {
        const { id } = request.body

        if (!id) return response.status(400).json(
            { status: "fail", message: "Id is not found  in the body" }
        )


        const URL_DB = "https://dragonball-api.com/api/characters"



        const data = await fetch(`${URL_DB}/${id}`)
        const json = await data.json()

        response.status(200).json(
            {
                answer: `[MOCK] -> recibiste datos desde ${URL_DB}`,
                data: json
            }
        )


    }
)


export default router