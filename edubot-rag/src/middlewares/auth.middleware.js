import jwt from "jsonwebtoken";
import config from "../config/config.js";

const authMiddleware = (request, response, next) => {
    const { authorization } = request.headers;

    if (!authorization) {
        return response.status(401).json({ msg: "Unauthorized" });
    }

    // Bearer token
    // Authorization: Bearer <token>
    if (!authorization.startsWith("Bearer ")) {
        return response.status(401).json({ msg: "Unauthorized" });
    }

    const token = authorization.split(" ")[1];

    // generar la verificacion del token
    try {
        const decoded = jwt.verify(token, config.jwtTokenSecret);

        request.user = decoded;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return response.status(401).json({ msg: "Token expired" });
        }

        if (error.name === "JsonWebTokenError") {
            return response.status(401).json({ msg: "Invalid token" });
        }

        console.error(error);
        return response.status(401).json({ msg: "Unauthorized" });
    }
};

export { authMiddleware };
