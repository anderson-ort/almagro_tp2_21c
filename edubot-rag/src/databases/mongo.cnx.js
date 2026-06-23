import { connect } from "mongoose";
import config from "../config/config.js";

export const connectMongo = async () => {
    try {
        await connect(config.mongoUri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
    }
};
