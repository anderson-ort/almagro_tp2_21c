import express from "express";
import cors from "cors";
import morgan from "morgan";
import { __joiner } from "./src/utils/utils.js";

import { proxyRouter } from "./src/routes/proxy.router.js";
import { chatRouter } from "./src/routes/chat.router.js";
import { historyRouter } from "./src/routes/history.router.js";
import { authRouter } from "./src/routes/auth.router.js";
import { uploadRouter } from "./src/routes/upload.router.js";
import { accessPreInfoRequest } from "./src/middlewares/preRequest.middleware.js";
import { authMiddleware } from "./src/middlewares/auth.middleware.js";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";

const swaggerPath = path.join(process.cwd(), "swagger-output.json");
const swaggerFile = JSON.parse(fs.readFileSync(swaggerPath, "utf-8"));

const VERSION = "v1";
const BASE_PATH = `/api/${VERSION}`;

const app = express();
const morganApacheStyle =
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]';

app.use(cors());
app.use(morgan(morganApacheStyle));
app.use(express.static(__joiner("static"))); //commonJs __dirname //

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (request, response) => {
    response.sendFile(__joiner("static", "index.html"));
});

app.get("/health", (requests, response) => {
    response.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// capa de intermediario
app.use("/proxy", accessPreInfoRequest, proxyRouter);

// crud
app.use(BASE_PATH, historyRouter);
app.use(BASE_PATH, uploadRouter);

// capa de authenticacion
app.use(BASE_PATH, authRouter);

// utilizando llm
app.use(BASE_PATH, authMiddleware, chatRouter);

app.use((request, response) => {
    response.status(404).json({
        msg: "Not found 😒",
    });
});

export default app;
