Snap = typeof Snap == 'undefined' ? {} : Snap;

/**
 * Snap.conversation contains all methods to add functionality into conversations.
 * this file has been loaded before mck-sidebox.js. do not add any code dependent to mck sidebox.
 */
Snap.conversation = {
    STATUS: Snap.conversationHelper.status,

    /**
     * this method will be called when click event triggered on a conversation in conversation list.
     * @param {object} data group data received from Applozic
     * @param {object} error  error if any.
     */
    processConversationOpenedFromList: function (data, error) {
        if (error) {
            console.log(
                'Error received. can not post process the conversation ',
                error
            );
            return;
        }
        var conversationDetail = data && data.groupFeeds[0];
        SnapUI.showClosedConversationBanner(
            Snap.conversationHelper.isConversationClosed(
                conversationDetail
            )
        );
    },
};
