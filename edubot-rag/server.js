import app from "./app.js";
import { connectMongo } from "./src/databases/mongo.cnx.js";
import config from "./src/config/config.js";

app.listen(3000, async () => {
    if (config.chatStorage === "mongo") {
        await connectMongo();
    }

    console.log("Server is running on http://localhost:3000");
});
