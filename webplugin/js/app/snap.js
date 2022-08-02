/**
 * all methods exposed to  users.
 */

// above code will expose below function from iframe window to browser window.
var SNAP_VERSION = window.snap.version;
SNAP_VERSION === 'v2' && (parent.Snap = window.Snap);

$applozic.extend(true, Snap, {
    getBaseUrl: function () {
        return KM_PLUGIN_SETTINGS.snapApiUrl;
    },
    setDefaultAgent: function (agentName) {
        //snap.defaultAgent  = agentName;
        throw new Error('not implemented');
    },
    getConversationOfParticipent: function (options, callback) {
        if (typeof callback !== 'function') {
            throw new Error(
                'invalid callback! expected: Snap.startNewConversation(options, callback) '
            );
        }
        $applozic.ajax({
            url:
                Snap.getBaseUrl() +
                '/conversations/participent/' +
                options.userId,
            type: 'get',
            success: function (result) {
                callback(null, result);
            },
            error: function (err) {
                callback(err);
            },
        });
    },
    startConversation: function (params, callback) {
        snapCommons.setWidgetStateOpen(true);
        params = typeof params == 'object' ? params : {};
        params = Snap.updateConversationDetail(params);
        if (!params.agentId && !params.agentIds && !params.teamId) {
            var appOptions =
                SnapUtils.getDataFromKmSession('appOptions') ||
                applozic._globals;
            params.agentId = appOptions.agentId;
        }
        var user = [];
        if (params.agentIds) {
            for (var i = 0; i < params.agentIds.length; i++) {
                user.push({ userId: params.agentIds[i], groupRole: 1 });
            }
        }
        if (params.botIds) {
            for (var i = 0; i < params.botIds.length; i++) {
                user.push({ userId: params.botIds[i], groupRole: 2 });
            }
        }
        var groupName =
            params.defaultGroupName ||
            params.conversationTitle ||
            params.groupName ||
            snap._globals.conversationTitle ||
            snap._globals.groupName ||
            snap._globals.agentId;
        var assignee =
            params.defaultAssignee || params.assignee || params.agentId;

        var groupMetadata = {};
        params.defaultGroupName && (groupMetadata.KM_ORIGINAL_TITLE = true);
        typeof params.metadata == 'object' &&
            typeof params.metadata['KM_CHAT_CONTEXT'] == 'object' &&
            (groupMetadata.KM_CHAT_CONTEXT =
                params.metadata['KM_CHAT_CONTEXT']);

        params.WELCOME_MESSAGE &&
            (groupMetadata.WELCOME_MESSAGE = params.WELCOME_MESSAGE);

        var conversationDetail = {
            groupName: groupName,
            type: 10,
            agentId: params.agentId,
            assignee: assignee,
            users: user,
            clientGroupId: params.clientGroupId,
            isMessage: params.isMessage,
            isInternal: params.isInternal,
            skipRouting: params.skipRouting,
            skipBotEvent: params.skipBotEvent,
            customWelcomeEvent: params.customWelcomeEvent,
            metadata: groupMetadata,
            teamId: params.teamId,
        };
        if (IS_SOCKET_CONNECTED) {
            Snap.client.createConversation(conversationDetail, callback);
        } else {
            var SET_INTERVAL_DURATION = 500;
            var SET_TIMEOUT_DURATION = 3500;
            var interval = setInterval(function () {
                // socket connected check
                if (IS_SOCKET_CONNECTED) {
                    Snap.client.createConversation(
                        conversationDetail,
                        callback
                    );
                    clearInterval(interval);
                    timeout && clearTimeout(timeout);
                }
            }, SET_INTERVAL_DURATION);
            var timeout = setTimeout(function () {
                conversationDetail.allowMessagesViaSocket = true;
                Snap.client.createConversation(conversationDetail, callback);
                clearInterval(interval);
            }, SET_TIMEOUT_DURATION);
        }
    },

    updateConversationMetadata: function (conversationMetadata) {
        if (conversationMetadata) {
            if (
                snapCommons.isObject(conversationMetadata) &&
                snapCommons.isObject(conversationMetadata.metadata) &&
                conversationMetadata.groupId &&
                conversationMetadata.metadata
            ) {
                var metadataToSend = conversationMetadata.metadata;
                const groupDataResponse = Applozic.ALApiService.groupUpdate({
                    data: {
                        groupId: conversationMetadata.groupId,
                        metadata: {
                            conversationMetadata: JSON.stringify(
                                metadataToSend
                            ),
                        },
                    },
                    success: function (response) {
                        console.log(response);
                    },
                    error: function (error) {
                        console.log(error);
                    },
                });
                return groupDataResponse;
            } else {
                throw new TypeError(
                    'updateConversationMetadata expects an object as an argument'
                );
            }
        } else {
            throw new Error(
                'updateConversationMetadata expect an object but got null'
            );
        }
    },
    updateConversationDetail: function (conversationDetail) {
        var snapSettings = SnapUtils.getDataFromKmSession('settings');
        if (typeof snapSettings === 'undefined' || snapSettings === null) {
            return conversationDetail;
        }
        // Update welcome message only if some value for it is coming in conversationDetails parameter or snapSettings.
        conversationDetail.WELCOME_MESSAGE =
            conversationDetail.WELCOME_MESSAGE || snapSettings.WELCOME_MESSAGE;
        conversationDetail.defaultAssignee =
            conversationDetail.assignee || snapSettings.defaultAssignee;
        conversationDetail.agentIds =
            conversationDetail.agentIds || snapSettings.defaultAgentIds;
        conversationDetail.botIds =
            conversationDetail.botIds || snapSettings.defaultBotIds;
        conversationDetail.skipRouting =
            conversationDetail.skipRouting || snapSettings.skipRouting;
        conversationDetail.skipBotEvent =
            conversationDetail.skipBotEvent || snapSettings.skipBotEvent;
        conversationDetail.customWelcomeEvent =
            conversationDetail.customWelcomeEvent ||
            snapSettings.customWelcomeEvent;
        conversationDetail.teamId =
            conversationDetail.teamId || snapSettings.teamId;
        return conversationDetail;
    },
    openConversationList: function () {
        snapCommons.setWidgetStateOpen(true);
        window.$applozic.fn.applozic('loadTab', '');
        SnapUI.showChat();
        SnapUI.hideFaq();
    },
    openConversation: function (groupId, groupDetail) {
        snapCommons.setWidgetStateOpen(true);
        if (groupId) {
            window.$applozic.fn.applozic('loadGroupTab', groupId);
        } else if (groupDetail && groupDetail.clientGroupId) {
            window.$applozic.fn.applozic(
                'loadGroupTabByClientGroupId',
                groupDetail
            );
        }
        SnapUI.hideFaq();
    },
    openDirectConversation: function (userId) {
        snapCommons.setWidgetStateOpen(true);
        window.$applozic.fn.applozic('loadTab', userId);
        SnapUI.showChat();
        SnapUI.hideFaq();
    },
    /**
     * load conversation will open or create a conversation between existing users.
     * it generate clientGroupId from the given conversationDetail, if any group exists with that Id opens that otherwise it will call creatge group API.
     * it will not open the group created by createConversation API.
     * @param {Object}  conversationDetail
     * @param {Array} conversationDetail.agentIds required parameter
     * @param {Array} conversationDetail.botIds  optional parameter
     */
    loadConversation: function (conversationDetail, callback) {
        var agentList = (conversationDetail.agentIds || []).sort(function (
            a,
            b
        ) {
            if (a.toLowerCase() < b.toLowerCase()) return -1;
            if (a.toLowerCase() > b.toLowerCase()) return 1;
            return 0;
        });
        console.log('agent list ', agentList);
        var botList = conversationDetail.botIds || [];

        if (agentList.length < 1) {
            var error = {
                code: 'INVALID_PARAMETERS',
                message: 'required parameter agentIds is missing.',
            };
            return typeof callback == 'function'
                ? callback(error)
                : console.log('required parameter agentIds is missing.');
        }
        // max length of clientGroupId is 256 in db.
        // default bot is not included in client groupId generation
        var loggedInUserName =
            snap._globals.userId ||
            SnapUtils.getCookie(SnapConstants.COOKIES.SNAP_LOGGED_IN_ID);
        var agentsNameStr = agentList.join('_');

        var botsNameStr = botList.join('_');
        var clientGroupId = encodeURIComponent(
            botsNameStr
                ? [agentsNameStr, loggedInUserName, botsNameStr].join('_')
                : [agentsNameStr, loggedInUserName].join('_')
        );
        if (clientGroupId.length > 256) {
            var error = {
                code: 'MEMBER_LIMIT_EXCEEDS',
                message: 'try adding fewer members',
            };

            return typeof callback == 'function'
                ? callback(error)
                : console.log('member limit exceeds. try adding fewer members');
        }
        mckGroupService.getGroupFeed({
            clientGroupId: clientGroupId,
            apzCallback: function (result) {
                if (result.status == 'error' && result.code == 'AL-G-01') {
                    // group not found. createing new group
                    var users = agentList.map(function (item) {
                        return { userId: item, groupRole: 1 };
                    });
                    users.push({ userId: 'bot', groupRole: 2 });
                    users.push(
                        botList.map(function (item) {
                            return { userId: item, groupRole: 2 };
                        })
                    );
                    var conversationDetail = {
                        groupName:
                            snap._globals.conversationTitle ||
                            snap._globals.groupName ||
                            snap._globals.agentId,
                        type: 10,
                        agentId: users[0].userId,
                        users: users,
                        clientGroupId: decodeURIComponent(clientGroupId),
                    };
                    Snap.client.createConversation(
                        conversationDetail,
                        function (result) {
                            if (callback) {
                                return callback(null, result);
                            }
                        }
                    );
                } else if (result.status == 'success') {
                    // group exist with clientGroupId
                    var groupId = result.data.id;
                    $applozic.fn.applozic('loadGroupTab', groupId);
                    return callback(null, result);
                }
            },
        });
    },
    createGroupName: function (group) {
        return group.sort().join().replace(/,/g, '_').substring(0, 250);
    },
    openLastConversation: function (params) {
        var conversationDetail = params;
        var user = [];
        var group = [];
        group.push(params.agentId);
        group.push(snap._globals.userId);
        user.push({ userId: params.agentId, groupRole: 1 });
        user.push({ userId: 'bot', groupRole: 2 });
        if (params.botIds) {
            console.log(params.botIds);
            for (var i = 0; i < params.botIds.length; i++) {
                user.push({ userId: params.botIds[i], groupRole: 2 });
                group.push(params.botIds[i]);
            }
        }
        var groupName = Snap.createGroupName(group);
        var groupDetail = {};
        groupDetail.groupName = groupName;
        groupDetail.callback = function (response) {
            if (response.data.groups.length > 0) {
                console.log('already have a group');
                Snap.openConversation(response.data.groups[0].id);
            } else {
                console.log('new user');
                Snap.startConversation(
                    conversationDetail,
                    function (response) {}
                );
            }
        };
        window.$applozic.fn.applozic('getGroupListByFilter', groupDetail);
    },
    /**
     * creating conversation entry in snap db.
     */
    createNewConversation: function (options, callback) {
        if (typeof callback !== 'function') {
            throw new Error(
                'invalid callback! expected: Snap.startNewConversation(options, callback) '
            );
        }
        var data = {
            groupId: options.groupId,
            participantUserId: options.participantUserId,
            createdBy: options.participantUserId,
            defaultAgentId: options.defaultAgentId,
            applicationId: options.applicationId,
        };
        $applozic.ajax({
            url: Snap.getBaseUrl() + '/conversations',
            type: 'post',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                console.log('conversation started successfully');
                callback(null, result);
            },
            error: function (err) {
                console.log('err while starting Conversation');
                callback(err);
            },
        });
    },
    logout: function () {
        if (
            typeof window.$applozic !== 'undefined' &&
            typeof window.$applozic.fn !== 'undefined' &&
            typeof window.$applozic.fn.applozic !== 'undefined'
        ) {
            window.$applozic.fn.applozic('logout');
        }
        SnapUtils.removeItemFromLocalStorage('mckActiveConversationInfo');
        SnapUtils.deleteUserCookiesOnLogout();
        parent.window && parent.window.removeSnapScripts();
    },
    launchConversation: function () {
        window.$applozic.fn.applozic('mckLaunchSideboxChat');
    },
    triggerEvent: function (event, options) {
        $applozic.ajax({
            url: Snap.getBaseUrl() + '/applications/events?type=' + event,
            type: 'post',
            data: JSON.stringify({
                conversationId: options.groupId,
                applicationId: options.applicationId,
            }),
            contentType: 'application/json',
            success: function (result) {
                console.log('conversation triggering event');
            },
            error: function (err) {
                console.log('err while starting Conversation');
            },
        });
    },
    updateUser: function (options) {
        var data = { data: options };
        window.$applozic.fn.applozic('updateUser', data);
    },
    getAwayMessage: function (options, callback) {
        $applozic.ajax({
            url:
                Snap.getBaseUrl() +
                '/applications/' +
                options.applicationId +
                '/awaymessage?conversationId=' +
                options.conversationId +
                '&languageCode=' +
                options.languageCode,
            type: 'get',
            contentType: 'application/json',
            success: function (result) {
                // console.log("got away message data");
                typeof callback == 'function' ? callback(null, result) : '';
            },
            error: function (err) {
                console.log('err while fetching away message');
                typeof callback == 'function' ? callback(err) : '';
            },
        });
    },
    updateUserIdentity: function (newUserId) {
        window.$applozic.fn.applozic('updateUserIdentity', {
            newUserId: newUserId,
            callback: function (response) {
                SnapUtils.setCookie({
                    name: SnapConstants.COOKIES.SNAP_LOGGED_IN_ID,
                    value: newUserId,
                    expiresInDays: 30,
                    domain: MCK_COOKIE_DOMAIN,
                });
                if (response == 'success') {
                    window.$applozic.fn.applozic('reInitialize', {
                        userId: newUserId,
                    });
                }
            },
        });
    },
    isRichTextMessage: function (metadata) {
        // contentType should be 300 for rich text message in metadata
        // contentType 300 is removed from rich message payload since Jan-2020 and old payload this may getting used.
        return (
            metadata &&
            (metadata.hasOwnProperty('templateId') ||
                metadata.contentType == 300)
        );
    },
    appendEmailToIframe: function (message) {
        var richText =
            Snap.isRichTextMessage(message.metadata) ||
            message.contentType == 3;
        if (richText && message.source === 7 && message.message) {
            var iframeID = 'km-iframe-' + message.groupId;
            var iframe = document.getElementById(iframeID);
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(message.message);
            doc.close();
            var anchors = doc.getElementsByTagName('a');
            for (var i = 0; i < anchors.length; i++) {
                anchors[i].setAttribute('target', '_blank');
            }
        }
    },
    isAttachment: function (msg) {
        return (
            (typeof msg.fileMeta === 'object' &&
                msg.contentType ==
                    SnapConstants.MESSAGE_CONTENT_TYPE.ATTACHMENT) ||
            msg.contentType == SnapConstants.MESSAGE_CONTENT_TYPE.LOCATION
        );
    },
    getContainerTypeForRichMessage: function (message) {
        // this method is obsolete, not in use. use km-div-slider to get slide effect
        var metadata = message.metadata;
        var sliderClass = 'km-slick-container ';
        metadata.templateId ==
            SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.CARD_CAROUSEL &&
            metadata.payload &&
            metadata.payload.length > 1 &&
            (sliderClass += 'km-slider-multiple-cards-container');
        if (metadata.templateId) {
            switch (metadata.templateId) {
                // add template Id to enable slick effect
                // 2 for get room pax info template
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE
                    .HOTEL_BOOKING_CARD:
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.ROOM_DETAIL:
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.CARD_CAROUSEL:
                    return sliderClass;
                    break;
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.QUICK_REPLY:
                    return 'km-border-less-container km-cta-multi-button-container custom-quick-reply';
                    break;
                default:
                    return 'km-fixed-container';
                    break;
            }
        } else if (
            message.contentType ==
                SnapConstants.MESSAGE_CONTENT_TYPE.TEXT_HTML &&
            message.source == SnapConstants.MESSAGE_SOURCE.MAIL_INTERCEPTOR
        ) {
            return 'km-fixed-container';
        }
    },
    processPaymentRequest: function (options) {},
    sendMessage: function (messagePxy) {
        var $mck_msg_inner = $applozic('#mck-message-cell .mck-message-inner');
        var $mck_msg_to = $applozic('#mck-msg-to');

        if ($mck_msg_inner.data('isgroup') === true) {
            messagePxy.groupId = $mck_msg_to.val();
        } else {
            messagePxy.to = $mck_msg_to.val();
        }
        $applozic.fn.applozic('sendGroupMessage', messagePxy);
    },
    getRichTextMessageTemplate: function (message) {
        var metadata = message.metadata;
        if (metadata.templateId) {
            switch (metadata.templateId) {
                // 1 for get room pax info template
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.ROOM_COUNT:
                    return Snap.markup.getHotelRoomPaxInfoTemplate();
                    break;
                //2 for hotel card template
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE
                    .HOTEL_BOOKING_CARD:
                    return Snap.markup.getHotelCardContainerTemplate(
                        JSON.parse(metadata.hotelList || '[]'),
                        metadata.sessionId
                    );
                    break;
                // 3 for button container
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.LINK_BUTTON:
                    return Snap.markup.buttonContainerTemplate(metadata);
                    break;
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.PASSENGER_DETAIL:
                    return Snap.markup.getPassangerDetail(metadata);
                    break;
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.ROOM_DETAIL:
                    return Snap.markup.getRoomDetailsContainerTemplate(
                        JSON.parse(metadata.hotelRoomDetail || '[]'),
                        metadata.sessionId
                    );
                    break;
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.QUICK_REPLY:
                    return Snap.markup.quickRepliesContainerTemplate(
                        metadata,
                        SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.QUICK_REPLY
                    );
                    break;
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.LIST:
                    return Snap.markup.getListContainerMarkup(metadata);
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.DIALOG_BOX:
                    return Snap.markup.getDialogboxContainer(metadata);
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.IMAGE:
                    return Snap.markup.getImageContainer(metadata);
                    break;
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.CARD_CAROUSEL:
                    return Snap.markup.getCarouselMarkup(metadata);
                    break;
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.GENERIC_BUTTONS:
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE
                    .GENERIC_BUTTONS_V2:
                    return Snap.markup.getGenericButtonMarkup(metadata);
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.FORM:
                    return Snap.markup.getActionableFormMarkup(metadata);
                    break;
                case SnapConstants.ACTIONABLE_MESSAGE_TEMPLATE.VIDEO:
                    return Snap.markup.getVideoMarkup(metadata);
                    break;
                default:
                    return '';
                    break;
            }
        } else if (
            message.contentType ==
                SnapConstants.MESSAGE_CONTENT_TYPE.TEXT_HTML &&
            message.source == SnapConstants.MESSAGE_SOURCE.MAIL_INTERCEPTOR
        ) {
            return Snap.markup.getHtmlMessageMarkups(message);
        } else {
            return '';
        }
    },
    /*
       updateSettings parameters
       1. defaultAssignee [single value]
       2. defaultAgentIds [multiple values]
       3. defaultBotIds [multiple values]
       4. skipRouting [boolean]
       5. skipBotEvent [multiple values]
       6. KM_CHAT_CONTEXT
       7. WELCOME_MESSAGE
       8. customWelcomeEvent [single value]
   */
    updateSettings: function (options) {
        var type = typeof options;
        if (type != 'object') {
            throw new error('update settings expects an object, found ' + type);
        }
        var settings = SnapUtils.getDataFromKmSession('settings');
        settings = settings ? settings : {};

        for (var key in options) {
            settings[key] = options[key];
        }
        SnapUtils.storeDataIntoKmSession('settings', settings);
    },
    getSettings: function (setting) {
        return SnapUtils.getSettings(setting);
    },
    updateChatContext: function (options) {
        if (typeof options == 'object') {
            var chatContext =
                SnapUtils.getSettings(SnapConstants.SETTINGS.KM_CHAT_CONTEXT) ||
                {};
            for (var key in options) {
                chatContext[key] = options[key];
            }
            Snap.updateSettings({ KM_CHAT_CONTEXT: chatContext });
        } else {
            console.info(
                "can not update chat context, expected data type is 'object', found ",
                typeof chatContext
            );
        }
    },
    updateUserLanguage: function (languageCode) {
        var chatContext =
            SnapUtils.getSettings(SnapConstants.SETTINGS.KM_CHAT_CONTEXT) || {};
        chatContext[
            SnapConstants.SETTINGS.KM_USER_LANGUAGE_CODE
        ] = languageCode;
        Snap.updateChatContext(chatContext);
    },
    setDefaultIframeConfigForOpenChat: function (isPopupEnabled) {
        !snapCommons.checkIfDeviceIsHandheld() &&
            snapCommons.modifyClassList(
                { id: ['mck-sidebox'] },
                'popup-enabled',
                ''
            );
        var snapIframe = parent.document.getElementById('snap-widget-iframe');
        var snapIframeDocument = snapIframe.contentDocument;
        var popUpCloseButton = snapIframeDocument.getElementById(
            'km-popup-close-button'
        );
        snapIframe.style.width = '';
        snapIframe.classList.remove('km-iframe-notification');
        snapIframe.classList.remove('km-iframe-closed');
        isPopupEnabled
            ? (snapIframe.classList.add('km-iframe-dimension-with-popup'),
              popUpCloseButton && (popUpCloseButton.style.display = 'flex'))
            : snapIframe.classList.add('km-iframe-dimension-no-popup');
        snapIframe.classList.add('snap-iframe-enable-media-query');
    },
    // add css to style component in window
    customizeWidgetCss: function (classSettings) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = classSettings;
        document.getElementsByTagName('head')[0].appendChild(style);
    },
    // subscribe to custom events
    subscribeToEvents: function (events) {
        $applozic.fn.applozic('subscribeToEvents', events);
    },
    /**
     * @param {String} timezone
     */
    updateUserTimezone: function (timezone) {
        if (SnapUtils.isValidTimeZone(timezone)) {
            var chatContext =
                SnapUtils.getSettings(SnapConstants.SETTINGS.KM_CHAT_CONTEXT) ||
                {};
            chatContext[SnapConstants.SETTINGS.KM_USER_TIMEZONE] = timezone;
            Snap.updateChatContext(chatContext);
        }
    },
    /**
     * @param {Boolean} display
     */
    displaySnapWidget: function (display) {
        var snapIframe = parent.document.getElementById('snap-widget-iframe');
        display
            ? snapIframe.classList.remove('snap-hide-custom-iframe')
            : snapIframe.classList.add('snap-hide-custom-iframe');
    },
    // check if the message needs to be processed by addMessage
    visibleMessage: function (msg) {
        if (!msg) return false;
        if (
            !msg.message &&
            (msg.metadata.hasOwnProperty('KM_ASSIGN_TO') ||
                msg.metadata.hasOwnProperty('KM_ASSIGN_TEAM'))
        ) {
            // KM_ASSIGN_TO and KM_ASSIGN_TEAM parameter comes when we change assignee by bot message.
            return false;
        }
        if (
            msg.type === SnapConstants.MESSAGE_TYPE.CALL_INCOMING ||
            msg.type === SnapConstants.MESSAGE_TYPE.CALL_OUTGOING
        ) {
            return false;
        }
        if (
            (msg.metadata && msg.metadata.category === 'HIDDEN') ||
            msg.contentType ===
                SnapConstants.MESSAGE_CONTENT_TYPE.AUDIO_VIDEO_CALL
        ) {
            return false;
        }
        if (
            msg.metadata &&
            (msg.metadata.KM_ASSIGN || msg.metadata.KM_STATUS)
        ) {
            return false;
        }
        if (
            msg.contentType ===
                SnapConstants.MESSAGE_CONTENT_TYPE.NOTIFY_MESSAGE &&
            msg.metadata &&
            msg.metadata.hide === 'true'
        ) {
            return false;
        }
        return true;
    },
    hideMessage: function (element) {
        var quickReplyContainer = $applozic('#quick-reply-container');

        if (element && quickReplyContainer.children().length > 0) {
            var parentEle = element.parentElement;

            while (!parentEle.classList.contains('quick-reply-container')) {
                parentEle = parentEle.parentElement;
                document.getElementById("quick-reply-container").scrollTop = 0;
            }

            parentEle.innerHTML = '';
            parentEle.classList.add('n-vis');
        } else {
            quickReplyContainer.empty();
        }
    },
    getAllSiblings: function (element) {
        var siblings = [];
        if (!element || !element.parentNode) {
            return siblings;
        }
        var sibling = element.parentNode.firstChild;
        while (sibling) {
            if (sibling.nodeType === 1 && sibling !== element) {
                siblings.push(sibling);
            }
            sibling = sibling.nextSibling;
        }
        return siblings;
    },
    changeVisibilityStateForElement: function ($element, state) {
        if (state === 'show') {
            $element.removeClass('n-vis').addClass('vis');
        } else {
            $element.removeClass('vis').addClass('n-vis');
        }
    },
    changeTextInputState: function (msg) {
        setTimeout(function () {
            var textBox = $applozic('#mck-text-box');

            let isEnable = (typeof msg.metadata.enable_text_input === 'boolean' && msg.metadata.enable_text_input) || msg.metadata.enable_text_input == 'true';
            if (isEnable) {
                $applozic('.mck-box-form').removeClass('data-text');
            } else {
                $applozic('.mck-box-form').addClass('data-text');
            }

            if (!msg.hasOwnProperty('metadata') || !msg.metadata.hasOwnProperty('enable_text_input')) {
                textBox.attr('data-text', '');
                textBox.attr('data-label', '');
                textBox.attr('aria-label', '')
                textBox.attr('aria-labelledby', '');
                textBox.attr('contenteditable', false);
            } else {
                var metadata = msg.metadata;
                var hintTextForTextInput = metadata.hasOwnProperty('text_input_hint') ? metadata.text_input_hint : '';
                textBox.attr('data-text', hintTextForTextInput);
                textBox.attr('data-label', hintTextForTextInput);
                textBox.attr('aria-labelledby', isEnable ? hintTextForTextInput + "Multiline text box, double tap to edit" : hintTextForTextInput);
                textBox.attr('aria-label', isEnable ? hintTextForTextInput + "Multiline text box, double tap to edit" : hintTextForTextInput);
                textBox.attr('contenteditable', metadata.enable_text_input);
            }

            if (msg.hasOwnProperty('metadata') && Boolean(msg.metadata.is_numeric_input)) {
                textBox.attr('pattern', '\d*');
                textBox.attr('inputmode', 'numeric');
            }
            Snap.reloadElement('mck-textbox-container', 'mck-text-box');
            Snap.reloadElement('mck-textbox-container', 'send-button-wrapper');
        }, 300);
    },
    sessionTimeout: function () {
        var parentWindow = window.parent;
        parentWindow.sessionTimeoutInitializer()
    },
    generateTouch: function (elemID) {
        window.setTimeout(function () {
            try {
                var event = document.createEvent('Events');
                event.initEvent('touchstart', true, true);
                var event2 = document.createEvent('Events');
                event2.initEvent('touchend', true, true);
                document.getElementById(elemID).dispatchEvent(event);
                document.getElementById(elemID).dispatchEvent(event2);
            }
            catch (e) {
                console.log(e);
            }
        }, 500);
    },
    reloadElement: function (parentElement, elemID) {
        var parent = document.getElementById(parentElement);
        var child = document.getElementById(elemID);
        parent.removeChild(child);
        parent.append(child);
    }
});
