Snap = typeof Snap == 'undefined' ? {} : Snap;
/**
 * Snap.conversationHelper is a supporting file to conversation service.
 * It is being loaded before conversation service.
 * Do not call conversation service from her to avoid circular dependency.
 *
 */
Snap.conversationHelper = {
    status: {
        INITIAL: -1,
        OPEN: 0,
        PROGRESS: 1,
        CLOSED: 2,
        SPAM: 3,
        DUPLICATE: 4,
        ARCHIVE: 5,
        UNRESPONDED: 6,
        WAITING: 7,
    },

    isConversationClosed: function (group) {
        if (typeof group !== 'undefined') {
            return (
                group.metadata &&
                group.metadata['CONVERSATION_STATUS'] ==
                    Snap.conversationHelper.status.CLOSED
            );
        }
        return;
    },
};
