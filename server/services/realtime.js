let ioInstance = null;

const initializeRealtime = (io) => {
  ioInstance = io;
};

const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) {
    return;
  }

  ioInstance.to(`user:${String(userId)}`).emit(event, payload);
};

module.exports = {
  initializeRealtime,
  emitToUser,
};
