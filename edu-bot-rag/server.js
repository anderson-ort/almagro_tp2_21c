import app  from './app.js'
import { PORT } from './src/config/config.js'



app.listen(
    PORT ,
    () => console.log(
        `🐥 EduBot Rag is running on port: http://localhost:${PORT}/health`
    )
)