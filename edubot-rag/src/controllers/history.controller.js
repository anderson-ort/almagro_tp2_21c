import {
    deleteAllHistoryService,
    deleteUseChatOneService,
    getUserHistoryService,
} from "../services/history.service.js";

const historyGetAllController = async (request, response) => {
    const { userId } = request.body.user;
    // const { userId } = request.user
    const historyChats = await getUserHistoryService(userId);
    response.status(200).json({
        ok: true,
        message: `history requested until ${Date.now().toLocaleString()}`,
        payload: historyChats,
    });
};
const historyDeleteOneController = async (request, response) => {
    const { userId } = request.body.user;
    // const { userId } = request.user
    const { chatId } = request.params;

    const chatDeleted = await deleteUseChatOneService(userId, chatId);

    if (!chatDeleted) {
        return response.status(404).json({
            error: "artifact not found",
        });
    }

    const { prompt: promptDeleted } = chatDeleted;
    response.status(200).json({
        ok: true,
        promptDeleted,
        message: `artifact deleted`,
    });
};
const historyDeleteAllController = async (request, response) => {
    const { userId } = request.body.user;
    // const { userId } = request.user
    await deleteAllHistoryService(userId);
    response.status(200).json({
        ok: true,
        message: "artifact slot restored",
    });
};

export {
    historyGetAllController,
    historyDeleteOneController,
    historyDeleteAllController,
};
