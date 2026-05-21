import mongoose from "mongoose";
const { Schema } = mongoose;

const chatSchema = new Schema({
    prompt: String,
    answer: String,
    sources: [{ type: String }],
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
