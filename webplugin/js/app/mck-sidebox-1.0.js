var MCK_GROUP_MAP = [];
var MCK_CLIENT_GROUP_MAP = [];
var MCK_EVENT_HISTORY = [];
var KM_PROGRESS_METER_RADIUS = 54;
var KM_PROGRESS_METER_CIRCUMFERENCE = 2 * Math.PI * KM_PROGRESS_METER_RADIUS;
var count = 0;
var isFirstLaunch = true;
var KM_PENDING_ATTACHMENT_FILE = new Map();
var MCK_TRIGGER_MSG_NOTIFICATION_PARAM;
var MCK_MAINTAIN_ACTIVE_CONVERSATION_STATE;
var CURRENT_GROUP_DATA = {};
var MCK_CHAT_POPUP_TEMPLATE_TIMER;
var IS_SOCKET_CONNECTED = false;
var MCK_BOT_MESSAGE_QUEUE = [];
var WAITING_QUEUE = [];
var AVAILABLE_VOICES_FOR_TTS = new Array();
var KM_ATTACHMENT_V2_SUPPORTED_MIME_TYPES = ['application', 'text', 'image'];
var userOverride = {
    voiceOutput: true,
};

(function ($applozic, w, d) {
    'use strict';
    if (!w.applozic) {
        w.applozic = w.applozic ? w.applozic : {};
        $applozic.extend(true, w.applozic, {
            applozic: { PRODUCT_ID: 'applozic-chat' },
        });
    }
    var default_options = {
        baseUrl: KM_PLUGIN_SETTINGS.applozicBaseUrl || 'https://chat.snap.io',
        fileBaseUrl: 'https://applozic.appspot.com',
        customFileUrl: 'https://googleupload.applozic.com', // google cloud file upload url
        genereateCloudFileUrl:
            'https://googleupload.applozic.com/files/url?key={key}', // generate viewable link for a file incase of file upload on google cloud
        notificationIconLink: '',
        notificationSoundLink: '',
        mapStaticAPIkey: 'AIzaSyCWRScTDtbt8tlXDr6hiceCsU83aS2UuZw',
        launcher: 'applozic-launcher',
        emojilibrary: false,
        userId: null,
        appId: null,
        userName: null,
        contactNumber: null,
        email: null,
        supportId: null,
        mode: 'standard',
        visitor: false,
        olStatus: false,
        unreadCountOnchatLauncher: true,
        openConversationOnNewMessage: false, // default value
        //      awsS3Server :false,
        groupUserCount: false,
        desktopNotification: true,
        locShare: false,
        maxAttachmentSize: 25, // default size is 25MB
        notification: true,
        launchOnUnreadMessage: false,
        loadOwnContacts: false,
        maxGroupSize: 100,
        authenticationTypeId: 0,
        groupName: 'Conversations',
        agentId: '',
        agentName: '',
        msgTriggerTimeout: 0,
        labels: Snap.defaultLabels,
        useBranding: true,
        openGroupSettings: {
            deleteChatAccess: 0, // NONE(0), ADMIN(1), ALL_GROUP_MEMBER(2)
            allowInfoAccessGroupMembers: true,
            disableChatForNonGroupMember: false,
            defaultChatDisabledMessage: 'Chat Disabled!',
        },
        voiceInput: false,
        voiceOutput: false,
    };
    var message_default_options = {
        messageType: 5,
        type: 0,
    };
    $applozic.fn.applozic = function (appOptions, params, callback) {
        var $mck_sidebox = $applozic('#mck-sidebox');
        if ($applozic.type(appOptions) === 'object') {
            // storing custom appOptions into session Storage.
            SnapUtils.storeDataIntoKmSession('appOptions', appOptions);
            appOptions = $applozic.extend(
                true,
                {},
                default_options,
                appOptions
            );
            // updating groupName to conversationTitle, supporting groupName for backward compatibility
            appOptions.conversationTitle =
                appOptions.conversationTitle || appOptions.groupName;
            appOptions.accessToken =
                appOptions.password || appOptions.accessToken;
        }
        var oInstance = undefined;
        if (typeof $mck_sidebox.data('applozic_instance') !== 'undefined') {
            oInstance = $mck_sidebox.data('applozic_instance');
            if ($applozic.type(appOptions) === 'string') {
                switch (appOptions) {
                    case 'reInitialize':
                        return oInstance.reInit(params);
                        break;
                    case 'loadConvTab':
                        oInstance.loadConvTab(params);
                        break;
                    case 'loadTab':
                        oInstance.loadTab(params, callback);
                        break;
                    case 'uploadFile':
                        oInstance.uploadFile(params);
                        break;
                    case 'uploadAttachemnt':
                        oInstance.uploadAttachemnt(params);
                        break;
                    case 'loadTabView':
                        oInstance.loadTabView(params);
                        break;
                    case 'loadChat':
                        oInstance.loadChat(params);
                        break;
                    case 'loadContextualTab':
                        return oInstance.loadTabWithTopic(params);
                        break;
                    case 'audioAttach':
                        oInstance.audioAttach(params);
                        break;
                    case 'addWelcomeMessage':
                        oInstance.addWelcomeMessage(params);
                        break;
                    case 'loadContacts':
                        oInstance.loadContacts(params);
                        break;
                    case 'sendMessage':
                        return oInstance.sendMessage(params);
                        break;
                    case 'sendGroupMessage':
                        return oInstance.sendGroupMessage(params);
                        break;
                    case 'createGroup':
                        return oInstance.createGroup(params);
                        break;
                    case 'loadBroadcastTab':
                        params.groupName = params.groupName
                            ? params.groupName
                            : 'Broadcast';
                        params.type = 5;
                        return oInstance.initGroupTab(params);
                        break;
                    case 'initBroadcastTab':
                        params.groupName = params.groupName
                            ? params.groupName
                            : 'Broadcast';
                        params.type = 5;
                        return oInstance.initGroupTab(params);
                        break;
                    case 'initGroupTab':
                        return oInstance.initGroupTab(params);
                        break;
                    case 'loadGroupTab':
                        return oInstance.loadGroupTab(params, callback);
                        break;
                    case 'loadGroupTabByClientGroupId':
                        return oInstance.loadGroupTabByClientGroupId(params);
                        break;
                    case 'setOffline':
                        oInstance.setOffline();
                        return 'success';
                        break;
                    case 'setOnline':
                        oInstance.setOnline();
                        return 'success';
                        break;
                    case 'logout':
                        oInstance.logout();
                        return 'success';
                        break;
                    case 'reset':
                        oInstance.reset(params);
                        break;
                    case 'getUserDetail':
                        oInstance.getUserStatus(params);
                        return 'success';
                        break;
                    case 'getGroupList':
                        oInstance.getGroupList(params);
                        return 'success';
                        break;
                    case 'leaveGroup':
                        return oInstance.leaveGroup(params);
                        break;
                    case 'addGroupMember':
                        return oInstance.addGroupMember(params);
                        break;
                    case 'removeGroupMember':
                        return oInstance.removeGroupMember(params);
                        break;
                    case 'updateGroupInfo':
                        return oInstance.updateGroupInfo(params);
                        break;
                    case 'getMessages':
                        oInstance.getMessages(params);
                        break;
                    case 'messageList':
                        return oInstance.getMessageList(params);
                        break;
                    case 'getMessageListByTopicId':
                        return oInstance.getMessageListByTopicId(params);
                        break;
                    case 'getTotalUnreadCount':
                        return oInstance.getTotalUnreadCount();
                        break;
                    case 'subscribeToEvents':
                        return oInstance.subscribeToEvents(params);
                        break;
                    case 'getConversation':
                        return oInstance.getConversation(params);
                        break;
                    case 'loadConversationWithAgent':
                        return oInstance.loadConversationWithAgent(params);
                        break;
                    case 'updateUserIdentity':
                        return oInstance.updateUserIdentity(params);
                        break;
                    case 'updateUser':
                        return oInstance.updateUser(params);
                        break;
                    case 'getGroupListByFilter':
                        return oInstance.getGroupListByFilter(params);
                        break;
                    case 'updateMessageMetadata':
                        return oInstance.updateMessageMetadata(params);
                        break;
                    case 'mckLaunchSideboxChat':
                        return oInstance.mckLaunchSideboxChat();
                        break;
                    case 'triggerMsgNotification':
                        return oInstance.triggerMsgNotification();
                        break;
                    case 'openChat':
                        return oInstance.openChat(params);
                        break;
                    case 'submitMessage':
                        return oInstance.submitMessage(params);
                        break;
                    case 'toggleMediaOptions':
                        return oInstance.toggleMediaOptions();
                        break;
                    case 'initializeSocketConnection':
                        return oInstance.initializeSocketConnection(params);
                }
            } else if ($applozic.type(appOptions) === 'object') {
                oInstance.reInit(appOptions);
            }
        } else if ($applozic.type(appOptions) === 'object') {
            if (
                appOptions.userId &&
                appOptions.appId &&
                $applozic.trim(appOptions.userId) !== '' &&
                $applozic.trim(appOptions.appId) !== ''
            ) {
                if (
                    typeof $mck_sidebox.data('applozic_instance') !==
                    'undefined'
                ) {
                    oInstance = $mck_sidebox.data('applozic_instance');
                    oInstance.reInit(appOptions);
                } else {
                    if (typeof appOptions.ojq !== 'undefined') {
                        $ = appOptions.ojq;
                        jQuery = appOptions.ojq;
                    } else {
                        $ = $applozic;
                        jQuery = $applozic;
                    }
                    if (typeof appOptions.obsm === 'function') {
                        $.fn.modal = appOptions.obsm;
                        jQuery.fn.modal = appOptions.obsm;
                    } else if (typeof $applozic.fn.modal === 'function') {
                        var oModal = $applozic.fn.modal.noConflict();
                        $.fn.modal = oModal;
                        jQuery.fn.modal = oModal;
                    } else if (typeof $.fn.modal === 'function') {
                        var oModal = $.fn.modal.noConflict();
                        $.fn.modal = oModal;
                        jQuery.fn.modal = oModal;
                    }
                    if (typeof appOptions.omckm === 'function') {
                        $applozic.fn.mckModal = appOptions.omckm;
                    } else if (typeof $applozic.fn.mckModal === 'function') {
                        $applozic.fn.mckModal = $applozic.fn.mckModal.noConflict();
                    } else if (typeof $.fn.mckModal === 'function') {
                        $applozic.fn.mckModal = $.fn.mckModal.noConflict();
                    }
                    if (typeof $.fn.linkify === 'function') {
                        $applozic.fn.linkify = $.fn.linkify;
                        jQuery.fn.linkify = $.fn.linkify;
                    } else if (typeof $applozic.fn.linkify === 'function') {
                        $.fn.linkify = $applozic.fn.linkify;
                        jQuery.fn.linkify = $applozic.fn.linkify;
                    }
                    if (typeof $.fn.emojiarea === 'function') {
                        $applozic.fn.emojiarea = $.fn.emojiarea;
                    } else if (typeof $applozic.fn.emojiarea === 'function') {
                        $.fn.emojiarea = $applozic.fn.emojiarea;
                        jQuery.fn.emojiarea = $applozic.fn.emojiarea;
                    }
                    if (typeof $.fn.locationpicker === 'function') {
                        $applozic.fn.locationpicker = $.fn.locationpicker;
                    } else if (
                        typeof $applozic.fn.locationpicker === 'function'
                    ) {
                        $.fn.locationpicker = $applozic.fn.locationpicker;
                        jQuery.fn.locationpicker = $applozic.fn.locationpicker;
                    }
                    var applozic = new Applozic(appOptions);
                    $mck_sidebox.data('applozic_instance', applozic);
                    applozic.init();
                }
            } else {
                alert('Oops! looks like incorrect application id or user Id.');
            }
        }
    };
    $applozic.fn.applozic.defaults = default_options;

    function Applozic(appOptions) {
        var _this = this;
        var IS_SOCKET_INITIALIZED = false;
        var INIT_APP_DATA = {};
        var IS_PLUGIN_INITIALIZATION_PROCESS_COMPLETED = false;
        var PRE_CHAT_LEAD_COLLECTION_POPUP_ON = true;
        var MCK_TOKEN;
        var USER_ENCRYPTION_KEY;
        var AUTH_CODE;
        MCK_GROUP_MAP = [];
        var FILE_META = [];
        var USER_DEVICE_KEY;
        var USER_COUNTRY_CODE;
        var MCK_WEBSOCKET_URL;
        var MCK_WEBSOCKET_PORT;
        var IS_LOGGED_IN = true;
        var MCK_CONTACT_MAP = [];
        var MCK_TYPING_STATUS = 0;
        MCK_CLIENT_GROUP_MAP = [];
        var CONTACT_SYNCING = false;
        var MCK_USER_TIMEZONEOFFSET;
        var MCK_BLOCKED_TO_MAP = [];
        var MCK_BLOCKED_BY_MAP = [];
        var MCK_IDLE_TIME_LIMIT = 90;
        var MCK_USER_DETAIL_MAP = [];
        var MCK_TOPIC_DETAIL_MAP = [];
        var MCK_LAST_SEEN_AT_MAP = [];
        var MCK_CONVERSATION_MAP = [];
        var IS_MCK_TAB_FOCUSED = true;
        var MCK_TOTAL_UNREAD_COUNT = 0;
        var CUSTOMER_CREATED_AT = appOptions.customerCreatedAt;
        var OPEN_CONVERSATION_ON_NEW_MESSAGE =
            appOptions.openConversationOnNewMessage;
        var SNAP_VERSION = appOptions.KM_VER ? appOptions.KM_VER : '';
        SNAP_VERSION === 'v2' && (parent.SnapGlobal = window);
        SNAP_VERSION === 'v2' && (parent.Snap = window.Snap);
        var WIDGET_SETTINGS = appOptions.widgetSettings;
        var EMOJI_LIBRARY = appOptions.emojilibrary;
        var CSAT_ENABLED = appOptions.collectFeedback;
        var HIDE_POST_CTA = appOptions.hidePostCTA;
        var MCK_MODE = appOptions.mode;
        MCK_LABELS = appOptions.labels;
        MCK_BASE_URL = appOptions.baseUrl;
        var MCK_CUSTOM_URL = appOptions.customFileUrl;
        var MCK_STORAGE_URL = appOptions.customUploadUrl;
        var MCK_APP_ID = appOptions.appId;
        var OPEN_GROUP_SUBSCRIBER_MAP = [];
        var MCK_CONNECTED_CLIENT_COUNT = 0;
        var GROUP_ROLE_MAP = [0, 1, 2, 3];
        var GROUP_TYPE_MAP = [1, 2, 5, 6, 10];
        var MCK_TOPIC_CONVERSATION_MAP = [];
        var IS_MCK_USER_DEACTIVATED = false;
        var MCK_LAUNCHER = appOptions.launcher;
        var IS_MCK_VISITOR = appOptions.visitor;
        var MCK_USER_NAME = appOptions.userName;
        var IS_MCK_LOCSHARE = appOptions.locShare;
        var IS_CALL_ENABLED = appOptions.video;
        var MCK_FILE_URL = appOptions.fileBaseUrl;
        var MCK_ON_PLUGIN_INIT = appOptions.onInit;
        var MCK_ON_TOPIC_DETAILS = appOptions.onTopicDetails;
        var AUTHENTICATION_TYPE_ID_MAP = [0, 1, 2];
        var MCK_ON_PLUGIN_CLOSE = appOptions.onClose;
        var MCK_DISPLAY_TEXT = appOptions.displayText;
        var MCK_ACCESS_TOKEN = appOptions.password || appOptions.accessToken;
        var MCK_CALLBACK = appOptions.readConversation;
        var MCK_GROUPMAXSIZE = appOptions.maxGroupSize;
        var MCK_ON_TAB_CLICKED = appOptions.onTabClicked;
        var MCK_CONTACT_NUMBER = appOptions.contactNumber;
        var MCK_FILEMAXSIZE = appOptions.maxAttachmentSize;
        var MCK_APP_MODULE_NAME = appOptions.appModuleName;
        var MCK_GETTOPICDETAIL = appOptions.getTopicDetail;
        var MCK_GETUSERNAME = appOptions.contactDisplayName;
        var MCK_MSG_VALIDATION = appOptions.validateMessage;
        var MCK_PRICE_DETAIL = appOptions.finalPriceResponse;
        var MCK_GETUSERIMAGE = appOptions.contactDisplayImage;
        var MCK_PRICE_WIDGET_ENABLED = appOptions.priceWidget;
        var MCK_OPEN_GROUP_SETTINGS = appOptions.openGroupSettings;
        var MCK_OFFLINE_MESSAGE_DETAIL = appOptions.offlineMessageDetail;
        var MCK_INIT_AUTO_SUGGESTION = appOptions.initAutoSuggestions;
        var MCK_AUTHENTICATION_TYPE_ID = appOptions.authenticationTypeId;
        var MCK_GETCONVERSATIONDETAIL = appOptions.getConversationDetail;
        var MCK_NOTIFICATION_ICON_LINK = appOptions.notificationIconLink;
        var MCK_MAP_STATIC_API_KEY = appOptions.mapStaticAPIkey;
        var MCK_ENABLE_BADGE_COUNT = appOptions.unreadCountOnchatLauncher;
        var CUSTOM_CHAT_LAUNCHER = appOptions.chatLauncherHtml;
        var MCK_CUSTOM_UPLOAD_SETTINGS = appOptions.fileUpload;
        //      var MCK_AWS_S3_SERVER = (appOptions.awsS3Server)?appOptions.awsS3Server:false;
        var MCK_NOTIFICATION_TONE_VOLUME =
            WIDGET_SETTINGS &&
            typeof WIDGET_SETTINGS.notificationVolume === 'number'
                ? WIDGET_SETTINGS.notificationVolume
                : 1; // Volume range for howler library is from 0->1.
        var MCK_NOTIFICATION_TONE_LINK =
            WIDGET_SETTINGS && WIDGET_SETTINGS.notificationTone
                ? SnapConstants.NOTIFICATION_RINGTONES[
                      WIDGET_SETTINGS.notificationTone
                  ]
                : SnapConstants.NOTIFICATION_RINGTONES['subtle'];
        var MCK_CHAT_POPUP_NOTIFICATION_TONE_LINK = appOptions.chatPopupSoundNotificationLink
            ? appOptions.chatPopupSoundNotificationLink
            : SnapConstants.KM_CHAT_POPUP_NOTIFICATION_URL;
        var MCK_USER_ID = IS_MCK_VISITOR
            ? 'guest'
            : $applozic.trim(appOptions.userId);
        var MCK_GOOGLE_API_KEY = IS_MCK_LOCSHARE
            ? appOptions.googleApiKey
            : 'NO_ACCESS';
        var MCK_SOURCE =
            typeof appOptions.source === 'undefined' ? 1 : appOptions.source;
        var IS_MCK_TOPIC_BOX =
            typeof appOptions.topicBox === 'boolean'
                ? appOptions.topicBox
                : false;
        var IS_MCK_OL_STATUS =
            typeof appOptions.olStatus === 'boolean'
                ? appOptions.olStatus
                : false;
        var MESSAGE_BUBBLE_AVATOR_ENABLED =
            typeof appOptions.messageBubbleAvator === 'boolean'
                ? appOptions.messageBubbleAvator
                : true;
        var IS_OFFLINE_MESSAGE_ENABLED =
            typeof appOptions.showOfflineMessage === 'boolean'
                ? appOptions.showOfflineMessage
                : false;
        var IS_GROUP_SUBTITLE_HIDDEN =
            typeof appOptions.hideGroupSubtitle === 'boolean'
                ? appOptions.hideGroupSubtitle
                : false;
        var MCK_DEFAULT_MESSAGE_METADATA =
            typeof appOptions.defaultMessageMetaData === 'undefined'
                ? {}
                : appOptions.defaultMessageMetaData;
        var IS_MCK_GROUPUSERCOUNT =
            typeof appOptions.groupUserCount === 'boolean'
                ? appOptions.groupUserCount
                : false;
        var MCK_CHECK_USER_BUSY_STATUS =
            typeof appOptions.checkUserBusyWithStatus === 'boolean'
                ? appOptions.checkUserBusyWithStatus
                : false;
        var IS_RESET_USER_STATUS =
            typeof appOptions.resetUserStatus === 'boolean'
                ? appOptions.resetUserStatus
                : false;
        var IS_MCK_TOPIC_HEADER =
            typeof appOptions.topicHeader === 'boolean'
                ? appOptions.topicHeader
                : false;
        var MCK_SUPPORT_ID_DATA_ATTR = appOptions.supportId
            ? 'data-mck-id="' + appOptions.supportId + '"'
            : '';
        var IS_MCK_OWN_CONTACTS =
            typeof appOptions.loadOwnContacts === 'boolean'
                ? appOptions.loadOwnContacts
                : false;
        var IS_MCK_NOTIFICATION =
            typeof appOptions.desktopNotification === 'boolean'
                ? appOptions.desktopNotification
                : true;
        var IS_NOTIFICATION_ENABLED =
            typeof appOptions.notification === 'boolean'
                ? appOptions.notification
                : true;
        var IS_SW_NOTIFICATION_ENABLED =
            typeof appOptions.swNotification === 'boolean'
                ? appOptions.swNotification
                : false;
        var IS_AUTO_TYPE_SEARCH_ENABLED =
            typeof appOptions.autoTypeSearchEnabled === 'boolean'
                ? appOptions.autoTypeSearchEnabled
                : true;
        var IS_LAUNCH_TAB_ON_NEW_MESSAGE =
            typeof appOptions.launchOnNewMessage === 'boolean'
                ? appOptions.launchOnNewMessage
                : false;
        var IS_LAUNCH_ON_UNREAD_MESSAGE_ENABLED =
            typeof appOptions.launchOnUnreadMessage === 'boolean'
                ? appOptions.launchOnUnreadMessage
                : false;
        var USER_TYPE_ID =
            typeof appOptions.userTypeId === 'number'
                ? appOptions.userTypeId
                : false;
        var CONVERSATION_STATUS_MAP = ['DEFAULT', 'NEW', 'OPEN'];
        var BLOCK_STATUS_MAP = [
            'BLOCKED_TO',
            'BLOCKED_BY',
            'UNBLOCKED_TO',
            'UNBLOCKED_BY',
        ];
        var MCK_TRIGGER_MSG_NOTIFICATION_TIMEOUT =
            typeof appOptions.msgTriggerTimeout === 'number'
                ? appOptions.msgTriggerTimeout
                : 0;
        MCK_MAINTAIN_ACTIVE_CONVERSATION_STATE =
            typeof appOptions.automaticChatOpenOnNavigation === 'boolean'
                ? appOptions.automaticChatOpenOnNavigation
                : false;
        var MCK_ATTACHMENT =
            typeof appOptions.attachment === 'boolean'
                ? appOptions.attachment
                : true;
        var CURRENT_PAGE_TITLE = parent.document.title;
        var FLASH_PAGE_TITLE;
        var MCK_POPUP_WIDGET_CONTENT = appOptions.chatPopupMessage;
        var TAB_FILE_DRAFT = new Object();
        var MCK_GROUP_ARRAY = new Array();
        var MCK_CONTACT_ARRAY = new Array();
        var TAB_MESSAGE_DRAFT = new Object();
        var MCK_CONTACT_NAME_MAP = new Array();
        var MCK_UNREAD_COUNT_MAP = new Array();
        var MCK_GROUP_MEMBER_SEARCH_ARRAY = new Array();
        var MCK_TAB_CONVERSATION_MAP = new Array();
        var mckInit = new MckInit();
        var mckUtils = new MckUtils();
        var mckMapLayout = new MckMapLayout();
        var mckUserUtils = new MckUserUtils();
        var mckMapService = new MckMapService();
        var mckGroupService = new MckGroupService();
        var mckGroupUtils = new MckGroupUtils();
        var mckGroupLayout = new MckGroupLayout();
        var mckFileService = new MckFileService();
        var mckMessageLayout = new MckMessageLayout();
        var mckMessageService = new MckMessageService();
        var mckContactService = new MckContactService();
        var mckNotificationService = new MckNotificationService();
        var alMessageService = new AlMessageService();
        var alFileService = new AlFileService();
        var kmCustomTheme = new KmCustomTheme();
        var snapCommons = new SnapCommons();
        var mckNotificationUtils = new MckNotificationUtils();
        var alNotificationService = new AlNotificationService();
        var alUserService = new AlUserService();
        var $mckChatLauncherIcon = $applozic('.chat-launcher-icon');
        var mckNotificationTone = null;
        var mckChatPopupNotificationTone = null;
        var notificationToneOption = {};
        var ringToneService;
        var lastFetchTime;
        var isUserDeleted = false;
        var mckVideoCallringTone = null;
        var KM_ASK_USER_DETAILS = mckMessageService.checkArray(
            appOptions.askUserDetails
        );
        var KM_PRELEAD_COLLECTION = appOptions.preLeadCollection
            ? mckMessageService.checkArray(appOptions.preLeadCollection)
            : appOptions.appSettings.collectLead &&
              appOptions.appSettings.leadCollection
            ? mckMessageService.checkArray(
                  appOptions.appSettings.leadCollection
              )
            : [];
        var DEFAULT_GROUP_NAME = appOptions.conversationTitle;
        var DEFAULT_AGENT_ID = appOptions.agentId;
        var DEFAULT_BOT_IDS = appOptions.botIds;
        var DEFAULT_AGENT_NAME = appOptions.agentName;
        var USE_BRANDING =
            typeof appOptions.useBranding == 'boolean'
                ? appOptions.useBranding
                : true;
        var POPUP_WIDGET = appOptions.popupWidget;
        w.MCK_OL_MAP = new Array();
        var VOICE_INPUT_ENABLED = appOptions.voiceInput;
        var VOICE_OUTPUT_ENABLED = appOptions.voiceOutput;
        var RATING_EMOJI_HOVER_TEXT_MAP = {
            1: MCK_LABELS['emoji.hover.text'].poor,
            5: MCK_LABELS['emoji.hover.text'].average,
            10: MCK_LABELS['emoji.hover.text'].great,
        };
        var MCK_BOT_MESSAGE_DELAY =
            WIDGET_SETTINGS && WIDGET_SETTINGS.botMessageDelayInterval
                ? WIDGET_SETTINGS.botMessageDelayInterval
                : 0;
        var MCK_CUSTOM_BRANDING =
            WIDGET_SETTINGS && WIDGET_SETTINGS.customBranding;
        var WIDGET_POSITION =
            WIDGET_SETTINGS &&
            snapCommons.isObject(WIDGET_SETTINGS) &&
            WIDGET_SETTINGS.hasOwnProperty('position')
                ? WIDGET_SETTINGS.position
                : SnapConstants.POSITION.RIGHT;
        window.Applozic.SOCKET_DISCONNECT_PROCEDURE = {
            SOCKET_DISCONNECT_TIMER_VALUE: 120000, // 2 minutes : 120000 milliSeconds
            DISCONNECTED: false,
            start: function () {
                this.SOCKET_DISCONNECT_TIMEOUT = setTimeout(function () {
                    /*
                        For a fresh user, if there are no conversation then we will disconnect the socket after n minutes.
                        To change the socket disconnect time interval refer to SOCKET_DISCONNECT_TIMER_VALUE
                    */
                    mckUserUtils.checkIfUserHasConversations(
                        null,
                        function (err, checkIfUserHasConversations) {
                            err && console.log(err);
                            if (!checkIfUserHasConversations) {
                                window.Applozic.ALSocket.disconnect();
                                window.Applozic.SOCKET_DISCONNECT_PROCEDURE.DISCONNECTED = true;
                                IS_SOCKET_CONNECTED = false;
                            }
                        }
                    );
                }, this.SOCKET_DISCONNECT_TIMER_VALUE);
            },
            stop: function () {
                clearTimeout(this.SOCKET_DISCONNECT_TIMEOUT);
            },
        };
        var CONNECT_SOCKET_ON_WIDGET_CLICK =
            appOptions.connectSocketOnWidgetClick;
        var SUBSCRIBE_TO_EVENTS_BACKUP = {};
        var DEFAULT_ENCRYPTED_APP_VERSION = 111; // Update it to 112 to enable encryption for socket messages.
        snapCommons.checkIfDeviceIsHandheld() &&
            (MCK_MAINTAIN_ACTIVE_CONVERSATION_STATE = false);

        _this.toggleMediaOptions = function () {
            var mckTypingBox = document.getElementById('mck-text-box');
            mckMessageService.toggleMediaOptions(mckTypingBox);
        };

        _this.submitMessage = function (params) {
            mckMessageService.submitMessage(params.messagePxy, params.optns);
        };

        _this.mckLaunchSideboxChat = function () {
            snapCommons.setWidgetStateOpen(true);
            !POPUP_WIDGET &&
                $applozic('#mck-sidebox-launcher')
                    .removeClass('vis')
                    .addClass('n-vis');
            SNAP_VERSION === 'v2' &&
                Snap.setDefaultIframeConfigForOpenChat(POPUP_WIDGET);
            SnapUI.showChat();
            $applozic('#mck-away-msg-box').removeClass('vis').addClass('n-vis');
            mckMessageService.loadConversationWithAgents(
                {
                    groupName: DEFAULT_GROUP_NAME,
                    agentId: DEFAULT_AGENT_ID,
                    botIds: DEFAULT_BOT_IDS,
                },
                function (data) {
                    console.log('conversation created successfully');
                    SnapUI.activateTypingField();
                }
            );
            $applozic('#mck-msg-preview-visual-indicator').hasClass('vis')
                ? $applozic('#mck-msg-preview-visual-indicator')
                      .removeClass('vis')
                      .addClass('n-vis')
                : '';
        };
        _this.openChat = function (params) {
            mckMessageService.openChat(params);
        };

        var EVENTS = {
            onConnectFailed: function (resp) {
                console.log('onConnectFailed' + resp);
                console.log('onconnect failed');
                IS_SOCKET_CONNECTED = false;
                if (navigator.onLine) {
                    window.Applozic.ALSocket.reconnect();
                }
            },
            onConnect: function (resp) {
                IS_SOCKET_CONNECTED = true;
                snapCommons.modifyClassList(
                    { id: ['km-local-file-system-warning'] },
                    'n-vis',
                    'vis'
                );
                if (
                    typeof SUBSCRIBE_TO_EVENTS_BACKUP == 'object' &&
                    Object.keys(SUBSCRIBE_TO_EVENTS_BACKUP).length != 0
                ) {
                    _this.subscribeToEvents(
                        SUBSCRIBE_TO_EVENTS_BACKUP,
                        function () {
                            SUBSCRIBE_TO_EVENTS_BACKUP = {};
                        }
                    );
                }
            },
            onMessageDelivered: function (resp) {},
            onMessageRead: function (resp) {},
            onMessageDeleted: function (resp) {},
            onConversationDeleted: function (resp) {},
            onUserConnect: function (resp) {},
            onUserDisconnect: function (resp) {},
            onConversationReadFromOtherSource: function (resp) {},
            onConversationRead: function (resp) {},
            onMessageReceived: function (resp) {},
            onMessageSentUpdate: function (resp) {},
            onMessageSent: function (resp) {},
            onUserBlocked: function (resp) {},
            onUserUnblocked: function (resp) {},
            onUserActivated: function (resp) {},
            onUserDeactivated: function (resp) {},
            onMessageNotification: function (resp) {},
            connectToSocket: function (resp) {
                mckInitializeChannel.connectToSocket(resp);
            },
            onMessage: function (resp) {
                mckInitializeChannel.onMessage(resp);
            },
            onOpenGroupMessage: function (resp) {
                mckInitializeChannel.onOpenGroupMessage(resp);
            },
            onTypingStatus: function (resp) {
                mckInitializeChannel.onTypingStatus(resp);
            },
        };

        _this.loadConversationWithAgent = function (params) {
            if (params && params.agentId) {
                console.log('setting default agent inside Applozic');
                mckMessageService.loadConversationWithAgents(params);
            } else {
                throw new Error('params are empty');
            }
        };

        var mckInitializeChannel = new MckInitializeChannel();
        _this.getOptions = function () {
            return appOptions;
        };
        _this.init = function () {
            window.Applozic.ALApiService.initServerUrl(MCK_BASE_URL);
            alFileService.get(appOptions);
            alMessageService.init(appOptions);
            kmCustomTheme.init(appOptions);
            snapCommons.init(appOptions);
            alNotificationService.init(appOptions);
            mckMessageLayout.init();
            notificationToneOption.loop = false;
            notificationToneOption.volume = MCK_NOTIFICATION_TONE_VOLUME;
            if (MCK_NOTIFICATION_TONE_LINK) {
                ringToneService = new RingToneService();
                try {
                    mckNotificationTone = ringToneService.loadRingTone(
                        MCK_NOTIFICATION_TONE_LINK,
                        notificationToneOption
                    );
                } catch (e) {
                    console.log(e, 'error while loading ringTone service');
                }
            }
            if (
                snapCommons.isObject(WIDGET_SETTINGS) &&
                WIDGET_SETTINGS.popup
            ) {
                ringToneService = new RingToneService();
                var greetingMsgVolumeOption = {};
                greetingMsgVolumeOption.volume =
                    WIDGET_SETTINGS.greetingMessageVolume;
                try {
                    mckChatPopupNotificationTone = ringToneService.loadChatPopupTone(
                        MCK_CHAT_POPUP_NOTIFICATION_TONE_LINK,
                        greetingMsgVolumeOption
                    );
                } catch (e) {
                    console.log(
                        e,
                        'Error while loading ringTone service for chat popup widget.'
                    );
                }
            }
            mckMessageService.init();
            mckFileService.init();
            mckGroupLayout.init();
            mckInit.initializeApp(appOptions, false);
            mckNotificationService.init();
            mckMapLayout.init();
            !MCK_ATTACHMENT &&
                snapCommons.modifyClassList(
                    { id: ['mck-attachfile-box', 'mck-file-up'] },
                    'n-vis',
                    'vis'
                );
            VOICE_INPUT_ENABLED &&
                Snap.typingAreaService.showMicIfSpeechRecognitionSupported();

            if (
                SNAP_VERSION === 'v2' &&
                window.frameElement.getAttribute('data-protocol') == 'file:' &&
                !window.top.hasOwnProperty('cordova')
            ) {
                snapCommons.modifyClassList(
                    { id: ['km-local-file-system-warning'] },
                    'vis',
                    'n-vis'
                );
            }
            document.addEventListener('keydown', function (e) {
                document.body.classList.add('accesibility');
            });
            document.addEventListener('mousedown', function (e) {
                document.body.classList.remove('accesibility');
            });

            // the browser call getVoices is async
            // so we are updating the array whenever they're available
            if (VOICE_OUTPUT_ENABLED && 'speechSynthesis' in window) {
                AVAILABLE_VOICES_FOR_TTS = speechSynthesis.getVoices();
                if (speechSynthesis.onvoiceschanged !== undefined) {
                    speechSynthesis.onvoiceschanged = function () {
                        AVAILABLE_VOICES_FOR_TTS = speechSynthesis.getVoices();
                    };
                }
            }
        };
        _this.reInit = function (optns) {
            // storing custum appOptions into session Storage.
            SnapUtils.storeDataIntoKmSession('appOptions', optns);
            if ($applozic.type(optns) === 'object') {
                optns = $applozic.extend(true, {}, default_options, optns);
                appOptions.conversationTitle =
                    appOptions.conversationTitle || appOptions.groupName;
                appOptions.accessToken =
                    appOptions.password || appOptions.accessToken;
            } else {
                return;
            }
            $applozic.fn.applozic('reset', optns);
            if (
                optns.userId &&
                optns.appId &&
                $applozic.trim(optns.userId) !== '' &&
                $applozic.trim(optns.appId) !== ''
            ) {
                mckInit.initializeApp(optns, true);
                appOptions = optns;
            } else {
                w.console(
                    'Oops! looks like incorrect application id or user Id.'
                );
                return;
            }
        };
        _this.loadTabView = function (params) {
            if (typeof params.isGroup === 'undefined') {
                params.isGroup = false;
            }
            mckMessageLayout.loadTab(params);
            $applozic('#mck-search').val('');
        };
        _this.loadTab = function (tabId, callback) {
            mckMessageLayout.loadTab(
                {
                    tabId: tabId,
                    isGroup: false,
                },
                callback
            );
            $applozic('#mck-search').val('');
        };
        _this.loadChat = function (optns) {
            if (
                (typeof optns.userId === 'undefined' || optns.userId === '') &&
                (typeof optns.groupId === 'undefined' ||
                    optns.groupId === '') &&
                (typeof optns.clientGroupId === 'undefined' ||
                    optns.clientGroupId === '')
            ) {
                return 'UserId or groupId or clientGroupId required';
            }
            var params = {
                tabId: optns.userId,
                isGroup: false,
            };
            var params = {};
            if (optns.userId) {
                params.tabId = userId;
                params.isGroup = false;
            }
            if (optns.displayName) {
                params.userName = optns.displayName;
            }
            if (optns.convId) {
                params.conversationId = optns.convId;
            }
            if (optns.groupId || optns.clientGroupId) {
                params.isGroup = true;
                if (optns.clientGroupId) {
                    params.clientGroupId = optns.clientGroupId;
                    var group = mckGroupUtils.getGroupByClientGroupId(
                        optns.clientGroupId
                    );
                    if (typeof group === 'object') {
                        params.tabId = group.contactId;
                    } else {
                        mckGroupService.getGroupFeed({
                            clientGroupId: params.clientGroupId,
                            apzCallback: mckGroupLayout.onGroupFeed,
                            callback: mckGroupLayout.loadGroupTab,
                        });
                        $applozic('#mck-search').val('');
                        return;
                    }
                } else {
                    var group = mckGroupUtils.getGroup(optns.groupId);
                    if (typeof group === 'object') {
                        params.tabId = optns.groupId;
                    } else {
                        mckGroupService.getGroupFeed({
                            groupId: optns.groupId,
                            apzCallback: mckGroupLayout.onGroupFeed,
                            callback: mckGroupLayout.loadGroupTab,
                        });
                        $applozic('#mck-search').val('');
                        return;
                    }
                }
            }
            mckMessageLayout.loadTab(params);
            $applozic('#mck-search').val('');
        };
        _this.uploadFile = function (file) {
            mckFileService.uploadFile(file);
        };
        _this.uploadAttachemnt = function (file) {
            mckFileService.uploadAttachemnt(file.params, file.messagePxy);
        };
        _this.audioAttach = function (file) {
            mckFileService.audioRecoder(file);
        };
        _this.loadGroupTab = function (tabId, callback) {
            if (typeof tabId === 'undefined' || tabId === '') {
                return 'GroupId required';
            }
            var group = mckGroupUtils.getGroup(tabId);
            if (typeof group === 'object') {
                mckMessageLayout.loadTab(
                    {
                        tabId: tabId,
                        isGroup: true,
                    },
                    callback
                );
                $applozic('#mck-search').val('');
            } else {
                mckGroupService.getGroupFeed({
                    groupId: tabId,
                    apzCallback: mckGroupLayout.onGroupFeed,
                    callback: mckGroupLayout.loadGroupTab,
                });
            }
        };
        _this.loadGroupTabByClientGroupId = function (params) {
            if (
                typeof params.clientGroupId === 'undefined' ||
                params.clientGroupId === ''
            ) {
                return 'Client Group Id Required';
            }
            var group = mckGroupUtils.getGroupByClientGroupId(
                params.clientGroupId
            );
            if (typeof group === 'object') {
                mckMessageLayout.loadTab({
                    tabId: group.contactId,
                    isGroup: true,
                });
                $applozic('#mck-search').val('');
            } else {
                mckGroupService.getGroupFeed({
                    clientGroupId: params.clientGroupId,
                    apzCallback: mckGroupLayout.onGroupFeed,
                    callback: mckGroupLayout.loadGroupTab,
                });
            }
        };
        _this.loadConvTab = function (optns) {
            if (typeof optns === 'object' && optns.userId && optns.convId) {
                mckMessageLayout.loadTab({
                    tabId: optns.userId,
                    conversationId: optns.convId,
                    isGroup: false,
                });
            }
        };
        _this.loadTabWithTopic = function (optns) {
            if (
                typeof optns === 'object' &&
                (optns.userId || optns.groupId) &&
                optns.topicId
            ) {
                var params = {
                    tabId: optns.userId,
                    topicId: optns.topicId,
                };
                if (optns.userName) {
                    params.userName = optns.userName;
                }
                if (optns.topicStatus) {
                    params.topicStatus =
                        CONVERSATION_STATUS_MAP.indexOf(optns.topicStatus) ===
                        -1
                            ? CONVERSATION_STATUS_MAP[0]
                            : optns.topicStatus.toString();
                } else {
                    params.topicStatus = CONVERSATION_STATUS_MAP[0];
                }
                if (
                    typeof MCK_GETTOPICDETAIL === 'function' ||
                    optns.topicDetail
                ) {
                    var topicDetail = optns.topicDetail
                        ? optns.topicDetail
                        : MCK_GETTOPICDETAIL(optns.topicId);
                    if (
                        typeof topicDetail === 'object' &&
                        topicDetail.title !== 'undefined'
                    ) {
                        MCK_TOPIC_DETAIL_MAP[optns.topicId] = topicDetail;
                    }
                }
                if (optns.message) {
                    var messagePxy = {
                        type: 5,
                        contentType: 0,
                        message: message,
                    };
                    params.messagePxy = messagePxy;
                    params.isMessage = true;
                } else {
                    params.isMessage = false;
                }
                if (optns.supportId) {
                    params.isGroup = true;
                    params.supportId = supportId;
                } else {
                    params.isGroup = false;
                    params.userId = optns.userId;
                }
                mckMessageService.getConversationId(params);
            } else {
                if (!optns.userId || !optns.groupId) {
                    return 'UserId required';
                } else if (!optns.topicId) {
                    return 'TopicId required';
                }
            }
        };
        _this.loadContacts = function (contacts) {
            mckMessageLayout.loadContacts(contacts);
        };
        _this.loadContactsForContactList = function (contacts) {
            mckMessageLayout.loadContactsForContactList(contacts);
        };
        _this.setOffline = function () {
            if (typeof window.Applozic.ALSocket !== 'undefined') {
                window.Applozic.ALSocket.sendStatus(0);
            }
        };
        _this.setOnline = function () {
            if (typeof window.Applozic.ALSocket !== 'undefined') {
                window.Applozic.ALSocket.sendStatus(1);
            }
        };
        _this.reset = function (optns) {
            ALStorage.clearSessionStorageElements();
            MCK_TOKEN = '';
            USER_ENCRYPTION_KEY = '';
            AUTH_CODE = '';
            window.Applozic.ALApiService.AUTH_TOKEN = null;
            FILE_META = [];
            MCK_GROUP_MAP = [];
            IS_LOGGED_IN = true;
            MCK_CONTACT_MAP = [];
            USER_DEVICE_KEY = '';
            MCK_MODE = optns.mode;
            USER_COUNTRY_CODE = '';
            MCK_BLOCKED_TO_MAP = [];
            MCK_BLOCKED_BY_MAP = [];
            CONTACT_SYNCING = false;
            MCK_IDLE_TIME_LIMIT = 90;
            MCK_APP_ID = optns.appId;
            MCK_LAST_SEEN_AT_MAP = [];
            MCK_CONVERSATION_MAP = [];
            MCK_TOPIC_DETAIL_MAP = [];
            MCK_CLIENT_GROUP_MAP = [];
            IS_MCK_TAB_FOCUSED = true;
            MCK_LABELS = optns.labels;
            MCK_TOTAL_UNREAD_COUNT = 0;
            MCK_BASE_URL = optns.baseUrl;
            MCK_CUSTOM_UPLOAD_SETTINGS = optns.fileupload;
            MCK_CUSTOM_URL = optns.customFileUrl;
            TAB_FILE_DRAFT = new Object();
            MCK_GROUP_ARRAY = new Array();
            MCK_LAUNCHER = optns.launcher;
            MCK_CONNECTED_CLIENT_COUNT = 0;
            OPEN_GROUP_SUBSCRIBER_MAP = [];
            MCK_USER_NAME = optns.userName;
            IS_MCK_VISITOR = optns.visitor;
            MCK_TOPIC_CONVERSATION_MAP = [];
            MCK_CONTACT_ARRAY = new Array();
            TAB_MESSAGE_DRAFT = new Object();
            MCK_FILE_URL = optns.fileBaseUrl;
            IS_MCK_LOCSHARE = optns.locShare;
            IS_CALL_ENABLED = appOptions.video;
            MCK_ON_PLUGIN_INIT = optns.onInit;
            MCK_ON_TOPIC_DETAILS = optns.onTopicDetails;
            MCK_CONTACT_NAME_MAP = new Array();
            MCK_UNREAD_COUNT_MAP = new Array();
            MCK_ON_PLUGIN_CLOSE = optns.onClose;
            MCK_ACCESS_TOKEN = optns.password || optns.accessToken;
            MCK_DISPLAY_TEXT = optns.displayText;
            MCK_CALLBACK = optns.readConversation;
            MCK_GROUPMAXSIZE = optns.maxGroupSize;
            MCK_TAB_CONVERSATION_MAP = new Array();
            MCK_ON_TAB_CLICKED = optns.onTabClicked;
            MCK_CONTACT_NUMBER = optns.contactNumber;
            MCK_APP_MODULE_NAME = optns.appModuleName;
            MCK_GETTOPICDETAIL = optns.getTopicDetail;
            MCK_FILEMAXSIZE = optns.maxAttachmentSize;
            MCK_MSG_VALIDATION = optns.validateMessage;
            MCK_GETUSERNAME = optns.contactDisplayName;
            MCK_GROUP_MEMBER_SEARCH_ARRAY = new Array();
            MCK_PRICE_DETAIL = optns.finalPriceResponse;
            MCK_GETUSERIMAGE = optns.contactDisplayImage;
            MCK_PRICE_WIDGET_ENABLED = optns.priceWidget;
            MCK_OPEN_GROUP_SETTINGS = appOptions.openGroupSettings;
            MCK_OFFLINE_MESSAGE_DETAIL = optns.offlineMessageDetail;
            MCK_INIT_AUTO_SUGGESTION = optns.initAutoSuggestions;
            MCK_GETCONVERSATIONDETAIL = optns.getConversationDetail;
            MCK_AUTHENTICATION_TYPE_ID = optns.authenticationTypeId;
            MCK_USER_ID = IS_MCK_VISITOR
                ? 'guest'
                : $applozic.trim(optns.userId);
            MCK_GOOGLE_API_KEY = IS_MCK_LOCSHARE
                ? optns.googleApiKey
                : 'NO_ACCESS';
            IS_MCK_OL_STATUS =
                typeof optns.olStatus === 'boolean' ? optns.olStatus : false;
            IS_MCK_TOPIC_BOX =
                typeof optns.topicBox === 'boolean' ? optns.topicBox : false;
            IS_OFFLINE_MESSAGE_ENABLED =
                typeof optns.showOfflineMessage === 'boolean'
                    ? optns.showOfflineMessage
                    : false;
            IS_MCK_TOPIC_HEADER =
                typeof optns.topicHeader === 'boolean'
                    ? optns.topicHeader
                    : false;
            IS_NOTIFICATION_ENABLED =
                typeof optns.notification === 'boolean'
                    ? optns.notification
                    : true;
            IS_SW_NOTIFICATION_ENABLED =
                typeof optns.swNotification === 'boolean'
                    ? optns.swNotification
                    : false;
            MCK_SUPPORT_ID_DATA_ATTR = optns.supportId
                ? 'data-mck-id="' + optns.supportId + '"'
                : '';
            IS_GROUP_SUBTITLE_HIDDEN =
                typeof optns.hideGroupSubtitle === 'boolean'
                    ? optns.hideGroupSubtitle
                    : false;
            MCK_DEFAULT_MESSAGE_METADATA =
                typeof optns.defaultMessageMetaData === 'undefined'
                    ? {}
                    : optns.defaultMessageMetaData;
            IS_MCK_GROUPUSERCOUNT =
                typeof optns.groupUserCount === 'boolean'
                    ? optns.groupUserCount
                    : false;
            IS_MCK_NOTIFICATION =
                typeof optns.desktopNotification === 'boolean'
                    ? optns.desktopNotification
                    : false;
            IS_MCK_OWN_CONTACTS =
                typeof optns.loadOwnContacts === 'boolean'
                    ? optns.loadOwnContacts
                    : false;
            MESSAGE_BUBBLE_AVATOR_ENABLED =
                typeof optns.messageBubbleAvator === 'boolean'
                    ? optns.messageBubbleAvator
                    : false;
            IS_RESET_USER_STATUS =
                typeof appOptions.resetUserStatus === 'boolean'
                    ? appOptions.resetUserStatus
                    : false;
            IS_LAUNCH_TAB_ON_NEW_MESSAGE =
                typeof optns.launchOnNewMessage === 'boolean'
                    ? optns.launchOnNewMessage
                    : false;
            IS_AUTO_TYPE_SEARCH_ENABLED =
                typeof optns.autoTypeSearchEnabled === 'boolean'
                    ? optns.autoTypeSearchEnabled
                    : true;
            MCK_CHECK_USER_BUSY_STATUS =
                typeof optns.checkUserBusyWithStatus === 'boolean'
                    ? optns.checkUserBusyWithStatus
                    : false;
            IS_LAUNCH_ON_UNREAD_MESSAGE_ENABLED =
                typeof optns.launchOnUnreadMessage === 'boolean'
                    ? optns.launchOnUnreadMessage
                    : false;
            KM_ASK_USER_DETAILS = appOptions.askUserDetails;
        };
        _this.logout = function () {
            if (typeof window.Applozic.ALSocket !== 'undefined') {
                window.Applozic.ALSocket.disconnect();
                sessionStorage.removeItem('snap');
                window.Applozic.ALApiService.setAjaxHeaders('', '', '', '', '');
                // Below function will clearMckMessageArray, clearAppHeaders, clearMckContactNameArray, removeEncryptionKey
                ALStorage.clearSessionStorageElements();
                $applozic.fn.applozic('reset', appOptions);
                SnapUtils.deleteCookie({
                    name: SnapConstants.COOKIES.SNAP_LOGGED_IN_USERNAME,
                    domain: MCK_COOKIE_DOMAIN,
                });
                SnapUtils.deleteCookie({
                    name: SnapConstants.COOKIES.SNAP_LOGGED_IN_ID,
                    domain: MCK_COOKIE_DOMAIN,
                });
                $applozic('#mck-sidebox').hide();
                $applozic('#mck-sidebox-launcher').hide();
                parent.document.getElementById('snap-widget-iframe') &&
                    (parent.document.getElementById(
                        'snap-widget-iframe'
                    ).style.display = 'none');
            }
            IS_LOGGED_IN = false;
        };
        _this.getUserStatus = function (params) {
            if (typeof params.callback === 'function') {
                if (typeof params.userIds !== 'undefined') {
                    mckContactService.getUsersDetail(params.userIds, params);
                } else {
                    alUserService.getUserStatus(params, function (data) {
                        $applozic.each(data.users, function (i, user) {
                            var contact = mckMessageLayout.getContact(
                                '' + user.userId
                            );
                            contact =
                                typeof contact === 'undefined'
                                    ? mckMessageLayout.createContactWithDetail(
                                          user
                                      )
                                    : mckMessageLayout.updateContactDetail(
                                          contact,
                                          user
                                      );
                            MCK_GROUP_MEMBER_SEARCH_ARRAY.push(
                                contact.contactId
                            );
                        });
                    });
                }
            }
        };
        _this.getGroupList = function (params) {
            if (typeof params.callback === 'function') {
                params.apzCallback = mckGroupLayout.loadGroups;
                mckGroupService.loadGroups(params);
                return 'success';
            } else {
                return 'Callback Function Required';
            }
        };
        _this.leaveGroup = function (params) {
            if (typeof params !== 'object') {
                return 'Unsupported Format. Please check format';
            }
            if (typeof params.callback === 'function') {
                if (
                    (typeof params.groupId === 'undefined' ||
                        params.groupId === '') &&
                    (typeof params.clientGroupId === 'undefined' ||
                        params.clientGroupId === '')
                ) {
                    params.callback({
                        status: 'error',
                        errorMessage: 'GroupId or Client GroupId Required',
                    });
                    return;
                }
                params.apzCallback = mckGroupLayout.onGroupLeft;
                mckGroupService.leaveGroup(params);
                return 'success';
            } else {
                return 'Callback Function Required';
            }
        };
        _this.addGroupMember = function (params) {
            if (typeof params !== 'object') {
                return 'Unsupported Format. Please check format';
            }
            if (typeof params.callback === 'function') {
                if (
                    (typeof params.groupId === 'undefined' ||
                        params.groupId === '') &&
                    (typeof params.clientGroupId === 'undefined' ||
                        params.clientGroupId === '')
                ) {
                    params.callback({
                        status: 'error',
                        errorMessage: 'GroupId or clientGroupId required',
                    });
                    return;
                }
                if (
                    typeof params.userId === 'undefined' ||
                    params.userId === ''
                ) {
                    params.callback({
                        status: 'error',
                        errorMessage: 'UserId required',
                    });
                    return;
                }
                if (
                    typeof params.role !== 'undefined' &&
                    GROUP_ROLE_MAP.indexOf(params.role) === -1
                ) {
                    params.callback({
                        status: 'error',
                        errorMessage: 'Incorrect member role',
                    });
                    return;
                }

                alUserService.loadUserProfile(params.userId);

                params.apzCallback = mckGroupLayout.onAddedGroupMember;
                mckGroupService.addGroupMember(params);
                return 'success';
            } else {
                return 'Callback function required';
            }
        };
        _this.removeGroupMember = function (params) {
            if (typeof params !== 'object') {
                return 'Unsupported Format. Please check format';
            }
            if (typeof params.callback === 'function') {
                if (
                    (typeof params.groupId === 'undefined' ||
                        params.groupId === '') &&
                    (typeof params.clientGroupId === 'undefined' ||
                        params.clientGroupId === '')
                ) {
                    params.callback({
                        status: 'error',
                        errorMessage: 'GroupId or clientGroupId required',
                    });
                    return;
                }
                if (
                    typeof params.userId === 'undefined' ||
                    params.userId === ''
                ) {
                    params.callback({
                        status: 'error',
                        errorMessage: 'UserId required',
                    });
                    return;
                }
                params.apzCallback = mckGroupLayout.onRemovedGroupMember;
                mckGroupService.removeGroupMemberFromChat(params);
                return 'success';
            } else {
                return 'Callback function required';
            }
        };
        _this.updateGroupInfo = function (params) {
            if (typeof params !== 'object') {
                return 'Unsupported format. Please check format';
            }
            if (typeof params.callback === 'function') {
                if (
                    (typeof params.groupId === 'undefined' ||
                        params.groupId === '') &&
                    (typeof params.clientGroupId === 'undefined' ||
                        params.clientGroupId === '')
                ) {
                    params.callback({
                        status: 'error',
                        errorMessage: 'GroupId or clientGroupId required',
                    });
                    return;
                }
                if (
                    (typeof params.name === 'undefined' ||
                        params.name === '') &&
                    (typeof params.imageUrl === 'undefined' ||
                        params.imageUrl === '') &&
                    (!params.users || params.users.length === 0)
                ) {
                    params.callback({
                        status: 'error',
                        errorMessage: 'Group properties required',
                    });
                    return;
                }
                if (params.users && params.users.length > 0) {
                    var users = [];
                    $applozic.each(params.users, function (i, user) {
                        if (
                            user.userId &&
                            typeof user.role !== 'undefined' &&
                            GROUP_ROLE_MAP.indexOf(user.role) !== -1
                        ) {
                            users.push(user);
                        }
                    });
                    if (users.length === 0) {
                        params.callback({
                            status: 'error',
                            errorMessage: 'Incorrect users detail',
                        });
                        return;
                    }
                }
                var users = [];
                $applozic('.mck-group-change-role-box.vis').each(function (
                    i,
                    elm
                ) {
                    var $this = $applozic(this);
                    var newRole = parseInt($this.find('select').val());
                    var role = $this
                        .parents('.mck-li-group-member')
                        .data('role');
                    if (newRole !== role) {
                        var user = {
                            userId: $this
                                .parents('.mck-li-group-member')
                                .data('mck-id'),
                            role: newRole,
                        };
                        users.push(user);
                    }
                });
                params.apzCallback = mckGroupLayout.onUpdateGroupInfo;
                mckGroupService.updateGroupInfo(params);
                return 'success';
            } else {
                return 'Callback function required';
            }
        };
        _this.getMessages = function (params) {
            if (typeof params.callback === 'function') {
                alMessageService.getMessages(params);
            }
        };
        _this.getMessageList = function (params) {
            if (
                typeof params !== 'undefined' &&
                typeof params.callback === 'function'
            ) {
                alMessageService.getMessageList(params, function (message) {
                    if (
                        typeof message.to !== 'undefined' ||
                        typeof message.groupId !== 'undefined'
                    ) {
                        var messageFeed = mckMessageLayout.getMessageFeed(
                            message
                        );
                        messageFeeds.push(messageFeed);
                    }
                });
                return 'success';
            } else {
                return 'Callback function required';
            }
        };
        _this.getMessageListByTopicId = function (params) {
            if (typeof params !== 'object') {
                return 'Unsupported format. Please check format';
            }
            if (typeof params.callback === 'function') {
                if (
                    (typeof params.id === 'undefined' || params.id === '') &&
                    (typeof params.clientGroupId === 'undefined' ||
                        params.clientGroupId === '')
                ) {
                    params.callback({
                        status: 'error',
                        errorMessage: 'Id or clientGroupId required',
                    });
                    return;
                }
                if (params.id && typeof params.isGroup !== 'boolean') {
                    params.callback({
                        status: 'error',
                        errorMessage: 'IsGroup parameter required',
                    });
                    return;
                }
                if (!params.topicId) {
                    params.callback('TopicId required');
                    return;
                }
                if (params.id) {
                    params.tabId = params.id;
                }
                params.topicStatus = CONVERSATION_STATUS_MAP[0];
                var conversationId = MCK_TOPIC_CONVERSATION_MAP[params.topicId];
                if (
                    conversationId &&
                    typeof MCK_CONVERSATION_MAP[conversationId] === 'object'
                ) {
                    params.conversationId = conversationId;
                    alMessageService.getMessageList(params, function (message) {
                        if (
                            typeof message.to !== 'undefined' ||
                            typeof message.groupId !== 'undefined'
                        ) {
                            var messageFeed = mckMessageLayout.getMessageFeed(
                                message
                            );
                            messageFeeds.push(messageFeed);
                        }
                    });
                } else {
                    params.isExtMessageList = true;
                    params.pageSize = 1;
                    alMessageService.fetchConversationByTopicId(
                        params,
                        function (params) {
                            mckMessageService.getMessageList(params);
                        }
                    );
                }
                return 'success';
            } else {
                return 'Callback function required.';
            }
        };
        _this.sendMessage = function (params) {
            if (typeof params === 'object') {
                params = $applozic.extend(
                    true,
                    {},
                    message_default_options,
                    params
                );
                var message = params.message;
                if (!params.to) {
                    return 'To field required';
                }
                if (typeof message === 'undefined' || message === '') {
                    return 'Message field required';
                }
                if (params.type > 12) {
                    return 'Invalid message type';
                }
                message = $applozic.trim(message);
                var messagePxy = {
                    to: $applozic.trim(params.to),
                    type: params.messageType,
                    contentType: params.type,
                    message: message,
                    metadata: params.metadata,
                };
                mckMessageService.sendMessage(messagePxy);
                return 'success';
            } else {
                return 'Unsupported format. Please check format';
            }
        };
        _this.updateUserIdentity = function (params) {
            mckContactService.updateUserIdentity(params);
        };
        _this.updateUser = function (options) {
            mckContactService.updateUser(options);
        };
        _this.getGroupListByFilter = function (options) {
            mckGroupService.getGroupByFilter(options);
        };

        _this.updateMessageMetadata = function (params) {
            mckMessageService.updateMessageMetadata(params);
        };

        _this.sendGroupMessage = function (params) {
            if (typeof params === 'object') {
                params = $applozic.extend(
                    true,
                    {},
                    message_default_options,
                    params
                );
                var message = params.message;
                if (!params.groupId && !params.clientGroupId) {
                    return 'groupId or clientGroupId required';
                }
                if (typeof message === 'undefined' || message === '') {
                    return 'message field required';
                }
                if (params.type > 12) {
                    return 'invalid message type';
                }
                message = $applozic.trim(message);

                var messagePxy = {
                    type: params.messageType,
                    contentType: params.type,
                    message: message,
                    metadata: params.metadata || {},
                };
                $applozic.extend(messagePxy.metadata, {
                    MESSAGE_TEMPLATE: params.messageTemplate,
                });

                if (params.groupId) {
                    messagePxy.groupId = $applozic.trim(params.groupId);
                } else if (params.clientGroupId) {
                    var group = mckGroupUtils.getGroupByClientGroupId(
                        params.clientGroupId
                    );
                    if (typeof group === 'undefined') {
                        return 'group not found';
                    }
                    messagePxy.clientGroupId = $applozic.trim(
                        params.clientGroupId
                    );
                }
                mckMessageService.sendMessage(messagePxy);
                return 'success';
            } else {
                return 'Unsupported format. Please check format';
            }
        };
        _this.addWelcomeMessage = function (params) {
            if (typeof params === 'object') {
                if (
                    typeof params.sender === 'undefined' ||
                    params.sender === ''
                ) {
                    return 'Sender Field Required';
                }
                if (
                    typeof params.messageContent === 'undefined' ||
                    params.messageContent === ''
                ) {
                    return 'Message Content Required';
                }
                mckMessageService.sendWelcomeMessage(params);
            } else {
                return 'Unsupported format. Please check format';
            }
        };
        _this.createGroup = function (params) {
            if (typeof params === 'object') {
                if (typeof params.callback === 'function') {
                    var users = params.users;
                    if (typeof users === 'undefined') {
                        params.callback({
                            status: 'error',
                            errorMessage: 'Users list required',
                        });
                        return;
                    }
                    if (users.length > MCK_GROUPMAXSIZE) {
                        params.callback({
                            status: 'error',
                            errorMessage:
                                'Users limit exceeds ' +
                                MCK_GROUPMAXSIZE +
                                '. Max number of users allowed is ' +
                                MCK_GROUPMAXSIZE +
                                '.',
                        });
                        return;
                    }
                    if (!params.groupName) {
                        params.callback({
                            status: 'error',
                            errorMessage: 'Group name required',
                        });
                        return;
                    }
                    if (
                        typeof params.type === 'undefined' ||
                        params.type === ''
                    ) {
                        params.callback({
                            status: 'error',
                            errorMessage: 'Group type required',
                        });
                        return;
                    }
                    if (GROUP_TYPE_MAP.indexOf(params.type) === -1) {
                        params.callback({
                            status: 'error',
                            errorMessage: 'Invalid group type',
                        });
                        return;
                    }
                    mckMessageService.getGroup(params);
                    return 'success';
                } else {
                    return 'Callback function required';
                }
            } else {
                return 'Unsupported Format. Please check format';
            }
        };

        _this.triggerMsgNotification = function () {
            if (MCK_TRIGGER_MSG_NOTIFICATION_TIMEOUT != 0) {
                MCK_TRIGGER_MSG_NOTIFICATION_PARAM = setTimeout(function () {
                    _this.getLatestConversationForMsgTriggerTimeout();
                }, MCK_TRIGGER_MSG_NOTIFICATION_TIMEOUT);
            }
        };

        _this.getLatestConversationForMsgTriggerTimeout = function () {
            var params = {
                tabId: '',
                isGroup: false,
            };
            snapCommons.setWidgetStateOpen(true);
            mckMessageService.loadMessageList(params, function (data) {
                if (
                    data &&
                    data.groupFeeds &&
                    data.groupFeeds.length !== 0 &&
                    data.message &&
                    data.message.length !== 0
                ) {
                    var latestGroupId = data.groupFeeds[0].id;
                    var latestGroupMessage = data.message.filter(function (
                        item
                    ) {
                        // added this check to get the latest group message from message array if one-to-one user chats are also present for the application
                        return item.groupId == latestGroupId;
                    })[0]; // It returns array of messages for the latestGroupId, so from array we're selecting the latest message for the group
                    latestGroupMessage.type !==
                        SnapConstants.MESSAGE_TYPE.SENT &&
                        mckNotificationService.notifyUser(latestGroupMessage);
                } else {
                    // startConversation function will create a new conversation.
                    var conversationDetail = mckGroupLayout.createGroupDefaultSettings();
                    conversationDetail.isMessage = false;
                    conversationDetail.isInternal = true;
                    Snap.startConversation(conversationDetail);
                }
            });
        };

        _this.initGroupTab = function (params) {
            if (typeof params === 'object') {
                var users = params.users;
                if (typeof users === 'undefined' || users.length < 1) {
                    return 'Users List Required';
                }
                if (users.length > MCK_GROUPMAXSIZE) {
                    return (
                        'Users limit exceeds ' +
                        MCK_GROUPMAXSIZE +
                        '. Max number of users allowed is ' +
                        MCK_GROUPMAXSIZE +
                        '.'
                    );
                }
                if (!params.groupName) {
                    return 'Group name required';
                }
                if (typeof params.type === 'undefined') {
                    return 'Group type required';
                }
                if (GROUP_TYPE_MAP.indexOf(params.type) === -1) {
                    return 'Invalid group type';
                }
                mckMessageService.getGroup(params);
                return 'success';
            } else {
                return 'Unsupported format. Please check format';
            }
        };
        _this.getTotalUnreadCount = function () {
            return MCK_TOTAL_UNREAD_COUNT;
        };
        /**
         * Note: This function should not be called more than one time as it will override the previous values as we're assigning event functions to object keys.
         * Where window.Applozic.ALSocket.events is the object we're referring to in the above scenario.
         */
        _this.subscribeToEvents = function (events, callback) {
            if (!IS_SOCKET_CONNECTED) {
                SUBSCRIBE_TO_EVENTS_BACKUP = events;
                return;
            }
            if (typeof events === 'object') {
                if (typeof events.onConnectFailed === 'function') {
                    window.Applozic.ALSocket.events.onConnectFailed =
                        events.onConnectFailed;
                }
                if (typeof events.onConnect === 'function') {
                    window.Applozic.ALSocket.events.onConnect =
                        events.onConnect;
                }
                if (typeof events.onMessageDelivered === 'function') {
                    window.Applozic.ALSocket.events.onMessageDelivered =
                        events.onMessageDelivered;
                }
                if (typeof events.onMessageRead === 'function') {
                    window.Applozic.ALSocket.events.onMessageRead =
                        events.onMessageRead;
                }
                if (typeof events.onMessageDeleted === 'function') {
                    window.Applozic.ALSocket.events.onMessageDeleted =
                        events.onMessageDeleted;
                }
                if (typeof events.onConversationDeleted === 'function') {
                    window.Applozic.ALSocket.events.onConversationDeleted =
                        events.onConversationDeleted;
                }
                if (typeof events.onUserConnect === 'function') {
                    window.Applozic.ALSocket.events.onUserConnect =
                        events.onUserConnect;
                }
                if (typeof events.onUserDisconnect === 'function') {
                    window.Applozic.ALSocket.events.onUserDisconnect =
                        events.onUserDisconnect;
                }
                if (
                    typeof events.onConversationReadFromOtherSource ===
                    'function'
                ) {
                    window.Applozic.ALSocket.events.onConversationReadFromOtherSource =
                        events.onConversationReadFromOtherSource;
                }
                if (typeof events.onConversationRead === 'function') {
                    window.Applozic.ALSocket.events.onConversationRead =
                        events.onConversationRead;
                }
                if (typeof events.onMessageReceived === 'function') {
                    window.Applozic.ALSocket.events.onMessageReceived =
                        events.onMessageReceived;
                }
                if (typeof events.onMessageSentUpdate === 'function') {
                    window.Applozic.ALSocket.events.onMessageSentUpdate =
                        events.onMessageSentUpdate;
                }
                if (typeof events.onMessageSent === 'function') {
                    window.Applozic.ALSocket.events.onMessageSent =
                        events.onMessageSent;
                }
                if (typeof events.onUserBlocked === 'function') {
                    window.Applozic.ALSocket.events.onUserBlocked =
                        events.onUserBlocked;
                }
                if (typeof events.onUserUnblocked === 'function') {
                    window.Applozic.ALSocket.events.onUserUnblocked =
                        events.onUserUnblocked;
                }
                if (typeof events.onUserActivated === 'function') {
                    window.Applozic.ALSocket.events.onUserActivated =
                        events.onUserActivated;
                }
                if (typeof events.onMessageNotification === 'function') {
                    window.Applozic.ALSocket.events.onMessageNotification =
                        events.onMessageNotification;
                }
                if (typeof events.onUserDeactivated === 'function') {
                    window.Applozic.ALSocket.events.onUserDeactivated =
                        events.onUserDeactivated;
                }
                typeof callback == 'function' && callback();
            }
        };

        _this.getConversation = function (params) {
            alMessageService.getTopicId(
                {
                    conversationId: params.conversationId,
                },
                function (params) {
                    mckMessageLayout.populateMessage(
                        params.messageType,
                        params.message,
                        params.notifyUser
                    );
                }
            );
        };

        _this.initializeSocketConnection = function (isReInit) {
            isReInit
                ? window.Applozic.ALSocket.reconnect()
                : window.Applozic.ALSocket.init(
                      MCK_APP_ID,
                      INIT_APP_DATA,
                      EVENTS
                  );
            // Disconnect open sockets if user has no conversations.
            !CONNECT_SOCKET_ON_WIDGET_CLICK &&
                !MCK_TRIGGER_MSG_NOTIFICATION_TIMEOUT &&
                window.Applozic.SOCKET_DISCONNECT_PROCEDURE.start();
        };
        function MckInit() {
            var _this = this;
            var IS_REINITIALIZE = false;
            var refreshIntervalId, offlineIntervalId;
            var $mck_file_menu = $applozic('#mck-file-menu');
            var $mck_msg_inner = $applozic(
                '#mck-message-cell .mck-message-inner'
            );
            var $mck_tab_individual = $applozic('#mck-tab-individual');
            var MCK_IDLE_TIME_COUNTER = MCK_IDLE_TIME_LIMIT;
            var INITIALIZE_APP_URL = '/v2/tab/initialize.page';
            var FEEDBACK_UPDATE_URL = '/feedback/v2';
            _this.getLauncherHtml = function (isAnonymousChat) {
                var defaultHtml = kmCustomTheme.customSideboxWidget();
                var CHAT_CLOSE_BUTTON = `<div id="km-popup-close-button" aria-label="Close" role="button" class="km-custom-widget-background-color">
                    <svg width="64" xmlns="http://www.w3.org/2000/svg" height="64" viewBox="0 0 64 64">
                        <path fill="#fff" d="M28.941 31.786L.613 60.114a2.014 2.014 0 1 0 2.848 2.849l28.541-28.541 28.541 28.541c.394.394.909.59 1.424.59a2.014 2.014 0 0 0 1.424-3.439L35.064 31.786 63.41 3.438A2.014 2.014 0 1 0 60.562.589L32.003 29.15 3.441.59A2.015 2.015 0 0 0 .593 3.439l28.348 28.347z" stroke-width="6" stroke="#fff"/>
                    </svg>
                </div>`;
                var customLauncherHtml =
                    `<div id="launcher-svg-container" class="vis" style ="white-space: nowrap;">
                ` +
                    CUSTOM_CHAT_LAUNCHER +
                    ` 
                </div>`;
                if (isAnonymousChat) {
                    return (
                        '<a href="#" target="_self" tabindex="0" role="button">' +
                        CHAT_CLOSE_BUTTON +
                        (CUSTOM_CHAT_LAUNCHER
                            ? customLauncherHtml
                            : defaultHtml) +
                        '</a>'
                    );
                } else {
                    return (
                        '<div id="mck-sidebox-launcher" class="mck-sidebox-launcher launchershadow n-vis"><a href="#" target="_self" role="button" tabindex="0" aria-live="polite" class="applozic-launcher">' +
                        CHAT_CLOSE_BUTTON +
                        (CUSTOM_CHAT_LAUNCHER
                            ? customLauncherHtml
                            : defaultHtml) +
                        '<div id="launcher-agent-img-container" class="n-vis"></div></a><div id="applozic-badge-count" class="applozic-badge-count"></div>' +
                        '<div id="mck-msg-preview-visual-indicator" class="mck-msg-preview-visual-indicator-container n-vis">' +
                        '<div class="mck-close-btn-container">' +
                        '<div class="mck-close-btn"><span class="mck-close-icon-svg"><svg viewBox="0 0 64 64" width="8" xmlns="http://www.w3.org/2000/svg" height="8"><path fill="#fff" d="M28.941 31.786L.613 60.114a2.014 2.014 0 1 0 2.848 2.849l28.541-28.541 28.541 28.541c.394.394.909.59 1.424.59a2.014 2.014 0 0 0 1.424-3.439L35.064 31.786 63.41 3.438A2.014 2.014 0 1 0 60.562.589L32.003 29.15 3.441.59A2.015 2.015 0 0 0 .593 3.439l28.348 28.347z"/></svg></span><span class="mck-close-text">Close</span></div></div>' +
                        '<div class="mck-msg-preview-visual-indicator-text  applozic-launcher"></div></div></div>' +
                        Snap.popupChatTemplate.getPopupChatTemplate(
                            MCK_POPUP_WIDGET_CONTENT,
                            WIDGET_SETTINGS
                        ) +
                        '<div id="mck-msg-preview" class="mck-msg-preview applozic-launcher">' +
                        '<div class="mck-row">' +
                        '<div class="blk-lg-3 mck-preview-icon"></div>' +
                        '<div class="blk-lg-9">' +
                        '<div class="mck-row mck-truncate mck-preview-content">' +
                        '<strong class="mck-preview-cont-name"></strong></div>' +
                        '<div class="mck-row mck-preview-content">' +
                        '<div class="mck-preview-msg-content"></div>' +
                        '<div class="mck-preview-file-content mck-msg-text notranslate blk-lg-12 mck-attachment n-vis"></div>' +
                        '</div></div></div><div id="mck-msg-preview-btns" class="n-vis"><button id="mck-vid-call-accept">Accept</button><button id="mck-vid-call-reject">reject</div></div>'
                    );
                }
            };

            _this.initializeApp = function (optns, isReInit) {
                IS_REINITIALIZE = isReInit;
                var userPxy = {
                    applicationId: optns.appId,
                    userId: MCK_USER_ID,
                };
                if (MCK_USER_NAME !== null) {
                    userPxy.displayName = optns.userName;
                }
                if (optns.email !== null) {
                    userPxy.email = optns.email;
                }
                if (MCK_CONTACT_NUMBER !== null) {
                    userPxy.contactNumber = optns.contactNumber;
                }
                if (optns.imageLink) {
                    userPxy.imageLink = optns.imageLink;
                }
                if (optns.appModuleName) {
                    userPxy.appModuleName = optns.appModuleName;
                }
                if (MCK_ACCESS_TOKEN) {
                    userPxy.password = MCK_ACCESS_TOKEN;
                }
                if (
                    AUTHENTICATION_TYPE_ID_MAP.indexOf(
                        MCK_AUTHENTICATION_TYPE_ID
                    ) === -1
                ) {
                    MCK_AUTHENTICATION_TYPE_ID = 0;
                }
                if (IS_RESET_USER_STATUS) {
                    userPxy.resetUserStatus = true;
                }
                if (typeof USER_TYPE_ID == 'number') {
                    userPxy.userTypeId = USER_TYPE_ID;
                }
                if (optns.metadata) {
                    userPxy.metadata = optns.metadata;
                }
                userPxy.enableEncryption = true;
                userPxy.appVersionCode = DEFAULT_ENCRYPTED_APP_VERSION;
                userPxy.deviceType = 0;
                userPxy.authenticationTypeId = MCK_AUTHENTICATION_TYPE_ID;
                userPxy.chatNotificationMailSent = true;
                AUTH_CODE = '';
                window.Applozic.ALApiService.AUTH_TOKEN = null;
                USER_DEVICE_KEY = '';
                if (
                    SnapUtils.getCookie(
                        SnapConstants.COOKIES.IS_USER_ID_FOR_LEAD_COLLECTION
                    ) &&
                    !JSON.parse(
                        SnapUtils.getCookie(
                            SnapConstants.COOKIES.IS_USER_ID_FOR_LEAD_COLLECTION
                        )
                    ) &&
                    KM_ASK_USER_DETAILS &&
                    KM_ASK_USER_DETAILS.length !== 0
                ) {
                    ALStorage.clearMckMessageArray();
                    ALStorage.clearMckContactNameArray();
                    ALStorage.clearAppHeaders();
                }
                var isValidated = _this.validateAppSession(userPxy);
                if (!isValidated) {
                    if (
                        (Array.isArray(KM_ASK_USER_DETAILS) &&
                            KM_ASK_USER_DETAILS.length !== 0) ||
                        KM_PRELEAD_COLLECTION.length !== 0
                    ) {
                        $applozic('#km-userId').val(MCK_USER_ID);
                        if (
                            SnapUtils.getCookie(
                                SnapConstants.COOKIES.SNAP_LOGGED_IN_ID
                            ) &&
                            SnapUtils.getCookie(
                                SnapConstants.COOKIES
                                    .IS_USER_ID_FOR_LEAD_COLLECTION
                            ) &&
                            JSON.parse(
                                SnapUtils.getCookie(
                                    SnapConstants.COOKIES
                                        .IS_USER_ID_FOR_LEAD_COLLECTION
                                )
                            )
                        ) {
                            var userId = SnapUtils.getCookie(
                                SnapConstants.COOKIES.SNAP_LOGGED_IN_ID
                            );
                            var options = {
                                userId: userId,
                                applicationId: MCK_APP_ID,
                                onInit: mckMessageService.loadChat,
                                baseUrl: MCK_BASE_URL,
                                locShare: IS_MCK_LOCSHARE,
                                googleApiKey: MCK_GOOGLE_API_KEY,
                                chatNotificationMailSent: true,
                            };
                            PRE_CHAT_LEAD_COLLECTION_POPUP_ON = false;
                            mckInit.initialize(options);
                            return false;
                        }
                        Snap.popupChatTemplate.getPopupChatTemplate(
                            MCK_POPUP_WIDGET_CONTENT,
                            WIDGET_SETTINGS,
                            true
                        );
                        var kmAnonymousChatLauncher = document.getElementById(
                            'km-anonymous-chat-launcher'
                        );
                        var kmAnonymousChatLauncherClass = document.getElementsByClassName(
                            'km-anonymous-chat-launcher'
                        );
                        var kmChatLoginModal = document.getElementById(
                            'km-chat-login-modal'
                        );

                        if (SNAP_VERSION === 'v2') {
                            WIDGET_POSITION === SnapConstants.POSITION.LEFT
                                ? (kmAnonymousChatLauncher.style.left = '10px')
                                : (kmAnonymousChatLauncher.style.right =
                                      '10px');
                            kmAnonymousChatLauncher.style.bottom = '10px';
                        }

                        $applozic('#km-anonymous-chat-launcher').append(
                            mckInit.getLauncherHtml(true)
                        );
                        _this.addLeadCollectionInputDiv();
                        _this.setLeadCollectionLabels();
                        kmChatLoginModal.style.visibility = 'visible';
                        kmChatLoginModal.style.display = 'none';
                        kmAnonymousChatLauncher.classList.remove('n-vis');
                        kmAnonymousChatLauncher.classList.add('vis');
                        document
                            .getElementById('km-modal-close')
                            .addEventListener(
                                'click',
                                _this.closeLeadCollectionWindow
                            );
                        var popUpCloseButton = document.getElementById(
                            'km-popup-close-button'
                        );
                        popUpCloseButton.addEventListener('click', function () {
                            event.preventDefault();
                            event.stopPropagation();
                            _this.closeLeadCollectionWindow();
                        });
                        for (
                            var i = 0;
                            i < kmAnonymousChatLauncherClass.length;
                            i++
                        ) {
                            kmAnonymousChatLauncherClass[i].addEventListener(
                                'click',
                                function (event) {
                                    event.preventDefault();
                                    if (SNAP_VERSION === 'v2') {
                                        Snap.setDefaultIframeConfigForOpenChat(
                                            POPUP_WIDGET
                                        );
                                        WIDGET_POSITION ===
                                        SnapConstants.POSITION.LEFT
                                            ? (kmAnonymousChatLauncher.style.left =
                                                  '10px')
                                            : (kmAnonymousChatLauncher.style.right =
                                                  '10px');
                                        kmAnonymousChatLauncher.style.bottom =
                                            '10px';
                                        kmChatLoginModal.classList.add(
                                            'km-iframe-sidebox-border-radius'
                                        );
                                        var snapIframe = parent.document.getElementById(
                                            'snap-widget-iframe'
                                        );
                                        !POPUP_WIDGET &&
                                            (snapIframe.style.boxShadow =
                                                '0 1.5rem 2rem rgba(0,0,0,.3)');
                                    }
                                    kmChatLoginModal.style.display = 'block';
                                    !POPUP_WIDGET &&
                                        (kmAnonymousChatLauncher.classList.remove(
                                            'vis'
                                        ),
                                        kmAnonymousChatLauncher.classList.add(
                                            'n-vis'
                                        ));
                                    mckInit.clearMsgTriggerAndChatPopuTimeouts();
                                }
                            );
                        }

                        if (
                            $applozic(
                                '#km-form-chat-login .km-form-group input'
                            ).hasClass('n-vis')
                        ) {
                            $applozic(
                                '#km-form-chat-login .km-form-group .km-form-control.n-vis'
                            ).prop('required', null);
                        }
                        SnapUI.displayPopupChatTemplate(
                            MCK_POPUP_WIDGET_CONTENT,
                            WIDGET_SETTINGS,
                            mckChatPopupNotificationTone
                        );
                    } else {
                        _this.initialize(userPxy);
                    }
                }
            };
            _this.initialize = function (userPxy) {
                window.Applozic.ALApiService.login({
                    data: { alUser: userPxy, baseUrl: MCK_BASE_URL },
                    success: function (result) {
                        if (window.applozic.PRODUCT_ID == 'snap') {
                            //$applozic("#km-chat-login-modal").removeClass('vis').addClass('n-vis');
                            $applozic('#km-chat-login-modal').css(
                                'display',
                                'none'
                            );
                        }
                        ALStorage.clearMckMessageArray();
                        ALStorage.clearMckContactNameArray();
                        if (result === 'INVALID_PASSWORD') {
                            SnapUtils.deleteUserCookiesOnLogout();
                            Snap.displaySnapWidget(false);
                            if (typeof MCK_ON_PLUGIN_INIT === 'function') {
                                MCK_ON_PLUGIN_INIT({
                                    status: 'error',
                                    errorMessage: 'INVALID PASSWORD',
                                });
                            }
                            throw new Error('INVALID_PASSWORD');
                        } else if (result === 'INVALID_APPID') {
                            Snap.displaySnapWidget(false);
                            if (typeof MCK_ON_PLUGIN_INIT === 'function') {
                                MCK_ON_PLUGIN_INIT({
                                    status: 'error',
                                    errorMessage: 'INVALID APPLICATION ID',
                                });
                            }
                            throw new Error('INVALID APPLICATION ID');
                        } else if (
                            result === 'error' ||
                            result === 'USER_NOT_FOUND'
                        ) {
                            Snap.displaySnapWidget(false);
                            if (typeof MCK_ON_PLUGIN_INIT === 'function') {
                                MCK_ON_PLUGIN_INIT({
                                    status: 'error',
                                    errorMessage: 'USER NOT FOUND',
                                });
                            }
                            throw new Error('USER_NOT_FOUND');
                        } else if (result === 'APPMODULE_NOT_FOUND') {
                            Snap.displaySnapWidget(false);
                            if (typeof MCK_ON_PLUGIN_INIT === 'function') {
                                MCK_ON_PLUGIN_INIT({
                                    status: 'error',
                                    errorMessage: 'APPMODULE NOT FOUND',
                                });
                            }
                            throw new Error('APPMODULE_NOT_FOUND');
                        }
                        if (
                            typeof result === 'object' &&
                            result !== null &&
                            result.token
                        ) {
                            result.appId = userPxy.applicationId;
                            if (MCK_ACCESS_TOKEN) {
                                result.accessToken = MCK_ACCESS_TOKEN;
                            }

                            _this.onInitApp(result);
                            // mckUtils.manageIdleTime();
                        } else {
                            Snap.displaySnapWidget(false);
                            if (typeof MCK_ON_PLUGIN_INIT === 'function') {
                                MCK_ON_PLUGIN_INIT({
                                    status: 'error',
                                    errorMessage: 'UNABLE TO PROCESS REQUEST',
                                });
                            }
                            throw new Error('UNABLE TO PROCESS REQUEST');
                        }
                    },
                    error: function () {
                        ALStorage.clearMckMessageArray();
                        Snap.displaySnapWidget(false);
                        if (typeof MCK_ON_PLUGIN_INIT === 'function') {
                            MCK_ON_PLUGIN_INIT({
                                status: 'error',
                                errorMessage: 'UNABLE TO PROCESS REQUEST',
                            });
                        }
                        throw new Error('UNABLE TO PROCESS REQUEST');
                    },
                });
            };

            _this.closeLeadCollectionWindow = function () {
                var kmChatLoginModal = document.getElementById(
                    'km-chat-login-modal'
                );
                var kmAnonymousChatLauncher = document.getElementById(
                    'km-anonymous-chat-launcher'
                );

                if (SNAP_VERSION === 'v2') {
                    var snapIframe = parent.document.getElementById(
                        'snap-widget-iframe'
                    );
                    var popUpcloseButton = document.getElementById(
                        'km-popup-close-button'
                    );
                    snapIframe.style.boxShadow = 'none';
                    POPUP_WIDGET && (popUpcloseButton.style.display = 'none');
                    snapIframe.classList.add('km-iframe-closed');
                    snapIframe.classList.remove(
                        'snap-iframe-enable-media-query'
                    );
                    snapIframe.classList.remove(
                        'km-iframe-dimension-with-popup'
                    );
                    snapIframe.classList.remove('km-iframe-dimension-no-popup');
                }
                kmChatLoginModal.style.display = 'none';
                kmAnonymousChatLauncher.classList.remove('n-vis');
                kmAnonymousChatLauncher.classList.add('vis');
            };

            _this.onInitApp = function (data) {
                INIT_APP_DATA = data;
                var $mck_sidebox = $applozic('#mck-sidebox');
                _this.appendLauncher();
                _this.setLabels();
                if (SNAP_VERSION === 'v2') {
                    _this.configureIframe();
                    _this.restrictScrollOnHandHeldDevices();
                }
                $applozic('.applozic-launcher').each(function () {
                    if (!$applozic(this).hasClass('mck-msg-preview')) {
                        $applozic(this).show();
                    }
                });
                MCK_TOKEN = data.token;
                MCK_USER_ID = data.userId;
                USER_COUNTRY_CODE = data.countryCode;
                USER_DEVICE_KEY = data.deviceKey;
                MCK_WEBSOCKET_URL = data.websocketUrl;
                MCK_WEBSOCKET_PORT = data.websocketPort;
                MCK_IDLE_TIME_LIMIT = data.websocketIdleTimeLimit;
                MCK_USER_TIMEZONEOFFSET = data.timeZoneOffset;
                MCK_FILE_URL = data.fileBaseUrl;
                IS_MCK_USER_DEACTIVATED = data.deactivated;
                // For trial plan connect to socket only when someone opens the chat or have some existing chat thread
                CONNECT_SOCKET_ON_WIDGET_CLICK == null &&
                    (CONNECT_SOCKET_ON_WIDGET_CLICK = snapCommons.isTrialPlan(
                        data.pricingPackage
                    ));
                AUTH_CODE = btoa(data.userId + ':' + data.deviceKey);
                window.Applozic.ALApiService.AUTH_TOKEN = data.authToken;
                window.Applozic.ALApiService.setAjaxHeaders(
                    AUTH_CODE,
                    MCK_APP_ID,
                    USER_DEVICE_KEY,
                    MCK_ACCESS_TOKEN,
                    MCK_APP_MODULE_NAME
                );
                window.Applozic.ALApiService.setEncryptionKeys(
                    data.encryptionKey,
                    data.userEncryptionKey
                );
                USER_ENCRYPTION_KEY = data.userEncryptionKey;
                if (!EMOJI_LIBRARY) {
                    // EMOJI_LIBRARY = false ->hide emoticon from chat widget
                    //Below code might be required once emoticons are added
                    /*document.getElementById('mck-textbox-container').getElementsByTagName('div')[0].setAttribute('class', 'n-vis');
                    document.getElementById('mck-text-box').classList.add('mck-text-box-width-increase');*/
                } else {
                    // EMOJI_LIBRARY = true -> if we want to include the emoticons and the emoticon library
                    document
                        .getElementById('mck-btn-smiley-box')
                        .classList.remove('n-vis');
                    mckMessageLayout.initEmojis();
                }

                MCK_TOTAL_UNREAD_COUNT = data.totalUnreadCount;
                mckUtils.badgeCountOnLaucher(
                    MCK_ENABLE_BADGE_COUNT,
                    MCK_TOTAL_UNREAD_COUNT
                );
                MCK_CONNECTED_CLIENT_COUNT = data.connectedClientCount;
                if (
                    !IS_MCK_VISITOR &&
                    MCK_USER_ID !== 'guest' &&
                    MCK_USER_ID !== '0' &&
                    MCK_USER_ID !== 'C0'
                ) {
                    if (CONNECT_SOCKET_ON_WIDGET_CLICK) {
                        mckUserUtils.checkIfUserHasConversations(
                            null,
                            function (err, checkIfUserHasConversations) {
                                err && console.log(err);
                                checkIfUserHasConversations &&
                                    $applozic.fn.applozic(
                                        'initializeSocketConnection',
                                        IS_REINITIALIZE
                                    );
                            }
                        );
                    } else {
                        $applozic.fn.applozic(
                            'initializeSocketConnection',
                            IS_REINITIALIZE
                        );
                    }
                    // mckGroupService.loadGroups();
                }
                $applozic.ajaxPrefilter(function (options) {
                    if (
                        !options.beforeSend &&
                        options.url.indexOf(MCK_BASE_URL) !== -1
                    ) {
                        // _this.manageIdleTime();
                        options.beforeSend = function (jqXHR) {
                            window.Applozic.ALApiService.addRequestHeaders(
                                jqXHR
                            );
                        };
                    }
                });

                var mckContactNameArray = ALStorage.getMckContactNameArray();
                if (
                    mckContactNameArray !== null &&
                    mckContactNameArray.length > 0
                ) {
                    for (var i = 0; i < mckContactNameArray.length; i++) {
                        var nameMap = mckContactNameArray[i];
                        if (nameMap !== null) {
                            MCK_CONTACT_NAME_MAP[nameMap[0]] = nameMap[1];
                        }
                    }
                }
                mckUserUtils.checkUserConnectedStatus();
                mckInit.tabFocused();
                w.addEventListener('online', function () {
                    console.log('online');
                    snapCommons.modifyClassList(
                        { id: ['km-internet-disconnect-msg'] },
                        'n-vis',
                        'vis'
                    );
                    window.Applozic.ALSocket.reconnect();
                });
                w.addEventListener('offline', function () {
                    snapCommons.modifyClassList(
                        { id: ['km-internet-disconnect-msg'] },
                        'vis',
                        'n-vis'
                    );
                    console.log('offline');
                });
                if (
                    $mckChatLauncherIcon.length > 0 &&
                    MCK_TOTAL_UNREAD_COUNT > 0
                ) {
                    $mckChatLauncherIcon.html(MCK_TOTAL_UNREAD_COUNT);
                }
                if (IS_LAUNCH_ON_UNREAD_MESSAGE_ENABLED) {
                    mckMessageService.loadMessageList({
                        tabId: '',
                        isGroup: false,
                        isLaunch: true,
                    });
                }
                alFileService.init(data);
                alNotificationService.subscribeToServiceWorker();
                ALStorage.setAppHeaders(data);

                if (
                    (KM_ASK_USER_DETAILS && KM_ASK_USER_DETAILS.length !== 0) ||
                    (KM_PRELEAD_COLLECTION &&
                        KM_PRELEAD_COLLECTION.length !== 0)
                ) {
                    PRE_CHAT_LEAD_COLLECTION_POPUP_ON &&
                        $applozic.fn.applozic('mckLaunchSideboxChat');
                    !PRE_CHAT_LEAD_COLLECTION_POPUP_ON &&
                        SnapUI.displayPopupChatTemplate(
                            MCK_POPUP_WIDGET_CONTENT,
                            WIDGET_SETTINGS,
                            mckChatPopupNotificationTone
                        );
                } else {
                    $applozic.fn.applozic('triggerMsgNotification');
                    !MCK_TRIGGER_MSG_NOTIFICATION_TIMEOUT &&
                        SnapUI.displayPopupChatTemplate(
                            MCK_POPUP_WIDGET_CONTENT,
                            WIDGET_SETTINGS,
                            mckChatPopupNotificationTone
                        );
                    if ($mck_sidebox.css('display') === 'block') {
                        mckInit.clearMsgTriggerAndChatPopuTimeouts();
                    }
                }

                Snap.initilizeEventListners();
                var activeConversationInfo = SnapUtils.getItemFromLocalStorage(
                    'mckActiveConversationInfo'
                );

                // Calling "loadMessageList" with empty parameters to get the count of the total conversations to show the back button if
                // Single Threaded Conversations settings (isSingleThreaded) is enabled.
                if (
                    MCK_MAINTAIN_ACTIVE_CONVERSATION_STATE &&
                    WIDGET_SETTINGS &&
                    WIDGET_SETTINGS.isSingleThreaded
                ) {
                    mckMessageService.loadMessageList(
                        {
                            tabId: '',
                            isGroup: false,
                        },
                        function (data) {
                            SnapUI.checkSingleThreadedConversationSettings(
                                data &&
                                    data.groupFeeds &&
                                    data.groupFeeds.length > 1
                            );
                        }
                    );
                } else {
                    SnapUI.checkSingleThreadedConversationSettings();
                }

                MCK_MAINTAIN_ACTIVE_CONVERSATION_STATE &&
                    SnapUtils.isActiveConversationNeedsToBeOpened(
                        activeConversationInfo,
                        data
                    ) &&
                    Snap.openConversation(activeConversationInfo.groupId);
                MCK_MAINTAIN_ACTIVE_CONVERSATION_STATE &&
                    !SnapUtils.isActiveConversationNeedsToBeOpened(
                        activeConversationInfo,
                        data
                    ) &&
                    SnapUtils.removeItemFromLocalStorage(
                        'mckActiveConversationInfo'
                    );

                // dispatch an event "kmInitilized".
                //w.dispatchEvent(new CustomEvent("kmInitilized",{detail:data,bubbles: true,cancelable: true}));
                SnapUtils.triggerCustomEvent(
                    'kmInitilized',
                    { detail: data, bubbles: true, cancelable: true },
                    SNAP_VERSION
                );

                if (typeof MCK_ON_PLUGIN_INIT === 'function') {
                    // callback when plugin initilized successfully.
                    MCK_ON_PLUGIN_INIT('success', data);
                }

                var kmChatLoginModal = document.getElementById(
                    'km-chat-login-modal'
                );
                kmChatLoginModal.style.visibility = 'hidden';
            };

            _this.loadDataPostInitialization = function () {
                IS_PLUGIN_INITIALIZATION_PROCESS_COMPLETED = true;
                var data = INIT_APP_DATA;
                // calling Snap for post initialization processing. error first style.
                Snap.postPluginInitialization(null, data);
                mckMessageLayout.createContactWithDetail({
                    userId: MCK_USER_ID,
                    displayName: data.displayName,
                    photoLink: data.imageLink,
                });
                // Showing powered by snap for all, will be removed incase of white label enterprises.
                var showPoweredBy = snapCommons.showPoweredBy(data);
                if (showPoweredBy) {
                    var snapIframe = parent.document.getElementById(
                        'snap-widget-iframe'
                    );
                    var utmSourceUrl = snapIframe
                        ? snapIframe.getAttribute('data-url') ||
                          parent.window.location.href
                        : w.location.href;
                    var poweredByUrl =
                        'https://www.snap.io/poweredby?utm_source=' +
                        utmSourceUrl +
                        '&utm_medium=webplugin&utm_campaign=poweredby';
                    $applozic('.mck-running-on a').attr('href', poweredByUrl);
                    if (MCK_CUSTOM_BRANDING) {
                        document.querySelector(
                            '.mck-running-on'
                        ).innerHTML = MCK_CUSTOM_BRANDING;
                    }
                    $applozic('.mck-running-on')
                        .removeClass('n-vis')
                        .addClass('vis');
                }
                _this.setEmojiHoverText();
                _this.configureRatingElements();
            };

            _this.validateAppSession = function (userPxy) {
                mckGroupLayout.init();
                mckMessageLayout.init();
                var appHeaders = ALStorage.getAppHeaders();
                if (appHeaders && appHeaders.userId) {
                    if (
                        userPxy.applicationId === appHeaders.appId &&
                        userPxy.userId === appHeaders.userId &&
                        userPxy.password === MCK_ACCESS_TOKEN
                    ) {
                        PRE_CHAT_LEAD_COLLECTION_POPUP_ON = !(
                            KM_ASK_USER_DETAILS !== 0
                        );
                        _this.onInitApp(appHeaders);
                        return true;
                    }
                    ALStorage.clearAppHeaders();
                    return false;
                } else {
                    return false;
                }
            };

            _this.configurePopupWidget = function () {
                !snapCommons.checkIfDeviceIsHandheld() &&
                    snapCommons.modifyClassList(
                        { id: ['mck-sidebox'] },
                        'popup-enabled',
                        ''
                    );
            };

            _this.configureIframe = function () {
                // update sidebox css for snap v2 version
                var chatbox = document.getElementById('mck-sidebox-launcher');
                var snapIframe = parent.document.getElementById(
                    'snap-widget-iframe'
                );

                if (WIDGET_POSITION === SnapConstants.POSITION.LEFT) {
                    chatbox.style.left = '10px';
                    snapIframe.classList.add('align-left');
                    snapCommons.modifyClassList(
                        { id: ['mck-sidebox'] },
                        'align-left'
                    );
                } else {
                    chatbox.style.right = '10px';
                }

                chatbox.style.bottom = '10px';
                document
                    .getElementById('mck-sidebox')
                    .classList.add('km-iframe-sidebox-border-radius');

                var badgeCount = document.getElementById(
                    'applozic-badge-count'
                );
                badgeCount.classList.add('km-iframe-badge-count');

                // handle click events for openning and closing of sidebox
                snapIframe.style.display = 'block';
                var popUpcloseButton = document.getElementById(
                    'km-popup-close-button'
                );
                chatbox.addEventListener('click', function () {
                    snapCommons.setWidgetStateOpen(true);
                    snapIframe.classList.remove('km-iframe-closed');
                    snapIframe.classList.add('snap-iframe-enable-media-query');
                    snapCommons.modifyClassList(
                        { id: ['applozic-badge-count'] },
                        'n-vis',
                        ''
                    );
                    snapIframe.style.width = '';
                    POPUP_WIDGET
                        ? (snapIframe.classList.add(
                              'km-iframe-dimension-with-popup'
                          ),
                          (popUpcloseButton.style.display = 'flex'))
                        : snapIframe.classList.add(
                              'km-iframe-dimension-no-popup'
                          );
                    POPUP_WIDGET && _this.configurePopupWidget();
                });
                var closeButton = document.getElementById(
                    'km-chat-widget-close-button'
                );
                function closeChatBox() {
                    snapCommons.setWidgetStateOpen(false);
                    mckMessageService.closeSideBox();
                    popUpcloseButton.style.display = 'none';
                    snapIframe.classList.add('km-iframe-closed');
                    snapIframe.classList.remove(
                        'snap-iframe-enable-media-query'
                    );
                    snapIframe.classList.remove(
                        'km-iframe-dimension-with-popup'
                    );
                    snapIframe.classList.remove('km-iframe-dimension-no-popup');
                    snapCommons.modifyClassList(
                        { id: ['applozic-badge-count'] },
                        '',
                        'n-vis'
                    );
                    snapCommons.modifyClassList(
                        { id: ['quick-reply-container'] },
                        'n-vis',
                        'vis'
                    );
                }
                closeButton.addEventListener('click', closeChatBox);
                popUpcloseButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeChatBox();
                });

                var iframeMedia = parent.window.matchMedia(
                    '(max-width: 600px)'
                );
                iframeMedia.addListener(function () {
                    if (iframeMedia.matches) {
                        // If media query matches
                        document
                            .getElementById('mck-sidebox')
                            .classList.remove(
                                'km-iframe-sidebox-border-radius'
                            );
                    } else {
                        document
                            .getElementById('mck-sidebox')
                            .classList.add('km-iframe-sidebox-border-radius');
                    }
                });
            };

            _this.restrictScrollOnHandHeldDevices = function () {
                var sideboxLauncher = document.getElementById(
                    'mck-sidebox-launcher'
                );
                var sideboxCloseButton = document.getElementById(
                    'km-chat-widget-close-button'
                );
                var parentBody = parent && parent.document.body;
                var parentHead = parent && parent.document.head;
                var parentHtmlTag =
                    parent && parent.document.getElementsByTagName('html')[0];

                sideboxLauncher.addEventListener('click', function () {
                    snapCommons.checkIfDeviceIsHandheld() &&
                        (parentBody &&
                            parentBody.classList.add('mck-restrict-scroll'),
                        parentHtmlTag &&
                            parentHtmlTag.classList.add('mck-restrict-scroll'));
                });
                sideboxCloseButton.addEventListener('click', function () {
                    snapCommons.checkIfDeviceIsHandheld() &&
                        (parentBody &&
                            parentBody.classList.remove('mck-restrict-scroll'),
                        parentHtmlTag &&
                            parentHtmlTag.classList.remove(
                                'mck-restrict-scroll'
                            ));
                });
            };
            _this.configureRatingElements = function () {
                var ratingSmilies = document.getElementsByClassName(
                    'mck-rating-box'
                );
                var sendFeedbackComment = document.getElementById(
                    'mck-submit-comment'
                );
                var restartConversation = document.getElementById(
                    'mck-restart-conversation'
                );
                var feedbackObject = {
                    groupId: 0,
                    comments: [],
                    rating: 0,
                };

                restartConversation.addEventListener('click', function () {
                    SnapUI.showClosedConversationBanner(false);
                    SnapUI.isConvJustResolved = false;
                });

                sendFeedbackComment.addEventListener('click', function () {
                    feedbackObject = {
                        groupId: 0,
                        comments: [],
                        rating: 0,
                    };
                    var comment = document.getElementById(
                        'mck-feedback-comment'
                    );
                    sendFeedbackComment.setAttribute('disabled', 'true');
                    comment &&
                        comment.value.trim() &&
                        (feedbackObject.comments = [comment.value]);
                    feedbackObject.rating = parseInt(
                        document
                            .querySelector('.mck-rating-box.selected')
                            .getAttribute('data-rating')
                    );
                    feedbackObject.groupId =
                        CURRENT_GROUP_DATA && CURRENT_GROUP_DATA.tabId;
                    feedbackObject.supportAgentName =
                        CURRENT_GROUP_DATA &&
                        CURRENT_GROUP_DATA.conversationAssignee;
                    feedbackObject.applicationId = MCK_APP_ID;
                    var LOGGED_IN_USER =
                        alUserService.MCK_USER_DETAIL_MAP[MCK_USER_ID];
                    feedbackObject.userInfo = {
                        name: LOGGED_IN_USER.userName,
                        userId: MCK_USER_ID,
                        email: LOGGED_IN_USER.email,
                    };
                    _this.sendFeedback(feedbackObject);
                });
                for (var i = 0; i < ratingSmilies.length; i++) {
                    ratingSmilies[i].addEventListener('click', function (e) {
                        snapCommons.modifyClassList(
                            { id: ['csat-2'] },
                            '',
                            'n-vis'
                        );
                        snapCommons.modifyClassList(
                            { id: ['mck-rate-conversation'] },
                            'n-vis',
                            ''
                        );
                        snapCommons.modifyClassList(
                            { class: ['mck-rating-box'] },
                            '',
                            'selected'
                        );
                        snapCommons.modifyClassList(
                            { class: ['mck-feedback-text-wrapper'] },
                            '',
                            'n-vis'
                        );
                        e.currentTarget.classList.add('selected');
                    });
                }
            };
            _this.sendFeedback = function (feedbackData) {
                mckUtils.ajax({
                    type: 'POST',
                    url:
                        Snap.getBaseUrl() +
                        FEEDBACK_UPDATE_URL +
                        '?sendAsMessage=true',
                    global: false,
                    data: JSON.stringify(feedbackData),
                    contentType: 'application/json',
                    success: function (result) {
                        if (result && result.data) {
                            CURRENT_GROUP_DATA.currentGroupFeedback =
                                result.data.data;
                            SnapUI.showClosedConversationBanner(true);
                            document.getElementById(
                                'mck-feedback-comment'
                            ).value = '';
                            snapCommons.modifyClassList(
                                { class: ['mck-feedback-text-wrapper'] },
                                'n-vis',
                                ''
                            );
                        }
                    },
                    error: function () {
                        console.log('Error submitting feedback');
                    },
                });
            };
            _this.getPreLeadDataForAskUserDetail = function () {
                var LEAD_COLLECTION_LABEL = MCK_LABELS['lead.collection'];
                var KM_USER_DETAIL_TYPE_MAP = {
                    email: 'email',
                    phone: 'number',
                };
                var preLeadCollection = KM_PRELEAD_COLLECTION;
                if (KM_ASK_USER_DETAILS && preLeadCollection.length === 0) {
                    for (var i = 0; i < KM_ASK_USER_DETAILS.length; i++) {
                        var obj = {};
                        obj['field'] = KM_ASK_USER_DETAILS[i];
                        obj['type'] =
                            KM_USER_DETAIL_TYPE_MAP[KM_ASK_USER_DETAILS[i]] ||
                            'text';
                        obj['placeholder'] =
                            LEAD_COLLECTION_LABEL[KM_ASK_USER_DETAILS[i]] || '';
                        obj['required'] = true;
                        KM_PRELEAD_COLLECTION.push(obj);
                    }
                }
            };
            _this.addLeadCollectionInputDiv = function () {
                KM_ASK_USER_DETAILS && _this.getPreLeadDataForAskUserDetail();
                for (var i = 0; i < KM_PRELEAD_COLLECTION.length; i++) {
                    //Create dynamic input field
                    var preLeadCollection = KM_PRELEAD_COLLECTION[i];
                    var kmChatInputDiv = document.createElement('div');
                    var preLeadCollectionClass =
                        'km-form-control ' +
                        (preLeadCollection.element === 'textarea'
                            ? 'mck-preleadcollection-textarea'
                            : 'km-input-width');
                    kmChatInputDiv.setAttribute(
                        'class',
                        'km-form-group km-form-group-container'
                    );
                    var kmChatInput = document.createElement(
                        preLeadCollection.element || 'input'
                    );
                    kmChatInput.setAttribute(
                        'id',
                        'km-' + preLeadCollection.field.toLowerCase()
                    );
                    kmChatInput.setAttribute(
                        'name',
                        'km-' + preLeadCollection.field.toLowerCase()
                    );
                    preLeadCollection.required &&
                        kmChatInput.setAttribute(
                            'required',
                            preLeadCollection.required
                        );
                    kmChatInput.setAttribute('class', preLeadCollectionClass);
                    if (
                        preLeadCollection.element == 'select' &&
                        preLeadCollection.options &&
                        mckMessageService.checkArray(preLeadCollection.options)
                    ) {
                        kmChatInput = _this.createSelectFieldDropdown(
                            preLeadCollection.options,
                            kmChatInput
                        );
                    } else {
                        kmChatInput.setAttribute(
                            'type',
                            preLeadCollection.type || 'text'
                        );
                        kmChatInput.setAttribute(
                            'placeholder',
                            preLeadCollection.placeholder || ''
                        );
                        kmChatInput.setAttribute(
                            'aria-label',
                            preLeadCollection.field
                        );
                    }
                    $applozic(kmChatInputDiv).append(kmChatInput);
                    $applozic('.km-last-child').append(kmChatInputDiv);
                }
                var phoneField = document.getElementById('km-phone');
                if (phoneField !== null) {
                    phoneField.addEventListener(
                        'keydown',
                        _this.phoneNumberValidation
                    );
                }
            };
            _this.phoneNumberValidation = function (e) {
                e.target.value = e.target.value.match(/^([0-9]{0,15})/)[0];
            };

            _this.createSelectFieldDropdown = function (
                options,
                selectElement
            ) {
                var dropDownOption = document.createElement('option');
                dropDownOption.setAttribute('value', '');
                dropDownOption.textContent =
                    MCK_LABELS['lead.collection'].option +
                    ' ' +
                    selectElement
                        .getAttribute('name')
                        .toLowerCase()
                        .split('-')[1];
                selectElement.appendChild(dropDownOption);
                options.forEach(function (element) {
                    if (snapCommons.isObject(element)) {
                        dropDownOption = document.createElement('option');
                        dropDownOption.setAttribute('value', element.value);
                        dropDownOption.textContent =
                            element.value.charAt(0).toUpperCase() +
                            element.value.slice(1);
                        selectElement.appendChild(dropDownOption);
                    } else {
                        console.error(
                            'Expected object inside options array but got ' +
                                typeof element
                        );
                    }
                });
                return selectElement;
            };
            _this.setLeadCollectionLabels = function () {
                var LEAD_COLLECTION_LABEL = MCK_LABELS['lead.collection'];
                var submitLogin = document.getElementById(
                    'km-submit-chat-login'
                );
                var leadCollectionHeading = document.getElementById(
                    'km-lead-collection-heading'
                );
                var tabTitle = document.getElementById('km-tab-title');
                submitLogin.innerHTML = LEAD_COLLECTION_LABEL.submit;
                submitLogin.setAttribute(
                    'aria-label',
                    LEAD_COLLECTION_LABEL.submit
                );
                leadCollectionHeading.innerHTML = appOptions.preLeadCollection
                    ? LEAD_COLLECTION_LABEL.heading
                    : appOptions.appSettings.chatWidget.preChatGreetingMsg ||
                      '';
                leadCollectionHeading.setAttribute(
                    'aria-label',
                    LEAD_COLLECTION_LABEL.heading
                );
                tabTitle.innerHTML = LEAD_COLLECTION_LABEL.title;
                tabTitle.setAttribute(
                    'aria-label',
                    LEAD_COLLECTION_LABEL.title
                );
            };
            _this.setEmojiHoverText = function () {
                var ratingList = document.getElementsByClassName(
                    'mck-rating-box'
                );
                var ratingListLength = ratingList && ratingList.length;
                if (ratingListLength) {
                    for (var a = 0; a < ratingListLength; a++) {
                        var ratingElement = ratingList[a];
                        var dateSpan = document.createElement('div');
                        dateSpan.innerHTML =
                            RATING_EMOJI_HOVER_TEXT_MAP[
                                ratingElement.dataset.rating
                            ];
                        ratingElement.appendChild(dateSpan);
                    }
                }
            };
            _this.setLabels = function () {
                $applozic('#mck-conversation-title')
                    .html(MCK_LABELS['conversations.title'])
                    .attr('title', MCK_LABELS['conversations.title']);
                $applozic('#mck-msg-new, #mck-sidebox-search .mck-box-title')
                    .html(MCK_LABELS['start.new'])
                    .attr('title', MCK_LABELS['start.new']);
                $applozic('#mck-contact-search-tab strong')
                    .html(MCK_LABELS['search.contacts'])
                    .attr('title', MCK_LABELS['search.contacts']);
                $applozic('#mck-group-search-tab strong')
                    .html(MCK_LABELS['search.groups'])
                    .attr('title', MCK_LABELS['search.groups']);
                $applozic(
                    '#mck-contact-search-input, #mck-group-search-input, #mck-group-member-search'
                ).attr('placeholder', MCK_LABELS['search.placeholder']);
                $applozic('#mck-loc-address').attr(
                    'placeholder',
                    MCK_LABELS['location.placeholder']
                );
                // $applozic('#mck-no-conversations').html(MCK_LABELS['empty.conversations']);
                // $applozic('#mck-no-messages').html(MCK_LABELS['empty.messages']);
                // $applozic('#mck-no-more-conversations').html(MCK_LABELS['no.more.conversations']);
                // $applozic('#mck-no-more-messages').html(MCK_LABELS['no.more.messages']);
                $applozic('#mck-no-search-contacts').html(
                    MCK_LABELS['empty.contacts']
                );
                $applozic('#mck-no-search-groups').html(
                    MCK_LABELS['empty.groups']
                );
                $applozic(
                    '#mck-new-group, #mck-group-create-tab .mck-box-title, #mck-btn-group-create'
                )
                    .html(MCK_LABELS['create.group.title'])
                    .attr('title', MCK_LABELS['create.group.title']);
                $applozic('#mck-gc-overlay-label').html(
                    MCK_LABELS['add.group.icon']
                );
                $applozic('#mck-msg-error').html(MCK_LABELS['group.deleted']);
                $applozic('#mck-gc-title-label').html(
                    MCK_LABELS['group.title']
                );
                $applozic('#mck-gc-type-label').html(MCK_LABELS['group.type']);
                $applozic(
                    '#mck-group-info-btn, #mck-group-info-tab .mck-box-title'
                )
                    .html(MCK_LABELS['group.info.title'])
                    .attr('title', MCK_LABELS['group.info.title']);
                $applozic('#mck-gi-overlay-label').html(
                    MCK_LABELS['change.group.icon']
                );
                $applozic('#mck-group-member-title')
                    .html(MCK_LABELS['members.title'])
                    .attr('title', MCK_LABELS['members.title']);
                $applozic(
                    '#mck-group-add-member .blk-lg-9, #mck-gm-search-box .mck-box-title'
                )
                    .html(MCK_LABELS['add.members.title'])
                    .attr('title', MCK_LABELS['add.members.title']);
                $applozic('#mck-btn-group-update')
                    .html(MCK_LABELS['group.info.update'])
                    .attr('title', MCK_LABELS['group.info.update']);
                $applozic('#mck-btn-leave-group, #mck-btn-group-exit')
                    .html(MCK_LABELS['exit.group'])
                    .attr('title', MCK_LABELS['exit.group']);
                $applozic('#mck-typing-label').html(MCK_LABELS['typing']);
                $applozic('#mck-btn-clear-messages')
                    .html(MCK_LABELS['clear.messages'])
                    .attr('title', MCK_LABELS['clear.messages']);
                $applozic('#mck-block-button')
                    .html(MCK_LABELS['block.user'])
                    .attr('title', MCK_LABELS['block.user']);
                $applozic('#mck-loc-box .mck-box-title, #mck-share-loc-label')
                    .html(MCK_LABELS['location.share.title'])
                    .attr('title', MCK_LABELS['location.share.title']);
                $applozic('#mck-btn-loc').attr(
                    'title',
                    MCK_LABELS['location.share.title']
                );
                $applozic('#mck-file-up-label').html(
                    MCK_LABELS['file.attachment']
                );
                $applozic('#mck-file-up').attr(
                    'title',
                    MCK_LABELS['file.attachment']
                );
                $applozic('.mck-file-attach-label').attr(
                    'title',
                    MCK_LABELS['file.attach.title']
                );
                $applozic('#mck-my-loc')
                    .html(MCK_LABELS['my.location'])
                    .attr('title', MCK_LABELS['my.location']);
                $applozic('#mck-btn-close-loc-box')
                    .html(MCK_LABELS['close'])
                    .attr('title', MCK_LABELS['close']);
                $applozic('#mck-loc-submit')
                    .html(MCK_LABELS['send'])
                    .attr('title', MCK_LABELS['send']);
                $applozic('#mck-msg-sbmt').attr(
                    'title',
                    MCK_LABELS['send.message']
                );
                $applozic('#mck-btn-smiley').attr(
                    'title',
                    MCK_LABELS['smiley']
                );
                $applozic('#mck-group-name-save').attr(
                    'title',
                    MCK_LABELS['save']
                );
                $applozic('#mck-btn-group-icon-save').attr(
                    'title',
                    MCK_LABELS['save']
                );
                $applozic('#mck-group-name-edit').attr(
                    'title',
                    MCK_LABELS['edit']
                );
                /* Uncomment lines below to set default input placeholder */

                // document.getElementById('mck-text-box').dataset.text =
                //     MCK_LABELS['input.message'];
                document.getElementById('mck-char-warning-text').innerHTML =
                    MCK_LABELS['char.limit.warn'];
                document
                    .getElementById('km-faq-search-input')
                    .setAttribute('placeholder', MCK_LABELS['search.faq']);
                document.getElementById('mck-no-faq-found').innerHTML =
                    MCK_LABELS['looking.for.something.else'];
                document.getElementById(
                    'km-internet-disconnect-msg'
                ).innerHTML = MCK_LABELS['offline.msg'];
                document.getElementById('talk-to-human-link').innerHTML =
                    MCK_LABELS['talk.to.agent'];
                document.getElementById('mck-collect-email').innerHTML =
                    MCK_LABELS['how.to.reachout'];
                document.getElementById('mck-email-error-alert').innerHTML =
                    MCK_LABELS['email.error.alert'];
                document.getElementById('mck-rated-text').innerHTML =
                    MCK_LABELS['csat.rating'].CONVERSATION_RATED;
                document.getElementById('mck-rate-conversation').innerHTML =
                    MCK_LABELS['csat.rating'].RATE_CONVERSATION;
                document.getElementById('mck-other-queries').innerHTML =
                    MCK_LABELS['csat.rating'].OTHER_QUERIES;
                document.getElementById('mck-restart-conversation').innerHTML =
                    MCK_LABELS['csat.rating'].RESTART_CONVERSATION;
                document
                    .getElementById('mck-feedback-comment')
                    .setAttribute(
                        'placeholder',
                        MCK_LABELS['csat.rating']
                            .CONVERSATION_REVIEW_PLACEHOLDER
                    );
                document.getElementById('mck-submit-comment').innerHTML =
                    MCK_LABELS['csat.rating'].SUBMIT_RATING;
                document.getElementById('wq-msg-first-Part').innerHTML =
                    MCK_LABELS['waiting.queue.message']['first.Part'];
                // document.getElementById('waiting-queue-number').innerHTML = MCK_LABELS['waiting.queue.message']['waiting.queue.number'];
                document.getElementById('wq-msg-last-part').innerHTML =
                    MCK_LABELS['waiting.queue.message']['last.part'];
                document.getElementById('km-csat-trigger-text').innerText =
                    MCK_LABELS['conversation.header.dropdown'].CSAT_RATING_TEXT;
            };
            $applozic(d).on('click', '.fancybox-snap', function (e) {
                e.preventDefault();
                var $this = $applozic(this);
                var href = $this.data('url');
                var title = snapCommons.formatHtmlTag($this.data('name'));
                if (href === '') {
                    var key;
                    key = $this.data('blobkey');
                    alFileService.generateCloudUrl(key, function (result) {
                        href = result;
                    });
                }
                // Get the modal
                var modal = parent.document.getElementById(
                    'km-fullscreen-image-modal'
                );
                var modalImg = parent.document.getElementById(
                    'km-fullscreen-image-modal-content'
                );
                var captionText = parent.document.getElementById(
                    'km-fullscreen-image-modal-caption'
                );
                modal.style.display = 'block';
                modalImg.src = href;
                captionText.innerHTML = title ? title : '';
            });

            parent.document.getElementById(
                'km-fullscreen-image-modal-close'
            ).onclick = function () {
                parent.document.getElementById(
                    'km-fullscreen-image-modal'
                ).style.display = 'none';
            };

            $applozic(w).on('resize', function () {
                if ($mck_file_menu.css('display') === 'block') {
                    mckMapLayout.fileMenuReposition();
                }
                if ($mck_msg_inner.find('.mck-contact-list').length === 0) {
                    var scrollHeight = $mck_msg_inner.get(0).scrollHeight;
                    if ($mck_msg_inner.height() < scrollHeight) {
                        $mck_msg_inner.animate(
                            {
                                scrollTop: $mck_msg_inner.prop('scrollHeight'),
                            },
                            0
                        );
                    }
                }
            });
            _this.appendLauncher = function () {
                var anonymousChatLauncher = document.querySelector(
                    '#km-anonymous-chat-launcher'
                );
                anonymousChatLauncher &&
                    anonymousChatLauncher.parentNode.removeChild(
                        anonymousChatLauncher
                    );
                $applozic('#mck-sidebox-launcher').remove();
                $applozic('body').append(_this.getLauncherHtml());
                mckNotificationService.init();
            };
            _this.tabFocused = function () {
                var hidden = 'hidden';
                // Standards:
                if (hidden in d)
                    d.addEventListener('visibilitychange', onchange);
                else if ((hidden === 'mozHidden') in d)
                    d.addEventListener('mozvisibilitychange', onchange);
                else if ((hidden === 'webkitHidden') in d)
                    d.addEventListener('webkitvisibilitychange', onchange);
                else if ((hidden === 'msHidden') in d)
                    d.addEventListener('msvisibilitychange', onchange);
                // IE 9 and lower:
                else if ('onfocusin' in d)
                    d.onfocusin = d.onfocusout = onchange;
                // All others:
                else
                    w.onpageshow = w.onpagehide = w.onfocus = w.onblur = onchange;

                function onchange(evt) {
                    var v = true,
                        h = false,
                        evtMap = {
                            focus: v,
                            focusin: v,
                            pageshow: v,
                            blur: h,
                            focusout: h,
                            pagehide: h,
                        };
                    evt = evt || w.event;
                    if (evt.type in evtMap) {
                        IS_MCK_TAB_FOCUSED = evtMap[evt.type];
                    } else {
                        IS_MCK_TAB_FOCUSED = this[hidden] ? false : true;
                        mckNotificationService.clearFlashPageTitleInterval();
                    }
                    if (IS_MCK_TAB_FOCUSED) {
                        if (MCK_IDLE_TIME_COUNTER < 1 && IS_LOGGED_IN) {
                            window.Applozic.ALSocket.checkConnected(true);
                        }
                        _this.stopIdleTimeCounter();
                        mckNotificationService.clearFlashPageTitleInterval();
                    } else {
                        if (window.Applozic.ALSocket.mck_typing_status === 1) {
                            window.Applozic.ALSocket.sendTypingStatus(0);
                        }
                        _this.manageIdleTime();
                    }
                }
                // set the initial state (but only if browser supports the Page
                // Visibility API)
                if (d[hidden] !== undefined)
                    onchange({
                        type: d[hidden] ? 'blur' : 'focus',
                    });
            };
            _this.manageIdleTime = function () {
                MCK_IDLE_TIME_COUNTER = MCK_IDLE_TIME_LIMIT;
                if (refreshIntervalId) {
                    clearInterval(refreshIntervalId);
                }
                refreshIntervalId = setInterval(function () {
                    if (--MCK_IDLE_TIME_COUNTER < 0) {
                        MCK_IDLE_TIME_COUNTER = 0;
                        window.Applozic.ALSocket.stopConnectedCheck();
                        clearInterval(refreshIntervalId);
                        refreshIntervalId = '';
                    }
                }, 60000);
            };
            _this.stopIdleTimeCounter = function () {
                MCK_IDLE_TIME_COUNTER = MCK_IDLE_TIME_LIMIT;
                if (refreshIntervalId) {
                    clearInterval(refreshIntervalId);
                }
                refreshIntervalId = '';
            };
            _this.manageOfflineMessageTime = function (userId) {
                if (
                    typeof MCK_OFFLINE_MESSAGE_DETAIL === 'object' &&
                    !isNaN(MCK_OFFLINE_MESSAGE_DETAIL.timeout)
                ) {
                    if (MCK_OFFLINE_MESSAGE_DETAIL.type === 1) {
                        if (
                            !MCK_OFFLINE_MESSAGE_DETAIL.userIds ||
                            MCK_OFFLINE_MESSAGE_DETAIL.userIds.length === 0
                        ) {
                            w.console.log('Offline message userIds required.');
                            return;
                        } else if (
                            MCK_OFFLINE_MESSAGE_DETAIL.userIds.indexOf(
                                userId
                            ) === -1
                        ) {
                            return;
                        }
                    }
                    if (offlineIntervalId) {
                        clearInterval(offlineIntervalId);
                    }
                    offlineIntervalId = setTimeout(function () {
                        clearInterval(offlineIntervalId);
                        offlineIntervalId = '';
                        mckMessageLayout.showOfflineMessage();
                    }, parseInt(MCK_OFFLINE_MESSAGE_DETAIL.timeout) * 5000);
                } else {
                    w.console.log('Offline message timeout required.');
                }
            };
            _this.stopOfflineMessageCounter = function () {
                if (offlineIntervalId) {
                    clearInterval(offlineIntervalId);
                }
                offlineIntervalId = '';
            };

            _this.clearMsgTriggerAndChatPopuTimeouts = function () {
                clearTimeout(MCK_TRIGGER_MSG_NOTIFICATION_PARAM);
                clearTimeout(MCK_CHAT_POPUP_TEMPLATE_TIMER);
                SnapUI.togglePopupChatTemplate();
            };

            $applozic(d).on(
                'click',
                '.chat-popup-widget-close-btn-container',
                function () {
                    SnapUI.togglePopupChatTemplate();
                }
            );
        }

        function MckMessageService() {
            var _this = this;
            var $mck_search = $applozic('#mck-search');
            var $mck_msg_to = $applozic('#mck-msg-to');
            var $mck_msg_new = $applozic('#mck-msg-new');
            var $mck_audio = $applozic('#mck-audio');
            var $mck_mike_btn = $applozic('#mck-mike-btn');
            var $mck_sidebox = $applozic('#mck-sidebox');
            var $mck_file_box = $applozic('#mck-file-box');
            var $mck_text_box = $applozic('#mck-text-box');
            var $mck_box_form = $applozic('.mck-box-form');
            var $mck_msg_form = $applozic('#mck-msg-form');
            var $mck_msg_sbmt = $applozic('#mck-msg-sbmt');
            var $mck_new_group = $applozic('#mck-new-group');
            var $mck_tab_title = $applozic('#mck-tab-title');
            var $mck_msg_error = $applozic('#mck-msg-error');
            var $mck_btn_attach = $applozic('#mck-btn-attach');
            var $mck_tab_status = $applozic('#mck-tab-status');
            var $mck_msg_cell = $applozic('#mck-message-cell');
            var $mck_typing_box = $applozic('.mck-typing-box');
            var $mck_gms_loading = $applozic('#mck-gms-loading');
            var $mck_group_title = $applozic('#mck-group-title');
            var $mck_loading = $applozic('#mck-contact-loading');
            var $mck_no_messages = $applozic('#mck-no-messages');
            var $mck_group_search = $applozic('.mck-group-search');
            var $mck_city_search = $applozic('.mck-city-search');
            var $mck_msg_response = $applozic('#mck-msg-response');
            var $mck_form_field = $applozic('#mck-msg-form #mck-file-input');
            var $mck_block_button = $applozic('#mck-block-button');
            var $li_mck_block_user = $applozic('#li-mck-block-user');
            var $li_mck_group_info = $applozic('#li-mck-group-info');
            var $mck_response_text = $applozic('#mck_response_text');
            var $mck_contact_search = $applozic('.mck-contact-search');
            var $mck_group_info_tab = $applozic('#mck-group-info-tab');
            var $mck_price_text_box = $applozic('#mck-price-text-box');
            var $mck_sidebox_search = $applozic('#mck-sidebox-search');
            var $mck_btn_group_info = $applozic('#mck-group-info-btn');
            var $mck_group_info_tab = $applozic('#mck-group-info-tab');
            var $mck_btn_group_exit = $applozic('#mck-btn-group-exit');
            var $mck_group_back_link = $applozic('#mck-group-back-link');
            var $mck_btn_leave_group = $applozic('#mck-btn-leave-group');
            var $mck_sidebox_content = $applozic('.mck-sidebox-content');
            var $mck_no_more_messages = $applozic('#mck-no-more-messages');
            var $mck_btn_group_create = $applozic('#mck-btn-group-create');
            var $mck_group_create_tab = $applozic('#mck-group-create-tab');
            var $mck_group_add_member = $applozic('#mck-group-add-member');
            var $mck_contacts_content = $applozic('#mck-contacts-content');
            var $mck_tab_option_panel = $applozic('#mck-tab-option-panel');
            var $mck_no_conversations = $applozic('#mck-no-conversations');
            var $mck_group_create_title = $applozic('#mck-group-create-title');
            var $mck_group_menu_options = $applozic('.mck-group-menu-options');
            var $mck_tab_message_option = $applozic('.mck-tab-message-option');
            var $mck_group_admin_options = $applozic(
                '.mck-group-admin-options'
            );
            var $mck_group_member_search = $applozic(
                '#mck-group-member-search'
            );
            var $mck_autosuggest_search_input = $applozic(
                '#mck-autosuggest-search-input'
            );
            var $mck_autosuggest_metadata = $applozic(
                '#mck-autosuggest-metadata'
            );
            var $mck_msg_inner = $applozic(
                '#mck-message-cell .mck-message-inner'
            );
            var $mck_search_inner = $applozic(
                '#mck-search-cell .mck-message-inner'
            );
            var $mck_no_more_conversations = $applozic(
                '#mck-no-more-conversations'
            );
            var $mck_gm_search_box = $applozic('#mck-gm-search-box');
            var $mck_group_member_search_list = $applozic(
                '#mck-group-member-search-list'
            );
            var $mck_no_gsm_text = $applozic('#mck-no-gsm-text');
            var MESSAGE_SEND_URL = '/rest/ws/message/send';
            var UPDATE_MESSAGE_METADATA = '/rest/ws/message/update/metadata';
            var GROUP_CREATE_URL = '/rest/ws/group/v2.1/create';
            var MESSAGE_LIST_URL = '/rest/ws/message/list';
            var UPDATE_REPLY_MAP = '/rest/ws/message/detail';
            var TOPIC_ID_URL = '/rest/ws/conversation/topicId';
            var MESSAGE_DELETE_URL = '/rest/ws/message/delete';
            var CONVERSATION_ID_URL = '/rest/ws/conversation/id';
            var MESSAGE_READ_UPDATE_URL = '/rest/ws/message/read';
            var CONVERSATION_FETCH_URL = '/rest/ws/conversation/get';
            var MESSAGE_ADD_INBOX_URL = '/rest/ws/message/add/inbox';
            var MESSAGE_DELIVERY_UPDATE_URL = '/rest/ws/message/delivered';
            var CONVERSATION_CLOSE_UPDATE_URL = '/rest/ws/conversation/close';
            var CONVERSATION_DELETE_URL =
                '/rest/ws/message/delete/conversation';
            var CONVERSATION_READ_UPDATE_URL =
                '/rest/ws/message/read/conversation';
            var FEEDBACK_UPDATE_URL = '/feedback/v2';
            var offlineblk =
                '<div id="mck-ofl-blk" class="mck-m-b"><div class="mck-clear"><div class="blk-lg-12 mck-text-light mck-text-muted mck-test-center">${userIdExpr} is offline now</div></div></div>';
            var refreshIntervalId;
            var $minutesLabel = $applozic('#mck-minutes');
            var $secondsLabel = $applozic('#mck-seconds');
            var warningBox = document.getElementById('mck-char-warning');
            var warningText = document.getElementById('mck-char-warning-text');

            _this.hideAutoSuggestionBoxEnableTxtBox = function () {
                if ($mck_autosuggest_search_input.hasClass('mck-text-box')) {
                    $mck_autosuggest_search_input
                        .addClass('n-vis')
                        .removeClass('mck-text-box')
                        .val('');
                    $mck_text_box.removeClass('n-vis').addClass('mck-text-box');
                    $mck_autosuggest_search_input.data('source-url', '');
                    $applozic('.mck-dropup-menu') &&
                        $applozic('.mck-dropup-menu').hide();
                }
            };

            _this.showSendButton = function () {
                snapCommons.modifyClassList(
                    { id: ['send-button-wrapper'] },
                    'vis',
                    'n-vis'
                );
                snapCommons.modifyClassList(
                    {
                        id: [
                            'mck-file-up',
                            'mck-btn-loc',
                            'mck-btn-smiley-box',
                        ],
                    },
                    'n-vis',
                    'vis'
                );
                IS_MCK_LOCSHARE
                    ? ''
                    : snapCommons.modifyClassList(
                          { id: ['mck-file-up2'] },
                          'n-vis',
                          'vis'
                      );
            };

            _this.hideSendButton = function () {
                snapCommons.modifyClassList(
                    { id: ['send-button-wrapper'] },
                    'n-vis',
                    'vis'
                );
                MCK_ATTACHMENT &&
                    snapCommons.modifyClassList(
                        { id: ['mck-file-up'] },
                        'vis',
                        'n-vis'
                    );
                !IS_MCK_LOCSHARE
                    ? snapCommons.modifyClassList(
                          { id: ['mck-file-up2'] },
                          'vis',
                          'n-vis'
                      )
                    : snapCommons.modifyClassList(
                          { id: ['mck-btn-loc'] },
                          'vis',
                          'n-vis'
                      );
                !EMOJI_LIBRARY
                    ? ''
                    : snapCommons.modifyClassList(
                          { id: ['mck-btn-smiley-box'] },
                          'vis',
                          'n-vis'
                      );
                document.activeElement.blur();
                $applozic("input").blur();
            };
            _this.toggleMediaOptions = function (el) {
                var text = '';
                if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                    text = el.value;
                } else {
                    text = el.textContent;
                }
                if (text == '' || !text.replace(/\s/g, '').length) {
                    _this.hideSendButton();
                    Snap.typingAreaService.showMicIfSpeechRecognitionSupported();
                } else {
                    _this.showSendButton();
                    Snap.typingAreaService.hideMicButton();
                }

                //Reset session timeout if user entering data to the mck-text-box element
                Snap.sessionTimeout();
            };

            _this.checkArray = function (askUserDetails) {
                if (askUserDetails && Array.isArray(askUserDetails) === false) {
                    throw new Error('askUserDetails should be an array');
                } else {
                    return askUserDetails;
                }
            };
            _this.getUserMetadata = function () {
                var KM_USER_DETAIL = ['name', 'email', 'phone', 'password'];
                var metadata = {};
                var field = '';
                KM_PRELEAD_COLLECTION.map(function (element) {
                    field = element.field && element.field.toLowerCase();
                    if (KM_USER_DETAIL.indexOf(field) === -1) {
                        metadata[element.field] = $applozic(
                            '#km-' + field
                        ).val();
                    }
                });
                return metadata;
            };
            _this.createNewConversation = function (params, callback) {
                Snap.startConversation(params, callback);
            };
            _this.openChatbox = function (params, callback) {
                snapCommons.setWidgetStateOpen(true);
                if ($mck_sidebox.css('display') === 'none') {
                    $applozic('.mckModal').mckModal('hide');
                    $mck_sidebox.mckModal();
                    $mck_msg_inner.html('');
                }
                $mck_msg_to.focus();
            };
            _this.loadConversationWithAgents = function (params, callback) {
                _this.openChatbox();
                if (window.applozic.PRODUCT_ID == 'snap') {
                    $mck_btn_leave_group.removeClass('vis').addClass('n-vis');
                }

                var options = {
                    type: 10,
                    startIndex: 0,
                    limit: 10,
                };
                //TO DO: set group detail data in session and fetch from their instead of making call every time.
                Snap.client.getGroupDetailByType(
                    options,
                    function (err, result) {
                        if (err) {
                            console.log(
                                'error while fetching group detail by type',
                                err
                            );
                            return;
                        } else if (result.response.length == 0) {
                            var conversationDetail = mckGroupLayout.createGroupDefaultSettings();
                            mckMessageService.createNewConversation(
                                conversationDetail,
                                function (groupId) {
                                    /* Snap.triggerEvent(SnapConstants.EVENT_IDS.WELCOME_MESSAGE, { "groupId": groupId, "applicationId": MCK_APP_ID });*/
                                    callback();
                                }
                            );
                        } else if (result.response.length == 1) {
                            var groupId = result.response[0].id;
                            $applozic.fn.applozic(
                                'loadGroupTab',
                                groupId,
                                callback
                            );
                        } else {
                            if (MCK_TRIGGER_MSG_NOTIFICATION_TIMEOUT > 0) {
                                ALStorage.clearMckMessageArray();
                            }
                            $applozic.fn.applozic('loadTab', null, callback);
                        }
                    }
                );
            };
            _this.timer = function () {
                var totalSeconds = 0;
                var that = this;
                refreshIntervalId = setInterval(function () {
                    ++totalSeconds;
                    $secondsLabel.html(that.pad(totalSeconds % 60));
                    $minutesLabel.html(that.pad(parseInt(totalSeconds / 60)));
                }, 1000);

                that.pad = function (val) {
                    var valString = val + '';
                    if (valString.length < 2) {
                        return '0' + valString;
                    } else {
                        return valString;
                    }
                };
            };
            _this.stoptimer = function () {
                $secondsLabel.html('0');
                $minutesLabel.html('0');
                clearInterval(refreshIntervalId);
            };

            $applozic(d).on('click', '.mck-message-delete', function () {
                _this.deleteMessage(
                    $applozic(this).parents('.mck-m-b').data('msgkey')
                );
            });

            $applozic(d).on('click', '.mck-message-reply', function () {
                _this.replyMessage(
                    $applozic(this).parents('.mck-m-b').data('msgkey')
                );
            });

            $applozic(d).on('click', '.mck-message-forward', function () {
                $mck_msg_new.data(
                    'forwardMessageKey',
                    $applozic(this).parents('.mck-m-b').data('msgkey')
                );
                $mck_msg_new.trigger('click');
            });
            $applozic('.mck-minimize-icon').click(function () {
                $applozic('.mck-box-md,.mck-box-ft').animate({
                    height: 'toggle',
                });
                if ($mck_sidebox_content.hasClass('minimized')) {
                    $mck_sidebox_content.css('height', '100%');
                    $mck_sidebox_content.removeClass('minimized');
                } else {
                    $mck_sidebox_content.css('height', '0%');
                    $mck_sidebox_content.addClass('minimized');
                }
            });

            _this.init = function () {
                var mck_text_box = document.getElementById('mck-text-box');

                $applozic.template('oflTemplate', offlineblk);
                ALStorage.clearMckMessageArray();
                $applozic(d).on('click', '.' + MCK_LAUNCHER, function () {
                    if ($applozic(this).hasClass('mck-msg-preview')) {
                        $applozic(this).hide();
                    }
                    mckInit.clearMsgTriggerAndChatPopuTimeouts();
                });
                mckMessageLayout.initSearchAutoType();
                $mck_contact_search.click(function () {
                    // mckMessageLayout.addContactsToContactSearchList();
                    var conversationDetail = mckGroupLayout.createGroupDefaultSettings();
                    mckMessageService.createNewConversation(
                        conversationDetail,
                        function (conversationId) {
                            // Snap.triggerEvent(SnapConstants.EVENT_IDS.WELCOME_MESSAGE, { groupId: conversationId, applicationId: MCK_APP_ID });
                        }
                    );
                    $applozic('#mck-msg-new').attr('disabled', true);
                    mckInit.clearMsgTriggerAndChatPopuTimeouts();
                });
                $applozic(d).on('click', '#mck-sidebox-launcher', function () {
                    document
                        .getElementById('launcher-agent-img-container')
                        .classList.add('n-vis');
                    document
                        .getElementById('launcher-agent-img-container')
                        .classList.remove('vis');
                    if (typeof CUSTOM_CHAT_LAUNCHER !== 'undefined') {
                        document
                            .getElementById('mck-sidebox-launcher')
                            .childNodes[0].childNodes[0].classList.remove(
                                'n-vis'
                            );
                    } else {
                        document
                            .getElementById('launcher-svg-container')
                            .classList.remove('n-vis');
                    }
                });
                $applozic(d).on('click', '#talk-to-human-link', function () {
                    var conversationDetail = mckGroupLayout.createGroupDefaultSettings();
                    SnapUI.hideFaq();
                    SnapUI.showChat();
                    if ($applozic('#km-faq-search-input').val() === '') {
                        mckMessageService.createNewConversation(
                            conversationDetail,
                            function (conversationId) {
                                // Snap.triggerEvent(SnapConstants.EVENT_IDS.WELCOME_MESSAGE, { groupId: conversationId, applicationId: MCK_APP_ID });
                            }
                        );
                    } else {
                        mckMessageService.createNewConversation(
                            conversationDetail,
                            function (conversationId) {
                                SnapUI.sendFaqQueryAsMsg(conversationId);
                            }
                        );
                    }
                    $applozic('#mck-contact-list')
                        .removeClass('vis')
                        .addClass('n-vis');
                });

                $mck_group_search.click(function () {
                    mckMessageLayout.addGroupsToGroupSearchList();
                });

                mck_text_box.addEventListener('keyup', function () {
                    _this.toggleMediaOptions(this);
                });
                _this.cursorPosition = function (element) {
                    var selection = window.getSelection();
                    var nodeCount = 0;
                    var emptyNodes = 0;
                    var currentRange = selection.getRangeAt(element);
                    var endOffset = currentRange.startOffset;
                    var startNode = element.firstChild;
                    var normalSpan = document.getElementById('mck-normal-span');
                    var currentNode = selection.focusNode;
                    if (normalSpan) {
                        startNode = normalSpan.firstChild;
                    }
                    var newRange = document.createRange();
                    newRange.setStart(startNode, 0);
                    newRange.setEnd(currentNode, endOffset);
                    var allNodes = newRange.commonAncestorContainer.childNodes;
                    for (
                        nodeCount = 0;
                        nodeCount < allNodes.length;
                        nodeCount++
                    ) {
                        if (
                            allNodes[nodeCount].nodeType &&
                            allNodes[nodeCount].nodeType == '3' &&
                            allNodes[nodeCount].nodeValue == ''
                        ) {
                            emptyNodes++;
                        }
                        if (
                            allNodes[nodeCount] == newRange.endContainer &&
                            allNodes[nodeCount].nodeType == '3'
                        ) {
                            break;
                        }
                    }
                    nodeCount = nodeCount - emptyNodes;
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    var length = selection.toString().length;
                    selection.collapseToEnd();
                    var details = {
                        position: endOffset,
                        node: nodeCount,
                        totalLength: length,
                    };
                    return details;
                };
                _this.disableSendButton = function (value) {
                    var sendButton = document.getElementById('mck-msg-sbmt');
                    value
                        ? sendButton.setAttribute('disabled', value)
                        : sendButton.removeAttribute('disabled');
                    CURRENT_GROUP_DATA.DISABLE_SEND_MESSAGE = value;
                };
                $mck_text_box.on('input paste', function (event) {
                    if (CURRENT_GROUP_DATA.CHAR_CHECK) {
                        var warningLength = 199;
                        var maxLength = 256;
                        var textBox = $mck_text_box[0]; //using separate selector for vanilla JS functions
                        if (!document.getElementById('mck-char-count')) {
                            warningText.innerHTML +=
                                '<span> | </span><span id="mck-char-count"></span>';
                        }
                        var remtxt;
                        var str = mckUtils.textVal(textBox);
                        var trimmedStr = str.trim();
                        var textLength = trimmedStr.length;
                        if (textLength > warningLength) {
                            var caretObject = _this.cursorPosition(textBox);
                            var nodeOffset = caretObject.position;
                            var caretPosition = caretObject.totalLength;
                            var caretNode = caretObject.node;
                            if (textLength > maxLength) {
                                _this.disableSendButton(true);
                                var selection;
                                remtxt =
                                    '(' +
                                    MCK_LABELS['limit.remove'] +
                                    ' ' +
                                    (textLength - maxLength) +
                                    ' ' +
                                    MCK_LABELS['limit.characters'] +
                                    ')';
                                var preSpanContent = str.slice(0, maxLength);
                                preSpanContent = preSpanContent.replace(
                                    /(?:\r\n|\r|\n)/g,
                                    '<br>'
                                );
                                var spanContent = str.slice(maxLength);
                                spanContent = spanContent.replace(
                                    /(?:\r\n|\r|\n)/g,
                                    '<br>'
                                );
                                var warningSpan = document.getElementById(
                                    'mck-text-warning-span'
                                );
                                var normalSpan = document.getElementById(
                                    'mck-normal-span'
                                );
                                if (warningSpan && !(event.type == 'paste')) {
                                    selection = document.getSelection();
                                    if (
                                        caretPosition <= maxLength + 1 &&
                                        selection.focusNode !=
                                            warningSpan.firstChild
                                    ) {
                                        warningSpan.innerHTML = spanContent;
                                        normalSpan.innerHTML = preSpanContent;
                                        selection = document.getSelection();
                                        if (caretPosition >= maxLength + 1) {
                                            targetNode =
                                                warningSpan.childNodes[
                                                    caretNode -
                                                        (normalSpan.childNodes
                                                            .length -
                                                            1)
                                                ];
                                            if (caretPosition > maxLength) {
                                                nodeOffset =
                                                    caretPosition - maxLength;
                                            }
                                        } else {
                                            targetNode =
                                                normalSpan.childNodes[
                                                    caretNode
                                                ];
                                        }
                                        selection.collapse(
                                            targetNode,
                                            nodeOffset
                                        );
                                    }
                                } else {
                                    textBox.innerHTML =
                                        '<span id = "mck-normal-span"></span><span contenteditable="true" id="mck-text-warning-span"></span>';
                                    normalSpan = document.getElementById(
                                        'mck-normal-span'
                                    );
                                    normalSpan.innerHTML = preSpanContent;
                                    warningSpan = document.getElementById(
                                        'mck-text-warning-span'
                                    );
                                    warningSpan.innerHTML = spanContent;
                                    selection = document.getSelection();
                                    try {
                                        var targetNode;
                                        if (
                                            caretNode == 0 &&
                                            caretPosition > maxLength
                                        ) {
                                            targetNode = warningSpan.firstChild;
                                            nodeOffset =
                                                caretPosition - maxLength;
                                        } else {
                                            if (caretPosition > maxLength) {
                                                var nodeNum =
                                                    caretNode -
                                                    (normalSpan.childNodes
                                                        .length -
                                                        1);
                                                if (
                                                    nodeNum >=
                                                    warningSpan.childNodes
                                                        .length
                                                ) {
                                                    targetNode =
                                                        warningSpan.lastChild;
                                                    nodeOffset =
                                                        warningSpan.lastChild
                                                            .length;
                                                } else {
                                                    targetNode =
                                                        warningSpan.childNodes[
                                                            caretNode -
                                                                (normalSpan
                                                                    .childNodes
                                                                    .length -
                                                                    1)
                                                        ];
                                                    if (
                                                        nodeOffset >
                                                        targetNode.nodeValue
                                                            .length
                                                    ) {
                                                        nodeOffset =
                                                            caretPosition -
                                                            maxLength;
                                                    }
                                                }
                                            } else {
                                                targetNode =
                                                    normalSpan.childNodes[
                                                        caretNode
                                                    ];
                                            }
                                        }
                                        selection.collapse(
                                            targetNode,
                                            nodeOffset
                                        );
                                    } catch (err) {
                                        console.log(err);
                                        targetNode = warningSpan.lastChild;
                                        nodeOffset =
                                            warningSpan.lastChild.length;
                                        selection.collapse(
                                            targetNode,
                                            nodeOffset
                                        );
                                    }
                                }
                            } else {
                                normalSpan = document.getElementById(
                                    'mck-normal-span'
                                );
                                warningSpan = document.getElementById(
                                    'mck-text-warning-span'
                                );
                                var spanRemains = '';
                                if (normalSpan) {
                                    spanRemains = normalSpan.innerHTML;
                                }
                                if (warningSpan) {
                                    spanRemains += warningSpan.innerHTML;
                                }
                                if (spanRemains.length > 1) {
                                    textBox.innerHTML = spanRemains;
                                    selection = document.getSelection();
                                    if (caretPosition > maxLength) {
                                        selection.collapse(
                                            textBox.lastChild,
                                            textBox.lastChild.length - 1
                                        );
                                    } else {
                                        selection.collapse(
                                            textBox.childNodes[caretNode],
                                            nodeOffset
                                        );
                                    }
                                }

                                _this.disableSendButton(false);
                                remtxt =
                                    '(' +
                                    (maxLength - textLength) +
                                    ' ' +
                                    MCK_LABELS['limit.characters'] +
                                    ' ' +
                                    MCK_LABELS['limit.remaining'] +
                                    ')';
                            }
                            document.getElementById(
                                'mck-char-count'
                            ).innerHTML = remtxt;
                            warningBox.classList.remove('n-vis');
                            if (
                                !warningBox.classList.contains(
                                    'mck-warning-slide-up'
                                )
                            ) {
                                warningBox.classList.add(
                                    'mck-warning-slide-up'
                                );
                                warningBox.classList.remove(
                                    'mck-warning-slide-down'
                                );
                            }
                        } else {
                            _this.disableSendButton(false);
                            if (
                                !warningBox.classList.contains('n-vis') &&
                                !warningBox.classList.contains(
                                    'mck-warning-slide-down'
                                )
                            ) {
                                warningBox.classList.add(
                                    'mck-warning-slide-down'
                                );
                                warningBox.classList.remove(
                                    'mck-warning-slide-up'
                                );
                                setTimeout(function () {
                                    warningBox.classList.add('n-vis');
                                }, 700);
                            }
                        }
                    }
                });
                $mck_text_box.keydown(function (e) {
                    if ($mck_box_form.hasClass('mck-text-req')) {
                        $mck_box_form.removeClass('mck-text-req');
                    }
                    if (e.keyCode === 13 && (e.shiftKey || e.ctrlKey)) {
                        e.preventDefault();
                        if (w.getSelection) {
                            var selection = w.getSelection(),
                                range = selection.getRangeAt(0),
                                br = d.createElement('br'),
                                textNode = d.createTextNode('\u00a0'); // Passing
                            range.deleteContents(); // required or not?
                            range.insertNode(br);
                            range.collapse(false);
                            range.insertNode(textNode);
                            range.selectNodeContents(textNode);
                            selection.removeAllRanges();
                            selection.addRange(range);
                            $mck_text_box.animate(
                                {
                                    scrollTop: $mck_text_box.prop(
                                        'scrollHeight'
                                    ),
                                },
                                0
                            );
                            return false;
                        }
                    } else if (
                        e.keyCode === 13 &&
                        !CURRENT_GROUP_DATA.DISABLE_SEND_MESSAGE
                    ) {
                        e.preventDefault();
                        if (window.Applozic.ALSocket.mck_typing_status === 1) {
                            window.Applozic.ALSocket.sendTypingStatus(
                                0,
                                window.Applozic.ALSocket.mck_typing_status,
                                MCK_USER_ID,
                                $mck_msg_inner.data('mck-id')
                            );
                        }
                        $mck_msg_sbmt.is(':disabled') &&
                        $mck_file_box.hasClass('vis')
                            ? alert(MCK_LABELS['file.uploading.wait'])
                            : $mck_msg_form.submit();
                        mckMessageLayout.messageClubbing(false);
                    } else if (
                        e.keyCode === 13 &&
                        CURRENT_GROUP_DATA.DISABLE_SEND_MESSAGE
                    ) {
                        e.preventDefault();
                    } else if (
                        window.Applozic.ALSocket.mck_typing_status === 0
                    ) {
                        window.Applozic.ALSocket.sendTypingStatus(
                            1,
                            window.Applozic.ALSocket.mck_typing_status,
                            MCK_USER_ID,
                            $mck_msg_inner.data('mck-id')
                        );
                    }
                });
                $applozic(d).on(
                    'click',
                    '.mck-btn-clear-messages',
                    function () {
                        if (confirm(MCK_LABELS['clear.messages.alert'])) {
                            mckMessageService.deleteConversation();
                        }
                    }
                );
                $applozic(d).on('click', '.applozic-tm-launcher', function (e) {
                    e.preventDefault();
                    var tabId = $applozic(this).data('mck-id');
                    tabId =
                        typeof tabId !== 'undefined' && tabId !== ''
                            ? tabId.toString()
                            : '';
                    var userName = $applozic(this).data('mck-name');
                    userName =
                        typeof userName !== 'undefined' && userName !== ''
                            ? userName.toString()
                            : '';
                    var supportId = $applozic(this).data('mck-supportid');
                    supportId =
                        typeof supportId !== 'undefined' && supportId !== ''
                            ? supportId.toString()
                            : '';
                    var topicId = $applozic(this).data('mck-topicid');
                    topicId =
                        typeof topicId !== 'undefined' && topicId !== ''
                            ? topicId.toString()
                            : '';
                    var msgText = $applozic(this).data('mck-msg');
                    msgText =
                        typeof msgText !== 'undefined' && msgText !== ''
                            ? msgText.toString()
                            : '';
                    if (typeof MCK_GETTOPICDETAIL === 'function' && topicId) {
                        var topicDetail = MCK_GETTOPICDETAIL(topicId);
                        if (
                            typeof topicDetail === 'object' &&
                            topicDetail.title !== 'undefined'
                        ) {
                            MCK_TOPIC_DETAIL_MAP[topicId] = topicDetail;
                        }
                    }
                    var params = {
                        topicId: topicId,
                        tabId: tabId,
                        userName: userName,
                        isMessage: true,
                    };
                    var messagePxy = {
                        type: 5,
                        contentType: 0,
                        message: msgText,
                    };
                    params.messagePxy = messagePxy;
                    if (supportId) {
                        params.isGroup = true;
                        params.supportId = supportId;
                        mckMessageService.getConversationId(params);
                    } else {
                        params.isGroup = false;
                        mckMessageLayout.loadTab(
                            params,
                            alMessageService.dispatchMessage
                        );
                    }
                });
                $applozic(d).on('click', '.applozic-wt-launcher', function (e) {
                    e.preventDefault();
                    var tabId = $applozic(this).data('mck-id');
                    tabId =
                        typeof tabId !== 'undefined' && tabId !== ''
                            ? tabId.toString()
                            : '';
                    var userName = $applozic(this).data('mck-name');
                    userName =
                        typeof userName !== 'undefined' && userName !== ''
                            ? userName.toString()
                            : '';
                    var topicId = $applozic(this).data('mck-topicid');
                    topicId =
                        typeof topicId !== 'undefined' && topicId !== ''
                            ? topicId.toString()
                            : '';
                    var topicStatus = $applozic(this).data('mck-topic-status');
                    if (topicStatus) {
                        topicStatus =
                            CONVERSATION_STATUS_MAP.indexOf(topicStatus) === -1
                                ? CONVERSATION_STATUS_MAP[0]
                                : topicStatus.toString();
                    } else {
                        topicStatus = CONVERSATION_STATUS_MAP[0];
                    }
                    if (typeof MCK_GETTOPICDETAIL === 'function') {
                        var topicDetail = MCK_GETTOPICDETAIL(topicId);
                        if (
                            typeof topicDetail === 'object' &&
                            topicDetail.title !== 'undefined'
                        ) {
                            MCK_TOPIC_DETAIL_MAP[topicId] = topicDetail;
                        }
                    }
                    mckMessageService.getConversationId({
                        tabId: tabId,
                        isGroup: false,
                        userName: userName,
                        topicId: topicId,
                        topicStatus: topicStatus,
                        isMessage: false,
                    });
                });
                $applozic(d).on('click', '.applozic-ct-launcher', function (e) {
                    e.preventDefault();
                    var tabId = $applozic(this).data('mck-id');
                    tabId =
                        typeof tabId !== 'undefined' && tabId !== ''
                            ? tabId.toString()
                            : '';
                    var userName = $applozic(this).data('mck-name');
                    userName =
                        typeof userName !== 'undefined' && userName !== ''
                            ? userName.toString()
                            : '';
                    var topicId = $applozic(this).data('mck-topicid');
                    topicId =
                        typeof topicId !== 'undefined' && topicId !== ''
                            ? topicId.toString()
                            : '';
                    var topicStatus = $applozic(this).data('mck-topic-status');
                    if (topicStatus) {
                        topicStatus =
                            CONVERSATION_STATUS_MAP.indexOf(topicStatus) === -1
                                ? CONVERSATION_STATUS_MAP[0]
                                : topicStatus.toString();
                    } else {
                        topicStatus = CONVERSATION_STATUS_MAP[0];
                    }
                    var params = {
                        tabId: tabId,
                        isGroup: false,
                        userName: userName,
                        topicId: topicId,
                        topicStatus: topicStatus,
                        isMessage: false,
                    };
                    if (typeof MCK_GETCONVERSATIONDETAIL === 'function') {
                        var conversationDetail = MCK_GETCONVERSATIONDETAIL(
                            topicId
                        );
                        if (typeof conversationDetail === 'object') {
                            if (
                                conversationDetail.topicDetail &&
                                typeof conversationDetail.topicDetail ===
                                    'object' &&
                                conversationDetail.topicDetail.title !==
                                    'undefined'
                            ) {
                                MCK_TOPIC_DETAIL_MAP[topicId] =
                                    conversationDetail.topicDetail;
                            }
                            if (
                                conversationDetail.fallBackTemplatesList &&
                                conversationDetail.fallBackTemplatesList
                                    .length > 0
                            ) {
                                params.fallBackTemplatesList =
                                    conversationDetail.fallBackTemplatesList;
                            }
                        }
                    }
                    mckMessageService.getConversationId(params);
                });
                $applozic(d).on(
                    'click',
                    '.' + MCK_LAUNCHER + ', .mck-contact-list .' + MCK_LAUNCHER,
                    function (e) {
                        e.preventDefault();
                        $applozic(
                            '#mck-tab-individual .mck-tab-link.mck-back-btn-container'
                        )
                            .addClass('vis-table')
                            .removeClass('n-vis');
                        $applozic(
                            '#mck-tab-individual .mck-name-status-container.mck-box-title'
                        ).removeClass('padding');
                        count++;
                        var $this = $applozic(this);
                        var elem = this;
                        var userId = $this.data('mck-id');
                        count > 1 &&
                            typeof MCK_EVENT_HISTORY[
                                MCK_EVENT_HISTORY.length - 1
                            ] !== 'object' &&
                            MCK_EVENT_HISTORY.push(elem);
                        if (userId) {
                            // for one to one chat
                            if ($this.parents('.mck-search-list').length) {
                                $mck_search.bind('blur');
                                setTimeout(function () {
                                    mckMessageService.openChat(elem);
                                }, 600);
                            } else {
                                // callback method 'Snap.conversation.processConversationOpnedFromList' will be called when conversation clicked from the cpnversation list.
                                // use this method to perform all post conversation opned operations i.e. populate welcome and away message, show lead collection template etc.
                                mckMessageService.openChat(elem);
                            }
                            return;
                        }
                        $applozic.fn.applozic('mckLaunchSideboxChat');
                        // var snapIframe = parent.document.getElementById("snap-widget-iframe");
                        // snapIframe.style.boxShadow="0 1.5rem 2rem rgba(0,0,0,.3)";
                        mckInit.clearMsgTriggerAndChatPopuTimeouts();
                    }
                );

                //---------Place all the dropdown option triggers here-----------------
                // CSAT trigger
                document.getElementById('km-csat-trigger').onclick = function (
                    e
                ) {
                    e.preventDefault();
                    SnapUI.triggerCSAT();
                };

                // Voice Output Override trigger
                document.getElementById(
                    'user-overide-voice-output'
                ).onclick = function (e) {
                    e.preventDefault();
                    userOverride.voiceOutput = !userOverride.voiceOutput;
                    SnapUI.toggleVoiceOutputOverride(userOverride.voiceOutput);
                };

                //----------------------------------------------------------------

                $applozic('#km-form-chat-login').submit(function (e) {
                    var $submit_chat_login = $applozic('#km-submit-chat-login');
                    var $error_chat_login = $applozic('#km-error-chat-login');
                    var userId = $applozic('#km-userId').val();
                    var email = $applozic('#km-email').val();
                    var userName = $applozic('#km-name').val();
                    var contactNumber = $applozic('#km-phone').val();
                    var password = $applozic('#km-password').val();
                    if (password) {
                        MCK_ACCESS_TOKEN = password;
                    }
                    if (contactNumber) {
                        userId = contactNumber;
                        // Remove listener from phone number
                        document
                            .getElementById('km-phone')
                            .removeEventListener(
                                'keydown',
                                _this.phoneNumberValidation
                            );
                    }
                    if (email) {
                        userId = email;
                        SnapUtils.setCookie({
                            name: SnapConstants.COOKIES.SNAP_LOGGED_IN_ID,
                            value: email,
                            expiresInDays: 30,
                            domain: MCK_COOKIE_DOMAIN,
                        });
                        SnapUtils.setCookie({
                            name:
                                SnapConstants.COOKIES
                                    .IS_USER_ID_FOR_LEAD_COLLECTION,
                            value: true,
                            expiresInDays: 30,
                            domain: MCK_COOKIE_DOMAIN,
                        });
                    }
                    var metadata = mckMessageService.getUserMetadata();
                    $error_chat_login.removeClass('show').addClass('hide');
                    $error_chat_login.html('');
                    var options = {
                        userId: userId,
                        applicationId: MCK_APP_ID,
                        onInit: loadChat,
                        baseUrl: MCK_BASE_URL,
                        locShare: IS_MCK_LOCSHARE,
                        metadata: metadata,
                        password: password,
                        googleApiKey: MCK_GOOGLE_API_KEY,
                        chatNotificationMailSent: true,
                        authenticationTypeId: MCK_AUTHENTICATION_TYPE_ID,
                    };
                    if (email) {
                        options.email = email.toLowerCase();
                    }
                    if (userName) {
                        options.displayName = userName;
                    }
                    if (contactNumber) {
                        options.contactNumber = contactNumber;
                    }
                    $submit_chat_login.attr('disabled', true);
                    $submit_chat_login.html('Initiating chat...');
                    mckInit.initialize(options);

                    return false;
                });

                var loadChat = function () {
                    if (window.applozic.PRODUCT_ID === 'snap') {
                        $mck_btn_leave_group
                            .removeClass('vis')
                            .addClass('n-vis');
                    }
                    mckMessageService.loadConversationWithAgents({
                        groupName: DEFAULT_GROUP_NAME,
                        agentId: DEFAULT_AGENT_ID,
                        botIds: DEFAULT_BOT_IDS,
                    });
                };

                $applozic('.km-login-model-close').on('click', function (e) {
                    //$applozic("#km-chat-login-modal").removeClass('vis').addClass('n-vis');
                    $applozic('#km-chat-login-modal').css('display', 'none');
                });
                $applozic(d).on(
                    'click',
                    '.mck-conversation-tab-link',
                    function (e) {
                        e.preventDefault();
                        var $this = $applozic(this);
                        var currTabId = $mck_msg_inner.data('mck-id');
                        var isGroup = $mck_msg_inner.data('isgroup');
                        SnapUI.hideAwayMessage();
                        SnapUI.hideLeadCollectionTemplate();
                        SnapUI.showClosedConversationBanner(false);
                        !MCK_ATTACHMENT &&
                            snapCommons.modifyClassList(
                                { id: ['mck-attachfile-box', 'mck-file-up'] },
                                'n-vis',
                                'vis'
                            );
                        mckMessageLayout.loadTab({
                            tabId: '',
                            isGroup: false,
                            lastActiveTabId: currTabId,
                            isLastActiveTabGroup: isGroup,
                        });
                    }
                );
                $applozic(d).on('click', '.mck-close-sidebox', function (e) {
                    e.preventDefault();
                    _this.closeSideBox();
                });
                $applozic(d).on('click', '.mck-price-submit', function (e) {
                    e.preventDefault();
                    _this.sendPriceMessage();
                });
                $mck_price_text_box.keydown(function (event) {
                    if (event.keyCode === 13) {
                        _this.sendPriceMessage();
                    }
                });
                $mck_msg_inner.bind('scroll', function () {
                    if ($mck_msg_inner.find('.mck-contact-list').length > 0) {
                        if (
                            $mck_msg_inner.scrollTop() +
                                $mck_msg_inner.innerHeight() >=
                            $mck_msg_inner[0].scrollHeight
                        ) {
                            var startTime = $mck_msg_inner.data('datetime');
                            if (startTime > 0 && !CONTACT_SYNCING) {
                                mckMessageService.loadMessageList({
                                    tabId: '',
                                    isGroup: false,
                                    startTime: startTime,
                                });
                            }
                        }
                    } else if ($mck_msg_inner.scrollTop() === 0) {
                        var tabId = $mck_msg_inner.data('mck-id');
                        if (typeof tabId === 'undefined' || tabId === '') {
                            return;
                        }
                        var isGroup = $mck_msg_inner.data('isgroup');
                        var conversationId = $mck_msg_inner.data(
                            'mck-conversationid'
                        );
                        conversationId = conversationId
                            ? conversationId.toString()
                            : '';
                        var startTime = $mck_tab_option_panel.data('datetime');
                        if (startTime > 0 && !CONTACT_SYNCING) {
                            mckMessageService.loadMessageList({
                                tabId: tabId,
                                isGroup: isGroup,
                                conversationId: conversationId,
                                startTime: startTime,
                            });
                        }
                    }
                });
                $mck_price_text_box.on('click', function (e) {
                    e.preventDefault();
                    $mck_price_text_box.removeClass('mck-text-req');
                });
                $mck_block_button.on('click', function (e) {
                    e.preventDefault();
                    var tabId = $mck_msg_inner.data('mck-id');
                    var isGroup = $mck_msg_inner.data('isgroup');
                    var isBlock = !$mck_msg_inner.data('blocked');
                    if (isGroup) {
                        $li_mck_block_user.removeClass('vis').addClass('n-vis');
                        return;
                    }
                    var blockText = isBlock
                        ? MCK_LABELS['block.user.alert']
                        : MCK_LABELS['unblock.user.alert'];
                    if (confirm(blockText)) {
                        alUserService.blockUser(
                            tabId,
                            isBlock,
                            function (userId) {
                                mckUserUtils.toggleBlockUser(userId, isBlock);
                            }
                        );
                    }
                });
                $mck_btn_leave_group.on('click', function (e) {
                    e.preventDefault();
                    var tabId = $mck_msg_inner.data('mck-id');
                    var isGroup = $mck_msg_inner.data('isgroup');
                    if (!isGroup) {
                        $mck_group_menu_options
                            .removeClass('vis')
                            .addClass('n-vis');
                        return;
                    }
                    if (confirm(MCK_LABELS['exit.group.alert'])) {
                        mckGroupService.leaveGroup({
                            apzCallback: mckGroupLayout.onGroupLeft,
                            groupId: tabId,
                        });
                    }
                });
                $applozic(d).on('click', '.mck-add-to-group', function (e) {
                    e.preventDefault();
                    var userId = $applozic(this).data('mck-id');
                    if (typeof userId !== 'undefined') {
                        mckGroupLayout.addGroupMemberFromSearch(userId);
                    }
                    $mck_gm_search_box.mckModal('hide');
                });
                $applozic(d).on(
                    'click',
                    '.mck-btn-remove-member',
                    function (e) {
                        e.stopPropagation();
                        var userId = $applozic(this)
                            .parents('.mck-li-group-member')
                            .data('mck-id');
                        var groupId = $mck_group_info_tab.data('mck-id');
                        if (
                            typeof groupId !== 'undefined' &&
                            typeof userId !== 'undefined'
                        ) {
                            var group = mckGroupUtils.getGroup(groupId);
                            if (
                                typeof group === 'object' &&
                                MCK_USER_ID === group.adminName
                            ) {
                                if (
                                    confirm(MCK_LABELS['remove.member.alert'])
                                ) {
                                    mckGroupService.removeGroupMember({
                                        groupId: groupId,
                                        userId: userId,
                                        apzCallback:
                                            mckGroupLayout.onRemovedGroupMember,
                                    });
                                }
                            } else {
                                $mck_group_admin_options
                                    .removeClass('vis')
                                    .addClass('n-vis');
                            }
                        }
                    }
                );
                $mck_btn_group_exit.on('click', function (e) {
                    e.preventDefault();
                    var groupId = $mck_group_info_tab.data('mck-id');
                    if (!groupId) {
                        mckMessageLayout.loadTab({
                            tabId: '',
                            isGroup: false,
                        });
                        return;
                    }
                    if (confirm(MCK_LABELS['exit.group.alert'])) {
                        mckGroupService.leaveGroup({
                            groupId: groupId,
                            apzCallback: mckGroupLayout.onGroupLeft,
                        });
                    }
                });
                $mck_btn_group_info.on('click', function (e) {
                    e.preventDefault();
                    var tabId = $mck_msg_inner.data('mck-id');
                    var isGroup = $mck_msg_inner.data('isgroup');
                    if (!isGroup) {
                        $mck_group_menu_options
                            .removeClass('vis')
                            .addClass('n-vis');
                        return;
                    }
                    var params = {
                        groupId: tabId,
                    };
                    var conversationId = $mck_msg_inner.data(
                        'mck-conversationid'
                    );
                    if (conversationId) {
                        params.conversationId = conversationId;
                    }
                    mckGroupLayout.loadGroupInfo(params);
                });
                $mck_new_group.on('click', function (e) {
                    e.preventDefault();
                    mckGroupLayout.loadCreateGroupTab();
                });
                $mck_group_back_link.on('click', function (e) {
                    e.preventDefault();
                    var groupId = $mck_group_info_tab.data('mck-id');
                    var conversationId = $mck_group_info_tab.data(
                        'mck-conversation-id'
                    );
                    if (groupId) {
                        var params = {
                            tabId: groupId,
                            isGroup: true,
                        };
                        if (conversationId) {
                            params.conversationId = conversationId;
                        }
                        mckMessageLayout.loadTab(params);
                    } else {
                        mckMessageLayout.loadTab({
                            tabId: '',
                            isGroup: false,
                        });
                    }
                });
                $mck_group_add_member.on('click', function (e) {
                    e.preventDefault();
                    var groupId = $mck_group_info_tab.data('mck-id');
                    if (groupId) {
                        var group = mckGroupUtils.getGroup(groupId);
                        if (group && group.adminName === MCK_USER_ID) {
                            $mck_group_member_search_list.html('');
                            $mck_gm_search_box.mckModal();
                            $mck_gms_loading
                                .removeClass('n-vis')
                                .addClass('vis');
                            if (MCK_GROUP_MEMBER_SEARCH_ARRAY.length > 0) {
                                mckGroupLayout.addMembersToGroupSearchList();
                            } else if (IS_MCK_OWN_CONTACTS) {
                                if (MCK_CONTACT_ARRAY.length > 0) {
                                    $applozic.each(
                                        MCK_CONTACT_ARRAY,
                                        function (i, contact) {
                                            MCK_GROUP_MEMBER_SEARCH_ARRAY.push(
                                                contact.contactId
                                            );
                                        }
                                    );
                                    mckGroupLayout.addMembersToGroupSearchList();
                                } else {
                                    $mck_gms_loading
                                        .removeClass('vis')
                                        .addClass('n-vis');
                                    $mck_no_gsm_text
                                        .removeClass('n-vis')
                                        .addClass('vis');
                                }
                            } else {
                                mckContactService.loadContacts();
                            }
                        } else {
                            $mck_group_admin_options
                                .removeClass('vis')
                                .addClass('n-vis');
                            return;
                        }
                    }
                });
                $mck_group_member_search.keypress(function (e) {
                    if (e.which === 13) {
                        var userId = $mck_group_member_search.val();
                        if (userId !== '') {
                            mckGroupLayout.addGroupMemberFromSearch(userId);
                        }
                        $mck_group_member_search.val('');
                        return true;
                    }
                });
                $applozic(d).on(
                    'click',
                    '.mck-group-member-search-link',
                    function (e) {
                        e.preventDefault();
                        var userId = $mck_group_member_search.val();
                        if (userId !== '') {
                            mckGroupLayout.addGroupMemberFromSearch(userId);
                        }
                        $mck_group_member_search.val('');
                    }
                );
                $applozic(d).on('click', '.mck-show-more', function (e) {
                    e.preventDefault();
                    var $this = $applozic(this);
                    var tabId = $this.data('tabId');
                    var isGroup = $mck_msg_inner.data('isgroup');
                    var conversationId = $mck_msg_inner.data(
                        'mck-conversationid'
                    );
                    conversationId = conversationId
                        ? conversationId.toString()
                        : '';
                    var startTime = $this.data('datetime');
                    mckMessageService.loadMessageList({
                        tabId: tabId,
                        isGroup: isGroup,
                        conversationId: conversationId,
                        startTime: startTime,
                    });
                });
                $applozic(d).on('click', '.mck-accept', function (e) {
                    var conversationId = $applozic(this).data(
                        'mck-conversationid'
                    );
                    var priceText = $applozic(this).data('mck-topic-price');
                    if (
                        typeof MCK_PRICE_DETAIL === 'function' &&
                        priceText &&
                        conversationId
                    ) {
                        var conversationPxy =
                            MCK_CONVERSATION_MAP[conversationId];
                        var groupId = $mck_msg_to.val();
                        var supplierId = mckGroupService.getGroupDisplayName(
                            groupId
                        );
                        if (typeof conversationPxy === 'object') {
                            MCK_PRICE_DETAIL({
                                custId: MCK_USER_ID,
                                suppId: supplierId,
                                productId: conversationPxy.topicId,
                                price: priceText,
                            });
                            alMessageService.sendConversationCloseUpdate(
                                conversationId
                            );
                        } else {
                            alMessageService.getTopicId(
                                {
                                    conversationId: conversationId,
                                    suppId: supplierId,
                                    priceText: priceText,
                                },
                                function (params) {
                                    mckMessageLayout.populateMessage(
                                        params.messageType,
                                        params.message,
                                        params.notifyUser
                                    );
                                }
                            );
                        }
                    }
                });
                $mck_msg_form.submit(function () {
                    if (window.Applozic.ALSocket.mck_typing_status === 1) {
                        window.Applozic.ALSocket.sendTypingStatus(
                            0,
                            window.Applozic.ALSocket.mck_typing_status,
                            MCK_USER_ID,
                            $mck_msg_inner.data('mck-id')
                        );
                    }
                    var message = $applozic.trim(
                        mckUtils.textVal($mck_text_box[0])
                    );
                    if (
                        $mck_file_box.hasClass('n-vis') &&
                        FILE_META.length > 0
                    ) {
                        FILE_META = [];
                    }
                    if (message.length === 0 && FILE_META.length === 0) {
                        $mck_box_form.addClass('mck-text-req');
                        return false;
                    }
                    if (
                        typeof MCK_MSG_VALIDATION === 'function' &&
                        !MCK_MSG_VALIDATION(message)
                    ) {
                        return false;
                    }
                    var messagePxy = {
                        type: 5,
                        contentType: 0,
                        message: message,
                    };
                    var conversationId = $mck_msg_inner.data(
                        'mck-conversationid'
                    );
                    var topicId = $mck_msg_inner.data('mck-topicid');
                    if (conversationId) {
                        messagePxy.conversationId = conversationId;
                    } else if (topicId) {
                        var conversationPxy = {
                            topicId: topicId,
                        };
                        var topicDetail = MCK_TOPIC_DETAIL_MAP[topicId];
                        if (typeof topicDetail === 'object') {
                            conversationPxy.topicDetail = w.JSON.stringify(
                                topicDetail
                            );
                        }
                        messagePxy.conversationPxy = conversationPxy;
                    }
                    var autosuggestMetadata = $mck_autosuggest_metadata.val();
                    if (autosuggestMetadata && autosuggestMetadata != '') {
                        messagePxy.metadata = {
                            suggestMessageMetadata: autosuggestMetadata,
                        };
                        $mck_autosuggest_metadata.val('');
                    }
                    if (
                        $mck_autosuggest_search_input.data('prev-msgkey') !=
                            '' &&
                        typeof $mck_autosuggest_search_input.data(
                            'prev-msgkey'
                        ) != 'undefined'
                    ) {
                        mckMessageService.updateMessageMetadata({
                            key: $mck_autosuggest_search_input.data(
                                'prev-msgkey'
                            ),
                            metadata: { obsolete: true },
                        });
                        $mck_autosuggest_search_input.data('prev-msgkey', '');
                    }
                    _this.hideAutoSuggestionBoxEnableTxtBox();
                    if ($mck_msg_inner.data('isgroup') === true) {
                        messagePxy.groupId = $mck_msg_to.val();
                    } else {
                        messagePxy.to = $mck_msg_to.val();
                    }
                    $mck_msg_sbmt.attr('disabled', true);
                    $mck_msg_error.removeClass('vis').addClass('n-vis');
                    $mck_msg_error.html('');
                    $mck_response_text.html('');
                    $mck_msg_response.removeClass('vis').addClass('n-vis');
                    var sendMsgCount = $applozic('[data-msgtype=5]').length;
                    //Lead Collection -Email Validation
                    if (
                        sendMsgCount == 1 &&
                        ((SnapUI.leadCollectionEnabledOnAwayMessage &&
                            SnapUI.awayMessageInfo.isEnabled &&
                            SnapUI.awayMessageInfo.eventId == 1) ||
                            (SnapUI.welcomeMessageEnabled &&
                                SnapUI.leadCollectionEnabledOnWelcomeMessage &&
                                SnapUI.anonymousUser))
                    ) {
                        var isValid = SnapUI.validateEmail(messagePxy.message);
                        if (!isValid) {
                            return false;
                        }
                    }
                    window.setTimeout(function () {
                        $applozic('#mck-text-box').blur();
                        $applozic('#mck-file-input').blur();
                        $applozic('#mck-autosuggest-search-input').blur();
                        $applozic('#mck-textbox-container').blur();
                        $applozic('#mck-msg-form').blur();
                        $applozic('input').blur();
                        try {
                            var event = document.createEvent('Events');
                            event.initEvent('touchstart', true, true);
                            var event2 = document.createEvent('Events');
                            event2.initEvent('touchend', true, true);
                            document.getElementById('mck-message-cell').dispatchEvent(event);
                            document.getElementById('mck-message-cell').dispatchEvent(event2);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }, 500);
                    document.addEventListener('touchstart', function(e) {
                        console.log('touchstart', e);
                    });
                    document.addEventListener('touchend', function(e) {
                        console.log('touchend', e);
                    });
                    _this.hideSendButton();
                    Snap.typingAreaService.showMicIfSpeechRecognitionSupported();
                    _this.sendMessage(messagePxy);
                    return false;
                });
                $mck_form_field.on('click', function () {
                    $applozic(this).val('');
                    $mck_msg_error.removeClass('vis').addClass('n-vis');
                    $mck_msg_response.removeClass('vis').addClass('n-vis');
                });
                $applozic(d).bind('click', function (e) {
                    $applozic('.mck-context-menu')
                        .removeClass('vis')
                        .addClass('n-vis');
                    if (
                        $mck_btn_attach.hasClass('on') &&
                        !$applozic(e.target).hasClass('mck-icon-upload') &&
                        !$applozic(e.target).hasClass('mck-btn-attach')
                    ) {
                        mckMapLayout.fileMenuToggle();
                    }
                    $mck_box_form.removeClass('mck-text-req');
                    if (d.activeElement && d.activeElement !== $mck_text_box) {
                        if (window.Applozic.ALSocket.mck_typing_status === 1) {
                            window.Applozic.ALSocket.sendTypingStatus(
                                0,
                                window.Applozic.ALSocket.mck_typing_status,
                                MCK_USER_ID,
                                $mck_msg_inner.data('mck-id')
                            );
                        }
                    }
                    if (
                        d.activeElement &&
                        d.activeElement.id !== 'mck-group-name-save'
                    ) {
                        $mck_group_title.removeClass('mck-req-border');
                    }
                    if (
                        d.activeElement &&
                        d.activeElement.id !== 'mck-btn-group-create'
                    ) {
                        $mck_group_create_title.removeClass('mck-req-border');
                    }
                    $applozic('.mcktypeahead.mck-dropdown-menu').hide();
                });

                $applozic('.mck-tabview-item').click(function () {
                    $applozic('.mck-tabview-item').removeClass('active');
                    $applozic(this).addClass('active');
                });
            };
            $applozic('.mck-sidebox').on('click', '#mck-mike-btn', function () {
                $applozic(this).removeClass('vis').addClass('n-vis');
                $applozic('.mck-stop-btn').addClass('vis').removeClass('n-vis');
                Fr.voice.record(false, function () {
                    $applozic('#mck-audio')
                        .removeClass('n-vis')
                        .addClass('vis');
                    mckMessageService.timer();
                });
            });
            $applozic('.mck-sidebox').on(
                'click',
                '#mck-stop-recording',
                function () {
                    $applozic('#mck-mike-btn')
                        .addClass('vis')
                        .removeClass('n-vis');
                    $applozic('.mck-stop-btn')
                        .addClass('n-vis')
                        .removeClass('vis');
                    $applozic('#mck-audio')
                        .removeClass('vis')
                        .addClass('n-vis');
                    mckMessageService.stoptimer();
                    Fr.voice.export(function (blob) {
                        var params = {};
                        params.file = blob;
                        params.name = 'blob';
                        $applozic.fn.applozic('audioAttach', params);
                    }, 'blob');
                    Fr.voice.stop();
                }
            );
            _this.closeSideBox = function () {
                snapCommons.setWidgetStateOpen(false);
                MCK_MAINTAIN_ACTIVE_CONVERSATION_STATE &&
                    SnapUtils.removeItemFromLocalStorage(
                        'mckActiveConversationInfo'
                    );
                SnapUI.hideAwayMessage();
                SnapUI.hideLeadCollectionTemplate();
                SnapUI.showClosedConversationBanner(false);
                $mck_sidebox.mckModal('hide');
                $applozic('#mck-sidebox-launcher')
                    .removeClass('n-vis')
                    .addClass('vis');
                if (
                    document
                        .getElementById('launcher-agent-img-container')
                        .classList.contains('vis')
                ) {
                    document
                        .querySelector(
                            '#mck-sidebox-launcher #launcher-svg-container'
                        )
                        .classList.add('n-vis');
                    document
                        .querySelector(
                            '#mck-sidebox-launcher #launcher-svg-container'
                        )
                        .classList.remove('vis');
                } else {
                    document
                        .querySelector(
                            '#mck-sidebox-launcher #launcher-svg-container'
                        )
                        .classList.add('vis');
                    document
                        .querySelector(
                            '#mck-sidebox-launcher #launcher-svg-container'
                        )
                        .classList.remove('n-vis');
                }
                var conversationId = $mck_msg_inner.data('mck-conversationid');
                $mck_msg_inner.data('mck-id', '');
                $mck_msg_inner.data('mck-topicid', '');
                $mck_msg_inner.data('mck-name', '');
                $mck_msg_inner.data('mck-conversationid', '');
                if (conversationId) {
                    var conversationPxy = MCK_CONVERSATION_MAP[conversationId];
                    if (typeof conversationPxy === 'object') {
                        var topicId = conversationPxy.topicId;
                        if (typeof MCK_ON_PLUGIN_CLOSE === 'function') {
                            MCK_ON_PLUGIN_CLOSE(MCK_USER_ID, topicId);
                        }
                    }
                }
                window.Applozic.ALSocket.unsubscibeToTypingChannel();
            };
            _this.openChat = function (ele, callback) {
                var $this = $applozic(ele);
                var tabId = $this.data('mck-id');
                tabId =
                    typeof tabId !== 'undefined' && tabId !== ''
                        ? tabId.toString()
                        : '';
                var userName = $this.data('mck-name');
                userName =
                    typeof userName !== 'undefined' && userName !== ''
                        ? userName.toString()
                        : '';
                var topicId = $this.data('mck-topicid');
                topicId =
                    typeof topicId !== 'undefined' && topicId !== ''
                        ? topicId.toString()
                        : '';
                var isGroup = $this.data('isgroup') === true;
                var conversationId = $this.data('mck-conversationid');
                conversationId =
                    typeof conversationId !== 'undefined' &&
                    conversationId !== ''
                        ? conversationId.toString()
                        : '';
                SnapUI.checkSingleThreadedConversationSettings(
                    Object.keys(MCK_GROUP_MAP).length > 1
                );
                if (topicId && !conversationId) {
                    var topicStatus = $applozic(elem).data('mck-topic-status');
                    if (topicStatus) {
                        topicStatus =
                            CONVERSATION_STATUS_MAP.indexOf(topicStatus) === -1
                                ? CONVERSATION_STATUS_MAP[0]
                                : topicStatus.toString();
                    } else {
                        topicStatus = CONVERSATION_STATUS_MAP[0];
                    }
                    mckMessageService.getConversationId({
                        tabId: tabId,
                        isGroup: isGroup,
                        userName: userName,
                        topicId: topicId,
                        topicStatus: topicStatus,
                        isMessage: false,
                    });
                } else {
                    mckMessageLayout.loadTab(
                        {
                            tabId: tabId,
                            isGroup: isGroup,
                            userName: userName,
                            conversationId: conversationId,
                            topicId: topicId,
                        },
                        callback
                    );
                }
                $mck_search.val('');
            };
            _this.sendMessage = function (messagePxy, file, callback) {
                var key;
                var message;
                if (
                    Snap.internetStatus &&
                    $applozic(
                        "#mck-message-cell .mck-message-inner div[name='message']:last-child"
                    ).data('msgkey') !== undefined
                ) {
                    key = $applozic(
                        "#mck-message-cell .mck-message-inner div[name='message']:last-child"
                    ).data('msgkey');
                    message = alMessageService.getReplyMessageByKey(key);
                }
                if (typeof messagePxy !== 'object') {
                    return;
                }
                if (messagePxy.to) {
                    if (
                        alUserService.MCK_USER_DETAIL_MAP[messagePxy.to] &&
                        (alUserService.MCK_USER_DETAIL_MAP[messagePxy.to]
                            .deletedAtTime ||
                            isUserDeleted === true)
                    ) {
                        $mck_msg_error
                            .html(MCK_LABELS['user.delete'])
                            .removeClass('n-vis')
                            .addClass('vis');
                        $applozic('#mck-tab-status')
                            .removeClass('vis')
                            .addClass('n-vis');
                        $mck_msg_form.removeClass('vis').addClass('n-vis');
                        $li_mck_block_user.removeClass('vis').addClass('n-vis');
                        return;
                    }
                }
                var metadata = messagePxy.metadata ? messagePxy.metadata : {};
                var msgKeys = $applozic('#mck-text-box').data('AL_REPLY');
                if (
                    typeof msgKeys !== 'undefined' &&
                    msgKeys !== '' &&
                    !messagePxy.forward
                ) {
                    metadata.AL_REPLY = msgKeys;
                }

                messagePxy.metadata = metadata;
                if (
                    (typeof messagePxy.message === 'undefined' ||
                        messagePxy.message.length === 0) &&
                    FILE_META.length === 0
                ) {
                    $mck_box_form.addClass('mck-text-req');
                    return;
                }

                if (message) {
                    if (
                        message.metadata.altype &&
                        (message.type === 0 ||
                            message.type === 4 ||
                            message.type === 6)
                    ) {
                        metadata.altype = message.metadata.altype;
                    }
                }

                if (messagePxy.conversationId) {
                    var conversationPxy =
                        MCK_CONVERSATION_MAP[messagePxy.conversationId];
                    if (
                        conversationPxy !== 'undefined' &&
                        conversationPxy.closed
                    ) {
                        mckMessageLayout.closeConversation();
                        $mck_msg_sbmt.attr('disabled', false);
                        return;
                    }
                }
                var isBlocked = $mck_msg_inner.data('blocked');
                if (isBlocked && !messagePxy.groupId) {
                    mckUserUtils.toggleBlockUser(tabId, true);
                    $mck_msg_sbmt.attr('disabled', false);
                    return;
                }
                var contact = '';
                if (messagePxy.groupId) {
                    contact = mckGroupUtils.getGroup(messagePxy.groupId);
                    if (typeof contact === 'undefined') {
                        contact = mckGroupUtils.createGroup(messagePxy.groupId);
                    }
                } else if (messagePxy.clientGroupId) {
                    contact = mckGroupUtils.getGroupByClientGroupId(
                        messagePxy.clientGroupId
                    );
                } else {
                    contact = mckMessageLayout.fetchContact(messagePxy.to);
                }
                if (
                    $applozic('#mck-message-cell .mck-no-data-text').length > 0
                ) {
                    $applozic('.mck-no-data-text').remove();
                }
                if (messagePxy.message && FILE_META.length === 0) {
                    var isTopPanelAdded = $mck_tab_message_option.hasClass(
                        'n-vis'
                    );
                    var tabId = $mck_msg_inner.data('mck-id');
                    var randomId = mckUtils.randomId();
                    messagePxy.key = randomId;
                    if (
                        messagePxy.contentType !== 12 &&
                        tabId &&
                        tabId.toString() === contact.contactId &&
                        messagePxy.contentType !== 102
                    ) {
                        alMessageService.addMessageToTab(
                            messagePxy,
                            contact,
                            function (message, contact) {
                                mckMessageLayout.addMessage(
                                    message,
                                    contact,
                                    true,
                                    true,
                                    false
                                );
                            }
                        );
                    }
                    var optns = {
                        tabId: contact.contactId,
                        isTopPanelAdded: isTopPanelAdded,
                    };
                    _this.submitMessage(messagePxy, optns);
                } else if (
                    messagePxy.message &&
                    FILE_META.length !== 0 &&
                    (messagePxy.contentType === 1 ||
                        messagePxy.contentType === 2)
                ) {
                    var isTopPanelAdded = $mck_tab_message_option.hasClass(
                        'n-vis'
                    );
                    var tabId = $mck_msg_inner.data('mck-id');
                    var randomId = mckUtils.randomId();
                    messagePxy.key = randomId;
                    var locationMessage = {};
                    if (messagePxy.groupId) {
                        locationMessage.groupId = messagePxy.groupId;
                    } else {
                        locationMessage.to = messagePxy.to;
                    }
                    locationMessage.type = messagePxy.type;
                    locationMessage.key = mckUtils.randomId();
                    locationMessage.message = messagePxy.message;
                    locationMessage.contentType = messagePxy.contentType;
                    messagePxy.contentType = 1;
                    messagePxy.fileMeta = FILE_META[0];
                    messagePxy.message = '';
                    if (
                        messagePxy.contentType !== 12 &&
                        tabId &&
                        tabId.toString() === contact.contactId
                    ) {
                        alMessageService.addMessageToTab(
                            messagePxy,
                            contact,
                            function (message, contact) {
                                mckMessageLayout.addMessage(
                                    message,
                                    contact,
                                    true,
                                    true,
                                    false
                                );
                            }
                        );
                        alMessageService.addMessageToTab(
                            locationMessage,
                            contact,
                            function (message, contact) {
                                mckMessageLayout.addMessage(
                                    message,
                                    contact,
                                    true,
                                    true,
                                    false
                                );
                            }
                        );
                    }
                    var optns = {
                        tabId: contact.contactId,
                        isTopPanelAdded: isTopPanelAdded,
                    };
                    _this.submitMessage(messagePxy, optns);
                    _this.submitMessage(locationMessage, optns);
                } else if (FILE_META.length > 0) {
                    $applozic.each(FILE_META, function (i, fileMeta) {
                        var isTopPanelAdded = $mck_tab_message_option.hasClass(
                            'n-vis'
                        );
                        var tabId = $mck_msg_inner.data('mck-id');
                        var randomId = mckUtils.randomId();
                        messagePxy.key = randomId;
                        messagePxy.fileMeta = fileMeta;
                        file &&
                            file.size &&
                            (messagePxy.fileMeta.size = file.size);
                        messagePxy.contentType = 1;
                        if (
                            messagePxy.contentType !== 12 &&
                            tabId &&
                            tabId.toString() === contact.contactId
                        ) {
                            alMessageService.addMessageToTab(
                                messagePxy,
                                contact,
                                function (message, contact) {
                                    mckMessageLayout.addMessage(
                                        message,
                                        contact,
                                        true,
                                        true,
                                        false
                                    );
                                }
                            );
                        }
                        var optns = {
                            tabId: contact.contactId,
                            isTopPanelAdded: isTopPanelAdded,
                        };
                        var stopUpload = SnapUI.getAttachmentStopUploadStatus(
                            messagePxy.key
                        );
                        if (!Snap.internetStatus || stopUpload) {
                            KM_PENDING_ATTACHMENT_FILE[messagePxy.key] = file;
                            file.type.indexOf('image/') != -1 &&
                                SnapUI.displayUploadIconForAttachment(
                                    messagePxy.key,
                                    false
                                );
                            SnapUI.updateAttachmentStopUploadStatus(
                                messagePxy.key,
                                true
                            );
                            return;
                        }
                        if (
                            FILE_META &&
                            SnapUI.isAttachmentV2(FILE_META[0].contentType)
                        ) {
                            $applozic('.mck-timestamp-' + messagePxy.key)
                                .removeClass('vis')
                                .addClass('n-vis');
                            FILE_META[0].contentType.indexOf('image/') != -1 &&
                                SnapUI.displayProgressMeter(messagePxy.key);
                            SnapUI.updateAttachmentTemplate(
                                messagePxy,
                                messagePxy.key
                            );
                            if (typeof callback == 'function') {
                                callback(messagePxy);
                            }
                        } else {
                            _this.submitMessage(messagePxy, optns);
                        }
                    });
                }
                $mck_box_form.removeClass('mck-text-req');
                $mck_msg_sbmt.attr('disabled', false);
                $applozic('.' + randomId + ' .mck-message-status')
                    .removeClass('mck-sent-icon')
                    .addClass('mck-pending-icon');
                mckMessageLayout.addTooltip(randomId);
                mckMessageLayout.clearMessageField(true);
                FILE_META = [];
                delete TAB_MESSAGE_DRAFT[contact.contactId];
            };
            _this.sendForwardMessage = function (forwardMessageKey) {
                var forwardMessage = ALStorage.getMessageByKey(
                    forwardMessageKey
                );
                if (typeof forwardMessage === 'undefined') {
                    return;
                }
                if (forwardMessage.fileMeta) {
                    FILE_META.push(forwardMessage.fileMeta);
                }

                var messagePxy = {
                    type: 5,
                    contentType: forwardMessage.contentType,
                    message: forwardMessage.message,
                    forward: 'forward',
                };
                if (forwardMessage.metadata) {
                    if (forwardMessage.metadata.AL_REPLY) {
                        forwardMessage.metadata.AL_REPLY = '';
                    }
                    messagePxy.metadata = forwardMessage.metadata;
                }
                var conversationId = $mck_msg_inner.data('mck-conversationid');
                var topicId = $mck_msg_inner.data('mck-topicid');
                if (conversationId) {
                    messagePxy.conversationId = conversationId;
                } else if (topicId) {
                    var conversationPxy = {
                        topicId: topicId,
                    };
                    var topicDetail = MCK_TOPIC_DETAIL_MAP[topicId];
                    if (typeof topicDetail === 'object') {
                        conversationPxy.topicDetail = w.JSON.stringify(
                            topicDetail
                        );
                    }
                    messagePxy.conversationPxy = conversationPxy;
                }
                if ($mck_msg_inner.data('isgroup') === true) {
                    messagePxy.groupId = $mck_msg_to.val();
                } else {
                    messagePxy.to = $mck_msg_to.val();
                }
                _this.sendMessage(messagePxy);
            };
            _this.sendWelcomeMessage = function (params) {
                var randomId = mckUtils.randomId();
                var tabId = $mck_msg_inner.data('mck-id');
                var isGroup = $mck_msg_inner.data('isgroup');
                var messagePxy = {
                    key: randomId,
                    type: 4,
                    contentType: 0,
                    to: params.sender,
                    message: params.messageContent,
                };
                if (tabId && tabId.toString() === params.sender && !isGroup) {
                    var contact = mckMessageLayout.fetchContact(tabId);
                    alMessageService.addMessageToTab(
                        messagePxy,
                        contact,
                        function (message, contact) {
                            mckMessageLayout.addMessage(
                                message,
                                contact,
                                true,
                                true,
                                false
                            );
                        }
                    );
                }
                window.Applozic.ALApiService.ajax({
                    type: 'GET',
                    url: MCK_BASE_URL + MESSAGE_ADD_INBOX_URL,
                    global: false,
                    data:
                        'sender=' +
                        encodeURIComponent(params.sender) +
                        '&messageContent=' +
                        encodeURIComponent(params.messageContent),
                    contentType: 'text/plain',
                    success: function (data) {
                        if (params.callback) {
                            params.callback(data);
                        }
                    },
                });
            };
            // chat context can be any extra information i.e. groupId, formUserName etc.
            _this.getChatContext = function (msgProxy) {
                var existingContextFromMetadata =
                    msgProxy &&
                    msgProxy.metadata &&
                    typeof msgProxy.metadata['KM_CHAT_CONTEXT'] == 'object'
                        ? msgProxy.metadata['KM_CHAT_CONTEXT']
                        : {};
                // chat context in setting can be updated by user using Snap.updateSetting()
                var chatContext = SnapUtils.getSettings('KM_CHAT_CONTEXT');
                chatContext = typeof chatContext == 'object' ? chatContext : {};
                MCK_DEFAULT_MESSAGE_METADATA =
                    typeof MCK_DEFAULT_MESSAGE_METADATA == 'object'
                        ? MCK_DEFAULT_MESSAGE_METADATA
                        : {};
                return $applozic.extend(
                    {},
                    chatContext,
                    MCK_DEFAULT_MESSAGE_METADATA,
                    existingContextFromMetadata
                );
            };

            _this.submitMessage = function (messagePxy, optns) {
                var randomId = messagePxy.key;
                var metadata = messagePxy.metadata ? messagePxy.metadata : {};

                if (MCK_CHECK_USER_BUSY_STATUS) {
                    metadata = $applozic.extend(messagePxy.metadata, {
                        userStatus: 4,
                    });
                }
                var msgKeys = $applozic('#mck-text-box').data('AL_REPLY');
                if (
                    typeof msgKeys !== 'undefined' &&
                    msgKeys !== '' &&
                    !messagePxy.forward
                ) {
                    metadata.AL_REPLY = msgKeys;
                    $applozic('#mck-text-box').data('AL_REPLY', '');
                }
                messagePxy.source = MCK_SOURCE;
                var $mck_msg_div = $applozic(
                    "#mck-message-cell .mck-message-inner div[name='message']." +
                        randomId
                );

                $applozic.extend(metadata, {
                    KM_CHAT_CONTEXT: JSON.stringify(
                        _this.getChatContext(messagePxy)
                    ),
                });

                messagePxy.metadata = metadata;
                messagePxy.message = messagePxy.message.normalize('NFD');
                if (snap._globals.hidePostCTA) {
                    Snap.hideMessage();
                }
                window.Applozic.ALApiService.ajax({
                    type: 'POST',
                    url: MCK_BASE_URL + MESSAGE_SEND_URL,
                    global: false,
                    data: w.JSON.stringify(messagePxy),
                    contentType: 'application/json',
                    success: function (data) {
                        // if (snap._globals.hidePostCTA) {
                        //     Snap.hideMessage();
                        // }

                        if (
                            messagePxy &&
                            typeof messagePxy.fileMeta === 'object' &&
                            SnapUI.isAttachmentV2(
                                messagePxy.fileMeta.contentType
                            )
                        ) {
                            $applozic('.mck-timestamp-' + messagePxy.key)
                                .removeClass('n-vis')
                                .addClass('vis');
                            SnapUI.updateAttachmentStopUploadStatus(
                                messagePxy.key,
                                false
                            );
                        }
                        var currentTabId = $mck_msg_inner.data('mck-id');
                        if (typeof data === 'object') {
                            SnapUI.deleteProgressMeter(messagePxy.key, true);
                            $applozic(
                                '.km-attachment-download-icon-' + messagePxy.key
                            )
                                .removeClass('n-vis')
                                .addClass('vis');
                            $applozic(
                                '.km-attachment-cancel-icon-' + messagePxy.key
                            )
                                .removeClass('vis')
                                .addClass('n-vis');
                            snapCommons.modifyClassList(
                                {
                                    class: [
                                        'km-attachment-progress-bar-wrapper-' +
                                            messagePxy.key,
                                    ],
                                },
                                'n-vis',
                                'vis'
                            );
                            var messageKey = data.messageKey;
                            if (
                                currentTabId &&
                                currentTabId.toString() === optns.tabId
                            ) {
                                var conversationId = data.conversationId;
                                $mck_msg_inner.data(
                                    'mck-conversationid',
                                    conversationId
                                );
                                $mck_msg_div
                                    .removeClass(randomId)
                                    .addClass(messageKey);
                                $mck_msg_div.data('msgkey', messageKey);
                                $applozic(
                                    '.' + messageKey + ' .mck-message-status'
                                )
                                    .removeClass('mck-pending-icon')
                                    .addClass('mck-sent-icon')
                                    .attr('title', 'sent');
                                mckMessageLayout.addTooltip(messageKey);
                                if (optns.isTopPanelAdded) {
                                    $mck_tab_option_panel.data(
                                        'datetime',
                                        data.createdAt
                                    );
                                }
                                var validated = true;
                                if (messagePxy.groupId) {
                                    var group = mckGroupUtils.getGroup(
                                        messagePxy.groupId
                                    );
                                    if (group.type === 6) {
                                        validated = false;
                                    }
                                }
                                if (validated) {
                                    mckMessageLayout.messageContextMenu(
                                        messageKey
                                    );
                                }
                            }
                            if (messagePxy.conversationPxy) {
                                var conversationPxy =
                                    messagePxy.conversationPxy;
                                if (messagePxy.topicId) {
                                    MCK_TOPIC_CONVERSATION_MAP[
                                        messagePxy.topicId
                                    ] = [conversationId];
                                }
                                MCK_CONVERSATION_MAP[
                                    conversationId
                                ] = conversationPxy;
                            }
                        } else if (
                            data === 'CONVERSATION_CLOSED' ||
                            data === 'BUSY_WITH_OTHER'
                        ) {
                            $mck_msg_sbmt.attr('disabled', false);
                            mckMessageLayout.closeConversation(data);
                            $mck_msg_div.remove();
                            if (optns.isTopPanelAdded) {
                                $mck_tab_message_option
                                    .removeClass('vis')
                                    .addClass('n-vis');
                            }
                        } else if (data === 'error') {
                            $mck_msg_sbmt.attr('disabled', false);
                            $mck_msg_error.html(
                                'Unable to process your request. Please try again'
                            );
                            $mck_msg_error.removeClass('n-vis').addClass('vis');
                            $mck_msg_div.remove();
                            if (optns.isTopPanelAdded) {
                                $mck_tab_message_option
                                    .removeClass('vis')
                                    .addClass('n-vis');
                            }
                        }
                        // Lead Collection (Email)
                        var sendMsgCount = $applozic('[data-msgtype=5]').length;
                        if (
                            sendMsgCount == 1 &&
                            ((SnapUI.leadCollectionEnabledOnAwayMessage &&
                                SnapUI.awayMessageInfo.isEnabled &&
                                SnapUI.awayMessageInfo.eventId == 1) ||
                                (SnapUI.welcomeMessageEnabled &&
                                    SnapUI.leadCollectionEnabledOnWelcomeMessage &&
                                    SnapUI.anonymousUser))
                        ) {
                            SnapUI.displayLeadCollectionTemplate(null);
                        }
                        sendMsgCount > 1 &&
                            $applozic('#mck-email-collection-box')
                                .removeClass('vis')
                                .addClass('n-vis');

                        var displayName = mckMessageLayout.getTabDisplayName(
                            currentTabId,
                            false
                        );
                        if (
                            !alUserService.MCK_USER_DETAIL_MAP[currentTabId] &&
                            currentTabId !== displayName
                        ) {
                            mckContactService.updateDisplayName(
                                currentTabId,
                                displayName
                            );
                            var userDetail = {
                                userId: currentTabId,
                                userName: displayName,
                            };
                            alUserService.MCK_USER_DETAIL_MAP[
                                userDetail.userId
                            ] = userDetail;
                        }
                        var audioSend = document.getElementById('audioSend');
                        audioSend.play();
                    },
                    error: function () {
                        $mck_msg_error.html(
                            'Unable to process your request. Please try again.'
                        );
                        $mck_msg_error.removeClass('n-vis').addClass('vis');
                        if ($mck_msg_div) {
                            $mck_msg_div.remove();
                        }
                        if (optns.isTopPanelAdded) {
                            $mck_tab_message_option
                                .removeClass('vis')
                                .addClass('n-vis');
                        }
                    },
                });
                $applozic('#mck-reply-to-div')
                    .removeClass('vis')
                    .addClass('n-vis');
            };

            _this.updateMessageMetadata = function (messagePxy) {
                if (!messagePxy.metadata && !messagePxy.messageKey) {
                    console.log('empty metadata');
                    return;
                }
                window.Applozic.ALApiService.ajax({
                    type: 'POST',
                    url: MCK_BASE_URL + UPDATE_MESSAGE_METADATA,
                    global: false,
                    data: w.JSON.stringify(messagePxy),
                    contentType: 'application/json',
                    success: function (data) {
                        console.log('metadata updated: ', data);
                    },
                    error: function () {},
                });
            };

            _this.downloadImage = function (fileurl) {
                window.open(fileurl, '_blank');
            };

            _this.replyMessage = function (msgKey) {
                var displayName = '';
                var tabId = $mck_msg_inner.data('mck-id');
                var message = alMessageService.getReplyMessageByKey(msgKey);
                $mck_text_box.focus().select();
                $applozic('#mck-reply-to-div')
                    .removeClass('n-vis')
                    .addClass('vis');
                if (message.type === 5) {
                    displayName = 'You';
                } else {
                    displayName = mckMessageLayout.getTabDisplayName(
                        message.to,
                        false
                    );
                }
                $applozic('#mck-reply-to').html(displayName);
                if (
                    typeof message.fileMeta === 'object' ||
                    message.contentType === 2
                ) {
                    $applozic('#mck-reply-msg').html(
                        mckMessageLayout.getImageForMessagePreview(message)
                    );
                } else {
                    $applozic('#mck-reply-msg').html(message.message);
                }
                $applozic('#mck-text-box').data('AL_REPLY', msgKey);
            };

            $applozic('#close').click(function () {
                $applozic('#mck-reply-to-div')
                    .removeClass('vis')
                    .addClass('n-vis');
                $applozic('#mck-text-box').data('AL_REPLY', '');
            });

            _this.deleteMessage = function (msgKey) {
                var tabId = $mck_msg_inner.data('mck-id');
                if (typeof tabId !== 'undefined') {
                    window.Applozic.ALApiService.ajax({
                        url:
                            MCK_BASE_URL +
                            MESSAGE_DELETE_URL +
                            '?key=' +
                            msgKey,
                        type: 'get',
                        success: function (data) {
                            if (data === 'success') {
                                var currentTabId = $mck_msg_inner.data(
                                    'mck-id'
                                );
                                if (currentTabId === tabId) {
                                    $applozic('.' + msgKey).remove();
                                    if ($mck_msg_inner.is(':empty')) {
                                        $mck_tab_message_option
                                            .removeClass('vis')
                                            .addClass('n-vis');
                                    }
                                }
                                ALStorage.clearMckMessageArray();
                            } else {
                                w.console.log(
                                    'Unable to delete message. Please reload page.'
                                );
                            }
                        },
                    });
                }
            };
            _this.deleteConversation = function () {
                var tabId = $mck_msg_inner.data('mck-id');
                var isGroup = $mck_msg_inner.data('isgroup');
                var conversationId = $mck_msg_inner.data('mck-conversationid');
                if (typeof tabId !== 'undefined') {
                    var data = {};
                    if (isGroup) {
                        data.groupId = tabId;
                    } else {
                        data.userId = tabId;
                    }
                    if (conversationId) {
                        data.conversationId = conversationId;
                    }
                    CONTACT_SYNCING = true;
                    window.Applozic.ALApiService.deleteConversation({
                        data: data,
                        success: function () {
                            var currentTabId = $mck_msg_inner.data('mck-id');
                            if (currentTabId === tabId) {
                                $mck_msg_inner.html('');
                                $mck_tab_option_panel.data('datetime', '');
                                $mck_msg_cell
                                    .removeClass('n-vis')
                                    .addClass('vis');
                                //   $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No messages yet!</div>');
                                // $mck_no_messages.removeClass('n-vis').addClass('vis');
                                $mck_tab_message_option
                                    .removeClass('vis')
                                    .addClass('n-vis');
                                CONTACT_SYNCING = false;
                            }
                        },
                        error: function () {},
                    });
                }
            };

            // populate away messsage for support group..
            _this.populateAwayStatusAndMessage = function (
                data,
                isAgentOffline,
                err,
                message
            ) {
                if (_this.isFaqTabOpen()) {
                    return;
                }
                if (
                    message &&
                    message.code === 'AGENTS_ONLINE' &&
                    !isAgentOffline
                ) {
                    SnapUI.setAvailabilityStatus('online');
                } else if (
                    message &&
                    message.code === 'SUCCESS' &&
                    !isAgentOffline
                ) {
                    SnapUI.setAvailabilityStatus('away');
                }
                SnapUI.populateAwayMessage(err, message);
                SnapUI.updateLeadCollectionStatus(
                    err,
                    message,
                    data.message || []
                );
            };

            _this.loadMessageList = function (params, callback) {
                var individual = false;
                var isConvReq = false;
                var reqData = '';
                var isAgentOffline = false;
                var append = false;
                if (
                    typeof params.tabId !== 'undefined' &&
                    params.tabId !== ''
                ) {
                    CURRENT_GROUP_DATA.tabId = parseInt(params.tabId);
                    reqData = params.isGroup
                        ? '&groupId=' + params.tabId
                        : '&userId=' + encodeURIComponent(params.tabId);
                    individual = true;
                    if (params.startTime) {
                        reqData += '&endTime=' + params.startTime;
                    }
                    reqData += '&pageSize=30';
                    if (
                        (IS_MCK_TOPIC_HEADER || IS_MCK_TOPIC_BOX) &&
                        params.conversationId
                    ) {
                        reqData += '&conversationId=' + params.conversationId;
                        if (
                            typeof MCK_TAB_CONVERSATION_MAP[params.tabId] ===
                            'undefined'
                        ) {
                            isConvReq = true;
                            reqData += '&conversationReq=true';
                        } else {
                            mckMessageLayout.addConversationMenu(
                                params.tabId,
                                params.isGroup
                            );
                        }
                    }
                } else {
                    CONTACT_SYNCING = true;
                    if (params.startTime) {
                        reqData += '&endTime=' + params.startTime;
                    }
                    reqData += '&mainPageSize=30';
                }
                if (!params.startTime && !params.allowReload) {
                    $mck_msg_inner.html('');
                }
                if (params.latestMessageReceivedTime) {
                    reqData += '&startTime=' + params.latestMessageReceivedTime;
                }
                if (!params.allowReload) {
                    $mck_loading.removeClass('n-vis').addClass('vis');
                } else {
                    append = true;
                }

                window.Applozic.ALApiService.ajax({
                    url:
                        MCK_BASE_URL +
                        MESSAGE_LIST_URL +
                        '?startIndex=0' +
                        reqData,
                    type: 'get',
                    global: false,
                    success: function (data) {
                        var isMessages = true;
                        //Display/hide lead(email) collection template
                        CURRENT_GROUP_DATA.isgroup = params.isGroup;
                        CURRENT_GROUP_DATA.conversationStatus =
                            data &&
                            data.groupFeeds[0] &&
                            data.groupFeeds[0].metadata.CONVERSATION_STATUS;
                        CURRENT_GROUP_DATA.conversationAssignee =
                            data &&
                            data.groupFeeds[0] &&
                            data.groupFeeds[0].metadata.CONVERSATION_ASSIGNEE;
                        CURRENT_GROUP_DATA.groupMembers =
                            data.userDetails && data.userDetails;
                        CURRENT_GROUP_DATA.lastMessagingMember =
                            data.message[0] && data.message[0].contactIds;
                        params.isWaitingQueue &&
                            SnapUI.handleWaitingQueueMessage();
                        var currTabId = $mck_msg_inner.data('mck-id');
                        var isGroupTab = $mck_msg_inner.data('isgroup');
                        if (!params.isGroup || params.startTime) {
                            $mck_loading.removeClass('vis').addClass('n-vis');
                        }
                        CONTACT_SYNCING = false;
                        if (
                            typeof currTabId === 'undefined' ||
                            (params.tabId === currTabId &&
                                '' + isGroupTab === '' + params.isGroup)
                        ) {
                            if (
                                data + '' === 'null' ||
                                typeof data.message === 'undefined' ||
                                data.message.length === 0
                            ) {
                                isMessages = false;
                                if (individual) {
                                    if (params.startTime) {
                                        // $mck_no_more_messages.removeClass('n-vis').addClass('vis');
                                        // $mck_no_more_messages.fadeOut(5000, function () {
                                        //     $mck_no_more_messages.removeClass('vis').addClass('n-vis');
                                        // });
                                        $mck_tab_option_panel.data(
                                            'datetime',
                                            ''
                                        );
                                    } else if (
                                        !params.isGroup &&
                                        $applozic(
                                            "#mck-message-cell .mck-message-inner div[name='message']"
                                        ).length === 0
                                    ) {
                                        $mck_tab_message_option
                                            .removeClass('vis')
                                            .addClass('n-vis');
                                        // $mck_no_conversations.removeClass('vis').addClass('n-vis');
                                        // $mck_no_messages.removeClass('n-vis').addClass('vis');
                                        //   $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No messages yet!</div>');
                                    }
                                } else {
                                    // $mck_no_messages.removeClass('vis').addClass('n-vis');
                                    if (params.startTime) {
                                        // $mck_no_more_conversations.removeClass('n-vis').addClass('vis');
                                        // $mck_no_more_conversations.fadeOut(5000, function () {
                                        //     $mck_no_more_conversations.removeClass('vis').addClass('n-vis');
                                        // });
                                    } else {
                                        // $mck_no_messages.removeClass('vis').addClass('n-vis');
                                        // $mck_no_conversations.removeClass('n-vis').addClass('vis');
                                        //  $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No conversations yet!</div>');
                                    }
                                    $mck_msg_inner.data('datetime', '');
                                }
                            }
                            if (
                                data + '' !== 'null' &&
                                data.status !== 'error'
                            ) {
                                if (individual) {
                                    if (isMessages) {
                                        if (params.startTime > 0) {
                                            mckMessageLayout.processMessageList(
                                                data,
                                                false,
                                                true,
                                                append
                                            );
                                        } else {
                                            if (!params.isGroup) {
                                                mckMessageLayout.processMessageList(
                                                    data,
                                                    true,
                                                    true,
                                                    append
                                                );
                                                $mck_tab_message_option
                                                    .removeClass('n-vis')
                                                    .addClass('vis');
                                            }
                                        }
                                    }
                                    if (
                                        !params.startTime > 0 &&
                                        !params.isGroup
                                    ) {
                                        if (
                                            typeof MCK_CALLBACK === 'function'
                                        ) {
                                            MCK_CALLBACK(params.tabId);
                                        }
                                    }

                                    if (data.userDetails.length > 0) {
                                        $applozic.each(
                                            data.userDetails,
                                            function (i, userDetail) {
                                                alUserService.MCK_USER_DETAIL_MAP[
                                                    userDetail.userId
                                                ] = userDetail;
                                                if (!params.isGroup) {
                                                    if (userDetail.connected) {
                                                        w.MCK_OL_MAP[
                                                            userDetail.userId
                                                        ] = true;
                                                    } else {
                                                        w.MCK_OL_MAP[
                                                            userDetail.userId
                                                        ] = false;
                                                        if (
                                                            typeof userDetail.lastSeenAtTime !==
                                                            'undefined'
                                                        ) {
                                                            MCK_LAST_SEEN_AT_MAP[
                                                                userDetail.userId
                                                            ] =
                                                                userDetail.lastSeenAtTime;
                                                        }
                                                    }
                                                    if (
                                                        !IS_MCK_USER_DEACTIVATED
                                                    ) {
                                                        if (!params.isGroup) {
                                                            if (
                                                                userDetail.blockedByThis
                                                            ) {
                                                                MCK_BLOCKED_TO_MAP[
                                                                    userDetail.userId
                                                                ] = true;
                                                                mckUserUtils.toggleBlockUser(
                                                                    params.tabId,
                                                                    true
                                                                );
                                                            } else if (
                                                                userDetail.blockedByOther
                                                            ) {
                                                                MCK_BLOCKED_BY_MAP[
                                                                    userDetail.userId
                                                                ] = true;
                                                                $mck_tab_title.removeClass(
                                                                    'mck-tab-title-w-status'
                                                                );
                                                                $mck_tab_status
                                                                    .removeClass(
                                                                        'vis'
                                                                    )
                                                                    .addClass(
                                                                        'n-vis'
                                                                    );
                                                                $mck_typing_box
                                                                    .removeClass(
                                                                        'vis'
                                                                    )
                                                                    .addClass(
                                                                        'n-vis'
                                                                    );
                                                                $mck_msg_inner.data(
                                                                    'blocked',
                                                                    false
                                                                );
                                                            } else {
                                                                mckUserUtils.toggleBlockUser(
                                                                    params.tabId,
                                                                    false
                                                                );
                                                            }
                                                        }
                                                    }
                                                    if (
                                                        userDetail.userName &&
                                                        !params.startTime
                                                    ) {
                                                        var name = mckMessageLayout.getTabDisplayName(
                                                            params.tabId,
                                                            params.isGroup,
                                                            userDetail.userName
                                                        );
                                                        $mck_tab_title.html(
                                                            name
                                                        );
                                                        $mck_tab_title.attr(
                                                            'title',
                                                            name
                                                        );
                                                        SnapUI.adjustConversationTitleHeadingWidth(
                                                            POPUP_WIDGET
                                                        );
                                                    }
                                                }
                                            }
                                        );
                                    }
                                    if (
                                        IS_OFFLINE_MESSAGE_ENABLED &&
                                        !params.isGroup &&
                                        !params.startTime &&
                                        !w.MCK_OL_MAP[params.tabId]
                                    ) {
                                        mckInit.manageOfflineMessageTime(
                                            params.tabId
                                        );
                                    }
                                    if (data.conversationPxys.length > 0) {
                                        var tabConvArray = new Array();
                                        $applozic.each(
                                            data.conversationPxys,
                                            function (i, conversationPxy) {
                                                if (
                                                    typeof conversationPxy ===
                                                    'object'
                                                ) {
                                                    tabConvArray.push(
                                                        conversationPxy
                                                    );
                                                    MCK_CONVERSATION_MAP[
                                                        conversationPxy.id
                                                    ] = conversationPxy;
                                                    MCK_TOPIC_CONVERSATION_MAP[
                                                        conversationPxy.topicId
                                                    ] = [conversationPxy.id];
                                                    if (
                                                        conversationPxy.topicDetail
                                                    ) {
                                                        try {
                                                            MCK_TOPIC_DETAIL_MAP[
                                                                conversationPxy.topicId
                                                            ] = $applozic.parseJSON(
                                                                conversationPxy.topicDetail
                                                            );
                                                        } catch (ex) {
                                                            w.console.log(
                                                                'Incorect Topic Detail!'
                                                            );
                                                        }
                                                    }
                                                }
                                            }
                                        );
                                        if (isConvReq) {
                                            MCK_TAB_CONVERSATION_MAP[
                                                params.tabId
                                            ] = tabConvArray;
                                            mckMessageLayout.addConversationMenu(
                                                params.tabId,
                                                params.isGroup
                                            );
                                        }
                                    }
                                    if (params.conversationId) {
                                        var conversationPxy =
                                            MCK_CONVERSATION_MAP[
                                                params.conversationId
                                            ];
                                        if (
                                            typeof conversationPxy ===
                                                'object' &&
                                            conversationPxy.closed
                                        ) {
                                            mckMessageLayout.closeConversation();
                                        }
                                    }
                                    if (!params.startTime) {
                                        if (params.isGroup) {
                                            mckGroupLayout.addGroupStatus(
                                                mckGroupUtils.getGroup(
                                                    params.tabId
                                                )
                                            );
                                            mckMessageLayout.updateUnreadCount(
                                                'group_' + params.tabId,
                                                0,
                                                true
                                            );
                                        } else {
                                            mckMessageLayout.updateUnreadCount(
                                                'user_' + params.tabId,
                                                0,
                                                true
                                            );
                                        }
                                    }
                                    if (data.groupFeeds.length > 0) {
                                        $applozic.each(
                                            data.groupFeeds,
                                            function (i, groupFeed) {
                                                var group = mckGroupUtils.addGroup(
                                                    groupFeed
                                                );
                                                if (!params.startTime) {
                                                    var membersIds =
                                                        groupFeed.membersId;
                                                    var userIdArray = [];
                                                    $applozic.each(
                                                        membersIds,
                                                        function (i, memberId) {
                                                            if (
                                                                typeof mckMessageLayout.getContact(
                                                                    memberId
                                                                ) ===
                                                                'undefined'
                                                            ) {
                                                                userIdArray.push(
                                                                    memberId
                                                                );
                                                            }
                                                        }
                                                    );
                                                    if (
                                                        userIdArray.length > 0
                                                    ) {
                                                        params.isMessages = isMessages;
                                                        params.messageData = data;
                                                        params.isLoadMessageList = true;
                                                        mckContactService.getUsersDetail(
                                                            userIdArray,
                                                            params
                                                        );
                                                    } else {
                                                        mckGroupLayout.addGroupStatus(
                                                            group
                                                        );
                                                        var validated = true;
                                                        var contact;
                                                        if (group.type === 7) {
                                                            $li_mck_group_info
                                                                .removeClass(
                                                                    'vis'
                                                                )
                                                                .addClass(
                                                                    'n-vis'
                                                                );
                                                            mckGroupService.getContactFromGroupOfTwo(
                                                                group,
                                                                function (
                                                                    user
                                                                ) {
                                                                    contact = mckMessageLayout.fetchContact(
                                                                        user
                                                                    );
                                                                }
                                                            );
                                                            mckUserUtils.lastSeenOfGroupOfTwo(
                                                                contact.contactId
                                                            );
                                                        }
                                                        if (
                                                            window.applozic
                                                                .PRODUCT_ID ==
                                                                'snap' &&
                                                            group.users[
                                                                MCK_USER_ID
                                                            ]
                                                        ) {
                                                            if (
                                                                group.users[
                                                                    MCK_USER_ID
                                                                ].role === 3 ||
                                                                group.users[
                                                                    MCK_USER_ID
                                                                ].role === 2 ||
                                                                group.users[
                                                                    MCK_USER_ID
                                                                ].role === 0
                                                            ) {
                                                                $li_mck_group_info
                                                                    .removeClass(
                                                                        'vis'
                                                                    )
                                                                    .addClass(
                                                                        'n-vis'
                                                                    );
                                                            }
                                                        }
                                                        if (group.type === 6) {
                                                            mckGroupLayout.validateOpenGroupUser(
                                                                group
                                                            );
                                                            validated = mckGroupService.isAppendOpenGroupContextMenu(
                                                                group
                                                            );
                                                        }
                                                        $mck_loading
                                                            .removeClass('vis')
                                                            .addClass('n-vis');
                                                        if (isMessages) {
                                                            // $mck_no_messages.removeClass('vis').addClass('n-vis');

                                                            mckMessageLayout.loadDropdownOptions(); // Loads the options dropdown in the widget

                                                            mckMessageLayout.processMessageList(
                                                                data,
                                                                true,
                                                                validated,
                                                                append,
                                                                params.allowReload
                                                            );
                                                            if (
                                                                group.type !== 6
                                                            ) {
                                                                $mck_tab_message_option
                                                                    .removeClass(
                                                                        'n-vis'
                                                                    )
                                                                    .addClass(
                                                                        'vis'
                                                                    );
                                                            }
                                                        } else if (
                                                            $applozic(
                                                                "#mck-message-cell .mck-message-inner div[name='message']"
                                                            ).length === 0
                                                        ) {
                                                            $mck_tab_message_option
                                                                .removeClass(
                                                                    'vis'
                                                                )
                                                                .addClass(
                                                                    'n-vis'
                                                                );
                                                            // $mck_no_messages.removeClass('n-vis').addClass('vis');
                                                            //  $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No messages yet!</div>');
                                                        }
                                                        if (
                                                            typeof MCK_CALLBACK ===
                                                            'function'
                                                        ) {
                                                            MCK_CALLBACK(
                                                                params.tabId
                                                            );
                                                        }
                                                    }
                                                }
                                            }
                                        );
                                    }
                                } else {
                                    if (!params.startTime) {
                                        w.MCK_OL_MAP = [];
                                    }
                                    if (data.userDetails.length > 0) {
                                        $applozic.each(
                                            data.userDetails,
                                            function (i, userDetail) {
                                                alUserService.MCK_USER_DETAIL_MAP[
                                                    userDetail.userId
                                                ] = userDetail;
                                                if (userDetail.connected) {
                                                    w.MCK_OL_MAP[
                                                        userDetail.userId
                                                    ] = true;
                                                } else {
                                                    w.MCK_OL_MAP[
                                                        userDetail.userId
                                                    ] = false;
                                                    if (
                                                        typeof userDetail.lastSeenAtTime !==
                                                        'undefined'
                                                    ) {
                                                        MCK_LAST_SEEN_AT_MAP[
                                                            userDetail.userId
                                                        ] =
                                                            userDetail.lastSeenAtTime;
                                                    }
                                                }
                                                mckMessageLayout.updateUnreadCount(
                                                    'user_' + userDetail.userId,
                                                    userDetail.unreadCount,
                                                    false
                                                );
                                                var contact = mckMessageLayout.getContact(
                                                    '' + userDetail.userId
                                                );
                                                typeof contact === 'undefined'
                                                    ? mckMessageLayout.createContactWithDetail(
                                                          userDetail
                                                      )
                                                    : mckMessageLayout.updateContactDetail(
                                                          contact,
                                                          userDetail
                                                      );
                                            }
                                        );
                                    }
                                    if (data.groupFeeds.length > 0) {
                                        $applozic.each(
                                            data.groupFeeds,
                                            function (i, groupFeed) {
                                                mckMessageLayout.updateUnreadCount(
                                                    'group_' + groupFeed.id,
                                                    groupFeed.unreadCount,
                                                    false
                                                );
                                                mckGroupUtils.addGroup(
                                                    groupFeed
                                                );
                                            }
                                        );
                                    }
                                    if (
                                        data.blockedUserPxyList
                                            .blockedToUserList.length > 0
                                    ) {
                                        $applozic.each(
                                            data.blockedUserPxyList
                                                .blockedToUserList,
                                            function (i, blockedToUser) {
                                                if (blockedToUser.userBlocked) {
                                                    MCK_BLOCKED_TO_MAP[
                                                        blockedToUser.blockedTo
                                                    ] = true;
                                                }
                                            }
                                        );
                                    }
                                    if (
                                        data.blockedUserPxyList
                                            .blockedByUserList.length > 0
                                    ) {
                                        $applozic.each(
                                            data.blockedUserPxyList
                                                .blockedByUserList,
                                            function (i, blockedByUser) {
                                                if (blockedByUser.userBlocked) {
                                                    MCK_BLOCKED_BY_MAP[
                                                        blockedByUser.blockedBy
                                                    ] = true;
                                                }
                                            }
                                        );
                                    }
                                    if (data.conversationPxys.length > 0) {
                                        $applozic.each(
                                            data.conversationPxys,
                                            function (i, conversationPxy) {
                                                MCK_CONVERSATION_MAP[
                                                    conversationPxy.id
                                                ] = conversationPxy;
                                                MCK_TOPIC_CONVERSATION_MAP[
                                                    conversationPxy.topicId
                                                ] = [conversationPxy.id];
                                                if (
                                                    conversationPxy.topicDetail
                                                ) {
                                                    try {
                                                        MCK_TOPIC_DETAIL_MAP[
                                                            conversationPxy.topicId
                                                        ] = $applozic.parseJSON(
                                                            conversationPxy.topicDetail
                                                        );
                                                    } catch (ex) {
                                                        w.console.log(
                                                            'Incorect Topic Detail!'
                                                        );
                                                    }
                                                }
                                            }
                                        );
                                    }
                                    if (isMessages) {
                                        if (!params.startTime) {
                                            params.isReload = true;
                                            if (!individual) {
                                                ALStorage.setLatestMessageArray(
                                                    data.message
                                                );
                                            }
                                        } else if (params.startTime) {
                                            params.isReload = false;
                                            if (!individual) {
                                                ALStorage.updateLatestMessageArray(
                                                    data.message
                                                );
                                            }
                                        }
                                        if (individual) {
                                            ALStorage.updateMckMessageArray(
                                                data.message
                                            );
                                        }
                                        mckMessageLayout.addContactsFromMessageList(
                                            data,
                                            params
                                        );
                                    } else {
                                        $mck_msg_inner.data('datetime', '');
                                    }
                                    if (params.isLaunch) {
                                        mckMessageLayout.updateUnreadCountonChatIcon(
                                            data.userDetails
                                        );
                                    }
                                }
                                if (params.isGroup) {
                                    Snap.conversation.processConversationOpenedFromList(
                                        data
                                    );
                                    var conversationAssignee =
                                        data.groupFeeds[0] &&
                                        data.groupFeeds[0].metadata
                                            .CONVERSATION_ASSIGNEE;
                                    var conversationAssigneeDetails = data.userDetails.filter(
                                        function (item) {
                                            return (
                                                item.userId ==
                                                conversationAssignee
                                            );
                                        }
                                    )[0];
                                }
                                // Setting Online and Offline status for the agent to whom the conversation is assigned to.
                                if (
                                    data.userDetails.length > 0 &&
                                    data.groupFeeds.length > 0
                                ) {
                                    var name;
                                    var updateConversationHeaderParams = new Object();
                                    if (data.groupFeeds[0].name) {
                                        name = data.groupFeeds[0].name;
                                    } else if (
                                        typeof params.groupName !== 'undefined'
                                    ) {
                                        name = params.groupName;
                                    } else {
                                        name = mckMessageLayout.getTabDisplayName(
                                            params.tabId,
                                            params.isGroup,
                                            params.userName
                                        );
                                    }
                                    updateConversationHeaderParams.name = name;
                                    data &&
                                        data.groupFeeds[0] &&
                                        (updateConversationHeaderParams.imageUrl =
                                            data.groupFeeds[0].imageUrl);
                                    mckMessageService.processOnlineStatusChange(
                                        params.tabId,
                                        conversationAssigneeDetails,
                                        updateConversationHeaderParams
                                    );
                                }
                            }
                        }

                        var forwardMessageKey = $mck_msg_new.data(
                            'forwardMessageKey'
                        );
                        if (typeof forwardMessageKey !== 'undefined') {
                            mckMessageService.sendForwardMessage(
                                forwardMessageKey
                            );
                            $mck_msg_new.data('forwardMessageKey', '');
                        }
                        typeof callback == 'function' && callback(data);

                        mckMessageLayout.messageClubbing(true);
                        for (var key in data.userDetails) {
                            if (
                                data.userDetails[key].userId &&
                                data.userDetails[key].userId ==
                                    CURRENT_GROUP_DATA.conversationAssignee &&
                                data.userDetails[key].roleType ==
                                    SnapConstants.APPLOZIC_USER_ROLE_TYPE.BOT
                            ) {
                                mckGroupLayout.checkBotDetail(
                                    CURRENT_GROUP_DATA.conversationAssignee
                                );
                                break;
                            } else {
                                CURRENT_GROUP_DATA.CHAR_CHECK = false;
                            }
                        }
                    },
                    error: function (xhr, desc, err) {
                        if (xhr.status === 401) {
                            ALStorage.clearSessionStorageElements();
                            console.log('Please reload page.');
                        }
                        CONTACT_SYNCING = false;
                        $mck_loading.removeClass('vis').addClass('n-vis');
                        w.console.log(
                            'Unable to load messages. Please reload page.'
                        );
                        typeof callback == 'function' && callback(null, err);
                    },
                });
            };

            _this.getAndSetAwayMessage = function (
                data,
                tabId,
                roleType,
                isAgentOffline
            ) {
                var userSession = SnapUtils.isSessionStorageAvailable()
                    ? JSON.parse(sessionStorage.snap)
                    : {};
                var languageCode =
                    userSession &&
                    userSession.settings &&
                    userSession.settings.KM_CHAT_CONTEXT &&
                    userSession.settings.KM_CHAT_CONTEXT.kmUserLanguageCode;
                if (
                    tabId &&
                    typeof roleType !== 'undefined' &&
                    roleType !== SnapConstants.APPLOZIC_USER_ROLE_TYPE.BOT
                ) {
                    Snap.getAwayMessage(
                        {
                            applicationId: MCK_APP_ID,
                            conversationId: tabId,
                            languageCode: languageCode || 'default',
                        },
                        function (err, message) {
                            _this.populateAwayStatusAndMessage(
                                data,
                                isAgentOffline,
                                err,
                                message
                            );
                        }
                    );
                }
            };
            _this.getUserAvailabilityStatus = function (
                detailOfAssignedUser,
                callback
            ) {
                var data = new Object();
                if (
                    typeof detailOfAssignedUser !== 'undefined' &&
                    detailOfAssignedUser.roleType ===
                        SnapConstants.APPLOZIC_USER_ROLE_TYPE.BOT
                ) {
                    // Checking if the CONVERSATION_ASSIGNEE is bot or not
                    data.availabilityStatus =
                        SnapConstants.AVAILABILITY_STATUS.ONLINE;
                } else if (
                    typeof detailOfAssignedUser !== 'undefined' &&
                    detailOfAssignedUser.roleType ===
                        SnapConstants.APPLOZIC_USER_ROLE_TYPE
                            .APPLICATION_WEB_ADMIN
                ) {
                    if (
                        typeof detailOfAssignedUser !== 'undefined' &&
                        detailOfAssignedUser.connected == true
                    ) {
                        data.availabilityStatus =
                            SnapConstants.AVAILABILITY_STATUS.ONLINE;
                    } else {
                        data.availabilityStatus =
                            SnapConstants.AVAILABILITY_STATUS.OFFLINE;
                        data.isAgentOffline = true;
                    }
                }
                typeof callback == 'function' && callback(data);
            };
            _this.isFaqTabOpen = function () {
                return (
                    document
                        .querySelector('#km-faqdiv')
                        .classList.contains('vis') ||
                    document
                        .querySelector('#km-faqanswer')
                        .classList.contains('vis') ||
                    document
                        .querySelector('#km-contact-search-input-box')
                        .classList.contains('vis')
                );
            };
            _this.updateConversationHeader = function (params) {
                if (_this.isFaqTabOpen()) {
                    return;
                }
                var imageUrl;
                params.name =
                    params.name && snapCommons.formatHtmlTag(params.name);
                // var profileImage = params.name
                //     ? params.name + ' profile image'
                //     : 'Profile image';
                var profileImage = '';
                $mck_tab_title.html(params.name);
                $mck_tab_title.attr('title', params.name);
                SnapUI.adjustConversationTitleHeadingWidth(POPUP_WIDGET);
                if (params.imageUrl) {
                    imageUrl = params.imageUrl;
                    $applozic('.mck-agent-image-container img').removeClass(
                        'n-vis'
                    );
                    $applozic(
                        '.mck-agent-image-container .mck-agent-image-svg-container'
                    ).addClass('n-vis');
                } else {
                    //DEFAULT_PROFILE_IMAGE
                    imageUrl = '';
                    $applozic(
                        '.mck-agent-image-container .mck-agent-image-svg-container'
                    ).html(
                        mckMessageLayout.getContactImageByAlphabet(params.name)
                    );
                    $applozic(
                        '.mck-agent-image-container .mck-agent-image-svg-container'
                    ).removeClass('n-vis');
                    $applozic('.mck-agent-image-container img').addClass(
                        'n-vis'
                    );
                }
                $applozic('.mck-agent-image-container img').attr({
                    src: imageUrl,
                    alt: profileImage,
                });
                SnapUI.setAvailabilityStatus(params.availabilityStatus);
            };
            _this.updateAssigneeDetails = function (data, tabId) {
                var updateConversationHeaderParams = new Object();
                data.displayName &&
                    (updateConversationHeaderParams.name = data.displayName);
                data.imageLink &&
                    (updateConversationHeaderParams.imageUrl = data.imageLink);
                CURRENT_GROUP_DATA.conversationAssignee = data && data.userId;
                if (
                    data.roleType === SnapConstants.APPLOZIC_USER_ROLE_TYPE.BOT
                ) {
                    updateConversationHeaderParams.availabilityStatus =
                        SnapConstants.AVAILABILITY_STATUS.ONLINE;
                } else {
                    updateConversationHeaderParams.availabilityStatus = data.connected
                        ? SnapConstants.AVAILABILITY_STATUS.ONLINE
                        : SnapConstants.AVAILABILITY_STATUS.OFFLINE;
                }
                _this.processOnlineStatusChange(
                    tabId,
                    data,
                    updateConversationHeaderParams
                );
            };
            _this.processOnlineStatusChange = function (
                tabId,
                conversationAssigneeDetails,
                updateConversationHeaderParams
            ) {
                mckMessageService.getUserAvailabilityStatus(
                    conversationAssigneeDetails,
                    function (data) {
                        updateConversationHeaderParams.availabilityStatus =
                            data.availabilityStatus;
                        mckMessageService.getAndSetAwayMessage(
                            {},
                            tabId,
                            conversationAssigneeDetails &&
                                conversationAssigneeDetails.roleType,
                            data.isAgentOffline
                        );
                        mckMessageService.updateConversationHeader(
                            updateConversationHeaderParams
                        );
                    }
                );
            };
            _this.updateContactList = function (tabId, isGroup) {
                var data = {};
                if (isGroup) {
                    data.groupId = tabId;
                } else {
                    data.userId = tabId;
                }
                data.pageSize = 1;
                window.Applozic.ALApiService.getMessages({
                    data: data,
                    success: function (response) {
                        var data = response.data;
                        if (
                            data + '' === 'null' ||
                            typeof data.message === 'undefined' ||
                            data.message.length === 0
                        ) {
                            mckMessageLayout.clearContactMessageData(
                                tabId,
                                isGroup
                            );
                        } else {
                            var message = data.message[0];
                            if (typeof message !== 'undefined') {
                                message.groupId
                                    ? mckGroupService.addGroupFromMessage(
                                          message,
                                          true,
                                          function (group, message, update) {
                                              _this.updateRecentConversationList(
                                                  group,
                                                  message,
                                                  update
                                              );
                                          }
                                      )
                                    : mckMessageLayout.addContactsFromMessage(
                                          message,
                                          true
                                      );
                            }
                        }
                    },
                    error: function (error) {
                        mckMessageLayout.clearContactMessageData(
                            tabId,
                            isGroup
                        );
                    },
                });
            };

            _this.conversationReadUpdate = function (params) {
                var tabId = params.tabId;
                var ucTabId = params.isGroup
                    ? 'group_' + tabId
                    : 'user_' + tabId;
                if (tabId && mckMessageLayout.getUnreadCount(ucTabId) > 0) {
                    var data =
                        '' + params.isGroup === 'true'
                            ? 'groupId=' + tabId
                            : 'userId=' + tabId;
                    window.Applozic.ALApiService.conversationReadUpdate({
                        data: data,
                        success: function (response) {
                            mckMessageLayout.updateUnreadCount(
                                ucTabId,
                                0,
                                true
                            );
                        },
                        error: function () {},
                    });
                }
            };

            _this.getConversationId = function (params) {
                if (
                    !params.isGroup &&
                    !params.isMessage &&
                    params.topicStatus !== CONVERSATION_STATUS_MAP[1]
                ) {
                    var conversationId =
                        MCK_TOPIC_CONVERSATION_MAP[params.topicId];
                    if (conversationId) {
                        conversationPxy = MCK_CONVERSATION_MAP[conversationId];
                        if (typeof conversationPxy === 'object') {
                            $mck_msg_inner.data(
                                'mck-conversationid',
                                conversationPxy.id
                            );
                            params.conversationId = conversationPxy.id;
                            if (
                                typeof MCK_TAB_CONVERSATION_MAP[
                                    params.tabId
                                ] !== 'undefined'
                            ) {
                                var tabConvArray =
                                    MCK_TAB_CONVERSATION_MAP[params.tabId];
                                tabConvArray.push(conversationPxy);
                                MCK_TAB_CONVERSATION_MAP[
                                    params.tabId
                                ] = tabConvArray;
                            }
                            mckMessageLayout.loadTab(params);
                            return;
                        }
                    }
                }
                if (params.topicId) {
                    var conversationPxy = {
                        topicId: params.topicId,
                        userId: params.tabId,
                        status: params.topicStatus,
                    };
                    if (params.isGroup) {
                        conversationPxy.groupId = params.groupId;
                        //conversationPxy.supportIds = [];
                        // conversationPxy.supportIds.push(params.supportId);
                    } else {
                        conversationPxy.userId = params.tabId;
                    }
                    var topicDetail = MCK_TOPIC_DETAIL_MAP[params.topicId];
                    if (typeof topicDetail === 'object') {
                        conversationPxy.topicDetail = w.JSON.stringify(
                            topicDetail
                        );
                    }
                    if (
                        params.fallBackTemplatesList &&
                        params.fallBackTemplatesList.length > 0
                    ) {
                        conversationPxy.fallBackTemplatesList =
                            params.fallBackTemplatesList;
                    }
                    window.Applozic.ALApiService.getConversationId({
                        data: conversationPxy,
                        success: function (data) {
                            if (
                                typeof data === 'object' &&
                                data.status === 'success'
                            ) {
                                var groupPxy = data.response;
                                if (
                                    typeof groupPxy === 'object' &&
                                    groupPxy.conversationPxy !== 'undefined'
                                ) {
                                    var conversationPxy =
                                        groupPxy.conversationPxy;
                                    MCK_CONVERSATION_MAP[
                                        conversationPxy.id
                                    ] = conversationPxy;
                                    MCK_TOPIC_CONVERSATION_MAP[
                                        conversationPxy.topicId
                                    ] = [conversationPxy.id];
                                    if (conversationPxy.topicDetail) {
                                        try {
                                            MCK_TOPIC_DETAIL_MAP[
                                                conversationPxy.topicId
                                            ] = $applozic.parseJSON(
                                                conversationPxy.topicDetail
                                            );
                                        } catch (ex) {
                                            w.console.log(
                                                'Incorect Topic Detail!'
                                            );
                                        }
                                    }
                                    $mck_msg_inner.data(
                                        'mck-conversationid',
                                        conversationPxy.id
                                    );
                                    params.conversationId = conversationPxy.id;
                                    if (
                                        typeof MCK_TAB_CONVERSATION_MAP[
                                            params.tabId
                                        ] !== 'undefined'
                                    ) {
                                        var tabConvArray =
                                            MCK_TAB_CONVERSATION_MAP[
                                                params.tabId
                                            ];
                                        tabConvArray.push(conversationPxy);
                                        MCK_TAB_CONVERSATION_MAP[
                                            params.tabId
                                        ] = tabConvArray;
                                    }
                                    if (params.isGroup) {
                                        var group = mckGroupUtils.addGroup(
                                            groupPxy
                                        );
                                        params.tabId = group.contactId;
                                    }
                                    params.isMessage && conversationPxy.created
                                        ? mckMessageLayout.loadTab(
                                              params,
                                              alMessageService.dispatchMessage
                                          )
                                        : mckMessageLayout.loadTab(params);
                                }
                            }
                        },
                        error: function () {},
                    });
                }
            };

            _this.sendPriceMessage = function () {
                var priceText = $mck_price_text_box.val();
                if (priceText === '') {
                    $mck_price_text_box.addClass('mck-text-req');
                    return;
                }
                priceText = $applozic.trim(priceText);
                var tabId = $mck_msg_to.val();
                var conversationId = $mck_msg_inner.data(
                    'mck-conversationid',
                    conversationId
                );
                var messagePxy = {
                    type: 5,
                    contentType: 4,
                    message: priceText,
                };
                if ($mck_msg_inner.data('isgroup') === true) {
                    messagePxy.groupId = tabId;
                } else {
                    messagePxy.to = tabId;
                }
                if ($mck_msg_inner.data('mck-conversationid')) {
                    var conversationId = $mck_msg_inner.data(
                        'mck-conversationid'
                    );
                    messagePxy.conversationId = conversationId;
                    var conversationPxy = MCK_CONVERSATION_MAP[conversationId];
                    if (conversationPxy !== 'object') {
                        alMessageService.getTopicId(
                            {
                                conversationId: conversationId,
                                suppId: tabId,
                                priceText: priceText,
                            },
                            function (params) {
                                mckMessageLayout.populateMessage(
                                    params.messageType,
                                    params.message,
                                    params.notifyUser
                                );
                            }
                        );
                    } else if (typeof MCK_PRICE_DETAIL === 'function') {
                        MCK_PRICE_DETAIL({
                            custId: MCK_USER_ID,
                            suppId: tabId,
                            productId: conversationPxy.topicId,
                            price: priceText,
                        });
                    }
                    $mck_price_text_box.val('');
                }
                _this.sendMessage(messagePxy);
            };

            _this.getGroup = function (params) {
                var usersArray = [];

                mckMessageLayout.loadDropdownOptions(); // Loads the Options dropdown in the widget

                $applozic.each(params.users, function (i, user) {
                    if (typeof user.userId !== 'undefined') {
                        if (
                            typeof user.groupRole === 'undefined' ||
                            GROUP_ROLE_MAP.indexOf(user.groupRole) !== -1
                        ) {
                            usersArray.push(user);
                        }
                    }
                });
                var groupInfo = {
                    groupName: $applozic.trim(params.groupName),
                    users: usersArray,
                    type: params.type,
                };
                if (params.admin) {
                    groupInfo.admin = params.admin;
                }
                if (params.clientGroupId) {
                    groupInfo.clientGroupId = params.clientGroupId;
                }
                if (params.groupIcon) {
                    groupInfo.imageUrl = params.groupIcon;
                }
                groupInfo.metadata = params.metadata
                    ? params.metadata
                    : MCK_LABELS['group.metadata'];
                var response = new Object();
                window.Applozic.ALApiService.ajax({
                    url: MCK_BASE_URL + GROUP_CREATE_URL,
                    global: false,
                    data: w.JSON.stringify(groupInfo),
                    type: 'post',
                    contentType: 'application/json',
                    success: function (data) {
                        if (params.isInternal) {
                            $mck_btn_group_create
                                .attr('disabled', false)
                                .html(MCK_LABELS['create.group.title']);
                        }
                        if (
                            typeof data === 'object' &&
                            data.status === 'success'
                        ) {
                            var groupPxy = data.response;
                            if (typeof groupPxy === 'object') {
                                var group = mckGroupUtils.addGroup(groupPxy);
                                if (groupPxy.users.length > 0) {
                                    $applozic.each(
                                        groupPxy.users,
                                        function (i, userDetail) {
                                            alUserService.MCK_USER_DETAIL_MAP[
                                                userDetail.userId
                                            ] = userDetail;
                                            if (userDetail.connected) {
                                                w.MCK_OL_MAP[
                                                    userDetail.userId
                                                ] = true;
                                            } else {
                                                w.MCK_OL_MAP[
                                                    userDetail.userId
                                                ] = false;
                                                if (
                                                    typeof userDetail.lastSeenAtTime !==
                                                    'undefined'
                                                ) {
                                                    MCK_LAST_SEEN_AT_MAP[
                                                        userDetail.userId
                                                    ] =
                                                        userDetail.lastSeenAtTime;
                                                }
                                            }
                                            mckMessageLayout.updateUnreadCount(
                                                'user_' + userDetail.userId,
                                                userDetail.unreadCount,
                                                false
                                            );
                                            var contact = mckMessageLayout.getContact(
                                                '' + userDetail.userId
                                            );
                                            typeof contact === 'undefined'
                                                ? mckMessageLayout.createContactWithDetail(
                                                      userDetail
                                                  )
                                                : mckMessageLayout.updateContactDetail(
                                                      contact,
                                                      userDetail
                                                  );
                                        }
                                    );
                                }
                                CURRENT_GROUP_DATA.tabId =
                                    groupPxy.clientGroupId;
                                CURRENT_GROUP_DATA.conversationStatus =
                                    groupPxy.metadata.CONVERSATION_STATUS;
                                params.tabId = group.contactId;
                                params.isGroup = true;
                                !params.allowMessagesViaSocket &&
                                    (params.viaCreateGroup = true);
                                params.groupDetails = groupPxy;
                                if (params.isMessage) {
                                    mckMessageLayout.loadTab(
                                        params,
                                        alMessageService.dispatchMessage
                                    );
                                } else {
                                    if (params.isInternal) {
                                        $mck_msg_inner.data(
                                            'mck-id',
                                            group.contactId
                                        );
                                        $mck_msg_inner.data('isgroup', true);
                                        mckGroupLayout.loadGroupInfo({
                                            groupId: group.contactId,
                                        });
                                    } else {
                                        mckMessageLayout.loadTab(params);
                                    }
                                }
                                if (typeof params.callback === 'function') {
                                    response.updated = data.updated
                                        ? data.updated
                                        : false;
                                    response.status = 'success';
                                    response.data = group;
                                    params.callback(response);
                                }
                            }
                        } else if (data.status === 'error') {
                            if (typeof params.callback === 'function') {
                                response.status = 'error';
                                response.errorMessage =
                                    data.errorResponse[0].description;
                                params.callback(response);
                            }
                        }
                    },
                    error: function () {
                        if (params.isInternal) {
                            $mck_btn_group_create
                                .attr('disabled', false)
                                .html(MCK_LABELS['create.group.title']);
                        }
                        if (typeof params.callback === 'function') {
                            response.status = 'error';
                            response.errorMessage =
                                'Unable to process request.';
                            params.callback(response);
                        }
                    },
                });
            };

            _this.sendDeliveryUpdate = function (key) {
                if (typeof key !== 'undefined' && key !== '') {
                    /* New implementation to send delivery report to server via Web Socket Connection */
                    var deliveryStatus = 4;
                    window.Applozic.ALSocket.sendMessageStatus(
                        key,
                        deliveryStatus,
                        MCK_USER_ID
                    );
                }
            };
            _this.sendReadUpdate = function (key) {
                if (typeof key !== 'undefined' && key !== '') {
                    /* New implementation to send read report to server via Web Socket Connection */
                    var readStatus = 1;
                    window.Applozic.ALSocket.sendMessageStatus(
                        key,
                        readStatus,
                        MCK_USER_ID
                    );
                }
            };
        }

        function MckMessageLayout() {
            var _this = this;
            var emojiTimeoutId = '';
            var $mck_search = $applozic('#mck-search');
            var $mck_msg_to = $applozic('#mck-msg-to');
            var $file_name = $applozic('.mck-file-lb');
            var $file_size = $applozic('.mck-file-sz');
            var $mck_sidebox = $applozic('#mck-sidebox');
            var $mck_file_box = $applozic('#mck-file-box');
            var $mck_msg_sbmt = $applozic('#mck-msg-sbmt');
            var $mck_msg_form = $applozic('#mck-msg-form');
            var $mck_text_box = $applozic('#mck-text-box');
            var $mck_box_form = $applozic('.mck-box-form');
            var $mck_msg_error = $applozic('#mck-msg-error');
            var $mck_show_more = $applozic('#mck-show-more');
            var $mck_tab_title = $applozic('#mck-tab-title');
            var $mck_tab_status = $applozic('#mck-tab-status');
            var $mck_msg_cell = $applozic('#mck-message-cell');
            var $mck_typing_box = $applozic('.mck-typing-box');
            var $mck_no_messages = $applozic('#mck-no-messages');
            var $mck_product_box = $applozic('#mck-product-box');
            var $mck_product_icon = $applozic('.mck-product-icon');
            var $mck_product_title = $applozic('.mck-product-title');
            var $mck_product_subtitle = $applozic('.mck-product-subtitle');
            var $product_box_caret = $applozic('#mck-product-box .mck-caret');
            var $mck_product_up_key = $applozic(
                '.mck-product-rt-up .mck-product-key'
            );
            var $mck_contact_search_input_box = $applozic(
                '#mck-contact-search-input-box'
            );
            var $mck_product_up_value = $applozic(
                '.mck-product-rt-up .mck-product-value'
            );
            var $mck_product_down_key = $applozic(
                '.mck-product-rt-down .mck-product-key'
            );
            var $mck_product_down_value = $applozic(
                '.mck-product-rt-down .mck-product-value'
            );

            var $li_mck_group_info = $applozic('#li-mck-group-info');
            var $li_mck_leave_group = $applozic('#li-mck-leave-group');
            var $mck_group_info_tab = $applozic('#mck-group-info-tab');
            var $mck_group_search_tab = $applozic('#mck-group-search-tab');
            var $mck_no_search_groups = $applozic('#mck-no-search-groups');
            var $mck_group_create_tab = $applozic('#mck-group-create-tab');
            var $mck_group_search_list = $applozic('#mck-group-search-list');
            var $mck_group_search_tabview = $applozic(
                '#mck-group-search-tabview'
            );
            var $mck_group_menu_options = $applozic('.mck-group-menu-options');
            var $mck_group_search_input = $applozic('#mck-group-search-input');
            var $mck_group_search_input_box = $applozic(
                '#mck-group-search-input-box'
            );

            var $mck_contact_search_list = $applozic(
                '#mck-contact-search-list'
            );
            var $mck_contacts_content = $applozic('#mck-contacts-content');
            var $mck_contact_search_tab = $applozic('#mck-contact-search-tab');
            var $mck_contact_search_tabview = $applozic(
                '#mck-contact-search-tabview'
            );
            var $mck_contact_search_input = $applozic(
                '#mck-contact-search-input'
            );
            var $mck_autosuggest_search_input = $applozic(
                '#mck-autosuggest-search-input'
            );
            var $mck_autosuggest_metadata = $applozic(
                '#mck-autosuggest-metadata'
            );

            var $mck_search_list = $applozic('#mck-search-list');
            var $mck_no_search_contacts = $applozic('#mck-no-search-contacts');
            var $mck_search_tab_link = $applozic('#mck-search-tab-box li a');
            var $mck_search_tabview_box = $applozic('#mck-search-tabview-box');
            var $mck_sidebox_search = $applozic('#mck-sidebox-search');

            var $mck_loading = $applozic('#mck-contact-loading');
            var $mck_typing_label = $applozic('#mck-typing-label');
            var $mck_price_widget = $applozic('#mck-price-widget');
            var $mck_msg_response = $applozic('#mck-msg-response');

            var $mck_response_text = $applozic('#mck_response_text');
            var $li_mck_block_user = $applozic('#li-mck-block-user');

            var $mck_search_loading = $applozic('#mck-search-loading');
            var $mck_tab_individual = $applozic('#mck-tab-individual');

            var $mck_attachfile_box = $applozic('#mck-attachfile-box');
            var $mck_atttachmenu_box = $applozic('#mck-location-sharing-box');
            var $mck_sidebox_content = $applozic('#mck-sidebox-content');

            var $mck_tab_option_panel = $applozic('#mck-tab-option-panel');
            var $mck_tab_conversation = $applozic('#mck-tab-conversation');

            var $mck_conversation_header = $applozic(
                '#mck-conversation-header'
            );
            var $mck_no_conversations = $applozic('#mck-no-conversations');

            var $mck_conversation_list = $applozic('#mck-conversation-list');

            var $mck_tab_message_option = $applozic('.mck-tab-message-option');
            var $modal_footer_content = $applozic('.mck-box-ft .mck-box-form');
            var $mck_btn_clear_messages = $applozic('#mck-btn-clear-messages');
            var $mck_offline_message_box = $applozic(
                '#mck-offline-message-box'
            );
            var $mck_msg_inner = $applozic(
                '#mck-message-cell .mck-message-inner'
            );
            var $quick_reply_container = $applozic('#quick-reply-container');

            var $mck_msg_new = $applozic('#mck-msg-new');
            var FILE_PREVIEW_URL = '/rest/ws/aws/file/';
            var CLOUD_HOST_URL = 'www.googleapis.com';
            var LINK_EXPRESSION = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            var LINK_MATCHER = new RegExp(LINK_EXPRESSION);
            var markup =
                '<div tabindex="-1" name="message" data-msgdelivered="${msgDeliveredExpr}" data-msgsent="${msgSentExpr}" data-msgtype="${msgTypeExpr}" data-msgtime="${msgCreatedAtTime}"' +
                'data-msgcontent="${replyIdExpr}" data-msgkey="${msgKeyExpr}" data-contact="${toExpr}" class="mck-m-b ${msgKeyExpr} ${msgFloatExpr} ${msgAvatorClassExpr} ${botMsgDelayExpr}">' +
                '<div class="mck-clear">' +
                '<div class="${nameTextExpr} ${showNameExpr} mck-conversation-name"><span class="mck-ol-status ${contOlExpr}"><span class="mck-ol-icon" title="${onlineLabel}"></span>&nbsp;</span>${msgNameExpr}</div>' +
                '<div class="blk-lg-12">' +
                '<div class="mck-msg-avator blk-lg-3">{{html msgImgExpr}}</div>' +
                '<div class ="km-conversation-container-right">' +
                '<div class="mck-msg-box ${msgClassExpr} ${msgBoxColor}">' +
                '<div class="move-right mck-msg-text"></div>' +
                '<div class="mck-msg-reply mck-verticalLine ${msgReplyToVisibleExpr}">' +
                '<div class="mck-msgto">${msgReplyTo} </div>' +
                '</div>' +
                '<div class="mck-msg-reply mck-verticalLine ${msgReplyDivExpr}">' +
                '<div class="mck-msgreply-border ${textreplyVisExpr}">${msgReply}</div>' +
                '<div class="mck-msgreply-border ${msgpreviewvisExpr}">{{html msgPreview}}</div>' +
                '</div>' +
                '<div class="mck-msg-text mck-msg-content notranslate" tabindex="-1"></div>' +
                '</div>' +
                '<div class="km-msg-box-attachment ${attachmentBoxExpr} ">{{html attachmentTemplate}}<div class="km-msg-box-progressMeter ${progressMeterClassExpr} ">{{html progressMeter}}</div></div>' +
                '<div class="mck-msg-box-rich-text-container notranslate ${kmRichTextMarkupVisibility} ${containerType}">' +
                '<div class="email-message-indicator ${emailMsgIndicatorExpr}"><span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11"><path fill="#BCBABA" fill-rule="nonzero" d="M12 3.64244378L7.82144281 0v2.08065889h-.0112584c-1.2252898.0458706-2.30872368.23590597-3.23022417.58877205-1.03614858.39436807-1.89047392.92952513-2.56710409 1.60169828-.53552482.53356847-.95771502 1.14100649-1.27501442 1.8173497-.08349984.17792235-.16437271.35624185-.23304899.54349718-.32987128.89954044-.56029331 1.87632619-.49311816 2.87991943C.02781163 9.76011309.1572833 10.5.30795828 10.5c0 0 .18801538-1.03695368.94795775-2.22482365.23267371-.36259621.50437656-.70533502.81698495-1.02186205l.0350887.03038182v-.06533086c.19420749-.19301397.40079923-.37828356.63497407-.54588006.63272238-.45433742 1.40748832-.8141536 2.32279668-1.0796471.74962217-.21763716 1.60432278-.34412883 2.54909064-.39019801h.20809286l-.00150112 2.08085746L12 3.64244378z"/></svg></span><span>via email</span></div>{{html kmRichTextMarkup}}</div>' +
                '<div class="${msgFloatExpr}-muted mck-text-light mck-text-xs mck-t-xs ${timeStampExpr} vis" aria-hidden="true"><span class="mck-created-at-time notranslate">${createdAtTimeExpr}</span> <span class="mck-message-status notranslate" aria-hidden="${msgStatusAriaTag}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.06103 10.90199" width="24" height="24" class="${statusIconExpr} mck-message-status notranslate" focusable="false" aria-hidden="true" ><path fill="#859479" d="M16.89436.53548l-.57-.444a.434.434 0 0 0-.609.076l-6.39 8.2a.38.38 0 0 1-.577.039l-.427-.388a.381.381 0 0 0-.578.038l-.451.576a.5.5 0 0 0 .043.645l1.575 1.51a.38.38 0 0 0 .577-.039l7.483-9.6a.436.436 0 0 0-.076-.609z" class="mck-delivery-report--delivered-read"></path><path fill="#859479" d="M12.00236.53548l-.57-.444a.434.434 0 0 0-.609.076l-6.39 8.2a.38.38 0 0 1-.577.039l-2.614-2.558a.435.435 0 0 0-.614.007l-.505.516a.435.435 0 0 0 .007.614l3.887 3.8a.38.38 0 0 0 .577-.039l7.483-9.6A.435.435 0 0 0 12.00109.536l-.00073-.00052z"  class="mck-delivery-report--sent"></path><path fill="#859479" d="M9.75 7.713H8.244V5.359a.5.5 0 0 0-.5-.5H7.65a.5.5 0 0 0-.5.5v2.947a.5.5 0 0 0 .5.5h.094l.003-.001.003.002h2a.5.5 0 0 0 .5-.5v-.094a.5.5 0 0 0-.5-.5zm0-5.263h-3.5c-1.82 0-3.3 1.48-3.3 3.3v3.5c0 1.82 1.48 3.3 3.3 3.3h3.5c1.82 0 3.3-1.48 3.3-3.3v-3.5c0-1.82-1.48-3.3-3.3-3.3zm2 6.8a2 2 0 0 1-2 2h-3.5a2 2 0 0 1-2-2v-3.5a2 2 0 0 1 2-2h3.5a2 2 0 0 1 2 2v3.5z" class="mck-delivery-report--pending"></path></svg><p class="mck-sending-failed">Sending failed</p></span></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="n-vis mck-context-menu">' +
                '<ul>' +
                '<li><a class="mck-message-forward ${msgForwardVisibleExpr}">${msgForwardExpr}</a></li>' +
                '<li><a class="mck-message-delete">${msgDeleteExpr}</a></li>' +
                '<li><a class="mck-message-reply">${msgReplyExpr}</a></li>' +
                '</ul>' +
                '</div>' +
                '</div>';
            var contactbox =
                '<li id="li-${contHtmlExpr}" class="${contIdExpr} ${conversationStatusClass}" data-msg-time="${msgCreatedAtTimeExpr}" role="button" tabindex="0">' +
                '<a class="${mckLauncherExpr}" href="#" data-mck-conversationid="${conversationExpr}" data-mck-id="${contIdExpr}" data-isgroup="${contTabExpr}">' +
                '<div class="mck-row" title="${contNameExpr}">' +
                '<div class="mck-conversation-topic mck-truncate ${contHeaderExpr}">${titleExpr}</div>' +
                '<div class="blk-lg-3">{{html contImgExpr}}' +
                '<div class="mck-unread-count-box move-right mck-truncate ${contUnreadExpr}"><span class="mck-unread-count-text">{{html contUnreadCount}}</span></div></div>' +
                '<div class="blk-lg-9">' +
                '<div class="mck-row">' +
                '<div class="blk-lg-8 mck-cont-name mck-truncate"><div class="mck-ol-status ${contOlExpr}"><span class="mck-ol-icon" title="${onlineLabel}"></span>&nbsp;</div><strong class="mck-truncate">${contNameExpr}</strong></div>' +
                '<div class="mck-text-muted move-right mck-cont-msg-date mck-truncate blk-lg-4">${msgCreatedDateExpr}</div></div>' +
                '<div class="mck-row">' +
                '<div class="mck-cont-msg-wrapper blk-lg-6 mck-truncate msgTextExpr"></div>' +
                '</div></div></div></a></li>';
            var convbox =
                '<li id="li-${convIdExpr}" class="${convIdExpr}">' +
                '<a class="${mckLauncherExpr}" href="#" data-mck-conversationid="${convIdExpr}" data-mck-id="${tabIdExpr}" data-isgroup="${isGroupExpr}" data-mck-topicid="${topicIdExpr}" data-isconvtab="true">' +
                '<div class="mck-row mck-truncate" title="${convTitleExpr}">${convTitleExpr}</div>' +
                '</a></li>';
            var searchContactbox =
                '<li id="li-${contHtmlExpr}" class="${contIdExpr}"><a class="applozic-launcher" href="#" data-mck-id="${contIdExpr}" data-isgroup="${contTabExpr}"><div class="mck-row" title="${contNameExpr}">' +
                '<div class="blk-lg-3">{{html contImgExpr}}</div>' +
                '<div class="blk-lg-9"><div class="mck-row"><div class="blk-lg-12 mck-cont-name mck-truncate"><strong>${contNameExpr}</strong>' +
                '<div class="move-right mck-group-count-box mck-group-count-text ${displayGroupUserCountExpr}">${groupUserCountExpr}</div></div>' +
                '<div class="blk-lg-12 mck-text-muted">${contLastSeenExpr}</div></div></div></div></a></li>';
            var csatModule =
                '<div class="km-csat-skeleton"> <div class="mck-rated"> <span class="mck-rated-text">' +
                MCK_LABELS['csat.rating'].CONVERSATION_RATED +
                '</span><span class="mck-rating-container">{{html ratingSmileSVG}}</span></div><div class="mck-conversation-comment">${ratingComment}</div></div>';
            _this.latestMessageReceivedTime = '';
            _this.init = function () {
                $applozic.template('convTemplate', convbox);
                $applozic.template('messageTemplate', markup);
                $applozic.template('contactTemplate', contactbox);
                $applozic.template('searchContactbox', searchContactbox);
                $applozic.template('csatModule', csatModule);
            };

            _this.loadDropdownOptions = function () {
                var enableDropdown = false;
                /*
                    Mid conversation CSAT
                    update if dedicated parameter is introduced
                */
                if (CSAT_ENABLED) {
                    enableDropdown = true;
                    snapCommons.modifyClassList(
                        { id: ['km-csat-trigger'] },
                        '',
                        'n-vis'
                    );
                }

                // For voice output user override
                if (VOICE_OUTPUT_ENABLED) {
                    enableDropdown = true;
                    SnapUI.toggleVoiceOutputOverride(userOverride.voiceOutput);
                    snapCommons.modifyClassList(
                        { id: ['user-overide-voice-output'] },
                        '',
                        'n-vis'
                    );
                }

                // For toggling display of three dot button (Dropdown btn)
                enableDropdown &&
                    snapCommons.modifyClassList(
                        { id: ['km-widget-options'] },
                        '',
                        'n-vis'
                    );
            };

            // _this.openConversation = function () {
            //     if ($mck_sidebox.css('display') === 'none') {
            //         $applozic('.mckModal').mckModal('hide');
            //         $mck_sidebox.mckModal();
            //     }
            //     $mck_msg_to.focus();
            // };
            _this.initEmojis = function () {
                try {
                    $applozic('#mck-text-box').emojiarea({
                        button: '#mck-btn-smiley',
                        wysiwyg: true,
                        menuPosition: 'top',
                    });
                } catch (ex) {
                    if (!emojiTimeoutId) {
                        emojiTimeoutId = setTimeout(function () {
                            _this.initEmojis();
                        }, 30000);
                    }
                }
            };

            _this.handleLoadTab = function () {
                if (SNAP_VERSION === 'v2') {
                    // load all the script which we want to load afterwards.
                    !IS_PLUGIN_INITIALIZATION_PROCESS_COMPLETED &&
                        mckInit.loadDataPostInitialization();
                    Snap.setDefaultIframeConfigForOpenChat(POPUP_WIDGET);
                    var snapIframe = parent.document.getElementById(
                        'snap-widget-iframe'
                    );
                    var snapIframeDocument = snapIframe.contentDocument;
                    var chatbox = snapIframeDocument.getElementById(
                        'mck-sidebox-launcher'
                    );
                    !snapCommons.isWidgetOpen() && chatbox.click();
                }

                if ($mck_sidebox.css('display') === 'none') {
                    $applozic('.mckModal').mckModal('hide');
                    $mck_sidebox.mckModal();
                }
                $mck_msg_to.focus();
            };

            _this.loadTab = function (params, callback) {
                var userId = SnapUtils.getCookie(
                    SnapConstants.COOKIES.SNAP_LOGGED_IN_ID
                );
                (SnapUtils.getItemFromLocalStorage(
                    'mckActiveConversationInfo',
                    { groupId: params.tabId }
                ) ||
                    snapCommons.isWidgetOpen()) &&
                    _this.handleLoadTab();
                mckInit.clearMsgTriggerAndChatPopuTimeouts();
                MCK_MAINTAIN_ACTIVE_CONVERSATION_STATE &&
                    params.isGroup &&
                    params.tabId &&
                    SnapUtils.setItemToLocalStorage(
                        'mckActiveConversationInfo',
                        {
                            groupId: params.tabId,
                            appId: appOptions.appId,
                            userId: userId,
                        }
                    );
                var currTabId = $mck_msg_inner.data('mck-id');
                if (currTabId) {
                    if (
                        $mck_text_box.html().length > 1 ||
                        $mck_file_box.hasClass('vis')
                    ) {
                        var text = $mck_text_box.html();
                        var tab_draft = {
                            text: text,
                            files: [],
                        };
                        if ($mck_file_box.hasClass('vis')) {
                            $applozic('.mck-file-box').each(function () {
                                var $fileBox = $applozic(this);
                                var file = {
                                    filelb: $fileBox
                                        .find('.mck-file-lb')
                                        .html(),
                                    filesize: $fileBox
                                        .find('.mck-file-sz')
                                        .html(),
                                };
                                var fileMeta = $fileBox.data('mckfile');
                                if (typeof fileMeta === 'object') {
                                    file.fileMeta = fileMeta;
                                }
                                tab_draft.files.push(file);
                            });
                        }
                        TAB_MESSAGE_DRAFT[currTabId] = tab_draft;
                    } else {
                        delete TAB_MESSAGE_DRAFT[currTabId];
                    }
                }
                CONTACT_SYNCING = true;
                _this.clearMessageField(false);
                _this.addDraftMessage(params.tabId);
                $mck_msg_error.html('');
                $mck_msg_error.removeClass('vis').addClass('n-vis');
                $mck_response_text.html('');
                $mck_msg_response.removeClass('vis').addClass('n-vis');
                $mck_msg_form[0].reset();
                $mck_msg_form.removeClass('n-vis').addClass('vis');
                $mck_msg_inner.html('');
                $mck_msg_error.removeClass('mck-no-mb');
                $mck_contacts_content.removeClass('n-vis').addClass('vis');
                $modal_footer_content.removeClass('vis').addClass('n-vis');
                $applozic('#mck-sidebox-ft')
                    .removeClass('vis')
                    .addClass('n-vis');
                $mck_sidebox_search.removeClass('vis').addClass('n-vis');
                $mck_group_info_tab.removeClass('vis').addClass('n-vis');
                $mck_group_create_tab.removeClass('vis').addClass('n-vis');
                $mck_sidebox_content.removeClass('n-vis').addClass('vis');
                $mck_product_box.removeClass('vis').addClass('n-vis');
                $mck_conversation_header.addClass('n-vis');
                $mck_loading.removeClass('vis').addClass('n-vis');
                $mck_msg_inner.removeClass('mck-group-inner');
                $mck_tab_status.removeClass('vis').addClass('n-vis');
                $mck_tab_title.removeClass('mck-tab-title-w-status');
                $mck_tab_title.removeClass('mck-tab-title-w-typing');
                $mck_typing_box.removeClass('vis').addClass('n-vis');
                $mck_typing_label.html(MCK_LABELS['typing']);
                $mck_msg_inner.data('isgroup', params.isGroup);
                $mck_msg_inner.data('datetime', '');
                document.getElementById('mck-char-warning') &&
                    document
                        .getElementById('mck-char-warning')
                        .classList.add('n-vis');
                snapCommons.modifyClassList(
                    { class: ['mck-rating-box'] },
                    '',
                    'selected'
                );
                if (params.tabId) {
                    $mck_msg_to.val(params.tabId);
                    $mck_msg_inner.data('mck-id', params.tabId);
                    $mck_msg_inner.data(
                        'mck-conversationid',
                        params.conversationId
                    );
                    $mck_msg_inner.data('mck-topicid', params.topicId);
                    $mck_tab_option_panel.data('tabId', params.tabId);
                    $mck_tab_option_panel.removeClass('n-vis').addClass('vis');
                    $mck_contacts_content.removeClass('vis').addClass('n-vis');
                    $modal_footer_content.removeClass('n-vis').addClass('vis');
                    $applozic('#mck-sidebox-ft')
                        .removeClass('n-vis')
                        .addClass('vis');
                    //$quick_reply_container.removeClass('vis').addClass('n-vis');
                    $mck_btn_clear_messages
                        .removeClass('n-vis')
                        .addClass('vis');
                    $mck_group_menu_options
                        .removeClass('vis')
                        .addClass('n-vis');
                    snapCommons.modifyClassList(
                        {
                            id: ['mck-waiting-queue'],
                        },
                        'n-vis',
                        'vis'
                    );
                    if (params.isGroup) {
                        $mck_msg_inner.addClass('mck-group-inner');
                        $li_mck_block_user.removeClass('vis').addClass('n-vis');
                        SnapUI.activateTypingField();
                    } else {
                        $li_mck_block_user.removeClass('n-vis').addClass('vis');
                    }
                    if (!params.topicId && params.conversationId) {
                        var conversationPxy =
                            MCK_CONVERSATION_MAP[params.conversationId];
                        if (typeof conversationPxy === 'object') {
                            params.topicId = conversationPxy.topicId;
                        }
                    }
                    if (params.topicId) {
                        var topicDetail = MCK_TOPIC_DETAIL_MAP[params.topicId];
                        if (typeof topicDetail === 'object') {
                            if (IS_MCK_TOPIC_HEADER) {
                                $mck_msg_inner.data(
                                    'mck-title',
                                    topicDetail.title
                                );
                                $mck_conversation_header.html(
                                    topicDetail.title
                                );
                                $mck_conversation_header.removeClass('n-vis');
                            } else if (IS_MCK_TOPIC_BOX) {
                                _this.setProductProperties(
                                    topicDetail,
                                    params.topicId
                                );
                                $product_box_caret.addClass('n-vis');
                                $mck_product_box.addClass('mck-product-box-wc');
                                $mck_conversation_list.addClass('n-vis');
                                $mck_product_box
                                    .removeClass('n-vis')
                                    .addClass('vis');
                            }
                        }
                    }
                    if (
                        IS_MCK_LOCSHARE &&
                        w.google &&
                        typeof w.google.maps === 'object'
                    ) {
                        $mck_attachfile_box
                            .removeClass('vis')
                            .addClass('n-vis');
                        $mck_atttachmenu_box
                            .removeClass('n-vis')
                            .addClass('vis');
                    } else {
                        $mck_atttachmenu_box
                            .removeClass('vis')
                            .addClass('n-vis');
                        MCK_ATTACHMENT &&
                            $mck_attachfile_box
                                .removeClass('n-vis')
                                .addClass('vis');
                    }

                    //Todo: temporarily removing.
                    /*if(IS_CALL_ENABLED) {
                        $applozic("#li-mck-video-call").removeClass("n-vis").addClass("vis");
                    }*/
                    if (_this.isGroupDeleted(params.tabId, params.isGroup)) {
                        $mck_msg_error.html(MCK_LABELS['group.deleted']);
                        $mck_msg_error
                            .removeClass('n-vis')
                            .addClass('vis')
                            .addClass('mck-no-mb');
                        $mck_msg_form.removeClass('vis').addClass('n-vis');
                    }
                    $mck_tab_conversation.removeClass('vis').addClass('n-vis');
                    $mck_search_tabview_box
                        .removeClass('vis')
                        .addClass('n-vis');
                    $mck_tab_individual.removeClass('n-vis').addClass('vis');

                    // $applozic("#km-faq").removeClass('vis').addClass('n-vis');
                    if (MCK_MODE === 'support') {
                        $applozic('.mck-tab-link')
                            .removeClass('vis')
                            .addClass('n-vis');
                    }
                    if (MCK_PRICE_WIDGET_ENABLED) {
                        $mck_price_widget.removeClass('n-vis').addClass('vis');
                        $mck_msg_inner.addClass('mck-msg-w-panel');
                    }
                    if (IS_MCK_USER_DEACTIVATED) {
                        $mck_msg_error.html('Deactivated');
                        $mck_msg_error
                            .removeClass('n-vis')
                            .addClass('vis')
                            .addClass('mck-no-mb');
                        $mck_msg_form.removeClass('vis').addClass('n-vis');
                    }
                    var subscribeId = params.isGroup
                        ? params.tabId
                        : MCK_USER_ID;
                    window.Applozic.ALSocket.subscibeToTypingChannel(
                        subscribeId
                    );
                    if (typeof MCK_ON_TAB_CLICKED === 'function') {
                        MCK_ON_TAB_CLICKED({
                            tabId: params.tabId,
                            isGroup: params.isGroup,
                        });
                    }
                } else {
                    params.tabId = '';
                    if (IS_OFFLINE_MESSAGE_ENABLED) {
                        mckMessageLayout.hideOfflineMessage();
                    }
                    $mck_tab_individual.removeClass('vis').addClass('n-vis');
                    // $applozic("#km-faq").removeClass('n-vis').addClass('vis');
                    $mck_tab_conversation.removeClass('n-vis').addClass('vis');
                    $mck_search_tabview_box
                        .removeClass('n-vis')
                        .addClass('vis');
                    $mck_product_box.removeClass('vis').addClass('n-vis');
                    $mck_msg_inner.data('mck-id', '');
                    $mck_msg_inner.data('mck-conversationid', '');
                    $mck_msg_inner.data('mck-topicid', '');
                    $mck_price_widget.removeClass('vis').addClass('n-vis');
                    $mck_msg_inner.removeClass('mck-msg-w-panel');
                    $mck_tab_option_panel.removeClass('vis').addClass('n-vis');
                    $mck_btn_clear_messages
                        .removeClass('vis')
                        .addClass('n-vis');
                    $mck_msg_to.val('');

                    var mckMessageArray = ALStorage.getLatestMessageArray();
                    window.Applozic.ALSocket.unsubscibeToTypingChannel();
                    if (
                        mckMessageArray !== null &&
                        mckMessageArray.length > 0
                    ) {
                        params.isReload = true;
                        mckMessageLayout.addContactsFromMessageList(
                            {
                                message: mckMessageArray,
                            },
                            params
                        );
                        //  _this.openConversation();
                        CONTACT_SYNCING = false;
                        return;
                    }
                }
                if (params.viaCreateGroup) {
                    var groupDetails = params.groupDetails;
                    var conversationAssignee =
                        groupDetails &&
                        groupDetails.metadata.CONVERSATION_ASSIGNEE;
                    var conversationAssigneeDetails = groupDetails.users.filter(
                        function (item) {
                            return item.userId == conversationAssignee;
                        }
                    )[0];
                    CURRENT_GROUP_DATA.conversationAssignee = conversationAssignee;
                    var updateConversationHeaderParams = {
                        name: params.groupDetails.name,
                        imageUrl: params.groupDetails.imageUrl,
                    };
                    mckMessageService.processOnlineStatusChange(
                        params.tabId,
                        conversationAssigneeDetails,
                        updateConversationHeaderParams
                    );
                    conversationAssigneeDetails.roleType ==
                    SnapConstants.APPLOZIC_USER_ROLE_TYPE.BOT
                        ? mckGroupLayout.checkBotDetail(conversationAssignee)
                        : (CURRENT_GROUP_DATA.CHAR_CHECK = false);
                } else {
                    params.isWaitingQueue = true;
                    mckMessageService.loadMessageList(params, callback);
                }
                document
                    .getElementById('mck-submit-comment')
                    .removeAttribute('disabled');
            };
            _this.setProductProperties = function (topicDetail, topicId) {
                $mck_product_title.html(topicDetail.title);
                $mck_product_icon.html(_this.getTopicLink(topicDetail.link));
                var subtitle = topicDetail.subtitle ? topicDetail.subtitle : '';
                $mck_product_subtitle.html(subtitle);
                var key1 = topicDetail.key1 ? topicDetail.key1 : '';
                var value1 = topicDetail.value1 ? ':' + topicDetail.value1 : '';
                $mck_product_up_key.html(key1);
                $mck_product_up_value.html(value1);
                var key2 = topicDetail.key2 ? topicDetail.key2 : '';
                var value2 = topicDetail.value2 ? ':' + topicDetail.value2 : '';
                $mck_product_down_key.html(key2);
                $mck_product_down_value.html(value2);

                if (typeof MCK_ON_TOPIC_DETAILS === 'function') {
                    topicDetail.topicId = topicId;
                    MCK_ON_TOPIC_DETAILS(topicDetail);
                }
            };
            _this.getTopicLink = function (topicLink) {
                return topicLink
                    ? '<img src="' + topicLink + '">'
                    : '<span class="mck-icon-no-image"></span>';
            };
            _this.processMessageList = function (
                data,
                scroll,
                isValidated,
                append,
                allowReload
            ) {
                // allowReload parameter is using to reload chat widget when the socket connect
                var showMoreDateTime;
                var $scrollToDiv = $mck_msg_inner.children(
                    "div[name='message']:first"
                );
                var tabId = $mck_msg_inner.data('mck-id');
                var isGroup = $mck_msg_inner.data('isgroup');
                var enableAttachment = '';
                append = typeof append !== 'undefined' ? append : false;
                var contact = isGroup
                    ? mckGroupUtils.getGroup(tabId)
                    : mckMessageLayout.fetchContact(tabId);
                scroll &&
                    $mck_msg_inner.data(
                        'last-message-received-time',
                        data.message[0].createdAtTime
                    );
                if (allowReload) {
                    scroll = false;
                    data &&
                        data.message &&
                        (data.message = data.message.reverse());
                }
                if (typeof data.message.length === 'undefined') {
                    var messageArray = [];
                    messageArray.push(data.message);
                    ALStorage.updateMckMessageArray(messageArray);
                    _this.addMessage(
                        data.message,
                        contact,
                        append,
                        false,
                        isValidated
                    );
                    showMoreDateTime = data.createdAtTime;
                } else {
                    ALStorage.updateMckMessageArray(data.message);
                    $applozic.each(data.message, function (i, message) {
                        if (!(typeof message.to === 'undefined')) {
                            !enableAttachment &&
                                (enableAttachment =
                                    typeof message.metadata === 'object' &&
                                    message.metadata.KM_ENABLE_ATTACHMENT
                                        ? message.metadata.KM_ENABLE_ATTACHMENT
                                        : '');
                            _this.addMessage(
                                message,
                                contact,
                                append,
                                false,
                                isValidated,
                                enableAttachment,
                                null,
                                allowReload,
                                data.message
                            );
                            Snap.appendEmailToIframe(message);
                            showMoreDateTime = message.createdAtTime;
                            allowReload &&
                                !scroll &&
                                message.contentType != 10 &&
                                (scroll = true);
                        }
                    });
                }
                $mck_tab_option_panel.data('datetime', showMoreDateTime);
                if (!scroll && $scrollToDiv.length > 0) {
                    $mck_msg_inner.scrollTop(
                        $scrollToDiv.offset().top -
                            $mck_msg_inner.offset().top +
                            $mck_msg_inner.scrollTop()
                    );
                } else if (scroll) {
                    $mck_msg_inner.animate(
                        {
                            scrollTop: $mck_msg_inner.prop('scrollHeight'),
                        },
                        'slow'
                    );
                }
            };
            _this.closeConversation = function (data) {
                if (typeof MCK_DISPLAY_TEXT === 'function') {
                    var displayText = MCK_DISPLAY_TEXT();
                    if (typeof displayText === 'object') {
                        var text =
                            data === 'BUSY_WITH_OTHER'
                                ? displayText.onBusyWithOtherUser
                                : displayText.onConversationClose;
                    }
                }
                if (!text) {
                    text = 'Chat disabled with user';
                }
                $mck_msg_error.html(text);
                $mck_msg_error
                    .removeClass('n-vis')
                    .addClass('vis')
                    .addClass('mck-no-mb');
                $mck_msg_form.removeClass('vis').addClass('n-vis');
            };
            _this.addTooltip = function (msgKey) {
                $applozic('.' + msgKey + ' .mck-pending-icon').attr(
                    'title',
                    'pending'
                );
                $applozic('.' + msgKey + ' .mck-btn-trash').attr(
                    'title',
                    'delete'
                );
                $applozic('.' + msgKey + ' .mck-sent-icon').attr(
                    'title',
                    'sent'
                );
                $applozic('.' + msgKey + ' .mck-btn-forward').attr(
                    'title',
                    'forward message'
                );
                $applozic('.' + msgKey + ' .mck-delivered-icon').attr(
                    'title',
                    'delivered'
                );
                $applozic('.' + msgKey + ' .mck-read-icon').attr(
                    'title',
                    'delivered and read'
                );
                $applozic('.' + msgKey + ' .msgtype-outbox-cr').attr(
                    'title',
                    'sent via Carrier'
                );
                $applozic('.' + msgKey + ' .msgtype-outbox-mck').attr(
                    'title',
                    'sent'
                );
                $applozic('.' + msgKey + ' .msgtype-inbox-cr').attr(
                    'title',
                    'received via Carrier'
                );
                $applozic('.' + msgKey + ' .msgtype-inbox-mck').attr(
                    'title',
                    'recieved'
                );
            };
            _this.fetchContact = function (contactId) {
                var contact = _this.getContact(contactId);
                if (typeof contact === 'undefined') {
                    contact = _this.createContact(contactId);
                }
                return contact;
            };
            _this.getContact = function (contactId) {
                if (typeof MCK_CONTACT_MAP[contactId] === 'object') {
                    return MCK_CONTACT_MAP[contactId];
                } else {
                    return;
                }
            };

            _this.getContactDisplayName = function (userId) {
                if (typeof MCK_CONTACT_NAME_MAP[userId] === 'string') {
                    return MCK_CONTACT_NAME_MAP[userId];
                } else if (
                    typeof MCK_CONTACT_NAME_MAP[userId] === 'undefined'
                ) {
                    var userDetail = alUserService.MCK_USER_DETAIL_MAP[userId];
                    if (typeof userDetail !== 'undefined') {
                        return userDetail.displayName;
                    }
                } else {
                    return;
                }
            };

            _this.sendUserEmail = function () {
                if (
                    document.getElementById('input-for-email').value.length > 1
                ) {
                    var email = document.getElementById('input-for-email')
                        .value;
                    mckContactService.updateUser({
                        data: { email: email },
                        success: function (response) {
                            console.log('email updated successfully !');
                            $applozic('#input-for-email').after(
                                "<div style='width: 100px; margin: auto;'><span>Email Sent</span></div>"
                            );
                            $applozic('#input-for-email').remove();
                            $applozic('#send-email-button').remove();
                        },
                        error: function (error) {},
                    });
                } else {
                    alert('No email');
                }
            };
            _this.updateMetadata = function (msg_Key, msg_metadata) {
                var data = w.JSON.stringify({
                    key: msg_Key,
                    metadata: msg_metadata,
                });

                window.Applozic.ALApiService.ajax({
                    type: 'POST',
                    url: MCK_BASE_URL + '/rest/ws/message/update/metadata',
                    global: false,
                    data: data,
                    contentType: 'application/json',
                    success: function (data) {
                        console.log('metadata cleared successfully !');
                    },
                });
            };

            _this.addMessage = function (
                msg,
                contact,
                append,
                scroll,
                appendContextMenu,
                enableAttachment,
                callback,
                allowReload,
                arrayOfAllMessages,
                processMessageInQueue = false,
                showWithoutDelay = false
            ) {
                var metadatarepiledto = '';
                var replymessage = '';
                var replyMsg = '';
                var msgpreview = '';
                var textreply = 'vis';
                var msgpreviewVis = 'n-vis';
                var replyTo = '';
                var msgReplyToVisible = 'n-vis';
                var emailMsgIndicator = 'n-vis';
                var messageClass = 'vis';
                var progressMeterClass = 'n-vis';
                var attachmentBox = 'n-vis';

                if (!Snap.visibleMessage(msg)) return;

                if (
                    typeof msg.metadata === 'object' &&
                    typeof msg.metadata.AL_REPLY !== 'undefined'
                ) {
                    metadatarepiledto = msg.metadata.AL_REPLY;
                    replyMsg = alMessageService.getReplyMessageByKey(
                        metadatarepiledto
                    );
                    if (typeof replyMsg !== 'undefined') {
                        if (
                            (contact.isGroup && replyMsg) ||
                            (!contact.isGroup &&
                                typeof replyMsg.fileMeta === 'undefined')
                        ) {
                            msgReplyToVisible = 'vis';
                        }
                        if (replyMsg.type === 5) {
                            replyTo = 'You';
                        } else {
                            replyTo = mckMessageLayout.getTabDisplayName(
                                replyMsg.to,
                                false
                            );
                        }
                        if (
                            typeof replyMsg.fileMeta === 'object' ||
                            replyMsg.contentType === 2
                        ) {
                            msgpreview = _this.getImageForReplyMessage(
                                replyMsg
                            );
                            textreply = 'n-vis';
                            msgpreviewVis = 'vis';
                            msgReplyToVisible = 'n-vis';
                        }
                    }
                }

                if ($applozic('#mck-message-cell .' + msg.key).length > 0) {
                    // if message with same key already rendered  skiping rendering it again.
                    return;
                }
                if (
                    msg.source == SnapConstants.MESSAGE_SOURCE.MAIL_INTERCEPTOR
                ) {
                    emailMsgIndicator = 'vis';
                    $applozic('.email-conversation-indicator')
                        .addClass('vis')
                        .removeClass('n-vis');
                    if (!msg.message) return; // If there is no message coming in case of source type 7 which is MAIL_INTERCEPTOR
                }

                // if ($mck_no_messages.hasClass('vis')) {
                //     $mck_no_messages.removeClass('vis').addClass('n-vis');
                // }

                if (
                    msg.contentType ==
                        SnapConstants.MESSAGE_CONTENT_TYPE.ATTACHMENT ||
                    msg.contentType ==
                        SnapConstants.MESSAGE_CONTENT_TYPE.LOCATION
                ) {
                    messageClass = 'n-vis';
                    progressMeterClass = 'n-vis';
                    attachmentBox = 'vis';
                } else {
                    messageClass =
                        (msg.contentType ==
                            SnapConstants.MESSAGE_CONTENT_TYPE.TEXT_HTML &&
                            msg.source ==
                                SnapConstants.MESSAGE_SOURCE
                                    .MAIL_INTERCEPTOR) ||
                        (msg.contentType ==
                            SnapConstants.MESSAGE_CONTENT_TYPE.DEFAULT &&
                            typeof msg.message != 'string')
                            ? 'n-vis'
                            : 'vis';
                }
                var downloadMediaUrl = '';
                var floatWhere = 'mck-msg-right';
                var msgBoxColorStyle = '';
                var statusIcon = 'mck-pending-icon';
                var contactExpr = 'vis';
                var timeStamp = 'mck-timestamp-' + msg.key;
                if (msg.type === 0 || msg.type === 4 || msg.type === 6) {
                    floatWhere = 'mck-msg-left';
                }
                if (
                    msg.contentType === 4 ||
                    msg.contentType === 10 ||
                    msg.contentType === 103
                ) {
                    floatWhere = 'mck-msg-center';
                }
                msgBoxColorStyle =
                    floatWhere === 'mck-msg-right'
                        ? 'km-custom-widget-background-color'
                        : 'km-custom-widget-background-color-secondary';

                statusIcon = _this.getStatusIconName(msg);
                var replyId = msg.key;
                var replyMessageParameters =
                    "'" +
                    msg.deviceKey +
                    "'," +
                    "'" +
                    msg.to +
                    "'" +
                    ",'" +
                    msg.to +
                    "'" +
                    ",'" +
                    replyId +
                    "'";
                var displayName = '';
                var imgsrctag = '';
                var nameTextExpr = '';
                var showNameExpr = 'n-vis';
                var msgAvatorClassExpr = '';
                var messageStatusAriaTag = '';

                alUserService.loadUserProfile(msg.to);

                if (
                    msg.groupId &&
                    msg.contentType !== 4 &&
                    contact.type !== 7 &&
                    (msg.type === 0 || msg.type === 4 || msg.type === 6)
                ) {
                    displayName = _this.getTabDisplayName(msg.to, false);
                    showNameExpr = 'vis';
                    nameTextExpr = _this.getNameTextClassByAlphabet(
                        displayName
                    );
                }
                if (MESSAGE_BUBBLE_AVATOR_ENABLED) {
                    msgAvatorClassExpr = 'mck-msg-avator-bubble';
                    var fromContact = '';
                    var fromDisplayName = displayName;
                    if (floatWhere === 'mck-msg-right') {
                        fromContact = mckMessageLayout.fetchContact(
                            MCK_USER_ID
                        );
                        fromDisplayName = _this.getTabDisplayName(
                            fromContact.displayName,
                            false
                        );
                        messageStatusAriaTag = 'false';
                    } else if (floatWhere === 'mck-msg-left') {
                        fromContact = msg.groupId
                            ? mckMessageLayout.fetchContact(msg.to)
                            : contact;
                        messageStatusAriaTag = 'true';
                    }
                    if (fromContact) {
                        imgsrctag = _this.getContactImageLink(
                            fromContact,
                            fromDisplayName
                        );
                    }
                }
                if (msg.groupId && msg.contentType === 10) {
                    displayName = '';
                    imgsrctag = '';
                    nameTextExpr = '';
                }
                var downloadIconVisible = 'n-vis';
                var msgFeatExpr = 'n-vis';
                var fileName = '';
                var fileSize = '';
                var frwdMsgExpr = msg.message;
                if (typeof msg.fileMeta === 'object') {
                    fileName = msg.fileMeta.name;
                    fileSize = msg.fileMeta.size;
                }
                if (typeof msg.fileMeta === 'object') {
                    if (
                        msg.fileMeta.contentType.indexOf('audio') ||
                        msg.fileMeta.contentType.indexOf('image') ||
                        msg.fileMeta.contentType.indexOf('video')
                    ) {
                        downloadIconVisible = 'vis';
                    }
                }
                var olStatus = 'n-vis';
                if (
                    IS_MCK_OL_STATUS &&
                    w.MCK_OL_MAP[msg.to] &&
                    msg.contentType !== 10
                ) {
                    olStatus = 'vis';
                }
                SnapUI.handleAttachmentIconVisibility(
                    enableAttachment,
                    msg,
                    !append
                );
                var richText =
                    Snap.isRichTextMessage(msg.metadata) ||
                    msg.contentType == 3;
                var kmRichTextMarkupVisibility = richText ? 'vis' : 'n-vis';
                var kmRichTextMarkup = richText
                    ? Snap.getRichTextMessageTemplate(msg)
                    : '';

                var containerType = Snap.getContainerTypeForRichMessage(msg);
                var attachment = Snap.isAttachment(msg);
                msg.fileMeta &&
                    msg.fileMeta.size &&
                    (msg.fileMeta.previewSize = alFileService.getFilePreviewSize(
                        msg.fileMeta.size
                    ));
                var attachmentTemplate = attachment
                    ? Snap.messageTemplate.getAttachmentContanier(
                          msg,
                          mckMessageLayout.getFilePath(msg),
                          alFileService.getFileAttachment(msg),
                          alFileService.getFileurl(msg)
                      )
                    : '';
                if (
                    msg.contentType ==
                    SnapConstants.MESSAGE_CONTENT_TYPE.ATTACHMENT
                ) {
                    var progressMeterClass = attachment ? 'n-vis' : 'vis';
                    attachmentBox = attachment ? 'vis' : 'n-vis';
                    var progressMeter =
                        attachment && !msg.fileMeta.url && !msg.fileMeta.blobKey
                            ? Snap.messageTemplate.getProgressMeterContanier(
                                  msg.key
                              )
                            : '';
                }
                var botMessageDelayClass = 'vis';
                if (
                    append &&
                    MCK_BOT_MESSAGE_DELAY !== 0 &&
                    !allowReload &&
                    mckMessageLayout.isMessageSentByBot(msg, contact)
                ) {
                    botMessageDelayClass = 'n-vis';
                }
                if (
                    HIDE_POST_CTA &&
                    richText &&
                    (kmRichTextMarkup.indexOf(
                        'km-cta-multi-button-container'
                    ) != -1 ||
                        kmRichTextMarkup.indexOf(
                            'km-faq-list--footer_button-container'
                        ) != -1) &&
                    (kmRichTextMarkup.indexOf('<button') != -1 ||
                        kmRichTextMarkup.indexOf('km-list-item-handler') !=
                            -1) &&
                    kmRichTextMarkup.indexOf('km-link-button') == -1
                ) {
                    // if(!append){
                    //     // if type of message is richmessage having CTA buttons and it does not include links then it should not be visible
                    //     botMessageDelayClass = 'n-vis';
                    // }else{
                    // this class is added to the message template if the message contains CTA buttons having only quick replies.
                    botMessageDelayClass =
                        botMessageDelayClass + ' contains-quick-replies-only';
                    // }
                }

                // if (!richText && !attachment && messageClass == "n-vis"){
                //     // if it is not a rich msg and neither contains any text then dont precess it because in UI it is shown as empty text box which does not look good.
                //     return ;
                // }

                var isLastSavedMessageInDialog = arrayOfAllMessages && msg.key === arrayOfAllMessages[0].key;

                var msgList = [
                    {
                        msgReply: replyMsg ? replyMsg.message + '\n' : '',
                        msgReplyTo: replyMsg ? replyTo + '\n' : '',
                        msgReplyDivExpr: replyMsg ? 'vis' : 'n-vis',
                        msgReplyToVisibleExpr: msgReplyToVisible,
                        msgPreview: msgpreview
                            ? _this.getImageForReplyMessage(replyMsg)
                            : '',
                        msgpreviewvisExpr: msgpreviewVis,
                        textreplyVisExpr: textreply,
                        msgKeyExpr: msg.key,
                        msgDeliveredExpr: msg.delivered,
                        msgSentExpr: msg.sent,
                        msgCreatedAtTime: msg.createdAtTime,
                        msgTypeExpr: msg.type,
                        msgDeleteExpr: MCK_LABELS['delete'],
                        msgReplyExpr: MCK_LABELS['reply'],
                        msgForwardExpr: MCK_LABELS['forward'],
                        msgForwardVisibleExpr:
                            window.applozic.PRODUCT_ID == 'snap'
                                ? 'n-vis'
                                : 'vis',
                        msgSourceExpr: msg.source,
                        statusIconExpr: statusIcon,
                        contactExpr: contactExpr,
                        toExpr: msg.to || MCK_USER_ID,
                        msgAvatorClassExpr: msgAvatorClassExpr,
                        showNameExpr: showNameExpr,
                        msgNameExpr: displayName,
                        msgImgExpr: imgsrctag,
                        nameTextExpr: nameTextExpr,
                        msgFloatExpr: floatWhere,
                        msgStatusAriaTag: messageStatusAriaTag,
                        timeStampExpr: timeStamp,
                        replyIdExpr: replyId,
                        createdAtTimeExpr: mckDateUtils.getDate(
                            msg.createdAtTime
                        ),
                        msgFeatExpr: msgFeatExpr,
                        replyMessageParametersExpr: replyMessageParameters,
                        downloadMediaUrlExpr: alFileService.getFileAttachment(
                            msg
                        ),
                        msgClassExpr: messageClass,
                        msgBoxColor: msgBoxColorStyle,
                        progressMeterClassExpr: progressMeterClass,
                        attachmentBoxExpr: attachmentBox,
                        msgExpr: frwdMsgExpr,
                        selfDestructTimeExpr: msg.timeToLive,
                        fileMetaKeyExpr: msg.fileMetaKey,
                        downloadIconVisibleExpr: downloadIconVisible,
                        fileExpr: mckMessageLayout.getFilePath(msg),
                        fileUrlExpr: alFileService.getFileurl(msg),
                        fileNameExpr: fileName,
                        fileSizeExpr: fileSize,
                        contOlExpr: olStatus,
                        kmRichTextMarkupVisibility: kmRichTextMarkupVisibility,
                        kmRichTextMarkup: kmRichTextMarkup,
                        containerType: containerType,
                        emailMsgIndicatorExpr: emailMsgIndicator,
                        attachmentTemplate: attachmentTemplate,
                        progressMeter: progressMeter,
                        botMsgDelayExpr: botMessageDelayClass,
                    },
                ];

                Snap.changeVisibilityStateForElement(
                    $applozic('#quick-reply-container'),
                    'hide'
                );

                if (msg.metadata.MESSAGE_TEMPLATE) {
                    msg.message = msg.metadata.MESSAGE_TEMPLATE;
                }

                if (
                    (kmRichTextMarkup.includes('km-quick-replies') &&
                        !kmRichTextMarkup.includes('km-div-slider')) ||
                    kmRichTextMarkup.includes('km-btn-hidden-form')
                ) {
                    //don't need to append buttons to the messageTemplate arrea,
                    //because we append them to the quick-reply-container
                    msgList[0].kmRichTextMarkup = '';

                    //append message to the messageTemplate arrea
                    append
                        ? $applozic
                              .tmpl('messageTemplate', msgList)
                              .appendTo('#mck-message-cell .mck-message-inner')
                        : $applozic
                              .tmpl('messageTemplate', msgList)
                              .prependTo(
                                  '#mck-message-cell .mck-message-inner'
                              );

                    //need to append reply buttons only from the last message (last message is the first element in arrayOfAllMessages)
                    if (
                        isLastSavedMessageInDialog ||
                        !arrayOfAllMessages
                    ) {
                        $quick_reply_container.empty();
                        $quick_reply_container.append(
                            $applozic(kmRichTextMarkup)
                        );
                    }
                } else {
                    append
                        ? $applozic
                              .tmpl('messageTemplate', msgList)
                              .appendTo('#mck-message-cell .mck-message-inner')
                        : $applozic
                              .tmpl('messageTemplate', msgList)
                              .prependTo(
                                  '#mck-message-cell .mck-message-inner'
                              );
                }
                _this.initDatepicker();

                if (
                    msg.contentType ==
                    SnapConstants.MESSAGE_CONTENT_TYPE.NOTIFY_MESSAGE
                ) {
                    if (msg.metadata && msg.metadata.feedback) {
                        var userFeedback = JSON.parse(msg.metadata.feedback);
                        var ratingSmileSVG = snapCommons.getRatingSmilies(
                            userFeedback.rating
                        );
                        var ratingComment = '';
                        if (userFeedback.comments) {
                            ratingComment =
                                '"' + userFeedback.comments.trim() + '"';
                        }

                        var ratingData = [
                            {
                                ratingSmileSVG: ratingSmileSVG,
                                ratingComment: ratingComment,
                            },
                        ];
                        $applozic(
                            '.' + replyId + ' .km-conversation-container-right'
                        ).remove();
                        $applozic
                            .tmpl('csatModule', ratingData)
                            .appendTo('.' + replyId + ' .blk-lg-12');
                    }
                }

                if (
                    !(
                        msg.metadata.obsolete && msg.metadata.obsolete == 'true'
                    ) &&
                    msg.metadata.KM_AUTO_SUGGESTION
                ) {
                    var autosuggetionMetadata = {};
                    try {
                        autosuggetionMetadata = JSON.parse(
                            msg.metadata.KM_AUTO_SUGGESTION
                        );
                    } catch (e) {
                        console.error('suggestionList should be an array');
                    }
                    $mck_autosuggest_search_input
                        .addClass('mck-text-box')
                        .removeClass('n-vis');
                    $mck_text_box.removeClass('mck-text-box').addClass('n-vis');
                    $mck_autosuggest_search_input.attr(
                        'placeholder',
                        autosuggetionMetadata.placeholder
                            ? autosuggetionMetadata.placeholder
                            : ''
                    );
                    $mck_autosuggest_search_input.data('prev-msgkey', msg.key);
                    mckFileService.resizeTextarea(
                        $mck_autosuggest_search_input[0]
                    );
                    if (autosuggetionMetadata.source.constructor == Array) {
                        $mck_autosuggest_search_input.data(
                            'origin',
                            'KM_AUTO_SUGGEST'
                        );
                        autosuggetionMetadata.source.length &&
                            mckMessageLayout.populateAutoSuggest({
                                source: autosuggetionMetadata.source,
                            });
                    } else if (
                        typeof autosuggetionMetadata.source === 'object'
                    ) {
                        $mck_autosuggest_search_input.data(
                            'source-url',
                            autosuggetionMetadata.source.url
                        );
                        $mck_autosuggest_search_input.data(
                            'method',
                            autosuggetionMetadata.source.method
                                ? autosuggetionMetadata.source.method
                                : 'get'
                        );
                        $mck_autosuggest_search_input.data(
                            'headers',
                            autosuggetionMetadata.source.headers
                                ? autosuggetionMetadata.source.headers
                                : {}
                        );
                    }
                } else {
                    // hide the auto suggestion box and show the text box
                    mckMessageService.hideAutoSuggestionBoxEnableTxtBox();
                }

                // if(msg.metadata["KM_AUTO_SUGGESTIONS"]){
                //     $mck_autosuggest_search_input.addClass('mck-text-box').removeClass('n-vis');
                //     // $mck_autosuggest_search_input.attr("placeholder", "say packers and movers..");
                //     $mck_text_box.removeClass('mck-text-box').addClass('n-vis');
                //     var autosuggestions =[];
                //     try{
                //         autosuggestions = JSON.parse(msg.metadata["KM_AUTO_SUGGESTIONS"]);
                //     }catch(e){
                //         console.error("KM_AUTO_SUGGESTIONS should be an array");
                //     }
                //     $mck_autosuggest_search_input.data("origin","KM_AUTO_SUGGESTIONS");
                //     autosuggestions.length && mckMessageLayout.populateAutoSuggest({source:autosuggestions});
                // }
                if (msg.contentType === 23) {
                    if (msg.metadata.msg_type === 'BUTTON') {
                        var payload = [];
                        if (msg.metadata.payload) {
                            payload = $applozic.parseJSON(msg.metadata.payload);
                            if (!payload[0].hidden) {
                                var elem =
                                    "<div style='width: 100px; margin: auto;'><button style='height: 27px;color: #FFF;background-color: #000;border-radius: 10px; width: 100px; margin: 10px;'>" +
                                    payload[0].title +
                                    '</button></div>';
                            }
                            if (payload.length > 1) {
                                for (var i = 1; i < payload.length; i++) {
                                    if (!payload[i].hidden) {
                                        elem +=
                                            "<div style='width: 100px; margin: auto;'><button style='height: 27px;color: #FFF;background-color: #000;border-radius: 10px; width: 100px; margin: 10px;'>" +
                                            payload[i].title +
                                            '</button></div>';
                                    }
                                }
                            }
                            $applozic(
                                "div[data-msgkey='" + msg.key + "'] .blk-lg-12"
                            ).after(elem);
                        } else {
                            console.log(
                                'msg.contentType === 23 && metadata.msg_type === BUTTON'
                            );
                            var elem =
                                "<div style='width: 100px; margin: auto;'><button style='height: 27px;color: #FFF;background-color: #000;border-radius: 10px; width: 100px; margin: 10px;'>Button</button></div>";
                            $applozic(
                                "div[data-msgkey='" + msg.key + "'] .blk-lg-12"
                            ).after(elem);
                        }
                    }

                    if (
                        msg.metadata.msg_type === 'INPUT' &&
                        !(msg.metadata.hidden === 'false' ? false : true)
                    ) {
                        console.log(
                            'msg.contentType === 23 && metadata.msg_type === INPUT'
                        );
                        var elem =
                            "<div style='float: left; margin: 13px; width: 100%'><input id='input-for-email' type='text' style='background-color: #FFF;width: 60%;height:35px;' placeholder='Enter your email...'/>";
                        elem +=
                            "<button id='send-email-button' style='height: 27px; width: 11%;color: #FFF;background-color: #000;border-radius: 0 10px 10px 0;'>Submit</button></div>";
                        $applozic(
                            "div[data-msgkey='" + msg.key + "'] .blk-lg-12"
                        ).after(elem);
                        $applozic('#send-email-button').click(function () {
                            if (
                                document.getElementById('input-for-email').value
                                    .length > 1
                            ) {
                                _this.sendUserEmail();
                                _this.updateMetadata(msg.key, {
                                    hidden: 'true',
                                });
                            }
                        });
                    }

                    if (msg.metadata.msg_type === 'LIST') {
                        var payload = [];
                        if (msg.metadata.payload) {
                            payload = $applozic.parseJSON(msg.metadata.payload);
                            console.log(
                                'msg.contentType === 23 && metadata.msg_type === LIST'
                            );
                            var elem = '';
                            if (!payload[0].hidden) {
                                if (
                                    payload[0].type.toLowerCase() === 'button'
                                ) {
                                    elem =
                                        "<div style='width: 100px; margin: auto;'><button style='height: 27px;color: #FFF;background-color: #000;border-radius: 10px; width: 100px; margin: 10px;'>" +
                                        payload[0].title +
                                        '</button></div>';
                                } else if (
                                    payload[0].type.toLowerCase() === 'input'
                                ) {
                                    elem =
                                        "<div style='float: left; margin: 13px; width: 100%'><input type='text' style='background-color: #FFF;width: 60%;height:35px;' placeholder='Enter your email...'/>";
                                    elem +=
                                        "<button style='height: 27px; width: 11%;color: #FFF;background-color: #000;border-radius: 0 10px 10px 0;'>" +
                                        payload[0].title +
                                        '</button></div>';
                                }
                            }

                            if (payload.length > 1) {
                                for (var i = 1; i < payload.length; i++) {
                                    if (!payload[i].hidden) {
                                        if (
                                            payload[i].type.toLowerCase() ===
                                            'button'
                                        ) {
                                            elem +=
                                                "<div style='width: 100px; margin: auto;'><button style='height: 27px;color: #FFF;background-color: #000;border-radius: 10px; width: 100px; margin: 10px;'>" +
                                                payload[i].title +
                                                '</button></div>';
                                        } else if (
                                            payload[i].type.toLowerCase() ===
                                            'input'
                                        ) {
                                            elem +=
                                                "<div style='float: left; margin: 13px; width: 100%'><input type='text' style='background-color: #FFF;width: 60%;height:35px;' placeholder='Enter your email...'/>";
                                            elem +=
                                                "<button style='height: 27px; width: 11%;color: #FFF;background-color: #000;border-radius: 0 10px 10px 0;'>" +
                                                payload[i].title +
                                                '</button></div>';
                                        }
                                    }
                                }
                            }
                            $applozic(
                                "div[data-msgkey='" + msg.key + "'] .blk-lg-12"
                            ).after(elem);
                        }
                    }
                }

                var emoji_template = '';
                if (msg.message) {
                    msg.message = mckMessageLayout.getScriptMessagePreview(
                        msg,
                        msg.message
                    );
                    var msg_text = msg.message.replace(/\n/g, '<br/>');
                    if (w.emoji !== null && typeof w.emoji !== 'undefined') {
                        emoji_template = w.emoji.replace_unified(msg_text);
                        emoji_template = w.emoji.replace_colons(emoji_template);
                    } else {
                        emoji_template = msg_text;
                    }
                }
                if (msg.conversationId) {
                    var conversationPxy =
                        MCK_CONVERSATION_MAP[msg.conversationId];
                    if (typeof conversationPxy !== 'object') {
                        alMessageService.getTopicId(
                            {
                                conversationId: msg.conversationId,
                            },
                            function (params) {
                                mckMessageLayout.populateMessage(
                                    params.messageType,
                                    params.message,
                                    params.notifyUser
                                );
                            }
                        );
                    }
                    if (append) {
                        $mck_msg_inner.data(
                            'mck-conversationid',
                            msg.conversationId
                        );
                        if (conversationPxy) {
                            var topicDetail =
                                MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId];
                            if (typeof topicDetail === 'object') {
                                if (IS_MCK_TOPIC_BOX) {
                                    _this.setProductProperties(
                                        topicDetail,
                                        conversationPxy.topicId
                                    );
                                } else if (IS_MCK_TOPIC_HEADER) {
                                    $mck_conversation_header.html(
                                        topicDetail.title
                                    );
                                }
                            }
                        }
                    }
                }
                if (msg.contentType === 4) {
                    var priceText = emoji_template;
                    emoji_template = 'Final agreed price: ' + emoji_template;
                    if (!MCK_PRICE_WIDGET_ENABLED)
                        emoji_template +=
                            '<br/><button class="mck-accept" data-mck-topic-price="' +
                            priceText +
                            '" data-mck-conversationid="' +
                            msg.conversationId +
                            '">Accept</button>';
                }
                var $textMessage = $applozic(
                    '.' + replyId + ' .mck-msg-content'
                );

                if ( showWithoutDelay ||
                  (!processMessageInQueue &&
                    $quick_reply_container.children().length > 0)
                ) {
                    Snap.changeVisibilityStateForElement(
                      $applozic('#quick-reply-container'),
                      'show'
                    );
                }

                if (
                    emoji_template.indexOf('emoji-inner') === -1 &&
                    msg.contentType === 0
                ) {
                    var nodes = emoji_template.split('<br/>');
                    for (var i = 0; i < nodes.length; i++) {
                        if (nodes[i] === '') {
                            var x = d.createElement('BR');
                        } else {
                            var x = d.createElement('div');
                            x.appendChild(d.createTextNode(nodes[i]));
                            x = $applozic(x).linkify({
                                target: '_blank',
                            });
                        }
                        $textMessage.append(x);

                        if (arrayOfAllMessages) {
                            if (isLastSavedMessageInDialog) {
                                Snap.changeTextInputState(msg);
                            }
                        } else {
                            Snap.changeTextInputState(msg);
                        }
                    }
                } else {
                    $textMessage.html(emoji_template);
                    $textMessage.linkify({
                        target: '_blank',
                    });
                }

                Snap.sessionTimeout();

                if (richText) {
                    Snap.richMsgEventHandler.initializeSlick(
                        $applozic(
                            "div[data-msgkey='" + msg.key + "'] .km-div-slider"
                        )
                    );
                }

                if (msg.fileMeta) {
                    $applozic('.' + replyId + ' .mck-file-text')
                        .removeClass('n-vis')
                        .addClass('vis');
                    if ($textMessage.html() === '') {
                        $textMessage.removeClass('vis').addClass('n-vis');
                    }
                }
                if (msg.contentType === 2) {
                    $textMessage.removeClass('vis').addClass('n-vis');
                    $applozic('.' + replyId + ' .mck-file-text')
                        .removeClass('n-vis')
                        .addClass('vis');
                }
                if (scroll) {
                    $mck_msg_inner.animate(
                        {
                            scrollTop: $mck_msg_inner.prop('scrollHeight'),
                        },
                        'slow'
                    );
                }
                if ($mck_tab_message_option.hasClass('n-vis')) {
                    if (msg.groupId) {
                        var group = mckGroupUtils.getGroup(msg.groupId);
                        if (group.type !== 6) {
                            $mck_tab_message_option
                                .removeClass('n-vis')
                                .addClass('vis');
                        }
                    } else {
                        $mck_tab_message_option
                            .removeClass('n-vis')
                            .addClass('vis');
                    }
                }
                _this.addTooltip(msg.key);
                if (
                    msg.contentType !== 4 &&
                    msg.contentType !== 10 &&
                    appendContextMenu
                ) {
                    _this.messageContextMenu(msg.key);
                }
                if (msg.groupId && msg.contentType === 10 && append) {
                    mckGroupService.getGroupFeed({
                        groupId: msg.groupId,
                        isReloadTab: true,
                        apzCallback: mckGroupLayout.onGroupFeed,
                    });
                }
                if (msg.source === 4) {
                    $applozic(
                        '.mck-msg-box-rich-text-container .km-faq-answer--body_ans'
                    ).linkify({
                        target: '_blank',
                    });
                }

                if (typeof callback == 'function') {
                    callback();
                }
            };
            _this.initDatepicker = function () {
                var popupDate = $applozic(".popup");
                var inline = $applozic(".inline");
                console.log(inline, inline.attr('min'), inline.attr('max'));
                if (popupDate.length) for (let i=0; i<popupDate.length; i++) {
                    flatpickr(popupDate[i], {
                        enableTime: !(popupDate[i].type === 'date'),
                        dateFormat: popupDate[i].type === 'date' ? "m/d/Y" : "m/d/Y H:i",
                        disableMobile: true,
                    });
                }
                if (inline.length) for (let i=0; i<inline.length; i++) {
                    const minYear =  (new Date(inline[i].getAttribute('min'))).getFullYear();
                    const maxYear = (new Date(inline[i].getAttribute('max'))).getFullYear();
                    const options = (inline[i].type === 'datetime-local') ?
                      {
                          mask: 'm/d/Y H:M A',
                          pattern: 'm{/}`d{/}`Y `H:`M `A', // Pattern mask with defined blocks, default is 'd{.}`m{.}`Y
                          blocks: {
                              d: { mask: IMask.MaskedRange, from: 1, to: 31, placeholderChar: 'D', maxLength: 2, autofix: true },
                              m: { mask: IMask.MaskedRange, from: 1, to: 12, placeholderChar: 'M', maxLength: 2, autofix: true },
                              Y: { mask: IMask.MaskedRange, from: minYear || 1999, to: maxYear || 2099,  placeholderChar: 'Y', autofix: true },
                              M: { mask: IMask.MaskedRange,from: 0, to: 59, placeholderChar: 'm', maxLength: 2, autofix: true },
                              H: { mask: IMask.MaskedRange, from: 0, to: 12, maxLength: 2, placeholderChar: 'h', autofix: true },
                              A: { mask: IMask.MaskedEnum, maxLength: 2, enum: ["AM", "am", "PM", "pm", "aM", "Am", "pM", "Pm"] }
                          },
                          autofix: true,
                          lazy: false,
                          overwrite: false,
                      } :
                      {
                          mask: 'M/d/Y',
                          pattern: 'M/`dd/`d',  // Pattern mask with defined blocks, default is 'd{.}`m{.}`Y
                          blocks: {
                              d: { mask: IMask.MaskedRange, from: 1, to: 31, placeholderChar: 'D', maxLength: 2, autofix: true },
                              M: { mask: IMask.MaskedRange, from: 1, to: 12, placeholderChar: 'M', maxLength: 2, autofix: true },
                              Y: { mask: IMask.MaskedRange, from: minYear || 1999, to: maxYear || 2099,  placeholderChar: 'Y', autofix: true },
                          },
                          autofix: true,
                          lazy: false,
                          overwrite: true
                      }
                    const dateMask = IMask(inline[i], options);
                    inline[i].type = 'text';
                    inline[i].setAttribute("pattern","\d*");
                    inline[i].setAttribute("inputmode","numeric");
                }
            };
            _this.addContactForSearchList = function (contact, $listId) {
                var groupUserCount = contact.userCount;
                var isGroupTab = contact.isGroup;
                var displayName = _this.getTabDisplayName(
                    contact.contactId,
                    isGroupTab
                );
                var imgsrctag = _this.getContactImageLink(contact, displayName);
                var ucTabId = isGroupTab
                    ? 'group_' + contact.contactId
                    : 'user_' + contact.contactId;
                var contHtmlExpr = isGroupTab
                    ? 'gs-group-' + contact.htmlId
                    : 'cs-user-' + contact.htmlId;
                var lastSeenStatus = '';
                var displayCount = isGroupTab && IS_MCK_GROUPUSERCOUNT;
                $applozic(
                    '#li-' + contHtmlExpr + ' .mck-group-count-text'
                ).html(groupUserCount);
                //$applozic("#li-" + contHtmlExpr + " .mck-group-count-box").removeClass('n-vis').addClass('vis');

                if (!isGroupTab && !MCK_BLOCKED_TO_MAP[contact.contactId]) {
                    if (w.MCK_OL_MAP[contact.contactId]) {
                        lastSeenStatus = MCK_LABELS['online'];
                    } else if (MCK_LAST_SEEN_AT_MAP[contact.contactId]) {
                        lastSeenStatus = mckDateUtils.getLastSeenAtStatus(
                            MCK_LAST_SEEN_AT_MAP[contact.contactId]
                        );
                    }
                }
                var contactList = [
                    {
                        contHtmlExpr: contHtmlExpr,
                        contIdExpr: contact.contactId,
                        contTabExpr: contact.isGroup,
                        contImgExpr: imgsrctag,
                        contLastSeenExpr: lastSeenStatus,
                        contNameExpr: displayName,
                        groupUserCountExpr: contact.userCount,
                        displayGroupUserCountExpr: displayCount
                            ? 'vis'
                            : 'n-vis',
                    },
                ];
                $applozic
                    .tmpl('searchContactbox', contactList)
                    .prependTo('#' + $listId);
            };

            _this.getFilePath = function (msg) {
                if (msg.contentType === 2) {
                    try {
                        var geoLoc = $applozic.parseJSON(msg.message);
                        if (geoLoc.lat && geoLoc.lon) {
                            return (
                                '<a href="https://maps.google.com/maps?z=17&t=m&q=loc:' +
                                geoLoc.lat +
                                ',' +
                                geoLoc.lon +
                                '" target="_blank"><img src="https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=200x150&center=' +
                                geoLoc.lat +
                                ',' +
                                geoLoc.lon +
                                '&maptype=roadmap&markers=color:red|' +
                                geoLoc.lat +
                                ',' +
                                geoLoc.lon +
                                '&key=' +
                                MCK_MAP_STATIC_API_KEY +
                                '"/></a>'
                            );
                        }
                    } catch (ex) {
                        if (msg.message.indexOf(',') !== -1) {
                            return (
                                '<a href="https://maps.google.com/maps?z=17&t=m&q=loc:' +
                                msg.message +
                                '" target="_blank"><img src="https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=200x150&center=' +
                                msg.message +
                                '&maptype=roadmap&markers=color:red|' +
                                msg.message +
                                '&key=' +
                                MCK_MAP_STATIC_API_KEY +
                                '" /></a>'
                            );
                        }
                    }
                }
                if (typeof msg.fileMeta === 'object') {
                    if (msg.fileMeta.contentType.indexOf('image') !== -1) {
                        if (msg.fileMeta.contentType.indexOf('svg') !== -1) {
                            return (
                                '<a href="#" target="_self"  role="link" class="file-preview-link fancybox-media fancybox-snap" data-type="' +
                                msg.fileMeta.contentType +
                                '" data-url="' +
                                alFileService.getFileurl(msg) +
                                '" data-name="' +
                                snapCommons.formatHtmlTag(msg.fileMeta.name) +
                                '"><img src="' +
                                MCK_FILE_URL +
                                FILE_PREVIEW_URL +
                                msg.fileMeta.blobKey +
                                '" area-hidden="true"></img></a>'
                            );
                        } else if (msg.contentType === 5) {
                            return (
                                '<a href="#" target="_self"  role="link" class="file-preview-link fancybox-media fancybox-snap" data-type="' +
                                msg.fileMeta.contentType +
                                '" data-url="' +
                                msg.fileMeta.blobKey +
                                '" data-name="' +
                                snapCommons.formatHtmlTag(msg.fileMeta.name) +
                                '"><img src="' +
                                msg.fileMeta.blobKey +
                                '" area-hidden="true"></img></a>'
                            );
                        } else {
                            if (msg.fileMeta.hasOwnProperty('url')) {
                                if (
                                    msg.fileMeta.url.indexOf(CLOUD_HOST_URL) !==
                                    -1
                                ) {
                                    var thumbnailUrl;
                                    alFileService.generateCloudUrl(
                                        msg.fileMeta.thumbnailBlobKey,
                                        function (result) {
                                            thumbnailUrl = result;
                                        }
                                    );
                                    return (
                                        '<a href="#" target="_self"  role="link" class="file-preview-link fancybox-media fancybox-snap" data-type="' +
                                        msg.fileMeta.contentType +
                                        '" data-url="" data-blobKey="' +
                                        msg.fileMeta.blobKey +
                                        '" data-name="' +
                                        snapCommons.formatHtmlTag(
                                            msg.fileMeta.name
                                        ) +
                                        '"><img src="' +
                                        thumbnailUrl +
                                        '" area-hidden="true" ></img></a>'
                                    );
                                } else {
                                    return (
                                        '<a href="#" target="_self"  role="link" class="file-preview-link fancybox-media fancybox-snap" data-type="' +
                                        msg.fileMeta.contentType +
                                        '" data-url="' +
                                        alFileService.getFileurl(msg) +
                                        '" data-name="' +
                                        snapCommons.formatHtmlTag(
                                            msg.fileMeta.name
                                        ) +
                                        '"><img src="' +
                                        msg.fileMeta.thumbnailUrl +
                                        '" area-hidden="true" ></img></a>'
                                    );
                                }
                            } else if (
                                msg.fileMeta.thumbnailUrl ===
                                'thumbnail_' + msg.fileMeta.name
                            ) {
                                return (
                                    '<a href="#" target="_self"  role="link" class="file-preview-link fancybox-media fancybox-snap" data-type="' +
                                    msg.fileMeta.contentType +
                                    '" data-url="' +
                                    alFileService.getFileurl(msg) +
                                    '" data-name="' +
                                    snapCommons.formatHtmlTag(
                                        msg.fileMeta.name
                                    ) +
                                    '"><img src="' +
                                    MCK_STORAGE_URL +
                                    '/files/thumbnail_' +
                                    msg.fileMeta.name +
                                    '" area-hidden="true" ></img></a>'
                                );
                            } else {
                                return (
                                    '<a href="#" target="_self"  role="link" class="file-preview-link fancybox-media fancybox-snap" data-type="' +
                                    msg.fileMeta.contentType +
                                    '" data-url="' +
                                    alFileService.getFileurl(msg) +
                                    '" data-name="' +
                                    snapCommons.formatHtmlTag(
                                        msg.fileMeta.name
                                    ) +
                                    '"><img src="' +
                                    msg.fileMeta.thumbnailUrl +
                                    '" area-hidden="true" ></img></a>'
                                );
                            }
                        }
                    } else if (
                        msg.fileMeta.contentType.indexOf('video') !== -1
                    ) {
                        return (
                            '<video controls class="mck-video-player">' +
                            '<source src="' +
                            alFileService.getFileurl(msg) +
                            '" type="video/mp4">' +
                            '<source src="' +
                            alFileService.getFileurl(msg) +
                            '" type="video/ogg"></video>'
                        );
                        //    return '<a href="#" role="link" class="file-preview-link fancybox-media fancybox-snap" data-type="' + msg.fileMeta.contentType + '" data-url="' + MCK_FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" data-name="' + msg.fileMeta.name + '"><div class="mck-video-box n-vis"><video controls preload><source src="' + MCK_FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" type="' + msg.fileMeta.contentType + '"></video></div><span class="file-detail"><span class="mck-file-name"><span class="mck-icon-attachment"></span>&nbsp;' + msg.fileMeta.name + '</span>&nbsp;<span class="file-size">' + alFileService.getFilePreviewSize(msg.fileMeta.size) + '</span></span></a>';
                    } else if (
                        msg.fileMeta.contentType.indexOf('audio') !== -1
                    ) {
                        return (
                            '<a href="#" target="_self" ><audio controls class="mck-audio-player">' +
                            '<source src="' +
                            alFileService.getFileurl(msg) +
                            '" type="audio/ogg">' +
                            '<source src="' +
                            alFileService.getFileurl(msg) +
                            '" type="audio/mpeg"></audio>' +
                            '<p class="mck-file-tag"></p></a>'
                        );
                    } else {
                        return '<a href="#" role="link" class="file-preview-link" target="_blank"></a>';
                    }
                }
                return '';
            };

            _this.getImageForMessagePreview = function (message) {
                if (typeof message.fileMeta === 'object') {
                    if (message.fileMeta.contentType.indexOf('image') !== -1) {
                        return (
                            '<span>photo</span> <img src="' +
                            MCK_FILE_URL +
                            FILE_PREVIEW_URL +
                            message.fileMeta.blobKey +
                            '" class="mck-image-reply move-right"/>'
                        );
                    } else if (
                        message.fileMeta.contentType.indexOf('audio') !== -1
                    ) {
                        return (
                            '<span>audio</span><span class="mck-file-detail move-right"><span class="mck-file-name"><span class="mck-icon-attachment"></span>&nbsp;' +
                            message.fileMeta.name +
                            '</span>&nbsp;<span class="file-size">' +
                            alFileService.getFilePreviewSize(
                                message.fileMeta.size
                            ) +
                            '</span></span>'
                        );
                    } else {
                        return (
                            '<span class="mck-file-detail move-right"><span class="mck-file-name"><span class="mck-icon-attachment"></span>&nbsp;' +
                            message.fileMeta.name +
                            '</span>&nbsp;<span class="file-size">' +
                            alFileService.getFilePreviewSize(
                                message.fileMeta.size
                            ) +
                            '</span></span>'
                        );
                    }
                    return '';
                }
                if (message.contentType === 2) {
                    var geoLoc = $applozic.parseJSON(message.message);
                    return (
                        '<span>location</span><img src="https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=200x150&center=' +
                        geoLoc.lat +
                        ',' +
                        geoLoc.lon +
                        '&maptype=roadmap&markers=color:red|' +
                        geoLoc.lat +
                        ',' +
                        geoLoc.lon +
                        '" class="mck-image-reply move-right"/>'
                    );
                }
            };

            _this.getImageForReplyMessage = function (message) {
                var displayName = mckMessageLayout.getTabDisplayName(
                    message.to,
                    false
                );
                if (typeof message.fileMeta === 'object') {
                    if (message.fileMeta.contentType.indexOf('image') !== -1) {
                        return (
                            '<div><div class="mck-imagereply mck-margin"><div class="mck-msgto">' +
                            displayName +
                            '</div><div><span class="mck-icon-camera mck-camera"></span><span>Photo</span></div></div><div class="mck-imagereply"><img src="' +
                            alFileService.getFileurl(message) +
                            '" class="mck-image-reply mck-msg-text mck-msg-content"/></div></div>'
                        );
                    } else if (
                        message.fileMeta.contentType.indexOf('audio') !== -1
                    ) {
                        return (
                            '<div class="mck-attachmentmsgto">' +
                            displayName +
                            '</div><span class="mck-file-detail mck-msg-text mck-msg-content"><span class="mck-file-name"><span class="mck-icon-attachment"></span>&nbsp;' +
                            message.fileMeta.name +
                            '</span>&nbsp;<span class="file-size">' +
                            alFileService.getFilePreviewSize(
                                message.fileMeta.size
                            ) +
                            '</span></span>'
                        );
                    } else {
                        return (
                            '<div class="mck-attachmentmsgto">' +
                            displayName +
                            '</div><span class="mck-file-detail"><span class="mck-file-name"><span class="mck-icon-attachment"></span>&nbsp;' +
                            message.fileMeta.name +
                            '</span>&nbsp;<span class="file-size">' +
                            alFileService.getFilePreviewSize(
                                message.fileMeta.size
                            ) +
                            '</span></span>'
                        );
                    }
                    return '';
                }
                if (message.contentType === 2) {
                    var geoLoc = $applozic.parseJSON(message.message);
                    return (
                        '<div><div class="mck-imagereply mck-margin"><div class="mck-msgto">' +
                        displayName +
                        '</div><span class="mck-icon-marker mck-location-icon"></span><span>Location</span></div><div class="mck-imagereply"><img src="https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=200x150&center=' +
                        geoLoc.lat +
                        ',' +
                        geoLoc.lon +
                        '&maptype=roadmap&markers=color:red|' +
                        geoLoc.lat +
                        ',' +
                        geoLoc.lon +
                        '" class="mck-image-reply mck-msg-text "/></div></div>'
                    );
                }
            };

            _this.getImageUrlForGroupType = function (contact, displayName) {
                // var profileDisplayName = displayName
                //     ? snapCommons.formatHtmlTag(displayName) + ' profile image'
                //     : 'Profile image';
                var profileDisplayName = '';
                return contact.imageUrl
                    ? '<img src="' +
                          contact.imageUrl +
                          '" alt="' +
                          profileDisplayName +
                          '"/>'
                    : _this.getContactImageByAlphabet(displayName);
            };

            _this.getContactImageLink = function (
                contact,
                displayName,
                message
            ) {
                var imgsrctag = '';
                // var profileDisplayName = displayName
                //     ? snapCommons.formatHtmlTag(displayName) + ' profile image'
                //     : 'Profile image';
                var profileDisplayName = '';
                if (!contact.isGroup) {
                    if (
                        !contact.photoSrc &&
                        !contact.photoData &&
                        !contact.photoLink &&
                        alUserService.MCK_USER_DETAIL_MAP[contact.contactId] &&
                        alUserService.MCK_USER_DETAIL_MAP[contact.contactId]
                            .imageLink
                    ) {
                        contact.photoSrc =
                            alUserService.MCK_USER_DETAIL_MAP[
                                contact.contactId
                            ].imageLink;
                    }
                }
                if (contact.members && contact.type == 10) {
                    if (
                        message &&
                        message.senderName &&
                        alUserService.MCK_USER_DETAIL_MAP[message.senderName]
                    ) {
                        imgsrctag = alUserService.MCK_USER_DETAIL_MAP[
                            message.senderName
                        ].imageLink
                            ? '<img src="' +
                              alUserService.MCK_USER_DETAIL_MAP[
                                  message.senderName
                              ].imageLink +
                              '" alt="' +
                              profileDisplayName +
                              '"/>'
                            : _this.getImageUrlForGroupType(
                                  contact,
                                  displayName
                              );
                    } else {
                        imgsrctag = _this.getImageUrlForGroupType(
                            contact,
                            displayName
                        );
                    }
                } else if (contact.isGroup && contact.type !== 7) {
                    imgsrctag = mckGroupService.getGroupImage(contact.imageUrl);
                } else {
                    if (
                        contact.isGroup &&
                        contact.type === 7 &&
                        contact.members.length > 1
                    ) {
                        mckGroupService.getContactFromGroupOfTwo(
                            contact,
                            function (user) {
                                contact = mckMessageLayout.fetchContact(user);
                            }
                        );
                    }
                    if (typeof MCK_GETUSERIMAGE === 'function') {
                        var imgsrc = MCK_GETUSERIMAGE(contact.contactId);
                        if (imgsrc && typeof imgsrc !== 'undefined') {
                            imgsrctag = '<img src="' + imgsrc + '"/>';
                        }
                    }
                    if (!imgsrctag) {
                        if (contact.photoSrc) {
                            imgsrctag =
                                '<img src="' +
                                contact.photoSrc +
                                '" alt="' +
                                profileDisplayName +
                                '"/>';
                        } else if (contact.photoData) {
                            imgsrctag =
                                '<img src="data:image/jpeg;base64,' +
                                contact.photoData +
                                '" alt="' +
                                profileDisplayName +
                                '"/>';
                        } else if (contact.photoLink) {
                            imgsrctag =
                                '<img src="' +
                                MCK_BASE_URL +
                                '/contact.image?photoLink=' +
                                contact.photoLink +
                                '" alt="' +
                                profileDisplayName +
                                '"/>';
                        } else if (contact.contactId == 'bot') {
                            //Todo: replace this with role once its build at Applozic side.
                            imgsrctag =
                                '<img src="' +
                                '/snap/bot_default_image_aetna.png' +
                                '" alt="' +
                                profileDisplayName +
                                '"/>';
                        } else {
                            if (!displayName) {
                                displayName = contact.displayName;
                            }
                            imgsrctag = _this.getContactImageByAlphabet(
                                displayName
                            );
                        }
                    }
                }
                return imgsrctag;
            };

            _this.getContactImageByAlphabet = function (name) {
                if (typeof name === 'undefined' || name === '') {
                    return '<div class="mck-alpha-contact-image mck-alpha-user"><span class="mck-icon-user"></span></div>';
                }
                var first_alpha = name.charAt(0);
                var letters = /^[a-zA-Z0-9]+$/;
                if (first_alpha.match(letters)) {
                    first_alpha = first_alpha.toUpperCase();
                    return (
                        '<div class="mck-videocall-image alpha_' +
                        first_alpha +
                        '"><span class="mck-contact-icon">' +
                        first_alpha +
                        '</span></div>'
                    );
                } else {
                    return '<div class="mck-videocall-image alpha_user"><span class="mck-icon-user"></span></div>';
                }
            };
            _this.getNameTextClassByAlphabet = function (name) {
                if (typeof name === 'undefined' || name === '') {
                    return 'mck-text-user';
                }
                name = name.toString();
                var first_alpha = name.charAt(0);
                var letters = /^[a-zA-Z0-9]+$/;
                if (first_alpha.match(letters)) {
                    first_alpha = first_alpha.toLowerCase();
                    return 'mck-text-' + first_alpha;
                } else {
                    return 'mck-text-user';
                }
            };
            _this.addContactsFromMessageList = function (data, params) {
                var showMoreDateTime;
                // $mck_no_messages.removeClass('vis').addClass('n-vis');
                if (data + '' === 'null') {
                    showMoreDateTime = '';
                    return;
                } else {
                    // $mck_no_conversations.removeClass('vis').addClass('n-vis');
                    //if (params.isReload) {
                    if (
                        $mck_msg_inner.has($applozic('#mck-contact-list'))
                            .length == 0
                    ) {
                        $mck_msg_inner.html(
                            '<ul id="mck-contact-list" class="mck-contact-list mck-nav mck-nav-tabs mck-nav-stacked"></ul>'
                        );
                    }
                    if (typeof data.message.length === 'undefined') {
                        if (data.message.groupId) {
                            mckGroupService.addGroupFromMessage(
                                data.message,
                                false,
                                function (group, message, update) {
                                    _this.updateRecentConversationList(
                                        group,
                                        message,
                                        update
                                    );
                                }
                            );
                        } else {
                            _this.addContactsFromMessage(data.message);
                        }
                        showMoreDateTime = data.message.createdAtTime;
                    } else {
                        $applozic.each(data.message, function (i, message) {
                            if (!(typeof message.to === 'undefined')) {
                                message.groupId
                                    ? mckGroupService.addGroupFromMessage(
                                          message,
                                          true,
                                          function (group, message, update) {
                                              _this.updateRecentConversationList(
                                                  group,
                                                  message,
                                                  update
                                              );
                                          }
                                      )
                                    : _this.addContactsFromMessage(
                                          message,
                                          true
                                      );
                                showMoreDateTime = message.createdAtTime;
                            }
                        });
                    }
                    $mck_msg_inner.data('datetime', showMoreDateTime);
                    if (params.isReload) {
                        var $scrollToDiv = '';
                        if (params.lastActiveTabId) {
                            var scrollTabId = params.isLastActiveTabGroup
                                ? 'group-' + params.lastActiveTabId
                                : 'user-' +
                                  mckContactUtils.formatContactId(
                                      params.lastActiveTabId
                                  );
                            $scrollToDiv = $applozic('#li-' + scrollTabId);
                        }
                        if ($scrollToDiv.length > 0) {
                            $mck_msg_inner.animate(
                                {
                                    scrollTop:
                                        $scrollToDiv.offset().top -
                                        $mck_msg_inner.offset().top +
                                        $mck_msg_inner.scrollTop(),
                                },
                                'fast'
                            );
                        } else {
                            $mck_msg_inner.animate(
                                {
                                    scrollTop: 0,
                                },
                                0
                            );
                        }
                    }
                }
            };
            _this.addGroupFromMessageList = function (data, isReloaded) {
                if (data + '' === 'null') {
                    return;
                } else {
                    if (isReloaded) {
                        $mck_msg_inner.html(
                            '<ul id="mck-group-list" class="mck-contact-list mck-nav mck-nav-tabs mck-nav-stacked"></ul>'
                        );
                    }
                    if (typeof data.message.length === 'undefined') {
                        mckGroupService.addGroupFromMessage(
                            data.message,
                            false,
                            function (group, message, update) {
                                _this.updateRecentConversationList(
                                    group,
                                    message,
                                    update
                                );
                            }
                        );
                    } else {
                        $applozic.each(data.message, function (i, message) {
                            if (!(typeof message.to === 'undefined')) {
                                mckGroupService.addGroupFromMessage(
                                    message,
                                    true,
                                    function (group, message, update) {
                                        _this.updateRecentConversationList(
                                            group,
                                            message,
                                            update
                                        );
                                    }
                                );
                            }
                        });
                    }
                }
            };
            _this.createContact = function (contactId) {
                var displayName = _this.getContactDisplayName(contactId);
                if (typeof displayName === 'undefined') {
                    displayName = contactId;
                }
                var contact = {
                    contactId: contactId,
                    htmlId: mckContactUtils.formatContactId(contactId),
                    displayName: displayName,
                    name:
                        displayName +
                        ' <' +
                        contactId +
                        '>' +
                        ' [' +
                        'Main' +
                        ']',
                    value: contactId,
                    photoLink: '',
                    photoSrc: '',
                    photoData: '',
                    email: '',
                    unsaved: true,
                    isGroup: false,
                };
                MCK_CONTACT_MAP[contactId] = contact;
                return contact;
            };
            _this.createContactWithDetail = function (data) {
                var displayName = data.displayName;
                var contactId = data.userId;
                if (!displayName) {
                    displayName = _this.getContactDisplayName(contactId);
                }
                if (typeof displayName === 'undefined') {
                    displayName = contactId;
                } else {
                    MCK_CONTACT_NAME_MAP[contactId] = displayName;
                }
                var photoLink = data.photoLink ? data.photoLink : '';
                if (!photoLink) {
                    photoLink = data.imageLink ? data.imageLink : '';
                }
                var photoData = data.imageData ? data.imageData : '';
                var contact = {
                    contactId: contactId,
                    htmlId: mckContactUtils.formatContactId(contactId),
                    displayName: displayName,
                    name:
                        displayName +
                        ' <' +
                        contactId +
                        '>' +
                        ' [' +
                        'Main' +
                        ']',
                    value: contactId,
                    photoLink: '',
                    photoSrc: photoLink,
                    photoData: photoData,
                    email: '',
                    unsaved: true,
                    isGroup: false,
                    roleType: data.roleType,
                };
                MCK_CONTACT_MAP[contactId] = contact;
                return contact;
            };
            _this.updateContactDetail = function (contact, data) {
                var displayName = data.displayName;
                var contactId = data.userId;
                if (
                    !contact.displayName ||
                    contact.displayName === contact.contactId
                ) {
                    if (!displayName) {
                        displayName = _this.getContactDisplayName(contactId);
                    }
                    if (typeof displayName === 'undefined') {
                        displayName = contactId;
                    } else {
                        MCK_CONTACT_NAME_MAP[contactId] = displayName;
                    }
                    contact.displayName = displayName;
                }
                var photoLink = data.photoLink;
                if (!photoLink) {
                    photoLink = data.imageLink ? data.imageLink : '';
                }
                if (photoLink && !contact.photoSrc) {
                    contact.photoSrc = photoLink;
                }
                var photoData = data.imageData ? data.imageData : '';
                if (photoData && !contact.photoData) {
                    contact.photoData = photoData;
                }
                if (data.roleType) {
                    contact.roleType = data.roleType;
                }
                MCK_CONTACT_MAP[contactId] = contact;
                return contact;
            };
            _this.addContactsFromMessage = function (message, update) {
                var contactIdsArray = _this.getUserIdFromMessage(message);
                if (contactIdsArray.length > 0 && contactIdsArray[0]) {
                    for (var i = 0; i < contactIdsArray.length; i++) {
                        var contact = _this.fetchContact(
                            '' + contactIdsArray[i]
                        );
                        _this.updateRecentConversationList(
                            contact,
                            message,
                            update
                        );
                    }
                }
            };

            _this.updateRecentConversationList = function (
                contact,
                message,
                update
            ) {
                if (
                    message &&
                    message.metadata &&
                    (message.metadata.KM_ASSIGN || message.metadata.KM_STATUS)
                ) {
                    return;
                }
                var $listId = 'mck-contact-list';
                var contactHtmlExpr = contact.isGroup
                    ? 'group-' + contact.htmlId
                    : 'user-' + contact.htmlId;
                if (
                    $applozic('#' + $listId + ' #li-' + contactHtmlExpr)
                        .length > 0
                ) {
                    var $mck_msg_part = $applozic(
                        '#' +
                            $listId +
                            ' #li-' +
                            contact.htmlId +
                            ' .mck-cont-msg-wrapper'
                    );
                    if (
                        ($mck_msg_part.is(':empty') || update) &&
                        message !== undefined
                    ) {
                        _this.updateContact(contact, message, $listId);
                    }
                } else {
                    _this.addContact(contact, $listId, message);
                }
                SnapUI.handleConversationBanner();
            };
            _this.addContactsToSearchList = function () {
                var contactsArray = [],
                    userIdArray = [];
                $applozic.each(MCK_CONTACT_ARRAY, function (i, contact) {
                    userIdArray.push(contact.contactId);
                });
                if (typeof contactList !== 'undefined') {
                    var params = {};
                    params.async = false;
                    params.userIds = contactList;
                    mckContactService.getUsersDetail(params.userIds, params);
                    userIdArray = contactList;
                }
                var uniqueUserIdArray = userIdArray.filter(function (
                    item,
                    pos
                ) {
                    return userIdArray.indexOf(item) === pos;
                });
                uniqueUserIdArray.sort();
                $mck_search_loading.removeClass('vis').addClass('n-vis');

                if (uniqueUserIdArray.length > 0) {
                    $applozic.each(uniqueUserIdArray, function (i, userId) {
                        if (userId) {
                            var contact = _this.fetchContact('' + userId);
                            contactsArray.push(contact);
                            if (
                                $applozic('#li-cs-user-' + contact.htmlId)
                                    .length === 0
                            ) {
                                _this.addContactForSearchList(
                                    contact,
                                    'mck-contact-search-list'
                                );
                            }
                        }
                    });
                } else {
                    $mck_no_search_contacts
                        .removeClass('n-vis')
                        .addClass('vis');
                }
                _this.initAutoSuggest({
                    contactsArray: contactsArray,
                    $searchId: $mck_contact_search_input,
                    isContactSearch: true,
                });
            };

            /**
             *
             * @param {*} params will contain source function/array of object and object will
             * contain message string that will be displayed into message box and metadata
             * will contain that we want to send with message.
             * params contain sourceUrl or source.
             * source will contain array of object
             * example:{sourceUrl:http://localhost:5454/city/search?name=}
             * or   {source:arrayOfObject}
             * object format into arrayOfObject:
             * {searchKey:key for search,
             * message: message//this is optional
             * metadata:{}//optional
             * }
             */

            $mck_autosuggest_search_input.on('keyup', function (e) {
                mckMessageService.toggleMediaOptions(this);
                $mck_text_box.text($mck_autosuggest_search_input.val());
                if (
                    !(
                        document.querySelector(
                            'ul.mcktypeahead.mck-auto-suggest-menu'
                        ).style.display === 'block'
                    ) &&
                    e.keyCode === 13
                ) {
                    e.preventDefault();
                    $mck_text_box.submit();
                    mckMessageLayout.clearMessageField(true);
                }
            });

            _this.populateAutoSuggest = function (params) {
                $mck_autosuggest_search_input.mcktypeahead({
                    order: 'desc',
                    hint: false,
                    minLength: 2,
                    wrapper: '.mck-box-form',
                    backdropOnFocus: true,
                    menu:
                        '<ul class="mcktypeahead mck-auto-suggest-menu mck-dropup-menu"></ul>',
                    show: function () {
                        var t = e.extend({}, this.$element.offset(), {
                            height: this.$element[0].offsetHeight,
                        });
                        return (
                            this.$menu.css({
                                left: t.left,
                            }),
                            this.$menu.show(),
                            (this.shown = !0),
                            this
                        );
                    },
                    source:
                        params && params.source
                            ? _this.processAutosuggestData(params.source)
                            : function (query, process) {
                                  mckUtils.ajax({
                                      url: params.sourceUrl + query,
                                      type: params.method,
                                      header: params.headers,
                                      success: function (data) {
                                          var items = _this.processAutosuggestData(
                                              data.data
                                          );
                                          process(items);
                                      },
                                  });
                              },
                    items: 8,
                    highlight: true,
                    updater: function (metadataString) {
                        var metadataObj = JSON.parse(metadataString);
                        if (Object.keys(metadataObj.metadata).length != 0) {
                            $mck_autosuggest_metadata.val(
                                JSON.stringify(metadataObj.metadata)
                            );
                        }
                        $mck_text_box.text(metadataObj.displayMessage);

                        // TODO: Need to improve this.
                        $mck_autosuggest_search_input.on(
                            'keydown',
                            function (e) {
                                $mck_text_box.text(
                                    $mck_autosuggest_search_input.val()
                                );
                                if (
                                    e.which === 13 &&
                                    metadataObj.displayMessage
                                ) {
                                    e.preventDefault();
                                    $mck_text_box.submit();
                                    mckMessageLayout.clearMessageField(true);
                                }
                                if (e.which === 9) {
                                    $mck_autosuggest_search_input.focus();
                                    e.preventDefault();
                                }
                            }
                        );
                        return metadataObj.displayMessage;
                    },
                    matcher: function (item) {
                        var matcher1 = new RegExp(this.query, 'i');
                        return matcher1.test(item.searchKey);
                    },
                    highlighter: function (item) {
                        var metadata = JSON.parse(item.toString());
                        return metadata.displayMessage;
                    },
                });
                // updating data source
                params && params.source
                    ? ($mck_autosuggest_search_input
                          .mcktypeahead()
                          .data(
                              'mcktypeahead'
                          ).source = _this.processAutosuggestData(
                          params.source
                      ))
                    : '';
                $mck_autosuggest_search_input.focus();
            };

            _this.processAutosuggestData = function (data) {
                var items = new Array();
                data.map(function (msg) {
                    var message =
                        typeof msg === 'string'
                            ? { searchKey: msg, message: msg, metadata: {} }
                            : msg;
                    var item = {
                        searchKey: message.searchKey,
                        toString: function () {
                            var metadata = {
                                displayMessage: message.message,
                                metadata: message.metadata
                                    ? message.metadata
                                    : {},
                            };
                            return JSON.stringify(metadata);
                        },
                        toLowerCase: function () {
                            return message.searchKey.toLowerCase();
                        },
                        indexOf: function (string) {
                            return String.prototype.indexOf.apply(
                                message.searchKey,
                                arguments
                            );
                        },
                        replace: function (string) {
                            var value = message.searchKey;
                            return String.prototype.replace.apply(
                                '<div style="padding: 10px; font-size: 1.5em;">' +
                                    value +
                                    '</div>',
                                arguments
                            );
                        },
                    };
                    items.push(item);
                });
                return items;
            };

            _this.initAutoSuggest = function (params) {
                var contactsArray = params.contactsArray;
                var $searchId = params.$searchId;
                var typeaheadArray = [];
                var typeaheadEntry;
                var typeaheadMap = {};
                var contactSuggestionsArray = [];
                for (var j = 0; j < contactsArray.length; j++) {
                    var contact = contactsArray[j];
                    contact.displayName = _this.getTabDisplayName(
                        contact.contactId,
                        contact.isGroup
                    );
                    typeaheadEntry = contact.displayName
                        ? $applozic.trim(contact.displayName)
                        : $applozic.trim(contact.contactId);
                    if (
                        (MCK_SELF_CHAT_DISABLE === true &&
                            contact.contactId !== MCK_USER_ID) ||
                        MCK_SELF_CHAT_DISABLE !== true
                    ) {
                        typeaheadMap[typeaheadEntry] = contact;
                        typeaheadArray.push(typeaheadEntry);
                        contactSuggestionsArray.push(typeaheadEntry);
                    }
                }
                var matcher1 = function (item) {
                    var contact = typeaheadMap[item];
                    var contactNameArray = contact.displayName.split(' ');
                    var contactNameLength = contactNameArray.length;
                    var contactFName = contactNameArray[0];
                    var contactMName = '';
                    var contactLName = '';
                    if (contactNameLength === 2) {
                        contactLName = contactNameArray[1];
                    } else if (contactNameLength >= 3) {
                        contactLName = contactNameArray[contactNameLength - 1];
                        contactMName = contactNameArray[contactNameLength - 2];
                    }
                    var matcher = new RegExp(this.query, 'i');
                    return (
                        matcher.test(contact.displayName) ||
                        matcher.test(contact.contactId) ||
                        matcher.test(contactMName) ||
                        matcher.test(contactLName) ||
                        matcher.test(contact.email) ||
                        matcher.test(contactFName + ' ' + contactLName)
                    );
                };
                var highlighter = function (item) {
                    var contact = typeaheadMap[item];
                    return contact.displayName;
                };
                var updater = function (item) {
                    var contact = typeaheadMap[item];
                    if (params.isContactSearch) {
                        mckMessageLayout.loadTab({
                            tabId: contact.contactId,
                            isGroup: contact.isGroup,
                        });
                        $modal_footer_content
                            .removeClass('n-vis')
                            .addClass('vis');
                        $applozic('#mck-sidebox-ft')
                            .removeClass('n-vis')
                            .addClass('n-vis');
                    } else {
                        mckGroupLayout.addGroupMemberFromSearch(
                            contact.contactId
                        );
                    }
                };
                if ($searchId.hasClass('mck-typeahead')) {
                    $searchId
                        .mcktypeahead()
                        .data('mcktypeahead').source = typeaheadArray;
                    $searchId
                        .mcktypeahead()
                        .data('mcktypeahead').matcher = matcher1;
                    $searchId
                        .mcktypeahead()
                        .data('mcktypeahead').highlighter = highlighter;
                    $searchId
                        .mcktypeahead()
                        .data('mcktypeahead').updater = updater;
                    return;
                } else {
                    $searchId.addClass('mck-typeahead');
                }
                $searchId.mcktypeahead({
                    source: typeaheadArray,
                    matcher: matcher1,
                    highlighter: highlighter,
                    updater: updater,
                });
            };
            _this.initSearchAutoType = function () {
                if (IS_AUTO_TYPE_SEARCH_ENABLED) {
                    $mck_contact_search_input.keypress(function (e) {
                        if (e.which === 13) {
                            var userId = $mck_contact_search_input.val();
                            if (userId) {
                                if (
                                    (MCK_SELF_CHAT_DISABLE === true &&
                                        userId !== MCK_USER_ID) ||
                                    MCK_SELF_CHAT_DISABLE !== true
                                ) {
                                    userId =
                                        typeof userId !== 'undefined' &&
                                        userId !== ''
                                            ? userId.toString()
                                            : '';
                                    if (userId) {
                                        mckMessageLayout.loadTab({
                                            tabId: userId,
                                            isGroup: false,
                                            isSearch: true,
                                        });
                                        $modal_footer_content
                                            .removeClass('n-vis')
                                            .addClass('vis');
                                    }
                                }
                            }
                            $mck_contact_search_input.val('');
                        }
                    });
                    $mck_group_search_input.keypress(function (e) {
                        if (e.which === 13) {
                            return true;
                        }
                    });
                    $applozic(d).on(
                        'click',
                        '.mck-group-search-link',
                        function (e) {
                            e.preventDefault();
                            return true;
                        }
                    );
                    $applozic(d).on(
                        'click',
                        '.mck-contact-search-link',
                        function (e) {
                            e.preventDefault();
                            var tabId = $mck_contact_search_input.val();
                            if (tabId !== '') {
                                if (
                                    (MCK_SELF_CHAT_DISABLE === true &&
                                        tabId !== MCK_USER_ID) ||
                                    MCK_SELF_CHAT_DISABLE !== true
                                ) {
                                    mckMessageLayout.loadTab({
                                        tabId: tabId,
                                        isGroup: false,
                                        isSearch: true,
                                    });
                                    $modal_footer_content
                                        .removeClass('n-vis')
                                        .addClass('vis');
                                    $applozic('#mck-sidebox-ft')
                                        .removeClass('n-vis')
                                        .addClass('vis');
                                }
                            }
                            $mck_contact_search_input.val('');
                        }
                    );
                }
            };
            _this.removeContact = function (contact) {
                var contactHtmlExpr = contact.isGroup
                    ? 'group-' + contact.htmlId
                    : 'user-' + contact.htmlId;
                $applozic('#li-' + contactHtmlExpr).remove();
            };
            _this.updateContact = function (contact, message, $listId) {
                var contHtmlExpr = contact.isGroup
                    ? 'group-' + contact.htmlId
                    : 'user-' + contact.htmlId;
                var $contactElem = $applozic('#li-' + contHtmlExpr);
                var currentMessageTime = $contactElem.data('msg-time');

                if (message.metadata && message.metadata.action) {
                    return;
                }
                // update contact only if its a rich msg or normal text msg
                if (message && message.createdAtTime > currentMessageTime) {
                    var ucTabId = message.groupId
                        ? 'group_' + contact.contactId
                        : 'user_' + contact.contactId;
                    var unreadCount = _this.getUnreadCount(ucTabId);
                    var emoji_template = _this.getMessageTextForContactPreview(
                        message,
                        contact
                    );
                    if (
                        message &&
                        message.metadata &&
                        message.metadata.feedback
                    ) {
                        emoji_template =
                            MCK_LABELS['you'] + ' ' + emoji_template;
                    }
                    if (typeof emoji_template == 'undefined') {
                        return;
                    }
                    $applozic(
                        '#li-' + contHtmlExpr + ' .mck-cont-msg-date'
                    ).html(
                        typeof message.createdAtTime === 'undefined'
                            ? ''
                            : snapCommons.getTimeOrDate(
                                  message ? message.createdAtTime : '',
                                  true
                              )
                    );
                    var $messageText = $applozic(
                        '#li-' + contHtmlExpr + ' .mck-cont-msg-wrapper'
                    );
                    $messageText.html('');
                    typeof emoji_template === 'object'
                        ? $messageText.append(emoji_template)
                        : $messageText.html(emoji_template);
                    if (message.conversationId) {
                        var conversationId = message.conversationId;
                        var conversationPxy =
                            MCK_CONVERSATION_MAP[conversationId];
                        if (typeof conversationPxy === 'object') {
                            var topicId = conversationPxy.topicId;
                            if (topicId && IS_MCK_TOPIC_HEADER) {
                                var topicDetail = MCK_TOPIC_DETAIL_MAP[topicId];
                                if (typeof topicDetail === 'object') {
                                    $applozic(
                                        '#li-' +
                                            contHtmlExpr +
                                            ' .mck-conversation-topic'
                                    ).html(topicDetail.title);
                                }
                            }
                        }
                        $applozic('#li-' + contHtmlExpr + ' a').data(
                            'mck-conversationid',
                            conversationId
                        );
                    }
                    if (unreadCount > 0) {
                        $applozic(
                            '#li-' + contHtmlExpr + ' .mck-unread-count-text'
                        ).html(unreadCount);
                        $applozic(
                            '#li-' + contHtmlExpr + ' .mck-unread-count-box'
                        )
                            .removeClass('n-vis')
                            .addClass('vis');
                    }
                    var latestCreatedAtTime = $applozic(
                        '#' + $listId + ' li:nth-child(1)'
                    ).data('msg-time');
                    $contactElem.data('msg-time', message.createdAtTime);
                    if (
                        (typeof latestCreatedAtTime === 'undefined' ||
                            (message ? message.createdAtTime : '') >=
                                latestCreatedAtTime) &&
                        $applozic('#mck-contact-list li').index(
                            $contactElem
                        ) !== 0
                    ) {
                        $applozic('#' + $listId + ' li:nth-child(1)').before(
                            $contactElem
                        );
                    }
                }
            };
            _this.clearContactMessageData = function (tabId, isGroup) {
                var htmlId = mckContactUtils.formatContactId(tabId);
                var contactIdExpr = isGroup
                    ? 'group-' + htmlId
                    : 'user-' + htmlId;
                $applozic('#li-' + contactIdExpr + ' .mck-cont-msg-date').html(
                    ''
                );
                $applozic(
                    '#li-' + contactIdExpr + ' .mck-cont-msg-wrapper'
                ).html('');
            };
            _this.addContact = function (contact, $listId, message) {
                var emoji_template = _this.getMessageTextForContactPreview(
                    message,
                    contact
                );
                var groupUserCount = contact.userCount;
                var conversationId = '';
                var isGroupTab = false;
                if (typeof message !== 'undefined') {
                    if (message.conversationId) {
                        conversationId = message.conversationId;
                        var conversationPxy =
                            MCK_CONVERSATION_MAP[conversationId];
                    }
                    if (message.groupId) {
                        isGroupTab = true;
                    }
                }
                var displayName = _this.getTabDisplayName(
                    contact.contactId,
                    isGroupTab
                );
                var imgsrctag = _this.getContactImageLink(contact, displayName);
                var prepend = false;
                var ucTabId = isGroupTab
                    ? 'group_' + contact.contactId
                    : 'user_' + contact.contactId;
                var unreadCount = _this.getUnreadCount(ucTabId);
                var unreadCountStatus =
                    unreadCount > 0 && $listId !== 'mck-search-list'
                        ? 'vis'
                        : 'n-vis';
                var olStatus = 'n-vis';
                var contHtmlExpr = isGroupTab
                    ? 'group-' + contact.htmlId
                    : 'user-' + contact.htmlId;
                var displayCount = isGroupTab && IS_MCK_GROUPUSERCOUNT;
                var statusClass =
                    contact &&
                    contact.metadata &&
                    contact.metadata.CONVERSATION_STATUS ==
                        Snap.conversationHelper.status.CLOSED
                        ? 'mck-conversation-resolved'
                        : 'mck-conversation-open';

                $applozic(
                    '#li-' + contHtmlExpr + ' .mck-group-count-text'
                ).html(groupUserCount);
                $applozic('#li-' + contHtmlExpr + ' .mck-group-count-box')
                    .removeClass('n-vis')
                    .addClass('vis');
                if (
                    !isGroupTab &&
                    !MCK_BLOCKED_TO_MAP[contact.contactId] &&
                    !MCK_BLOCKED_BY_MAP[contact.contactId] &&
                    IS_MCK_OL_STATUS &&
                    w.MCK_OL_MAP[contact.contactId]
                ) {
                    olStatus = 'vis';
                    prepend = true;
                }
                if (contact.type === 7 && contact.members.length > 1) {
                    var contacts;
                    var group = mckGroupUtils.getGroup(message.groupId);
                    mckGroupService.getContactFromGroupOfTwo(
                        group,
                        function (user) {
                            contacts = mckMessageLayout.fetchContact(user);
                        }
                    );
                    if (
                        isGroupTab &&
                        IS_MCK_OL_STATUS &&
                        w.MCK_OL_MAP[contacts.contactId]
                    ) {
                        olStatus = 'vis';
                        prepend = true;
                    }
                }
                var isContHeader = 'n-vis';
                if (
                    typeof conversationPxy === 'object' &&
                    IS_MCK_TOPIC_HEADER
                ) {
                    var topicDetail =
                        MCK_TOPIC_DETAIL_MAP[conversationPxy.topicId];
                    if (typeof topicDetail === 'object') {
                        isContHeader = 'vis';
                        var title = topicDetail.title;
                    }
                }
                var contHtmlExpr = isGroupTab
                    ? 'group-' + contact.htmlId
                    : 'user-' + contact.htmlId;
                var contactList = [
                    {
                        contHtmlExpr: contHtmlExpr,
                        contIdExpr: contact.contactId,
                        contTabExpr: isGroupTab,
                        msgCreatedAtTimeExpr: message
                            ? message.createdAtTime
                            : '',
                        mckLauncherExpr: MCK_LAUNCHER,
                        contImgExpr: imgsrctag,
                        contOlExpr: olStatus,
                        onlineLabel: MCK_LABELS['online'],
                        contUnreadExpr: unreadCountStatus,
                        contUnreadCount: unreadCount,
                        contNameExpr: displayName,
                        conversationExpr: conversationId,
                        contHeaderExpr: isContHeader,
                        titleExpr: title,
                        groupUserCountExpr: isGroupTab ? contact.userCount : '',
                        displayGroupUserCountExpr: displayCount
                            ? 'vis'
                            : 'n-vis',
                        msgCreatedDateExpr: message
                            ? snapCommons.getTimeOrDate(
                                  message.createdAtTime,
                                  true
                              )
                            : '',
                        conversationStatusClass: statusClass,
                    },
                ];
                var latestCreatedAtTime = $applozic(
                    '#' + $listId + ' li:nth-child(1)'
                ).data('msg-time');
                if (
                    typeof latestCreatedAtTime === 'undefined' ||
                    (message ? message.createdAtTime : '') >=
                        latestCreatedAtTime ||
                    ($listId.indexOf('search') !== -1 && prepend)
                ) {
                    $applozic
                        .tmpl('contactTemplate', contactList)
                        .prependTo('#' + $listId);
                } else {
                    $applozic
                        .tmpl('contactTemplate', contactList)
                        .appendTo('#' + $listId);
                    SnapUI.checkSingleThreadedConversationSettings(true);
                }
                var $textMessage = $applozic(
                    '#li-' + contHtmlExpr + ' .msgTextExpr'
                );
                emoji_template = _this.getScriptMessagePreview(
                    message,
                    emoji_template
                );
                if (message && message.metadata && message.metadata.feedback) {
                    emoji_template = MCK_LABELS['you'] + ' ' + emoji_template;
                }
                snapCommons.isObject(emoji_template)
                    ? $textMessage.append(emoji_template)
                    : $textMessage.html(emoji_template);
                if (typeof emoji_template == 'undefined') {
                    $textMessage.html('');
                }
            };
            _this.addContactsToContactSearchList = function () {
                var contactsArray = [],
                    userIdArray = [];
                $mck_no_search_contacts.removeClass('vis').addClass('n-vis');
                $mck_no_search_groups.removeClass('vis').addClass('n-vis');
                if (!$mck_contact_search_tab.hasClass('active')) {
                    $mck_search_tab_link.removeClass('active');
                    $mck_contact_search_tab.addClass('active');
                }
                $mck_group_search_list.removeClass('vis').addClass('n-vis');
                $mck_contact_search_list.removeClass('n-vis').addClass('vis');
                $mck_group_search_input_box
                    .removeClass('vis')
                    .addClass('n-vis');
                $mck_contact_search_input_box
                    .removeClass('n-vis')
                    .addClass('vis');
                $mck_contact_search_list.html('');
                $mck_contacts_content.removeClass('vis').addClass('n-vis');
                $mck_sidebox_content.removeClass('vis').addClass('n-vis');
                $mck_group_info_tab.removeClass('vis').addClass('n-vis');
                $mck_group_create_tab.removeClass('vis').addClass('n-vis');
                $mck_sidebox_search.removeClass('n-vis').addClass('vis');
                $mck_search_loading.removeClass('n-vis').addClass('vis');
                if (MCK_CONTACT_ARRAY.length !== 0) {
                    mckMessageLayout.addContactsToSearchList();
                } else if (!IS_MCK_OWN_CONTACTS) {
                    mckContactService.loadContacts();
                } else {
                    $mck_search_loading.removeClass('vis').addClass('n-vis');
                    $mck_no_search_contacts
                        .removeClass('n-vis')
                        .addClass('vis');
                }
                $mck_contact_search_input.focus();
            };
            _this.addGroupsToGroupSearchList = function () {
                var groupsArray = [],
                    groupIdArray = [];
                $mck_no_search_contacts.removeClass('vis').addClass('n-vis');
                $mck_no_search_groups.removeClass('vis').addClass('n-vis');
                if (!$mck_group_search_tab.hasClass('active')) {
                    $mck_search_tab_link.removeClass('active');
                    $mck_group_search_tab.addClass('active');
                }
                $mck_contact_search_list.removeClass('vis').addClass('n-vis');
                $mck_group_search_list.removeClass('n-vis').addClass('vis');
                $mck_contact_search_input_box
                    .removeClass('vis')
                    .addClass('n-vis');
                $mck_group_search_input_box
                    .removeClass('n-vis')
                    .addClass('vis');
                $mck_group_search_list.html('');
                $mck_contacts_content.removeClass('vis').addClass('n-vis');
                $mck_sidebox_content.removeClass('vis').addClass('n-vis');
                $mck_group_info_tab.removeClass('vis').addClass('n-vis');
                $mck_group_create_tab.removeClass('vis').addClass('n-vis');
                $mck_sidebox_search.removeClass('n-vis').addClass('vis');
                $mck_search_loading.removeClass('n-vis').addClass('vis');
                if (MCK_GROUP_ARRAY.length > 0) {
                    $applozic.each(MCK_GROUP_ARRAY, function (i, group) {
                        groupIdArray.push(group.contactId);
                    });
                    var uniqueGroupIdArray = groupIdArray.filter(function (
                        item,
                        pos
                    ) {
                        return groupIdArray.indexOf(item) === pos;
                    });
                    uniqueGroupIdArray.sort();
                    $applozic.each(uniqueGroupIdArray, function (i, groupId) {
                        if (groupId) {
                            var group = mckGroupUtils.getGroup('' + groupId);
                            groupsArray.push(group);
                            if (
                                $applozic('#li-gs-group-' + group.htmlId)
                                    .length === 0
                            ) {
                                _this.addContactForSearchList(
                                    group,
                                    'mck-group-search-list'
                                );
                            }
                        }
                    });
                } else {
                    $mck_no_search_groups.removeClass('n-vis').addClass('vis');
                }
                _this.initAutoSuggest({
                    contactsArray: groupsArray,
                    $searchId: $mck_group_search_input,
                    isContactSearch: true,
                });
                $mck_search_loading.removeClass('vis').addClass('n-vis');
            };
            _this.addConversationMenu = function (tabId, isGroup) {
                var currTabId = $mck_msg_inner.data('mck-id');
                $mck_conversation_list.html('');
                if (tabId !== currTabId) {
                    return;
                }
                var tabConvArray = MCK_TAB_CONVERSATION_MAP[tabId];
                if (
                    typeof tabConvArray === 'undefined' ||
                    tabConvArray.length === 0 ||
                    tabConvArray.length === 1
                ) {
                    $product_box_caret.addClass('n-vis');
                    $mck_product_box.addClass('mck-product-box-wc');
                    $mck_conversation_list.addClass('n-vis');
                    return;
                }
                $mck_conversation_list.removeClass('n-vis');
                $product_box_caret.removeClass('n-vis');
                $mck_product_box.removeClass('mck-product-box-wc');
                $applozic.each(tabConvArray, function (i, convPxy) {
                    if (
                        $applozic('#mck-conversation-list #li-' + convPxy.id)
                            .length === 0
                    ) {
                        var title = '';
                        if (convPxy.topicDetail) {
                            var topicDetail = $applozic.parseJSON(
                                convPxy.topicDetail
                            );
                            title =
                                typeof topicDetail === 'object'
                                    ? topicDetail.title
                                    : convPxy.topicDetail;
                        }
                        if (!title) {
                            title = convPxy.topicId;
                        }
                        var convList = [
                            {
                                convIdExpr: convPxy.id,
                                tabIdExpr: tabId,
                                isGroupExpr: isGroup,
                                topicIdExpr: convPxy.topicId,
                                convTitleExpr: title,
                                mckLauncherExpr: MCK_LAUNCHER,
                            },
                        ];
                        $applozic
                            .tmpl('convTemplate', convList)
                            .appendTo($mck_conversation_list);
                    }
                });
                if ($applozic('#mck-conversation-list li').length < 2) {
                    $product_box_caret.addClass('n-vis');
                    $mck_product_box.addClass('mck-product-box-wc');
                    $mck_conversation_list.addClass('n-vis');
                }
            };
            _this.loadContacts = function (data) {
                if (
                    data + '' === 'null' ||
                    typeof data === 'undefined' ||
                    typeof data.contacts === 'undefined' ||
                    data.contacts.length === 0
                ) {
                    return;
                }
                MCK_CONTACT_ARRAY.length = 0;
                MCK_GROUP_MEMBER_SEARCH_ARRAY.length = 0;
                $applozic.each(data.contacts, function (i, data) {
                    if (typeof data.userId !== 'undefined') {
                        var contact = _this.getContact('' + data.userId);
                        contact =
                            typeof contact === 'undefined'
                                ? _this.createContactWithDetail(data)
                                : _this.updateContactDetail(contact, data);
                        MCK_CONTACT_ARRAY.push(contact);
                        MCK_GROUP_MEMBER_SEARCH_ARRAY.push(contact.contactId);
                    }
                });
            };

            _this.loadContactsForContactList = function (data) {
                var startIndex = data.startIndex ? data.startIndex : '0';
                var pageSize = data.pageSize ? data.pageSize : '50';
                var url =
                    MCK_BASE_URL +
                    '/rest/ws/user/filter?startIndex=' +
                    startIndex +
                    '&pageSize=' +
                    pageSize +
                    '&orderBy=1';
                window.Applozic.ALApiService.ajax({
                    url: url,
                    type: 'get',
                    global: false,
                    encryptionKey: window.Applozic.ALApiService.getEncryptionKey(),
                    success: function (data) {
                        console.log(data);
                    },
                    error: function () {
                        w.console.log(
                            'Unable to load contacts. Please reload page.'
                        );
                    },
                });
            };

            _this.getStatusIcon = function (msg) {
                return (
                    '<span class="' +
                    _this.getStatusIconName(msg) +
                    ' move-right ' +
                    msg.key +
                    '_status status-icon"></span>'
                );
            };
            _this.getStatusIconName = function (msg) {
                if (!Snap.internetStatus && msg.contentType === 1) {
                    return 'mck-failed-text';
                }
                if (
                    msg.type === 7 ||
                    msg.type === 6 ||
                    msg.type === 4 ||
                    msg.type === 0
                ) {
                    return '';
                }
                if (msg.status === 5) {
                    return 'mck-read-icon';
                }
                if (msg.status === 4) {
                    return 'mck-delivered-icon';
                }
                if (
                    msg.type === 3 ||
                    msg.type === 5 ||
                    (msg.type === 1 && (msg.source === 0 || msg.source === 1))
                ) {
                    return 'mck-sent-icon';
                }
                return '';
            };
            _this.clearMessageField = function (keyboard) {
                $mck_text_box.html('');
                $mck_box_form.removeClass('mck-text-req');
                $mck_msg_sbmt.attr('disabled', false);
                $mck_file_box
                    .removeClass('vis')
                    .removeClass('mck-text-req')
                    .addClass('n-vis')
                    .attr('required', '')
                    .html('');
                var disableAutofocus =
                    document
                        .getElementById('mck-text-box')
                        .getAttribute('data-quick-reply') === 'true';
                if (keyboard && !disableAutofocus) {
                    $mck_text_box.focus().select();
                } else {
                    $mck_search.blur();
                    $mck_text_box.blur();
                }
                document
                    .getElementById('mck-text-box')
                    .setAttribute('data-quick-reply', false);
                document.getElementById('mck-char-warning') &&
                    document
                        .getElementById('mck-char-warning')
                        .classList.add('n-vis');
            };
            _this.addDraftMessage = function (tabId) {
                FILE_META = [];
                if (tabId && typeof TAB_MESSAGE_DRAFT[tabId] === 'object') {
                    var draftMessage = TAB_MESSAGE_DRAFT[tabId];
                    $mck_text_box.html(draftMessage.text);
                    if (draftMessage.files.length > 0) {
                        $applozic.each(draftMessage.files, function (i, file) {
                            mckFileService.addFileBox(file);
                        });
                        $file_name.html(draftMessage.filelb);
                        $file_size.html(draftMessage.filesize);
                        $mck_file_box
                            .removeClass('n-vis')
                            .removeClass('mck-text-req')
                            .addClass('vis')
                            .removeAttr('required');
                    }
                } else {
                    FILE_META = [];
                }
            };
            _this.showOfflineMessage = function () {
                if (
                    typeof MCK_OFFLINE_MESSAGE_DETAIL === 'object' &&
                    MCK_OFFLINE_MESSAGE_DETAIL.innerHTML
                ) {
                    $mck_offline_message_box.html(
                        MCK_OFFLINE_MESSAGE_DETAIL.innerHTML
                    );
                    $mck_offline_message_box
                        .removeClass('n-vis')
                        .addClass('vis');
                } else {
                    w.console.log('Offline message innerHTML required.');
                }
            };
            _this.hideOfflineMessage = function () {
                mckInit.stopOfflineMessageCounter();
                $mck_offline_message_box.removeClass('vis').addClass('n-vis');
            };
            _this.removeConversationThread = function (tabId, isGroup) {
                ALStorage.clearMckMessageArray();
                var contact = isGroup
                    ? mckGroupUtils.getGroup(tabId)
                    : mckMessageLayout.getContact(tabId);
                var currentTabId = $mck_msg_inner.data('mck-id');
                var isCurrGroupTab = $mck_msg_inner.data('isgroup');
                if (
                    typeof currentTabId === 'undefined' ||
                    currentTabId === ''
                ) {
                    var htmlId =
                        typeof contact !== 'undefined'
                            ? contact.htmlId
                            : mckContactUtils.formatContactId(tabId);
                    var contactIdExpr = isGroup
                        ? 'group-' + htmlId
                        : 'user-' + htmlId;
                    $applozic('#li-' + contactIdExpr).remove();
                } else if (
                    currentTabId === tabId &&
                    isCurrGroupTab === isGroup
                ) {
                    $mck_tab_option_panel.data('datetime', '');
                    // $mck_no_messages.removeClass('n-vis').addClass('vis');
                    //   $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No messages yet!</div>');
                    $mck_msg_cell.removeClass('n-vis').addClass('vis');
                    $mck_tab_message_option
                        .removeClass('vis')
                        .addClass('n-vis');
                }
            };
            _this.removedDeletedMessage = function (key, tabId, isGroup) {
                ALStorage.clearMckMessageArray();
                var $divMessage = $applozic('.' + key);
                if ($divMessage.length > 0) {
                    $divMessage.remove();
                    if ($mck_msg_inner.is(':empty')) {
                        $mck_msg_cell.removeClass('n-vis').addClass('vis');
                        $mck_tab_message_option
                            .removeClass('vis')
                            .addClass('n-vis');
                    }
                } else if (typeof tabId !== 'undefined') {
                    var mckContactListLength = $applozic('#mck-contact-list')
                        .length;
                    if (mckContactListLength > 0) {
                        alMessageService.updateContactList(tabId, isGroup);
                    }
                }
            };
            _this.getScriptMessagePreview = function (message, emoji_template) {
                if (
                    message &&
                    message.message &&
                    message.contentType !==
                        SnapConstants.MESSAGE_CONTENT_TYPE.LOCATION &&
                    message.contentType !==
                        SnapConstants.MESSAGE_CONTENT_TYPE.TEXT_HTML &&
                    !Snap.isRichTextMessage(message.metadata)
                ) {
                    if (
                        typeof emoji_template === 'string' &&
                        emoji_template.indexOf('emoji-inner') === -1
                    ) {
                        emoji_template = snapCommons.formatHtmlTag(
                            emoji_template
                        );
                    }
                }
                return emoji_template;
            };
            _this.getMessageTextForContactPreview = function (
                message,
                contact
            ) {
                var emoji_template = '';
                if (typeof message !== 'undefined') {
                    if (message.message) {
                        if (message.metadata.hide === 'true') {
                            return;
                        }
                        if (
                            message.metadata &&
                            (message.metadata.KM_ASSIGN ||
                                message.metadata.KM_STATUS)
                        ) {
                            return;
                        }
                        if (
                            message.contentType ===
                            SnapConstants.MESSAGE_CONTENT_TYPE.LOCATION
                        ) {
                            emoji_template =
                                '<span class="mck-icon--location"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="rgba(38,50,56,.52)"/><path d="M0 0h24v24H0z" fill="none"/></svg></span><span>Location</span>';
                        } else if (
                            message.contentType ===
                                SnapConstants.MESSAGE_CONTENT_TYPE.TEXT_HTML &&
                            message.source ===
                                SnapConstants.MESSAGE_SOURCE.MAIL_INTERCEPTOR
                        ) {
                            var s = message.message;
                            var result = s
                                .match(/<b>(.*?)<\/b>/g)
                                .map(function (val) {
                                    return val.replace(/<\/?b>/g, '');
                                });

                            var emailSvg =
                                '<span class="mck-icon--email"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25l-6.54 4.09c-.65.41-1.47.41-2.12 0L4.4 8.25c-.25-.16-.4-.43-.4-.72 0-.67.73-1.07 1.3-.72L12 11l6.7-4.19c.57-.35 1.3.05 1.3.72 0 .29-.15.56-.4.72z" fill="rgba(38,50,56,.52)"/></svg>';

                            emoji_template = result
                                ? emailSvg + result[0]
                                : emailSvg + '</span><span>Email</span>';
                        } else {
                            var msg = message.message;
                            if (mckUtils.startsWith(msg, '<img')) {
                                return '<span class="mck-icon--camera"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="rgba(38,50,56,.52)"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="rgba(38,50,56,.52)"/><path d="M0 0h24v24H0z" fill="none"/></svg></span><span>image</span>';
                            } else {
                                if (
                                    w.emoji !== null &&
                                    typeof w.emoji !== 'undefined'
                                ) {
                                    emoji_template = w.emoji.replace_unified(
                                        msg
                                    );
                                    emoji_template = w.emoji.replace_colons(
                                        emoji_template
                                    );
                                    emoji_template =
                                        emoji_template.indexOf('</span>') !== -1
                                            ? emoji_template.substring(
                                                  0,
                                                  emoji_template.lastIndexOf(
                                                      '</span>'
                                                  )
                                              )
                                            : emoji_template;
                                } else {
                                    emoji_template = msg;
                                }
                            }
                            if (!contact.isGroup) {
                                if (
                                    emoji_template.indexOf('emoji-inner') ===
                                        -1 &&
                                    message.contentType ===
                                        SnapConstants.MESSAGE_CONTENT_TYPE
                                            .DEFAULT
                                ) {
                                    var x = d.createElement('p');
                                    x.appendChild(
                                        d.createTextNode(emoji_template)
                                    );
                                    emoji_template = x;
                                }
                            }
                        }
                    } else if (
                        message.fileMetaKey &&
                        typeof message.fileMeta === 'object'
                    ) {
                        emoji_template = alFileService.getFileIcon(message);
                    } else if (
                        message.metadata &&
                        message.metadata.messagePreview
                    ) {
                        emoji_template = message.metadata.messagePreview;
                    }

                    if (
                        Snap.isRichTextMessage(message.metadata) ||
                        message.contentType ==
                            SnapConstants.MESSAGE_CONTENT_TYPE.TEXT_HTML
                    ) {
                        var messageContent = message.message;
                        message.contentType ==
                            SnapConstants.MESSAGE_CONTENT_TYPE.TEXT_HTML &&
                            (messageContent = '');
                        emoji_template =
                            '<span class="mck-icon--rich-message">' +
                            SnapConstants.RICH_MESSAGE_ICON +
                            '</span><span>' +
                            (messageContent ||
                                MCK_LABELS['rich.message'][
                                    'notification.preview'
                                ]) +
                            '</span>';
                    }
                    if (
                        contact.isGroup &&
                        contact.type !== SnapConstants.GROUP_TYPE.SELLER &&
                        contact.type !== SnapConstants.GROUP_TYPE.GROUP_OF_TWO
                    ) {
                        var msgFrom =
                            message.to.split(',')[0] === MCK_USER_ID
                                ? 'Me'
                                : mckMessageLayout.getTabDisplayName(
                                      message.to.split(',')[0],
                                      false
                                  );
                        if (
                            message.contentType !==
                                SnapConstants.MESSAGE_CONTENT_TYPE
                                    .NOTIFY_MESSAGE &&
                            contact.type !== SnapConstants.GROUP_TYPE.SUPPORT
                        ) {
                            emoji_template = msgFrom + ': ' + emoji_template;
                        }
                        if (
                            emoji_template.indexOf('emoji-inner') === -1 &&
                            message &&
                            message.message &&
                            message.contentType ===
                                SnapConstants.MESSAGE_CONTENT_TYPE.DEFAULT &&
                            !Snap.isRichTextMessage(message.metadata)
                        ) {
                            var x = d.createElement('p');
                            x.appendChild(d.createTextNode(emoji_template));
                            emoji_template = x;
                        }
                    }
                }
                return emoji_template;
            };
            _this.getTextForMessagePreview = function (message, contact) {
                var emoji_template = '';
                if (typeof message !== 'undefined') {
                    if (message.contentType === 2) {
                        emoji_template = 'Shared location';
                    } else if (message.message) {
                        var msg = message.message;
                        if (mckUtils.startsWith(msg, '<img')) {
                            emoji_template = 'Image attachment';
                        } else {
                            var x = d.createElement('div');
                            x.innerHTML = msg;
                            msg = $applozic.trim(mckUtils.textVal(x));
                            emoji_template = msg.substring(0, 50);
                        }
                    } else if (
                        message.fileMetaKey &&
                        typeof message.fileMeta === 'object'
                    ) {
                        emoji_template =
                            message.fileMeta.contentType.indexOf('image') !== -1
                                ? 'Image attachment'
                                : 'File attachment';
                    }
                    if (
                        contact.isGroup &&
                        contact.type !== 3 &&
                        contact.type !== 7
                    ) {
                        var msgFrom =
                            message.to.split(',')[0] === MCK_USER_ID
                                ? 'Me'
                                : mckMessageLayout.getTabDisplayName(
                                      message.to.split(',')[0],
                                      false
                                  );
                        emoji_template = msgFrom + ': ' + emoji_template;
                    }
                }
                return emoji_template;
            };
            _this.getUserIdFromMessage = function (message) {
                var tos = message.to;
                if (tos.lastIndexOf(',') === tos.length - 1) {
                    tos = tos.substring(0, tos.length - 1);
                }
                return tos.split(',');
            };
            _this.getUserIdArrayFromMessageList = function (messages) {
                var userIdArray = new Array();
                if (typeof messages.length === 'undefined') {
                    userIdArray.concat(_this.getUserIdFromMessage(messages));
                } else {
                    $applozic.each(messages, function (i, message) {
                        if (!(typeof message.to === 'undefined')) {
                            userIdArray = userIdArray.concat(
                                _this.getUserIdFromMessage(message)
                            );
                        }
                    });
                }
                return userIdArray;
            };
            _this.messageContextMenu = function (messageKey) {
                var $messageBox = $applozic('.' + messageKey + ' .mck-msg-box');
                if ($messageBox.addEventListener) {
                    $messageBox.addEventListener(
                        'contextmenu',
                        function (e) {
                            e.preventDefault();
                        },
                        false
                    );
                } else {
                    //     $messageBox.bind('contextmenu', function (e) {
                    //         e.preventDefault();
                    //         $applozic(".mck-context-menu").removeClass("vis").addClass("n-vis");
                    //         $applozic("." + messageKey + " .mck-context-menu").removeClass("n-vis").addClass("vis");
                    //         w.event.returnValue = false;
                    //     });
                }
            };
            _this.isValidMetaData = function (message) {
                if (!message.metadata) {
                    return true;
                } else if (
                    message.metadata.category === 'HIDDEN' ||
                    message.metadata.hide == 'true' ||
                    message.metadata.show == 'false' ||
                    message.metadata.KM_ASSIGN ||
                    message.metadata.KM_STATUS
                ) {
                    return false;
                } else {
                    return true;
                }
            };
            _this.updateDraftMessage = function (tabId, fileMeta) {
                if (typeof fileMeta === 'object') {
                    var tab_draft = {
                        text: '',
                        files: [],
                    };
                    var file = {
                        fileMeta: fileMeta,
                        filelb: alFileService.getFilePreviewPath(fileMeta),
                        filesize: alFileService.getFilePreviewSize(
                            fileMeta.size
                        ),
                    };
                    if (
                        typeof tabId !== 'undefined' &&
                        typeof TAB_MESSAGE_DRAFT[tabId] === 'object'
                    ) {
                        tab_draft = TAB_MESSAGE_DRAFT[tabId];
                        $applozic.each(tab_draft.files, function (i, oldFile) {
                            if (oldFile.filelb === file.filelb) {
                                tab_draft.files.splice(i, 1);
                            }
                        });
                    }
                    tab_draft.files.push(file);
                }
                TAB_MESSAGE_DRAFT[tabId] = tab_draft;
            };
            _this.updateUnreadCount = function (tabId, count, isTotalUpdate) {
                var previousCount = _this.getUnreadCount(tabId);
                MCK_UNREAD_COUNT_MAP[tabId] = count;
                if (isTotalUpdate || $mckChatLauncherIcon.length > 0) {
                    MCK_TOTAL_UNREAD_COUNT += count - previousCount;
                    if (MCK_TOTAL_UNREAD_COUNT < 0) {
                        MCK_TOTAL_UNREAD_COUNT = 0;
                    }
                    MCK_TOTAL_UNREAD_COUNT > 0
                        ? $mckChatLauncherIcon.html(MCK_TOTAL_UNREAD_COUNT)
                        : $mckChatLauncherIcon.html('');
                }
                if (isTotalUpdate) {
                    mckUtils.badgeCountOnLaucher(
                        MCK_ENABLE_BADGE_COUNT,
                        MCK_TOTAL_UNREAD_COUNT
                    );
                }
                if (snapCommons.isWidgetOpen()) {
                    snapCommons.modifyClassList(
                        { id: ['applozic-badge-count'] },
                        'n-vis',
                        ''
                    );
                }
            };
            _this.incrementUnreadCount = function (tabId) {
                MCK_TOTAL_UNREAD_COUNT += 1;
                MCK_UNREAD_COUNT_MAP[tabId] =
                    typeof MCK_UNREAD_COUNT_MAP[tabId] === 'undefined'
                        ? 1
                        : MCK_UNREAD_COUNT_MAP[tabId] + 1;
                if ($mckChatLauncherIcon.length > 0) {
                    $mckChatLauncherIcon.html(MCK_TOTAL_UNREAD_COUNT);
                }
                mckUtils.badgeCountOnLaucher(
                    MCK_ENABLE_BADGE_COUNT,
                    MCK_TOTAL_UNREAD_COUNT
                );
            };
            _this.getUnreadCount = function (tabId) {
                if (typeof MCK_UNREAD_COUNT_MAP[tabId] === 'undefined') {
                    MCK_UNREAD_COUNT_MAP[tabId] = 0;
                    return 0;
                } else {
                    return MCK_UNREAD_COUNT_MAP[tabId];
                }
            };
            _this.isGroupDeleted = function (tabId, isGroup) {
                if (isGroup) {
                    var deletedAtTime = mckGroupLayout.getDeletedAtTime(tabId);
                    return (
                        typeof deletedAtTime !== 'undefined' &&
                        deletedAtTime > 0
                    );
                }
                return false;
            };
            _this.getTabDisplayName = function (tabId, isGroup, userName) {
                var displayName = '';
                if (isGroup) {
                    displayName = mckGroupService.getGroupDisplayName(tabId);
                } else {
                    if (typeof MCK_GETUSERNAME === 'function') {
                        displayName = MCK_GETUSERNAME(tabId);
                    }
                    if (typeof userName !== 'undefined' && userName) {
                        displayName = userName;
                        MCK_CONTACT_NAME_MAP[tabId] = userName;
                    }
                    if (!displayName) {
                        displayName = _this.getContactDisplayName(tabId);
                    }
                    var contact = _this.fetchContact('' + tabId);
                    if (!displayName) {
                        if (typeof contact.displayName !== 'undefined') {
                            displayName = contact.displayName;
                        }
                    } else {
                        contact.displayName = displayName;
                        MCK_CONTACT_MAP[contact.contactId] = contact;
                    }
                    if (!displayName) {
                        displayName = tabId;
                    }
                }
                return displayName && snapCommons.formatHtmlTag(displayName);
            };
            _this.populateMessage = function (
                messageType,
                message,
                notifyUser
            ) {
                var callDuration = mckDateUtils.convertMilisIntoTime(
                    message.metadata.CALL_DURATION
                );
                var contact = message.groupId
                    ? mckGroupUtils.getGroup(message.groupId)
                    : mckMessageLayout.getContact(message.to);
                alUserService.loadUserProfile(message.to);
                !_this.isMessageSentByBot(message, contact) &&
                    $applozic('.km-typing-wrapper').remove();
                var tabId = $mck_msg_inner.data('mck-id');
                var isValidMeta = mckMessageLayout.isValidMetaData(message);
                if (typeof tabId === 'undefined' || tabId === '') {
                    var mckContactListLength = $applozic('#mck-contact-list')
                        .length;
                    if (mckContactListLength > 0 && isValidMeta) {
                        var update =
                            typeof message.metadata == 'object' &&
                            (typeof message.metadata.KM_ASSIGN == 'undefined' ||
                                typeof message.metadata.KM_STATUS ==
                                    'undefined');
                        message.groupId
                            ? mckGroupService.addGroupFromMessage(
                                  message,
                                  update,
                                  function (group, message, update) {
                                      _this.updateRecentConversationList(
                                          group,
                                          message,
                                          update
                                      );
                                  }
                              )
                            : mckMessageLayout.addContactsFromMessage(
                                  message,
                                  true
                              );
                    } else {
                        mckMessageLayout.addContactsFromMessageList(
                            { message: [message] },
                            ''
                        );
                    }
                    if (
                        messageType === 'APPLOZIC_01' ||
                        messageType === 'MESSAGE_RECEIVED'
                    ) {
                        if (typeof contact === 'undefined') {
                            contact = message.groupId
                                ? mckGroupUtils.createGroup(message.groupId)
                                : mckMessageLayout.createContact(message.to);
                        }
                        if (IS_LAUNCH_TAB_ON_NEW_MESSAGE) {
                            mckMessageLayout.loadTab({
                                tabId: contact.contactId,
                                isGroup: contact.isGroup,
                                conversationId: message.conversationId,
                            });
                            return;
                        }
                        var ucTabId = message.groupId
                            ? 'group_' + contact.contactId
                            : 'user_' + contact.contactId;
                        if (isValidMeta) {
                            if (
                                message.contentType !== 10 &&
                                message.contentType !== 102
                            ) {
                                mckMessageLayout.incrementUnreadCount(ucTabId);
                            }
                            if (
                                !(
                                    document.getElementById('mck-sidebox').style
                                        .display === 'block'
                                )
                            ) {
                                mckNotificationService.notifyUser(message);
                            }
                        }
                        var contactHtmlExpr = message.groupId
                            ? 'group-' + contact.htmlId
                            : 'user-' + contact.htmlId;
                        $applozic(
                            '#li-' + contactHtmlExpr + ' .mck-unread-count-text'
                        ).html(mckMessageLayout.getUnreadCount(ucTabId));
                        if (mckMessageLayout.getUnreadCount(ucTabId) > 0) {
                            $applozic(
                                '#li-' +
                                    contactHtmlExpr +
                                    ' .mck-unread-count-box'
                            )
                                .removeClass('n-vis')
                                .addClass('vis');
                        }
                        mckMessageService.sendDeliveryUpdate(
                            message.pairedMessageKey
                        );
                    }
                } else {
                    if (typeof contact === 'undefined') {
                        contact = message.groupId
                            ? mckGroupUtils.createGroup(message.groupId)
                            : mckMessageLayout.createContact(message.to);
                    }
                    if (
                        messageType === 'APPLOZIC_01' ||
                        messageType === 'MESSAGE_RECEIVED'
                    ) {
                        if (typeof contact !== 'undefined') {
                            var isGroupTab = $mck_msg_inner.data('isgroup');
                            if (
                                ((typeof message.oldKey === 'undefined' ||
                                    $applozic('.' + message.oldKey).length ===
                                        0) &&
                                    $applozic('.' + message.key).length ===
                                        0) ||
                                message.contentType === 10
                            ) {
                                if (
                                    typeof tabId !== 'undefined' &&
                                    tabId == contact.contactId &&
                                    isGroupTab === contact.isGroup &&
                                    !$mck_group_info_tab.hasClass('vis')
                                ) {
                                    var validated = true;
                                    if (isGroupTab && contact.type === 6) {
                                        validated = mckGroupService.isAppendOpenGroupContextMenu(
                                            contact
                                        );
                                    }
                                    if (
                                        message.conversationId &&
                                        (IS_MCK_TOPIC_HEADER ||
                                            IS_MCK_TOPIC_BOX)
                                    ) {
                                        var currConvId = $mck_msg_inner.data(
                                            'mck-conversationid'
                                        );
                                        if (
                                            currConvId &&
                                            currConvId.toString() ===
                                                message.conversationId.toString()
                                        ) {
                                            if (
                                                !message.metadata ||
                                                message.metadata.category !==
                                                    'HIDDEN'
                                            ) {
                                                mckMessageLayout.addMessage(
                                                    message,
                                                    contact,
                                                    true,
                                                    true,
                                                    validated
                                                );
                                            }
                                            mckMessageService.sendReadUpdate(
                                                message.pairedMessageKey
                                            );
                                        } else if (
                                            IS_LAUNCH_TAB_ON_NEW_MESSAGE
                                        ) {
                                            mckMessageLayout.loadTab({
                                                tabId: contact.contactId,
                                                isGroup: contact.isGroup,
                                                conversationId:
                                                    message.conversationId,
                                            });
                                            return;
                                        }
                                    } else {
                                        if (contact.type === 7) {
                                            var contacts;
                                            var group = mckGroupUtils.getGroup(
                                                message.groupId
                                            );
                                            mckGroupService.getContactFromGroupOfTwo(
                                                group,
                                                function (user) {
                                                    contacts = mckMessageLayout.fetchContact(
                                                        user
                                                    );
                                                }
                                            );
                                            mckUserUtils.lastSeenOfGroupOfTwo(
                                                contacts.contactId
                                            );
                                            mckMessageLayout.addMessage(
                                                message,
                                                contact,
                                                true,
                                                true,
                                                validated
                                            );
                                        }

                                        if (
                                            !message.metadata ||
                                            (message.metadata.category !==
                                                'HIDDEN' &&
                                                message.metadata.hide !==
                                                    'true' &&
                                                contact.type !== 7) ||
                                            (!message.message &&
                                                (message.metadata.hasOwnProperty(
                                                    'KM_ASSIGN_TO'
                                                ) ||
                                                    message.metadata.hasOwnProperty(
                                                        'KM_ASSIGN_TEAM'
                                                    )))
                                        ) {
                                            if (
                                                MCK_BOT_MESSAGE_DELAY !== 0 &&
                                                _this.isMessageSentByBot(
                                                    message,
                                                    contact
                                                )
                                            ) {
                                                mckMessageLayout.addMessage(
                                                    message,
                                                    contact,
                                                    true,
                                                    true,
                                                    validated,
                                                    null,
                                                    function () {
                                                        _this.processMessageInQueue(
                                                            message
                                                        );
                                                    },
                                                    null,
                                                    null,
                                                    true
                                                );
                                            } else {
                                                mckMessageLayout.addMessage(
                                                    message,
                                                    contact,
                                                    true,
                                                    true,
                                                    validated,
                                                    null,
                                                    null,
                                                    null,
                                                    null,
                                                    null,
                                                    true
                                                );
                                                $applozic(
                                                    '.km-typing-wrapper'
                                                ).remove();
                                            }
                                            mckMessageLayout.messageClubbing(
                                                false
                                            );
                                        }
                                        mckMessageService.sendReadUpdate(
                                            message.pairedMessageKey
                                        );
                                    }
                                    if (!message.groupId) {
                                        $applozic('#mck-tab-status').html(
                                            MCK_LABELS['online']
                                        );
                                        alUserService.updateUserStatus(
                                            {
                                                userId: message.to,
                                                status: 1,
                                            },
                                            function (userIdArray) {
                                                mckContactService.getUsersDetail(
                                                    userIdArray,
                                                    {}
                                                );
                                            }
                                        );
                                    }
                                    // Todo: use contactNumber instead of contactId
                                    // for Google Contacts API.
                                } else {
                                    if (IS_LAUNCH_TAB_ON_NEW_MESSAGE) {
                                        mckMessageLayout.loadTab({
                                            tabId: contact.contactId,
                                            isGroup: contact.isGroup,
                                            conversationId:
                                                message.conversationId,
                                        });
                                        return;
                                    }

                                    if (
                                        isValidMeta &&
                                        message.contentType !== 10 &&
                                        message.contentType !== 102
                                    ) {
                                        var ucTabId = message.groupId
                                            ? 'group_' + contact.contactId
                                            : 'user_' + contact.contactId;
                                        mckMessageLayout.incrementUnreadCount(
                                            ucTabId
                                        );
                                    }

                                    mckMessageService.sendDeliveryUpdate(
                                        message.pairedMessageKey
                                    );
                                }
                                if (notifyUser && contact.type !== 6) {
                                    if (
                                        !(
                                            document.getElementById(
                                                'mck-sidebox'
                                            ).style.display === 'block'
                                        )
                                    ) {
                                        mckNotificationService.notifyUser(
                                            message
                                        );
                                    }
                                }
                            }
                        }
                    } else if (
                        messageType === 'APPLOZIC_02' &&
                        !(message.contentType == 102)
                    ) {
                        if (
                            ((typeof message.oldKey === 'undefined' ||
                                $applozic('.' + message.oldKey).length === 0) &&
                                $applozic('.' + message.key).length === 0) ||
                            message.contentType === 10
                        ) {
                            if (mckContactListLength > 0) {
                                mckMessageLayout.addContactsFromMessage(
                                    message,
                                    true
                                );
                            } else {
                                if (typeof contact !== 'undefined') {
                                    var isGroupTab = $mck_msg_inner.data(
                                        'isgroup'
                                    );
                                    if (
                                        typeof tabId !== 'undefined' &&
                                        tabId === contact.contactId &&
                                        isGroupTab === contact.isGroup
                                    ) {
                                        var validated = true;
                                        if (isGroupTab && contact.type === 6) {
                                            validated = mckGroupService.isAppendOpenGroupContextMenu(
                                                contact
                                            );
                                        }
                                        if (
                                            !message.metadata ||
                                            message.metadata.category !==
                                                'HIDDEN'
                                        ) {
                                            mckMessageLayout.addMessage(
                                                message,
                                                contact,
                                                true,
                                                true,
                                                validated
                                            );
                                        }
                                        if (message.type === 3) {
                                            $applozic(
                                                '.' +
                                                    message.key +
                                                    ' .mck-message-status'
                                            )
                                                .removeClass('mck-pending-icon')
                                                .addClass('mck-sent-icon');
                                            mckMessageLayout.addTooltip(
                                                message.key
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                $mck_loading.removeClass('vis').addClass('n-vis');
            };

            _this.isMessageSentByBot = function (message, contact) {
                return (
                    contact.users &&
                    contact.users[message.to] &&
                    contact.users[message.to].userId !== 'bot' &&
                    contact.users[message.to].role ===
                        SnapConstants.GROUP_ROLE.MODERATOR_OR_BOT
                );
            };

            _this.processMessageInQueue = function (message) {
                message &&
                    message.key &&
                    MCK_BOT_MESSAGE_QUEUE.push(message.key);
                MCK_BOT_MESSAGE_QUEUE.length == 1 &&
                    _this.procesMessageTimerDelay();
            };

            _this.procesMessageTimerDelay = function () {
                var messageContainer = document.getElementById(
                        'mck-message-cell'
                    ),
                    message;

                if (!document.querySelector('.km-typing-wrapper')) {
                    $mck_msg_inner.append(
                        '<div class="km-typing-wrapper"><div class="km-typing-indicator"></div><div class="km-typing-indicator"></div><div class="km-typing-indicator"></div></div>'
                    );
                    $mck_msg_inner.animate(
                        {
                            scrollTop: $mck_msg_inner.prop('scrollHeight'),
                        },
                        0
                    );
                }

                setTimeout(function () {
                    var currentMessageObject = ALStorage.getMessageByKey(
                        MCK_BOT_MESSAGE_QUEUE[0]
                    );

                    message = messageContainer.querySelector(
                        'div[data-msgkey="' + MCK_BOT_MESSAGE_QUEUE[0] + '"]'
                    );
                    $applozic('.km-typing-wrapper').remove();
                    if (message) {
                        message.classList.remove('n-vis');
                        if ($quick_reply_container.children().length > 0 && MCK_BOT_MESSAGE_QUEUE.length <= 1
                          && !currentMessageObject.metadata.is_close_conversation)  {
                            Snap.changeVisibilityStateForElement(
                                $applozic('#quick-reply-container'),
                                'show'
                            );
                        } else {
                            Snap.changeVisibilityStateForElement(
                                $applozic('#quick-reply-container'),
                                'hide'
                            );
                        }
                        if (currentMessageObject.metadata.is_close_conversation)  {
                            $quick_reply_container.empty();
                            $applozic('#mck-text-box').empty();
                        }

                        $mck_msg_inner.animate(
                            {
                                scrollTop: $mck_msg_inner.prop('scrollHeight'),
                            },
                            0
                        );
                    }
                    MCK_BOT_MESSAGE_QUEUE.shift();

                    if (MCK_BOT_MESSAGE_QUEUE.length !== 0) {
                        _this.procesMessageTimerDelay();
                    } else {
                        Snap.changeTextInputState(currentMessageObject);
                    }

                    var audioGet = document.getElementById('audioGet');
                    audioGet.play();

                }, MCK_BOT_MESSAGE_DELAY);
            };

            _this.getMessageFeed = function (message) {
                var messageFeed = {};
                messageFeed.key = message.key;
                messageFeed.timeStamp = message.createdAtTime;
                messageFeed.message = message.message;
                messageFeed.from =
                    message.type === 4 ? message.to : MCK_USER_ID;
                if (message.groupId) {
                    messageFeed.to = message.groupId;
                } else {
                    messageFeed.to =
                        message.type === 5 ? message.to : MCK_USER_ID;
                }
                messageFeed.status = 'read';
                messageFeed.type = message.type === 4 ? 'inbox' : 'outbox';
                if (message.type === 5) {
                    if (message.status === 3) {
                        messageFeed.status = 'sent';
                    } else if (message.status === 4) {
                        messageFeed.status = 'delivered';
                    }
                }
                if (typeof message.fileMeta === 'object') {
                    var file = $applozic.extend({}, message.fileMeta);
                    if (typeof file.url === 'undefined' || file.url === '') {
                        file.url =
                            MCK_FILE_URL +
                            '/rest/ws/aws/file/' +
                            message.fileMeta.blobKey;
                    }
                    delete file.blobKey;
                    messageFeed.file = file;
                }
                messageFeed.source = message.source;
                messageFeed.metadata = message.metadata;
                return messageFeed;
            };
            _this.updateUnreadCountonChatIcon = function (userDetails) {
                if (
                    IS_LAUNCH_ON_UNREAD_MESSAGE_ENABLED &&
                    userDetails.length > 0
                ) {
                    var contactIdWithUnreadMessage = null;
                    var unreadCountForUser = 0;
                    if (userDetails.length > 0) {
                        $applozic.each(userDetails, function (i, userDetail) {
                            if (
                                userDetail.unreadCount > 0 &&
                                contactIdWithUnreadMessage !== null
                            ) {
                                return;
                            }
                            if (userDetail.unreadCount > 0) {
                                contactIdWithUnreadMessage = userDetail.userId;
                                unreadCountForUser = userDetail.unreadCount;
                            }
                        });
                        if (
                            MCK_TOTAL_UNREAD_COUNT > 0 &&
                            $mck_sidebox.css('display') === 'none'
                        ) {
                            if (
                                contactIdWithUnreadMessage !== null &&
                                unreadCountForUser === MCK_TOTAL_UNREAD_COUNT
                            ) {
                                mckMessageLayout.loadTab({
                                    tabId: contactIdWithUnreadMessage,
                                    isGroup: false,
                                });
                            } else {
                                mckMessageLayout.loadTab({
                                    tabId: '',
                                    isGroup: false,
                                });
                            }
                        }
                    }
                }
            };
            _this.loadMessageListOnUserDetailFetch = function (params) {
                $mck_loading.removeClass('vis').addClass('n-vis');
                var currTabId = $mck_msg_inner.data('mck-id');
                var isGroupTab = $mck_msg_inner.data('isgroup');
                if (
                    typeof currTabId === 'undefined' ||
                    (params.tabId === currTabId &&
                        '' + isGroupTab === '' + params.isGroup)
                ) {
                    var group = mckGroupUtils.getGroup(params.tabId);
                    mckGroupLayout.addGroupStatus(group);
                    var validated = group.type === 6 ? false : true;
                    var validated = true;
                    if (group.type === 6) {
                        mckGroupLayout.validateOpenGroupUser(group);
                        validated = mckGroupService.isAppendOpenGroupContextMenu(
                            group
                        );
                    }
                    if (params.isMessages) {
                        // $mck_no_messages.removeClass('vis').addClass('n-vis');
                        mckMessageLayout.processMessageList(
                            params.messageData,
                            true,
                            validated
                        );
                        if (group.type !== 6) {
                            $mck_tab_message_option
                                .removeClass('n-vis')
                                .addClass('vis');
                        }
                        if (typeof MCK_CALLBACK === 'function') {
                            MCK_CALLBACK(params.tabId);
                        }
                    } else if (
                        $applozic(
                            "#mck-message-cell .mck-message-inner div[name='message']"
                        ).length === 0
                    ) {
                        $mck_tab_message_option
                            .removeClass('vis')
                            .addClass('n-vis');
                        // $mck_no_messages.removeClass('n-vis').addClass('vis');
                        //   $mck_msg_inner.html('<div class="mck-no-data-text mck-text-muted">No messages yet!</div>');
                    }
                }
            };

            _this.messageClubbing = function (processAllMessages) {
                var allMessages = $applozic(
                    '#mck-message-cell .mck-message-inner div[name="message"]'
                );
                var _len = allMessages.length;
                if (_len > 1 && !processAllMessages) {
                    var timeOffset =
                        allMessages[_len - 1].getAttribute('data-msgtime') -
                        allMessages[_len - 2].getAttribute('data-msgtime');
                    if (
                        allMessages[_len - 2].getAttribute('data-contact') ==
                            allMessages[_len - 1].getAttribute(
                                'data-contact'
                            ) &&
                        timeOffset < SnapConstants.MESSAGE_CLUBBING.TIME_FRAME
                    ) {
                        allMessages[_len - 2].classList.add(
                            'km-clubbing-first'
                        );
                        allMessages[_len - 1].classList.add('km-clubbing-last');
                    }
                } else {
                    $applozic.each(allMessages, function (key, value) {
                        var timeOffset =
                            allMessages[key].nextSibling &&
                            allMessages[key].nextSibling.getAttribute(
                                'data-msgtime'
                            ) - allMessages[key].getAttribute('data-msgtime');
                        if (allMessages[key].nextSibling) {
                            if (
                                allMessages[key].nextSibling.getAttribute(
                                    'data-contact'
                                ) ==
                                    allMessages[key].getAttribute(
                                        'data-contact'
                                    ) &&
                                timeOffset <
                                    SnapConstants.MESSAGE_CLUBBING.TIME_FRAME
                            ) {
                                allMessages[key].classList.add(
                                    'km-clubbing-first'
                                );
                                allMessages[key].nextSibling.classList.add(
                                    'km-clubbing-last'
                                );
                            }
                        }
                    });
                }
            };
        }

        function MckUserUtils() {
            var _this = this;
            var $mck_msg_form = $applozic('#mck-msg-form');
            var $mck_msg_error = $applozic('#mck-msg-error');
            var $mck_tab_title = $applozic('#mck-tab-title');
            var $mck_tab_status = $applozic('#mck-tab-status');
            var $mck_typing_box = $applozic('.mck-typing-box');
            var $mck_block_button = $applozic('#mck-block-button');
            var $mck_message_inner = $applozic(
                '#mck-message-cell .mck-message-inner'
            );

            _this.checkUserConnectedStatus = function () {
                var userIdArray = new Array();
                var otherUserIdArray = new Array();
                $applozic('.mck-user-ol-status').each(function () {
                    var tabId = $applozic(this).data('mck-id');
                    if (typeof tabId !== 'undefined' && tabId !== '') {
                        userIdArray.push(tabId);
                        var htmlId = mckContactUtils.formatContactId(
                            '' + tabId
                        );
                        $applozic(this).addClass(htmlId);
                        $applozic(this).next().addClass(htmlId);
                    }
                });
                if (userIdArray.length > 0) {
                    $applozic.each(userIdArray, function (i, userId) {
                        if (
                            typeof alUserService.MCK_USER_DETAIL_MAP[userId] ===
                            'undefined'
                        ) {
                            otherUserIdArray.push(userId);
                        }
                    });
                    otherUserIdArray.length > 0
                        ? mckContactService.getUsersDetail(otherUserIdArray, {
                              setStatus: true,
                          })
                        : _this.updateUserConnectedStatus();
                }
            };
            _this.updateUserConnectedStatus = function () {
                $applozic('.mck-user-ol-status').each(function () {
                    var $this = $applozic(this);
                    var tabId = $this.data('mck-id');
                    if (tabId) {
                        var userDetail = MCK_USER_DETAIL_MAP[tabId];
                        if (
                            typeof alUserService.MCK_USER_DETAIL_MAP[tabId] !==
                                'undefined' &&
                            userDetail.connected
                        ) {
                            $this.removeClass('n-vis').addClass('vis');
                            $this.next().html('(' + MCK_LABELS['online'] + ')');
                        } else {
                            $this.removeClass('vis').addClass('n-vis');
                            $this.next().html('(Offline)');
                        }
                    }
                });
            };
            _this.lastSeenOfGroupOfTwo = function (tabId) {
                if (w.MCK_OL_MAP[tabId]) {
                    $mck_tab_status
                        .attr('title', MCK_LABELS['online'])
                        .html(MCK_LABELS['online']);
                    // $mck_tab_status.removeClass('n-vis').addClass('vis');
                } else if (MCK_LAST_SEEN_AT_MAP[tabId]) {
                    var lastSeenAt = mckDateUtils.getLastSeenAtStatus(
                        MCK_LAST_SEEN_AT_MAP[tabId]
                    );
                    $mck_tab_status.html(lastSeenAt);
                    $mck_tab_status.attr('title', lastSeenAt);
                    $mck_tab_title.addClass('mck-tab-title-w-status');
                    // $mck_tab_status.removeClass('n-vis').addClass('vis');
                }
            };
            _this.toggleBlockUser = function (tabId, isBlocked) {
                if (isBlocked) {
                    $mck_msg_error.html(MCK_LABELS['blocked']);
                    $mck_msg_error
                        .removeClass('n-vis')
                        .addClass('vis')
                        .addClass('mck-no-mb');
                    $mck_msg_form.removeClass('vis').addClass('n-vis');
                    $mck_tab_title.removeClass('mck-tab-title-w-status');
                    $mck_tab_status.removeClass('vis').addClass('n-vis');
                    $mck_typing_box.removeClass('vis').addClass('n-vis');
                    $mck_message_inner.data('blocked', true);
                    $mck_block_button
                        .html(MCK_LABELS['unblock.user'])
                        .attr('title', MCK_LABELS['unblock.user']);
                } else {
                    $mck_msg_error.html('');
                    $mck_msg_error
                        .removeClass('vis')
                        .addClass('n-vis')
                        .removeClass('mck-no-mb');
                    $mck_msg_form.removeClass('n-vis').addClass('vis');
                    $mck_message_inner.data('blocked', false);
                    $mck_block_button
                        .html(MCK_LABELS['block.user'])
                        .attr('title', MCK_LABELS['block.user']);
                    if (
                        !MCK_BLOCKED_BY_MAP[tabId] &&
                        (w.MCK_OL_MAP[tabId] || MCK_LAST_SEEN_AT_MAP[tabId])
                    ) {
                        if (w.MCK_OL_MAP[tabId]) {
                            $mck_tab_status
                                .attr('title', MCK_LABELS['online'])
                                .html(MCK_LABELS['online']);
                        } else if (MCK_LAST_SEEN_AT_MAP[tabId]) {
                            var lastSeenAt = mckDateUtils.getLastSeenAtStatus(
                                MCK_LAST_SEEN_AT_MAP[tabId]
                            );
                            $mck_tab_status.html(lastSeenAt);
                            $mck_tab_status.attr('title', lastSeenAt);
                        }
                        $mck_tab_title.addClass('mck-tab-title-w-status');
                        // $mck_tab_status.removeClass('n-vis').addClass('vis');
                    }
                }
            };
            _this.checkIfUserHasConversations = function (params, callback) {
                var options = {
                    type: 10,
                    startIndex: 0,
                    limit: 10,
                };
                Snap.client.getGroupDetailByType(
                    options,
                    function (err, result) {
                        if (err) {
                            console.log(
                                'error while fetching group detail by type',
                                err
                            );
                            return;
                        }
                        typeof callback === 'function' &&
                            callback(err, result.response.length > 0);
                    }
                );
            };
        }

        function MckContactService() {
            var _this = this;
            var $mck_search_List = $applozic('#mck-search-list');
            var $mck_sidebox_search = $applozic('#mck-sidebox-search');
            var $mck_search_loading = $applozic('#mck-search-loading');
            var $mck_search_inner = $applozic(
                '#mck-search-cell .mck-message-inner'
            );
            var $mck_msg_inner = $applozic(
                '#mck-message-cell .mck-message-inner'
            );
            var $mck_tab_message_option = $applozic('.mck-tab-message-option');
            var $mck_loading = $applozic('#mck-contact-loading');
            var USER_BLOCK_URL = '/rest/ws/user/block';
            var CONTACT_NAME_URL = '/rest/ws/user/info';
            var USER_DETAIL_URL = '/rest/ws/user/v2/detail';
            var CONTACT_LIST_URL = '/rest/ws/user/filter';
            var USER_STATUS_URL = '/rest/ws/user/chat/status';
            var USER_DISPLAY_NAME_UPDATE = '/rest/ws/user/name';
            var USER_IDENTITY_UPDATE_URL = '/rest/ws/user/change/identifier';
            var FRIEND_LIST_URL = '/rest/ws/group/';
            _this.getContactDisplayName = function (userIdArray) {
                var mckContactNameArray = [];
                window.Applozic.ALApiService.getContactDisplayName({
                    data: { userIdArray: userIdArray },
                    success: function (data) {
                        for (var userId in data) {
                            if (data.hasOwnProperty(userId)) {
                                mckContactNameArray.push([
                                    userId,
                                    data[userId],
                                ]);
                                MCK_CONTACT_NAME_MAP[userId] = data[userId];
                                var contact = mckMessageLayout.fetchContact(
                                    userId
                                );
                                contact.displayName = data[userId];
                            }
                        }
                        ALStorage.updateMckContactNameArray(
                            mckContactNameArray
                        );
                    },
                    error: function () {},
                });
            };
            _this.loadContacts = function () {
                var mckContactNameArray = [];
                var url =
                    '/rest/ws/user/v3/filter?startIndex=0&pageSize=50&orderBy=1';
                window.Applozic.ALApiService.getContactList({
                    url: url,
                    baseUrl: MCK_BASE_URL,
                    success: function (data) {
                        if ($mck_sidebox_search.hasClass('vis')) {
                            if (
                                typeof data === 'object' &&
                                data.users.length > 0
                            ) {
                                $applozic.each(data.users, function (i, user) {
                                    if (typeof user.userId !== 'undefined') {
                                        var contact = mckMessageLayout.getContact(
                                            '' + user.userId
                                        );
                                        contact =
                                            typeof contact === 'undefined'
                                                ? mckMessageLayout.createContactWithDetail(
                                                      user
                                                  )
                                                : mckMessageLayout.updateContactDetail(
                                                      contact,
                                                      user
                                                  );
                                        MCK_CONTACT_ARRAY.push(contact);
                                        mckContactNameArray.push([
                                            user.userId,
                                            contact.displayName,
                                        ]);
                                        if (user.connected) {
                                            w.MCK_OL_MAP[user.userId] = true;
                                        } else {
                                            w.MCK_OL_MAP[user.userId] = false;
                                            if (
                                                typeof user.lastSeenAtTime !==
                                                'undefined'
                                            ) {
                                                MCK_LAST_SEEN_AT_MAP[
                                                    user.userId
                                                ] = user.lastSeenAtTime;
                                            }
                                        }
                                    }
                                });
                                mckContactService.getUsersDetail(
                                    contactNameArray,
                                    { async: false }
                                );
                                if (mckContactNameArray.length > 0) {
                                    ALStorage.updateMckContactNameArray(
                                        mckContactNameArray
                                    );
                                }
                            }
                            mckMessageLayout.addContactsToSearchList();
                            mckGroupLayout.addMembersToGroupSearchList();
                            return;
                        }
                    },
                    error: function () {
                        $mck_search_loading
                            .removeClass('vis')
                            .addClass('n-vis');
                        w.console.log(
                            'Unable to load contacts. Please reload page.'
                        );
                    },
                });
            };

            _this.getUsersDetail = function (userIdArray, params) {
                if (
                    typeof userIdArray === 'undefined' ||
                    userIdArray.length < 1
                ) {
                    return;
                }
                var cached =
                    typeof params.cached !== 'undefined' ? params.cached : true;
                var userIdList = [];
                var uniqueUserIdArray = userIdArray.filter(function (
                    item,
                    pos
                ) {
                    return userIdArray.indexOf(item) === pos;
                });

                for (var i = 0; i < uniqueUserIdArray.length; i++) {
                    var userId = uniqueUserIdArray[i];
                    if (
                        !cached ||
                        typeof alUserService.MCK_USER_DETAIL_MAP[userId] ===
                            'undefined'
                    ) {
                        userIdList.push(userId);
                    }
                }

                if (userIdList.length === 0) {
                    if (params.setStatus) {
                        mckUserUtils.updateUserConnectedStatus();
                    } else if (params.message) {
                        mckMessageLayout.populateMessage(
                            params.messageType,
                            params.message,
                            params.notifyUser
                        );
                    } else if (params.isLoadMessageList) {
                        mckMessageLayout.loadMessageListOnUserDetailFetch(
                            params
                        );
                    }
                    return;
                }

                var response = new Object();
                window.Applozic.ALApiService.getUserDetail({
                    data: userIdList,
                    success: function (data) {
                        if (data.status === 'success') {
                            if (data.response.length > 0) {
                                $applozic.each(
                                    data.response,
                                    function (i, userDetail) {
                                        alUserService.MCK_USER_DETAIL_MAP[
                                            userDetail.userId
                                        ] = userDetail;
                                        w.MCK_OL_MAP[userDetail.userId] =
                                            userDetail.connected;
                                        var contact = mckMessageLayout.getContact(
                                            '' + userDetail.userId
                                        );
                                        contact =
                                            typeof contact === 'undefined'
                                                ? mckMessageLayout.createContactWithDetail(
                                                      userDetail
                                                  )
                                                : mckMessageLayout.updateContactDetail(
                                                      contact,
                                                      userDetail
                                                  );
                                    }
                                );
                            }
                        }
                        if (params.setStatus) {
                            mckUserUtils.updateUserConnectedStatus();
                        } else if (params.message) {
                            mckMessageLayout.populateMessage(
                                params.messageType,
                                params.message,
                                params.notifyUser
                            );
                        } else if (params.isLoadMessageList) {
                            mckMessageLayout.loadMessageListOnUserDetailFetch(
                                params
                            );
                        }

                        response.status = 'success';
                        response.data = data;
                        if (params.callback) {
                            params.callback(response);
                        }
                    },
                    error: function () {
                        if (params.setStatus) {
                            mckUserUtils.updateUserConnectedStatus();
                        } else if (params.message) {
                            mckMessageLayout.populateMessage(
                                params.messageType,
                                params.message,
                                params.notifyUser
                            );
                        } else if (params.isLoadMessageList) {
                            mckMessageLayout.loadMessageListOnUserDetailFetch(
                                params
                            );
                        }

                        response.status = 'error';
                        if (params.callback) {
                            params.callback(response);
                        }
                    },
                });
            };

            _this.updateUserIdentity = function (params) {
                if (params.newUserId === null || params.newUserId === '') {
                    return;
                }
                var data = 'newUserId=' + encodeURIComponent(params.newUserId);
                window.Applozic.ALApiService.ajax({
                    url: MCK_BASE_URL + USER_IDENTITY_UPDATE_URL,
                    type: 'get',
                    data: data,
                    contentType: 'application/json',
                    success: function (res) {
                        if (typeof res === 'object') {
                            if (res.status === 'success') {
                                if (params.callback) {
                                    //update access token here
                                    params.callback(res);
                                }
                            }
                        }
                        return;
                    },
                    error: function (res) {
                        if (params.callback) {
                            params.callback({ response: 'error' });
                        }
                    },
                });
            };

            _this.updateUser = function (options) {
                var param = {
                    elasticUpdate: true,
                };
                options.data.email && (param['allowEmail'] = true);
                var url =
                    MCK_BASE_URL +
                    '/rest/ws/user/update?' +
                    $applozic.param(param);
                //.param() using to serialize the properties of an object as a query string
                window.Applozic.ALApiService.ajax({
                    type: 'POST',
                    url: url,
                    data: w.JSON.stringify(options.data),
                    contentType: 'application/json',
                    success: function (response) {
                        if (options.success) {
                            options.success(response);
                        }
                    },
                    error: function (response) {
                        if (options.error) {
                            options.error(response);
                        }
                    },
                });
            };

            _this.updateDisplayName = function (userId, userName) {
                if (userId === '' || userName === '') {
                    return;
                }
                var data = 'userId=' + userId + '&displayName=' + userName;
                $applozic.ajax({
                    url: MCK_BASE_URL + USER_DISPLAY_NAME_UPDATE,
                    type: 'get',
                    data: data,
                    success: function (data) {
                        if (typeof data === 'object') {
                            if (data.status === 'success') {
                                return 'success';
                            }
                        }
                    },
                    error: function () {},
                });
            };
        }

        function MckGroupLayout() {
            var _this = this;
            var ROLE_MAP = {
                0: MCK_LABELS['user'],
                1: MCK_LABELS['admin'],
                2: MCK_LABELS['moderator'],
                3: MCK_LABELS['member'],
            };
            var MCK_BOT_API = KM_PLUGIN_SETTINGS.botPlatformApi;
            var select = document.getElementById('mck-group-create-type');
            select.options[select.options.length] = new Option(
                MCK_LABELS['public'],
                '1'
            );
            select.options[select.options.length] = new Option(
                MCK_LABELS['private'],
                '2'
            );
            select.options[select.options.length] = new Option(
                MCK_LABELS['open'],
                '6'
            );

            var $mck_msg_form = $applozic('#mck-msg-form');
            var $mck_msg_error = $applozic('#mck-msg-error');
            var $mck_tab_title = $applozic('#mck-tab-title');
            var $mck_tab_status = $applozic('#mck-tab-status');
            var $mck_no_gsm_text = $applozic('#mck-no-gsm-text');
            var $mck_gms_loading = $applozic('#mck-gms-loading');
            var $mck_loading = $applozic('#mck-contact-loading');
            var $mck_tab_menu_box = $applozic('#mck-tab-menu-box');
            var $mck_search_loading = $applozic('#mck-search-loading');
            var $mck_group_info_tab = $applozic('#mck-group-info-tab');
            var $mck_sidebox_search = $applozic('#mck-sidebox-search');
            var $mck_group_name_box = $applozic('#mck-group-name-box');
            var $mck_group_back_link = $applozic('#mck-group-back-link');
            var $mck_group_name_edit = $applozic('#mck-group-name-edit');
            var $mck_group_name_save = $applozic('#mck-group-name-save');
            var $mck_sidebox_content = $applozic('#mck-sidebox-content');
            var $mck_tab_option_panel = $applozic('#mck-tab-option-panel');
            var $mck_btn_group_create = $applozic('#mck-btn-group-create');
            var $mck_group_create_tab = $applozic('#mck-group-create-tab');
            var $mck_contacts_content = $applozic('#mck-contacts-content');
            var $mck_btn_group_update = $applozic('#mck-btn-group-update');
            var $mck_group_create_type = $applozic('#mck-group-create-type');
            var $mck_group_icon_upload = $applozic('#mck-group-icon-upload');
            var $mck_group_icon_change = $applozic('#mck-group-icon-change');
            var $mck_group_member_List = $applozic('#mck-group-member-list');
            var $mck_group_update_panel = $applozic('#mck-group-update-panel');
            var $mck_tab_message_option = $applozic('.mck-tab-message-option');
            var $mck_group_create_title = $applozic('#mck-group-create-title');
            var $mck_group_menu_options = $applozic('.mck-group-menu-options');
            var $mck_group_member_search = $applozic(
                '#mck-group-member-search'
            );
            var $mck_btn_group_icon_save = $applozic(
                '#mck-btn-group-icon-save'
            );
            var $mck_group_info_icon_box = $applozic(
                '#mck-group-info-icon-box'
            );
            var $mck_group_admin_options = $applozic(
                '.mck-group-admin-options'
            );
            var $mck_group_add_member_box = $applozic(
                '#mck-group-add-member-box'
            );
            var $mck_msg_inner = $applozic(
                '#mck-message-cell .mck-message-inner'
            );
            var $mck_group_title = $applozic(
                '#mck-group-name-sec .mck-group-title'
            );
            var $mck_group_create_icon_box = $applozic(
                '#mck-group-create-icon-box'
            );
            var $mck_group_info_icon_loading = $applozic(
                '#mck-group-info-icon-loading'
            );
            var $mck_gm_search_box = $applozic('#mck-gm-search-box');
            var $mck_group_member_search_list = $applozic(
                '#mck-group-member-search-list'
            );
            var $mck_group_create_icon_loading = $applozic(
                '#mck-group-create-icon-loading'
            );
            var $mck_group_info_icon = $applozic(
                '#mck-group-info-icon-box .mck-group-icon'
            );
            var $mck_group_create_icon = $applozic(
                '#mck-group-create-icon-box .mck-group-icon'
            );
            var $mck_group_create_overlay_box = $applozic(
                '#mck-group-create-icon-box .mck-overlay-box'
            );
            var $mck_gc_overlay_label = $applozic('#mck-gc-overlay-label');
            var warningBox = document.getElementById('mck-char-warning');
            var groupContactbox =
                '<li id="li-gm-${contHtmlExpr}" class="${contIdExpr} mck-li-group-member" data-mck-id="${contIdExpr}" data-role="${roleVal}" data-alpha="${contFirstAlphaExpr}">' +
                '<div class="mck-row mck-group-member-info" title="${contNameExpr}">' +
                '<div class="blk-lg-3">{{html contImgExpr}}</div>' +
                '<div class="blk-lg-9">' +
                '<div class="mck-row">' +
                '<div class="blk-lg-8 mck-cont-name mck-truncate"><strong>${contNameExpr}</strong></div>' +
                '<div class="blk-lg-4 mck-group-admin-text move-right vis"><span>${roleExpr}</span></div></div>' +
                '<div class="mck-row">' +
                '<div class="blk-lg-8 mck-truncate mck-last-seen-status" title="${contLastSeenExpr}">${contLastSeenExpr}</div>' +
                '<div class="blk-lg-4 mck-group-admin-options move-right ${enableAdminMenuExpr}">' +
                '<div class="mck-menu-box n-vis"><div class="mck-dropdown-toggle mck-group-admin-menu-toggle mck-text-center" data-toggle="mckdropdown" aria-expanded="true">' +
                '<span class="mck-caret"></span></div>' +
                '<ul id="mck-group-admin-menu" class="mck-dropdown-menu mck-group-admin-menu mck-tab-menu-box menu-right" role="menu">' +
                '<li>' +
                '<a href="#" target="_self"  class="mck-btn-remove-member menu-item" title="${removeMemberLabel}">${removeMemberLabel}</a>' +
                '</li>' +
                '<li>' +
                '<a href="#" target="_self"  class="mck-btn-change-role menu-item" title="${changeRoleLabel}">${changeRoleLabel}</a>' +
                '</li>' +
                '</ul></div></div>' +
                '</div>' +
                '<div id="mck-group-change-role-box" class="mck-row mck-group-change-role-box n-vis">' +
                '<div class="blk-lg-4"><div class="mck-label">Select role </div></div>' +
                '<div class="blk-lg-8 move-right">' +
                '<select id="mck-change-role-type" class="mck-select">' +
                '<option value="0">User</option>' +
                '<option value="1">Admin</option>' +
                '<option value="2">Moderator</option>' +
                '<option value="3" selected>Member</option>' +
                '</select>' +
                '</div></div></div></div></li>';
            var groupMemberSearchContact =
                '<li id="li-${contHtmlExpr}" class="${contIdExpr} mck-li-group-member" data-mck-id="${contIdExpr}">' +
                '<a class="mck-add-to-group" href="#" data-mck-id="${contIdExpr}">' +
                '<div class="mck-row" title="${contNameExpr}">' +
                '<div class="blk-lg-3">{{html contImgExpr}}</div>' +
                '<div class="blk-lg-9">' +
                '<div class="mck-row"><div class="blk-lg-12 mck-cont-name mck-truncate"><strong>${contNameExpr}</strong></div></div>' +
                '<div class="mck-row"><div class="blk-lg-12 mck-truncate mck-last-seen-status" title="${contLastSeenExpr}">${contLastSeenExpr}</div></div>' +
                '</div></div></a></li>';

            var MAX_GROUP_NAME_SIZE = 30;
            $applozic('.mck-group-name-box div[contenteditable]')
                .keypress(function (e) {
                    if (
                        e.which === 8 ||
                        e.keyCode === 37 ||
                        e.keyCode === 38 ||
                        e.keyCode === 39 ||
                        e.keyCode === 40 ||
                        (e.ctrlKey && e.which === 97)
                    ) {
                        return true;
                    } else if (e.keyCode === 13 && !(e.shiftKey || e.ctrlKey)) {
                        if (
                            $applozic(e.target).hasClass(
                                'mck-group-create-title'
                            )
                        ) {
                            _this.submitCreateGroup();
                            return false;
                        } else {
                            return false;
                        }
                    } else {
                        return MAX_GROUP_NAME_SIZE > this.innerHTML.length;
                    }
                })
                .on('paste', function (e) {
                    var $this = this;
                    setTimeout(function () {
                        var len = $this.innerText.length;
                        if (len > MAX_GROUP_NAME_SIZE) {
                            $this.innerHTML = $this.innerText.substring(
                                0,
                                MAX_GROUP_NAME_SIZE
                            );
                            mckUtils.setEndOfContenteditable($this);
                        }
                        return false;
                    }, 'fast');
                })
                .on('drop', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
            $applozic(d).on('click', '.mck-btn-change-role', function (e) {
                e.preventDefault();
                var $changeRoleBox = $applozic(this)
                    .parents('.mck-li-group-member')
                    .find('.mck-group-change-role-box');
                var role = $applozic(this)
                    .parents('.mck-li-group-member')
                    .data('role');
                $changeRoleBox.find('select').val(role);
                $changeRoleBox.removeClass('n-vis').addClass('vis');
                $mck_group_update_panel.removeClass('n-vis').addClass('vis');
            });
            $mck_btn_group_update.on('click', function () {
                var users = [];
                $applozic('.mck-group-change-role-box.vis').each(function (
                    i,
                    elm
                ) {
                    var $this = $applozic(this);
                    var newRole = parseInt($this.find('select').val());
                    var role = $this
                        .parents('.mck-li-group-member')
                        .data('role');
                    if (newRole !== role) {
                        var user = {
                            userId: $this
                                .parents('.mck-li-group-member')
                                .data('mck-id'),
                            role: newRole,
                        };
                        users.push(user);
                    }
                });
                if (users.length > 0) {
                    var currTabId = $mck_msg_inner.data('mck-id');
                    var isGroupTab = $mck_msg_inner.data('isgroup');
                    if (currTabId && isGroupTab) {
                        $mck_btn_group_update
                            .attr('disabled', true)
                            .html(MCK_LABELS['group.info.updating']);
                        var params = {
                            groupId: currTabId,
                            users: users,
                            apzCallback: mckGroupLayout.onUpdateGroupInfo,
                        };
                        mckGroupService.updateGroupInfo(params);
                    }
                }
            });
            $applozic('#mck-group-info-icon-box .mck-overlay').on(
                'click',
                function (e) {
                    $mck_group_icon_change.trigger('click');
                }
            );
            $applozic('#mck-group-create-icon-box .mck-overlay').on(
                'click',
                function (e) {
                    $mck_group_icon_upload.trigger('click');
                }
            );
            $applozic(d)
                .on(
                    'mouseenter',
                    '.mck-group-create-icon-box.mck-hover-on',
                    function () {
                        $applozic(this)
                            .find('.mck-overlay-box')
                            .removeClass('n-vis');
                    }
                )
                .on(
                    'mouseleave',
                    '.mck-group-create-icon-box.mck-hover-on',
                    function () {
                        var $this = $applozic(this);
                        if (
                            $this.find('.mck-group-icon-default').length === 0
                        ) {
                            $this.find('.mck-overlay-box').addClass('n-vis');
                        }
                    }
                );
            $applozic(d)
                .on(
                    'mouseenter',
                    '.mck-group-info-icon-box.mck-hover-on',
                    function () {
                        $applozic(this)
                            .find('.mck-overlay-box')
                            .removeClass('n-vis');
                    }
                )
                .on(
                    'mouseleave',
                    '.mck-group-info-icon-box.mck-hover-on',
                    function () {
                        $applozic(this)
                            .find('.mck-overlay-box')
                            .addClass('n-vis');
                    }
                );
            $mck_group_name_edit.on('click', function () {
                $mck_group_title.attr('contenteditable', true).focus();
                mckUtils.setEndOfContenteditable($mck_group_title[0]);
                $mck_group_name_save.removeClass('n-vis').addClass('vis');
                $mck_group_name_edit.removeClass('vis').addClass('n-vis');
            });
            $mck_group_name_save.on('click', function () {
                var groupName = $applozic.trim($mck_group_title.text());
                if (groupName.length > 0) {
                    var currTabId = $mck_msg_inner.data('mck-id');
                    var isGroupTab = $mck_msg_inner.data('isgroup');
                    if (currTabId && isGroupTab) {
                        $mck_group_name_edit
                            .removeClass('n-vis')
                            .addClass('vis');
                        $mck_group_name_save
                            .removeClass('vis')
                            .addClass('n-vis');
                        $mck_group_title.attr('contenteditable', false);
                        var params = {
                            groupId: currTabId,
                            name: groupName,
                            apzCallback: mckGroupLayout.onUpdateGroupInfo,
                        };
                        mckGroupService.updateGroupInfo(params);
                    }
                } else {
                    $mck_group_title.addClass('mck-req-border');
                }
            });
            $mck_btn_group_icon_save.on('click', function () {
                var iconUrl = $mck_group_info_icon.data('iconurl');
                if (iconUrl) {
                    var currTabId = $mck_msg_inner.data('mck-id');
                    var isGroupTab = $mck_msg_inner.data('isgroup');
                    if (currTabId && isGroupTab) {
                        setTimeout(function () {
                            $mck_btn_group_icon_save
                                .removeClass('vis')
                                .addClass('n-vis');
                        }, 1000);
                        $mck_group_info_icon.data('iconurl', '');
                        var params = {
                            groupId: currTabId,
                            imageUrl: iconUrl,
                            apzCallback: mckGroupLayout.onUpdateGroupInfo,
                        };
                        mckGroupService.updateGroupInfo(params);
                    }
                } else {
                    $mck_group_title.addClass('mck-req-border');
                }
            });
            $mck_btn_group_create.on('click', function () {
                _this.submitCreateGroup();
            });

            _this.init = function () {
                $applozic.template('groupMemberTemplate', groupContactbox);
                $applozic.template(
                    'groupMemberSearchTemplate',
                    groupMemberSearchContact
                );
            };

            _this.createGroupDefaultSettings = function () {
                var defaultSettings = SnapUtils.getDataFromKmSession(
                    'settings'
                );
                var conversationDetail = {
                    groupName:
                        (defaultSettings && defaultSettings.groupName) ||
                        DEFAULT_GROUP_NAME,
                    agentId:
                        (defaultSettings && defaultSettings.agentId) ||
                        DEFAULT_AGENT_ID,
                    botIds:
                        (defaultSettings && defaultSettings.botIds) ||
                        DEFAULT_BOT_IDS,
                };
                return conversationDetail;
            };
            _this.checkBotDetail = function (userId) {
                window.Applozic.ALApiService.ajax({
                    url:
                        MCK_BOT_API +
                        '/application/' +
                        MCK_APP_ID +
                        '/bot/' +
                        userId,
                    type: 'get',
                    skipEncryption: true,
                    global: false,
                    success: function (data) {
                        /*
                            Auto human handoff check is removed from the below code if something breaks regarding the same,
                            please add this condition to the below check like this :  && !(data.data[0].autoHumanHandoff)
                        */
                        CURRENT_GROUP_DATA.CHAR_CHECK =
                            data.data[0] &&
                            data.data[0].aiPlatform ==
                                SnapConstants.BOT_PLATFORM.DIALOGFLOW;
                        !CURRENT_GROUP_DATA.CHAR_CHECK &&
                            _this.removeWarningsFromTextBox();
                        CURRENT_GROUP_DATA.CHAR_CHECK &&
                            _this.disableSendButton(true);
                    },
                    error: function () {
                        CURRENT_GROUP_DATA.CHAR_CHECK = false;
                        _this.removeWarningsFromTextBox();
                    },
                });
            };
            _this.removeWarningsFromTextBox = function () {
                snapCommons.modifyClassList(
                    { id: ['mck-char-warning'] },
                    'n-vis',
                    ''
                );
                var textBox = document.getElementById('mck-text-box');
                var spanContent;
                if (document.getElementById('mck-text-warning-span')) {
                    spanContent = document.getElementById('mck-normal-span')
                        .innerHTML;
                    spanContent += document.getElementById(
                        'mck-text-warning-span'
                    ).innerHTML;
                    textBox.innerHTML = spanContent;
                    _this.disableSendButton(false);
                }
            };
            _this.disableSendButton = function (value) {
                var textBox = document.getElementById('mck-text-box');
                var str = mckUtils.textVal(textBox);
                var maxLength = 256;
                var sendButton = document.getElementById('mck-msg-sbmt');
                var trimmedStr = str.trim();
                var textLength = trimmedStr.length;
                if (value) {
                    if (textLength > maxLength) {
                        sendButton.setAttribute('disabled', value);
                        CURRENT_GROUP_DATA.DISABLE_SEND_MESSAGE = value;
                    }
                } else {
                    sendButton.removeAttribute('disabled');
                    CURRENT_GROUP_DATA.DISABLE_SEND_MESSAGE = value;
                }
            };
            _this.submitCreateGroup = function () {
                var groupName = $applozic.trim($mck_group_create_title.text());
                var groupType = $mck_group_create_type.val();
                var iconUrl = $mck_group_create_icon.data('iconurl');
                if (groupName.length > 0) {
                    var params = {
                        groupName: groupName,
                    };
                    if (groupType) {
                        groupType = parseInt(groupType);
                        if (GROUP_TYPE_MAP.indexOf(groupType) !== -1) {
                            params.type = groupType;
                        }
                    }
                    if (iconUrl) {
                        params.groupIcon = iconUrl;
                    }
                    $mck_group_create_icon.data('iconurl', '');
                    params.isInternal = true;
                    $mck_btn_group_create
                        .attr('disabled', true)
                        .html(MCK_LABELS['group.create.submit']);
                    mckMessageService.getGroup(params);
                } else {
                    $mck_group_create_title.addClass('mck-req-border');
                }
            };
            _this.loadGroups = function (response) {
                var groups = response.data;
                MCK_GROUP_ARRAY.length = 0;
                $applozic.each(groups, function (i, group) {
                    if (typeof group.id !== 'undefined') {
                        var group = mckGroupUtils.addGroup(group);
                        MCK_GROUP_ARRAY.push(group);
                    }
                });
            };
            _this.getDeletedAtTime = function (groupId) {
                if (typeof MCK_GROUP_MAP[groupId] === 'object') {
                    var group = MCK_GROUP_MAP[groupId];
                    return group['deletedAtTime'];
                }
            };
            _this.validateOpenGroupUser = function (group) {
                if (group.type === 6) {
                    var isGroupMember = mckGroupService.authenticateGroupUser(
                        group
                    );
                    if (!isGroupMember) {
                        if (
                            MCK_OPEN_GROUP_SETTINGS.disableChatForNonGroupMember
                        ) {
                            var text =
                                MCK_OPEN_GROUP_SETTINGS.defaultChatDisabledMessage;
                            if (!text) {
                                text = 'Chat disabled';
                            }
                            $mck_msg_error.html(text);
                            $mck_msg_error
                                .removeClass('n-vis')
                                .addClass('vis')
                                .addClass('mck-no-mb');
                            $mck_msg_form.removeClass('vis').addClass('n-vis');
                            $mck_tab_title.removeClass(
                                'mck-tab-title-w-status'
                            );
                            $mck_tab_status
                                .removeClass('vis')
                                .addClass('n-vis');
                        }
                        $mck_group_menu_options
                            .removeClass('vis')
                            .addClass('n-vis');
                        $mck_tab_message_option
                            .removeClass('vis')
                            .addClass('n-vis');
                        $mck_tab_option_panel
                            .removeClass('vis')
                            .addClass('n-vis');
                        if (
                            typeof OPEN_GROUP_SUBSCRIBER_MAP[
                                group.contactId
                            ] === 'undefined'
                        ) {
                            window.Applozic.ALSocket.subscribeToOpenGroup(
                                group
                            );
                        }
                    }
                    if (group.adminName === MCK_USER_ID) {
                        if (MCK_OPEN_GROUP_SETTINGS.deleteChatAccess === 0) {
                            $mck_tab_message_option
                                .removeClass('vis')
                                .addClass('n-vis');
                        }
                    } else {
                        if (
                            !MCK_OPEN_GROUP_SETTINGS.allowInfoAccessGroupMembers
                        ) {
                            $mck_group_menu_options
                                .removeClass('vis')
                                .addClass('n-vis');
                        }
                        if (MCK_OPEN_GROUP_SETTINGS.deleteChatAccess !== 2) {
                            $mck_tab_message_option
                                .removeClass('vis')
                                .addClass('n-vis');
                        }
                        if (
                            !MCK_OPEN_GROUP_SETTINGS.allowInfoAccessGroupMembers &&
                            MCK_OPEN_GROUP_SETTINGS.deleteChatAccess !== 2
                        ) {
                            $mck_tab_option_panel
                                .removeClass('vis')
                                .addClass('n-vis');
                        }
                    }
                    return false;
                }
                return true;
            };
            _this.addGroupStatus = function (group) {
                var isGroupLeft = _this.isGroupLeft(group);
                if (
                    group.type !== 6 &&
                    (isGroupLeft || IS_GROUP_SUBTITLE_HIDDEN)
                ) {
                    if (isGroupLeft) {
                        mckGroupLayout.onGroupLeft('', {
                            groupId: group.contactId,
                        });
                    }
                    $mck_tab_title.removeClass('mck-tab-title-w-status');
                    $mck_tab_status.removeClass('vis').addClass('n-vis');
                } else if (group.members.length > 0) {
                    var groupMembers = '';
                    var isGroupMember = false;
                    var subtitleLength =
                        group.members.length <= 30 ? group.members.length : 25;
                    for (var i = 0; i < subtitleLength; i++) {
                        if (
                            MCK_USER_ID === '' + group.members[i] ||
                            group.removedMembersId.indexOf(group.members[i]) !==
                                -1
                        ) {
                            isGroupMember = true;
                            continue;
                        }
                        var contact = mckMessageLayout.fetchContact(
                            '' + group.members[i]
                        );
                        var name = mckMessageLayout.getTabDisplayName(
                            contact.contactId,
                            false
                        );
                        groupMembers += ' ' + name + ',';
                    }
                    if (
                        (group.type !== 5 && group.type !== 6) ||
                        (isGroupMember && group.type !== 5)
                    ) {
                        groupMembers += ' You';
                    }
                    if (group.members.length > 30) {
                        groupMembers +=
                            ' and ' + (group.members.length - 25) + ' more';
                    }
                    groupMembers = groupMembers.replace(/,\s*$/, '');
                    $mck_tab_status.html(groupMembers);
                    $mck_tab_status.attr('title', groupMembers);
                    // $mck_tab_status.removeClass('n-vis').addClass('vis');
                    $mck_tab_title.addClass('mck-tab-title-w-status');
                    $mck_group_menu_options
                        .removeClass('n-vis')
                        .addClass('vis');
                } else {
                    $mck_tab_title.removeClass('mck-tab-title-w-status');
                    $mck_tab_status.removeClass('vis').addClass('n-vis');
                }
                if (group.type === 7) {
                    $mck_tab_status.html('');
                    $mck_group_menu_options
                        .removeClass('vis')
                        .addClass('n-vis');
                }
            };
            _this.disableGroupTab = function () {
                $mck_msg_error.html(MCK_LABELS['group.chat.disabled']);
                $mck_msg_error
                    .removeClass('n-vis')
                    .addClass('vis')
                    .addClass('mck-no-mb');
                $mck_msg_form.removeClass('vis').addClass('n-vis');
                $mck_tab_title.removeClass('mck-tab-title-w-status');
                $mck_tab_status.removeClass('vis').addClass('n-vis');
            };
            _this.isGroupLeft = function (group) {
                var isGroupLeft = false;
                if (
                    group.removedMembersId &&
                    group.removedMembersId.length > 0
                ) {
                    $applozic.each(
                        group.removedMembersId,
                        function (i, removedMemberId) {
                            if (removedMemberId === MCK_USER_ID) {
                                isGroupLeft = true;
                            }
                        }
                    );
                }
                return isGroupLeft;
            };
            _this.onGroupLeft = function (response, params) {
                $mck_loading.removeClass('vis').addClass('n-vis');
                if (typeof response === 'object') {
                    if (response.status === 'error') {
                        alert(
                            'Unable to process your request. ' +
                                response.errorMessage
                        );
                        return;
                    }
                }
                var groupId = params.groupId;
                if ($mck_group_info_tab.hasClass('vis')) {
                    var currGroupId = $mck_group_info_tab.data('mck-id');
                    if (groupId === currGroupId) {
                        $mck_group_back_link.trigger('click');
                    }
                } else if ($mck_sidebox_content.hasClass('vis')) {
                    var currTabId = $mck_msg_inner.data('mck-id');
                    var isGroupTab = $mck_msg_inner.data('isgroup');
                    if (currTabId === groupId.toString() && isGroupTab) {
                        $mck_group_menu_options
                            .removeClass('vis')
                            .addClass('n-vis');
                        _this.disableGroupTab();
                    }
                }
            };
            _this.onAddedGroupMember = function (response, params) {
                $mck_loading.removeClass('vis').addClass('n-vis');
                if (typeof response === 'object') {
                    if (response.status === 'error') {
                        alert(
                            'Unable to process your request. ' +
                                response.errorMessage
                        );
                        return;
                    }
                }
                var groupId = params.groupId;
                var userId = params.userId;
                var group = '';
                if (groupId) {
                    group = mckGroupUtils.getGroup(groupId);
                } else if (params.clientGroupId) {
                    group = mckGroupUtils.getGroupByClientGroupId(
                        params.clientGroupId
                    );
                }
                if (typeof group === 'object') {
                    group = mckGroupService.addMemberToGroup(group, userId);
                    if ($mck_group_info_tab.hasClass('vis')) {
                        var currGroupId = $mck_group_info_tab.data('mck-id');
                        if (groupId === currGroupId) {
                            var contact = mckMessageLayout.fetchContact(
                                '' + userId
                            );
                            if (
                                $applozic('#li-gm-' + contact.htmlId).length ===
                                0
                            ) {
                                _this.addGroupMember(group, contact);
                            }
                            _this.sortGroupMemberHtmlList();
                            _this.enableGroupAdminMenuToggle();
                        }
                    } else if ($mck_sidebox_content.hasClass('vis')) {
                        var currTabId = $mck_msg_inner.data('mck-id');
                        var isGroupTab = $mck_msg_inner.data('isgroup');
                        if (currTabId === groupId.toString() && isGroupTab) {
                            _this.addGroupStatus(group);
                        }
                    }
                } else {
                    mckGroupService.getGroupFeed({
                        groupId: groupId,
                        clientGroupId: params.clientGroupId,
                        apzCallback: mckGroupLayout.onGroupFeed,
                    });
                }
            };
            _this.onRemovedGroupMember = function (response, params) {
                $mck_loading.removeClass('vis').addClass('n-vis');
                if (typeof response === 'object') {
                    if (response.status === 'error') {
                        alert(
                            'Unable to process your request. ' +
                                response.errorMessage
                        );
                        return;
                    }
                }
                var groupId = params.groupId;
                var userId = params.userId;
                var group = '';
                if (groupId) {
                    group = mckGroupUtils.getGroup(groupId);
                } else if (params.clientGroupId) {
                    group = mckGroupUtils.getGroupByClientGroupId(
                        params.clientGroupId
                    );
                }
                if (typeof group === 'object') {
                    group = mckGroupService.removeMemberFromGroup(
                        group,
                        userId
                    );
                    if ($mck_group_info_tab.hasClass('vis')) {
                        var currGroupId = $mck_group_info_tab.data('mck-id');
                        if (groupId === currGroupId) {
                            var contact = mckMessageLayout.fetchContact(
                                '' + userId
                            );
                            var $liRemovedMember = $applozic(
                                '#li-gm-' + contact.htmlId
                            );
                            if ($liRemovedMember.length > 0) {
                                $liRemovedMember.remove();
                            }
                        }
                    } else if ($mck_sidebox_content.hasClass('vis')) {
                        var currTabId = $mck_msg_inner.data('mck-id');
                        var isGroupTab = $mck_msg_inner.data('isgroup');
                        if (currTabId === groupId.toString() && isGroupTab) {
                            _this.addGroupStatus(group);
                        }
                    }
                } else {
                    mckGroupService.getGroupFeed({
                        groupId: groupId,
                        clientGroupId: params.clientGroupId,
                        apzCallback: mckGroupLayout.onGroupFeed,
                    });
                }
            };
            _this.onGroupFeed = function (response, params) {
                $mck_loading.removeClass('vis').addClass('n-vis');
                if (response.status === 'success') {
                    var groupFeed = response.data;
                    var conversationPxy = groupFeed.conversationPxy;
                    var group = mckGroupUtils.getGroup(groupFeed.id);
                    if (groupFeed.deletedAtTime) {
                        $mck_msg_error.html(MCK_LABELS['group.deleted']);
                        $mck_msg_error
                            .removeClass('n-vis')
                            .addClass('vis')
                            .addClass('mck-no-mb');
                        $mck_msg_form.removeClass('vis').addClass('n-vis');
                    }
                    var tabConvArray = new Array();
                    if (typeof conversationPxy === 'object') {
                        MCK_CONVERSATION_MAP[
                            conversationPxy.id
                        ] = conversationPxy;
                        MCK_TOPIC_CONVERSATION_MAP[conversationPxy.topicId] = [
                            conversationPxy.id,
                        ];
                        if (conversationPxy.topicDetail) {
                            MCK_TOPIC_DETAIL_MAP[
                                conversationPxy.topicId
                            ] = $applozic.parseJSON(
                                conversationPxy.topicDetail
                            );
                        }
                        tabConvArray.push(conversationPxy);
                    }
                    if (tabConvArray.length > 0) {
                        MCK_TAB_CONVERSATION_MAP[params.groupId] = tabConvArray;
                    }

                    alUserService.loadUserProfiles(
                        groupFeed.membersId,
                        function (userIds, userIdArray) {
                            $applozic.each(userIds, function (i, userId) {
                                if (
                                    typeof mckMessageLayout.getContact(
                                        userId
                                    ) === 'undefined'
                                ) {
                                    userIdArray.push(userId);
                                }
                            });
                            mckContactService.getUsersDetail(userIdArray, {
                                async: false,
                            });
                        }
                    );

                    if (
                        params.isMessage &&
                        typeof params.message === 'object'
                    ) {
                        mckMessageLayout.populateMessage(
                            params.messageType,
                            params.message,
                            params.notifyUser
                        );
                    }
                    if (params.isReloadTab) {
                        _this.reloadGroupTab(group);
                    }
                }
            };
            _this.onUpdateGroupInfo = function (response, params) {
                $mck_loading.removeClass('vis').addClass('n-vis');
                $mck_btn_group_update.attr('disabled', false).html('Update');
                $mck_group_update_panel.removeClass('vis').addClass('n-vis');
                if (typeof response === 'object') {
                    if (response.status === 'error') {
                        alert(
                            'Unable to process your request. ' +
                                response.errorMessage
                        );
                        return;
                    }
                }
                var groupId = params.groupId;
                var groupInfo = params.groupInfo;
                var group = mckGroupUtils.getGroup(groupId);
                if (typeof group === 'object') {
                    if (groupInfo.imageUrl) {
                        group.imageUrl = groupInfo.imageUrl;
                    }
                    if (groupInfo.newName) {
                        group.displayName = groupInfo.newName;
                    }
                    if (groupInfo.metadata) {
                        group.metadata = groupInfo.metadata;
                    }
                    if (groupInfo.users && groupInfo.users.length > 0) {
                        $applozic.each(groupInfo.users, function (i, user) {
                            if (user.userId) {
                                group.users[user.userId] = user;
                            }
                        });
                    }
                    if ($mck_group_info_tab.hasClass('vis')) {
                        if (groupInfo.imageUrl) {
                            $mck_group_info_icon.html(
                                mckGroupService.getGroupImage(group.imageUrl)
                            );
                        }
                        $mck_group_title.html(group.displayName);
                        if (groupInfo.users && groupInfo.users.length > 0) {
                            $mck_group_member_List.html('');
                            _this.addMembersToGroupInfoList(group);
                            group.adminName === MCK_USER_ID
                                ? $mck_group_add_member_box
                                      .removeClass('n-vis')
                                      .addClass('vis')
                                : $mck_group_add_member_box
                                      .removeClass('vis')
                                      .addClass('n-vis');
                        }
                    } else if ($mck_sidebox_content.hasClass('vis')) {
                        var currTabId = $mck_msg_inner.data('mck-id');
                        var isGroupTab = $mck_msg_inner.data('isgroup');
                        if (currTabId === groupId.toString() && isGroupTab) {
                            var groupName =
                                group.displayName &&
                                snapCommons.formatHtmlTag(group.displayName);
                            $mck_tab_title.html(groupName);
                        } else {
                            if (
                                $applozic('#li-group-' + group.htmlId).length >
                                0
                            ) {
                                $applozic(
                                    '#li-group-' +
                                        group.htmlId +
                                        ' .mck-cont-name strong'
                                ).html(group.displayName);
                                if (groupInfo.imageUrl) {
                                    $applozic(
                                        '#li-group-' +
                                            group.htmlId +
                                            ' .blk-lg-3'
                                    ).html(
                                        "<img src=' " + group.imageUrl + "'>"
                                    );
                                }
                            }
                        }
                    }
                    MCK_GROUP_MAP[group.contactId] = group;
                }
            };
            _this.getGroupFeedFromMessage = function (params) {
                var message = params.message;
                if (message) {
                    params.groupId = message.groupId;
                    params.isMessage = true;
                    if (message.conversationId) {
                        var conversationPxy =
                            MCK_CONVERSATION_MAP[message.conversationId];
                        if (
                            typeof conversationPxy !== 'object' ||
                            typeof MCK_TOPIC_DETAIL_MAP[
                                conversationPxy.topicId
                            ] !== 'object'
                        ) {
                            params.conversationId = message.conversationId;
                        }
                    }
                    params.apzCallback = mckGroupLayout.onGroupFeed;
                    mckGroupService.getGroupFeed(params);
                }
            };
            _this.reloadGroupTab = function (group) {
                var currTabId = $mck_msg_inner.data('mck-id');
                var isGroupTab = $mck_msg_inner.data('isgroup');
                if (currTabId === group.contactId.toString() && isGroupTab) {
                    _this.addGroupStatus(group);
                }
            };
            _this.loadGroupTab = function (response) {
                if (response.status === 'error') {
                    alert(
                        'Unable to process your request. ' +
                            response.errorMessage
                    );
                } else {
                    var group = response.data;
                    mckMessageLayout.loadTab({
                        tabId: group.contactId,
                        isGroup: true,
                    });
                    $applozic('#mck-search').val('');
                }
            };
            _this.addMembersToGroupInfoList = function (group) {
                var userIdArray = group.members;
                userIdArray.sort();
                $mck_group_member_List.html('');
                $applozic.each(userIdArray, function (i, userId) {
                    if (userId) {
                        var contact = mckMessageLayout.fetchContact(
                            '' + userId
                        );
                        if (
                            $applozic('#li-gm-' + contact.htmlId).length === 0
                        ) {
                            _this.addGroupMember(group, contact);
                        }
                    }
                });
                _this.sortGroupMemberHtmlList();
                _this.enableGroupAdminMenuToggle();
            };
            _this.enableGroupAdminMenuToggle = function () {
                $applozic('.mck-group-member-info')
                    .bind('mouseenter', function () {
                        $applozic(this)
                            .find('.mck-menu-box')
                            .removeClass('n-vis');
                    })
                    .bind('mouseleave', function () {
                        $applozic(this)
                            .find('.mck-menu-box')
                            .removeClass('open')
                            .addClass('n-vis');
                    });
            };
            _this.addGroupMember = function (group, contact) {
                var isGroupAdminExpr = 'n-vis';
                var enableAdminMenuExpr = 'n-vis';
                var groupUser = group.users[contact.contactId];
                var roleExpr = MCK_LABELS['member'];
                var roleValue = 3;
                if (groupUser && typeof groupUser.role !== 'undefined') {
                    roleValue = groupUser.role;
                    roleExpr = ROLE_MAP[groupUser.role];
                }
                var displayName = mckMessageLayout.getTabDisplayName(
                    contact.contactId,
                    false
                );
                if (contact.contactId === group.adminName) {
                    isGroupAdminExpr = 'vis';
                }
                if (group.adminName === MCK_USER_ID) {
                    enableAdminMenuExpr = 'vis';
                }
                if (contact.contactId === MCK_USER_ID) {
                    displayName = MCK_LABELS['you'];
                    enableAdminMenuExpr = 'n-vis';
                }
                var imgsrctag = mckMessageLayout.getContactImageLink(
                    contact,
                    displayName
                );
                var lastSeenStatus = '';
                if (!MCK_BLOCKED_TO_MAP[contact.contactId]) {
                    if (w.MCK_OL_MAP[contact.contactId]) {
                        lastSeenStatus = MCK_LABELS['online'];
                    } else if (MCK_LAST_SEEN_AT_MAP[contact.contactId]) {
                        lastSeenStatus = mckDateUtils.getLastSeenAtStatus(
                            MCK_LAST_SEEN_AT_MAP[contact.contactId]
                        );
                    }
                }
                var contactList = [
                    {
                        roleExpr: roleExpr,
                        roleVal: roleValue,
                        removeMemberLabel: MCK_LABELS['remove.member'],
                        changeRoleLabel: MCK_LABELS['change.role'],
                        contHtmlExpr: contact.htmlId,
                        contIdExpr: contact.contactId,
                        contImgExpr: imgsrctag,
                        contLastSeenExpr: lastSeenStatus,
                        contNameExpr: displayName,
                        contFirstAlphaExpr: displayName.charAt(0).toUpperCase(),
                        isAdminExpr: isGroupAdminExpr,
                        enableAdminMenuExpr: enableAdminMenuExpr,
                    },
                ];
                $applozic
                    .tmpl('groupMemberTemplate', contactList)
                    .appendTo('#mck-group-member-list');
            };
            _this.addMembersToGroupSearchList = function () {
                var groupId = $mck_msg_inner.data('mck-id');
                var isGroup = $mck_msg_inner.data('isgroup');
                if (isGroup) {
                    var group = mckGroupUtils.getGroup(groupId);
                    var contactArray = MCK_GROUP_MEMBER_SEARCH_ARRAY;
                    var searchArray = [];
                    var friendListGroupName = ALStorage.getFriendListGroupName();
                    var friendListGroupType = ALStorage.getFriendListGroupType();

                    if (friendListGroupName && friendListGroupType) {
                        contactArray = mckContactService.getFriendList(
                            friendListGroupName,
                            friendListGroupType
                        );
                    }
                    if (friendListGroupName && !friendListGroupType) {
                        contactArray = mckContactService.getFriendList(
                            friendListGroupName
                        );
                    }
                    contactArray = contactArray.filter(function (item, pos) {
                        return contactArray.indexOf(item) === pos;
                    });
                    contactArray.sort();
                    var groupMemberArray = group.members;
                    $applozic.each(contactArray, function (i, contact) {
                        if (contact) {
                            if (
                                typeof contact === 'object' &&
                                contact.contactId
                            ) {
                                var contact = mckMessageLayout.fetchContact(
                                    '' + contact.contactId
                                );
                            } else {
                                var contact = mckMessageLayout.fetchContact(
                                    '' + contact
                                );
                            }
                            if (
                                groupMemberArray.indexOf(contact.contactId) ===
                                    -1 ||
                                (groupMemberArray.indexOf(contact.contactId) !==
                                    -1 &&
                                    group.removedMembersId.indexOf(
                                        contact.contactId
                                    ) !== -1)
                            ) {
                                _this.addGroupSearchMember(contact);
                                searchArray.push(contact);
                            }
                        }
                    });
                    _this.enableGroupAdminMenuToggle();
                    searchArray.length > 0
                        ? $mck_no_gsm_text.removeClass('vis').addClass('n-vis')
                        : $mck_no_gsm_text.removeClass('n-vis').addClass('vis');
                    mckMessageLayout.initAutoSuggest({
                        contactsArray: searchArray,
                        $searchId: $mck_group_member_search,
                        isContactSearch: false,
                    });
                }
                $mck_gms_loading.removeClass('vis').addClass('n-vis');
            };
            _this.addGroupSearchMember = function (contact) {
                var displayName = mckMessageLayout.getTabDisplayName(
                    contact.contactId,
                    false
                );
                var imgsrctag = mckMessageLayout.getContactImageLink(
                    contact,
                    displayName
                );
                var contHtmlExpr = 'user-' + contact.htmlId;
                var lastSeenStatus = '';
                if (!MCK_BLOCKED_TO_MAP[contact.contactId]) {
                    if (w.MCK_OL_MAP[contact.contactId]) {
                        lastSeenStatus = MCK_LABELS['online'];
                    } else if (MCK_LAST_SEEN_AT_MAP[contact.contactId]) {
                        lastSeenStatus = mckDateUtils.getLastSeenAtStatus(
                            MCK_LAST_SEEN_AT_MAP[contact.contactId]
                        );
                    }
                }
                var contactList = [
                    {
                        contHtmlExpr: contHtmlExpr,
                        contIdExpr: contact.contactId,
                        contImgExpr: imgsrctag,
                        contLastSeenExpr: lastSeenStatus,
                        contNameExpr: displayName,
                    },
                ];
                $applozic
                    .tmpl('groupMemberSearchTemplate', contactList)
                    .appendTo('#mck-group-member-search-list');
            };
            _this.loadCreateGroupTab = function () {
                $mck_contacts_content.removeClass('vis').addClass('n-vis');
                $mck_sidebox_content.removeClass('vis').addClass('n-vis');
                $mck_sidebox_search.removeClass('vis').addClass('n-vis');
                $mck_group_info_tab.removeClass('vis').addClass('n-vis');
                $mck_group_create_icon_loading
                    .removeClass('vis')
                    .addClass('n-vis');
                $mck_group_create_icon.data('iconurl', '');
                $mck_group_create_title.html('');
                $mck_group_create_overlay_box.removeClass('n-vis');
                $mck_gc_overlay_label.html(MCK_LABELS['add.group.icon']);
                $mck_group_create_icon.html(
                    mckGroupService.getGroupDefaultIcon()
                );
                $mck_group_create_tab.removeClass('n-vis').addClass('vis');
            };
            _this.loadGroupInfo = function (params) {
                if (params.groupId) {
                    $mck_group_title.attr('contenteditable', false);
                    $mck_group_name_save.removeClass('vis').addClass('n-vis');
                    $mck_group_name_edit.removeClass('n-vis').addClass('vis');
                    $mck_contacts_content.removeClass('vis').addClass('n-vis');
                    $mck_sidebox_search.removeClass('vis').addClass('n-vis');
                    $mck_group_update_panel
                        .removeClass('vis')
                        .addClass('n-vis');
                    $mck_group_create_tab.removeClass('vis').addClass('n-vis');
                    $mck_btn_group_icon_save
                        .removeClass('vis')
                        .addClass('n-vis');
                    $mck_group_info_icon_loading
                        .removeClass('vis')
                        .addClass('n-vis');
                    $mck_group_info_tab.data('mck-id', params.groupId);
                    $mck_group_info_icon.data('iconurl', '');
                    if (params.conversationId) {
                        $mck_group_info_tab.data(
                            'mck-conversation-id',
                            params.conversationId
                        );
                    }
                    $mck_group_member_List.html('');
                    var group = mckGroupUtils.getGroup(params.groupId);
                    if (typeof group === 'object') {
                        $mck_group_info_icon.html(
                            mckGroupService.getGroupImage(group.imageUrl)
                        );
                        $mck_group_title.html(group.displayName);
                        _this.addMembersToGroupInfoList(group);
                        group.adminName === MCK_USER_ID
                            ? $mck_group_add_member_box
                                  .removeClass('n-vis')
                                  .addClass('vis')
                            : $mck_group_add_member_box
                                  .removeClass('vis')
                                  .addClass('n-vis');
                    } else {
                        mckGroupService.getGroupFeed({
                            groupId: params.groupId,
                            apzCallback: mckGroupLayout.onGroupFeed,
                        });
                    }
                }
            };
            _this.sortGroupMemberHtmlList = function () {
                $applozic('#mck-group-member-list .mck-li-group-member')
                    .sort(function (a, b) {
                        return a.dataset.alpha > b.dataset.alpha;
                    })
                    .appendTo('#mck-group-member-list');
            };
            _this.addGroupMemberFromSearch = function (userId) {
                var groupId = $mck_group_info_tab.data('mck-id');
                if (
                    typeof groupId !== 'undefined' &&
                    typeof userId !== 'undefined'
                ) {
                    var group = mckGroupUtils.getGroup(groupId);
                    if (
                        typeof group === 'object' &&
                        MCK_USER_ID === group.adminName
                    ) {
                        alUserService.loadUserProfile(userId);

                        mckGroupService.addGroupMember({
                            groupId: groupId,
                            userId: userId,
                            apzCallback: mckGroupLayout.onAddedGroupMember,
                        });
                    } else {
                        $mck_group_admin_options
                            .removeClass('vis')
                            .addClass('n-vis');
                    }
                }
                $mck_gm_search_box.mckModal('hide');
            };
        }

        function MckMapLayout() {
            var _this = this;
            var GEOCODER = '';
            var CURR_LOC_ADDRESS = '';
            var IS_LOC_SHARE_INIT = false;
            var $mck_my_loc = $applozic('#mck-my-loc');
            var $mck_loc_box = $applozic('#mck-loc-box');
            var $mck_loc_lat = $applozic('#mck-loc-lat');
            var $mck_loc_lon = $applozic('#mck-loc-lon');
            var $mck_btn_loc = $applozic('#mck-btn-loc');
            var $mck_footer = $applozic('#mck-sidebox-ft');
            var $mck_file_menu = $applozic('#mck-file-menu');
            var $mck_btn_attach = $applozic('#mck-btn-attach');
            var $mckMapContent = $applozic('#mck-map-content');
            var $mck_loc_address = $applozic('#mck-loc-address');
            _this.init = function () {
                if (
                    IS_MCK_LOCSHARE &&
                    w.google &&
                    typeof w.google.maps === 'object'
                ) {
                    GEOCODER = new w.google.maps.Geocoder();
                    $mck_btn_attach.on('click', function () {
                        _this.fileMenuToggle();
                    });
                    $mck_btn_loc.on('click', function (e) {
                        e.preventDefault();
                        if (IS_LOC_SHARE_INIT) {
                            $mck_loc_box.mckModal();
                        } else {
                            mckMapUtils.getCurrentLocation(
                                _this.onGetCurrLocation,
                                _this.onErrorCurrLocation
                            );
                            IS_LOC_SHARE_INIT = true;
                        }
                    });
                }
                $mck_my_loc.on('click', function () {
                    mckMapUtils.getCurrentLocation(
                        _this.onGetMyCurrLocation,
                        _this.onErrorMyCurrLocation
                    );
                });
            };
            _this.fileMenuReposition = function () {
                var offset = $mck_footer.offset();
                offset.bottom = w.innerHeight - offset.top;
                $mck_file_menu.css({
                    bottom: offset.bottom > 51 ? offset.bottom : 51,
                    right: 0,
                });
            };
            _this.fileMenuToggle = function () {
                if ($mck_btn_attach.hasClass('on')) {
                    $mck_btn_attach.removeClass('on');
                    $mck_file_menu.hide();
                } else {
                    _this.fileMenuReposition();
                    $mck_btn_attach.addClass('on');
                    $mck_file_menu.show();
                }
            };
            _this.onGetCurrLocation = function (loc) {
                MCK_CURR_LATITIUDE = loc.coords.latitude;
                MCK_CURR_LONGITUDE = loc.coords.longitude;
                _this.openMapBox();
            };
            _this.onErrorCurrLocation = function () {
                MCK_CURR_LATITIUDE = 46.15242437752303;
                MCK_CURR_LONGITUDE = 2.7470703125;
                _this.openMapBox();
            };
            _this.onErrorMyCurrLocation = function (err) {
                alert(
                    'Unable to retrieve your location. ERROR(' +
                        err.code +
                        '): ' +
                        err.message
                );
            };
            _this.onGetMyCurrLocation = function (loc) {
                MCK_CURR_LATITIUDE = loc.coords.latitude;
                MCK_CURR_LONGITUDE = loc.coords.longitude;
                $mck_loc_lat.val(MCK_CURR_LATITIUDE);
                $mck_loc_lon.val(MCK_CURR_LONGITUDE);
                $mck_loc_lat.trigger('change');
                $mck_loc_lon.trigger('change');
                if (CURR_LOC_ADDRESS) {
                    $mck_loc_address.val(CURR_LOC_ADDRESS);
                } else if (GEOCODER) {
                    var latlng = {
                        lat: MCK_CURR_LATITIUDE,
                        lng: MCK_CURR_LONGITUDE,
                    };
                    GEOCODER.geocode(
                        {
                            location: latlng,
                        },
                        function (results, status) {
                            if (status === 'OK') {
                                if (results[1]) {
                                    CURR_LOC_ADDRESS =
                                        results[1].formatted_address;
                                }
                            }
                        }
                    );
                }
            };
            _this.openMapBox = function () {
                $mckMapContent.locationpicker({
                    location: {
                        latitude: MCK_CURR_LATITIUDE,
                        longitude: MCK_CURR_LONGITUDE,
                    },
                    radius: 0,
                    scrollwheel: true,
                    inputBinding: {
                        latitudeInput: $mck_loc_lat,
                        longitudeInput: $mck_loc_lon,
                        locationNameInput: $mck_loc_address,
                    },
                    enableAutocomplete: true,
                    enableReverseGeocode: true,
                    onchanged: function (currentLocation) {
                        MCK_CURR_LATITIUDE = currentLocation.latitude;
                        MCK_CURR_LONGITUDE = currentLocation.longitude;
                    },
                });
                $mck_loc_box.on('shown.bs.mck-box', function () {
                    $mckMapContent.locationpicker('autosize');
                });
                $mck_loc_box.mckModal();
            };
        }

        function MckMapService() {
            var _this = this;
            var $mck_msg_to = $applozic('#mck-msg-to');
            var $mck_btn_loc = $applozic('#mck-btn-loc');
            var $mck_loc_box = $applozic('#mck-loc-box');
            var $mck_msg_sbmt = $applozic('#mck-msg-sbmt');
            var $mck_msg_error = $applozic('#mck-msg-error');
            var $mck_loc_submit = $applozic('#mck-loc-submit');
            var $mck_msg_response = $applozic('#mck-msg-response');
            var $mck_response_text = $applozic('#mck_response_text');
            var $mck_msg_inner = $applozic(
                '#mck-message-cell .mck-message-inner'
            );
            $mck_loc_submit.on('click', function () {
                var messagePxy = {
                    type: 5,
                    contentType: 2,
                    message: w.JSON.stringify(
                        mckMapUtils.getSelectedLocation()
                    ),
                };
                var conversationId = $mck_msg_inner.data('mck-conversationid');
                var topicId = $mck_msg_inner.data('mck-topicid');
                if (conversationId) {
                    messagePxy.conversationId = conversationId;
                } else if (topicId) {
                    var conversationPxy = {
                        topicId: topicId,
                    };
                    var topicDetail = MCK_TOPIC_DETAIL_MAP[topicId];
                    if (typeof topicDetail === 'object') {
                        conversationPxy.topicDetail = w.JSON.stringify(
                            topicDetail
                        );
                    }
                    messagePxy.conversationPxy = conversationPxy;
                }
                if ($mck_msg_inner.data('isgroup') === true) {
                    messagePxy.groupId = $mck_msg_to.val();
                } else {
                    messagePxy.to = $mck_msg_to.val();
                }
                $mck_msg_sbmt.attr('disabled', true);
                $mck_msg_error.removeClass('vis').addClass('n-vis');
                $mck_msg_error.html('');
                $mck_response_text.html('');
                $mck_msg_response.removeClass('vis').addClass('n-vis');
                mckMessageService.sendMessage(messagePxy);
                $mck_loc_box.mckModal('hide');
            });
        }

        function MckFileService() {
            var _this = this;
            var ONE_KB = 1024;
            var ONE_MB = 1048576;
            var UPLOAD_VIA = ['CREATE', 'UPDATE'];
            var $file_box = $applozic('#mck-file-box');
            var $mck_overlay = $applozic('.mck-overlay');
            var $mck_msg_sbmt = $applozic('#mck-msg-sbmt');
            var $mck_text_box = $applozic('#mck-text-box');
            var $mck_file_input = $applozic('#mck-file-input');
            var $mck_autosuggest_search_input = $applozic(
                '#mck-autosuggest-search-input'
            );
            var $mck_overlay_box = $applozic('.mck-overlay-box');
            var $mck_file_upload = $applozic('.mck-file-upload');
            var $mck_group_icon_upload = $applozic('#mck-group-icon-upload');
            var $mck_group_icon_change = $applozic('#mck-group-icon-change');
            var $mck_group_info_icon_box = $applozic(
                '#mck-group-info-icon-box'
            );
            var $mck_btn_group_icon_save = $applozic(
                '#mck-btn-group-icon-save'
            );
            var $mck_msg_inner = $applozic(
                '#mck-message-cell .mck-message-inner'
            );
            var $mck_group_create_icon_box = $applozic(
                '#mck-group-create-icon-box'
            );
            var $mck_group_info_icon_loading = $applozic(
                '#mck-group-info-icon-loading'
            );
            var $mck_group_create_icon_loading = $applozic(
                '#mck-group-create-icon-loading'
            );
            var $mck_group_info_icon = $applozic(
                '#mck-group-info-icon-box .mck-group-icon'
            );
            var $mck_group_create_icon = $applozic(
                '#mck-group-create-icon-box .mck-group-icon'
            );
            var $mck_gc_overlay_label = $applozic('#mck-gc-overlay-label');
            var FILE_PREVIEW_URL = '/rest/ws/aws/file';
            var FILE_UPLOAD_URL = '/rest/ws/aws/file/url';
            var ATTACHMENT_UPLOAD_URL = '/rest/ws/upload/image';
            var FILE_AWS_UPLOAD_URL = '/rest/ws/upload/file';
            var FILE_DELETE_URL = '/rest/ws/aws/file/delete';
            var CUSTOM_FILE_UPLOAD_URL = '/files/upload/';
            var mck_filebox_tmpl =
                '<div id="mck-filebox-${fileIdExpr}" class="mck-file-box ${fileIdExpr}">' +
                '<div class="mck-file-expr">' +
                '<span class="mck-file-content blk-lg-8"><span class="mck-file-lb">{{html fileNameExpr}}</span>&nbsp;<span class="mck-file-sz">${fileSizeExpr}</span></span>' +
                '<span class="km-progress km-progress-striped active blk-lg-3" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="km-progress-bar km-progress-bar-success km-bar" stye></span></span>' +
                '<span class="move-right">' +
                '<button type="button" class="mck-attach-icon mck-box-close mck-remove-file" data-dismiss="div" aria-hidden="true">x</button>' +
                '</span></div></div>';
            _this.init = function () {
                $applozic.template('fileboxTemplate', mck_filebox_tmpl);
                //ataching events for rich msh templates
                Snap.attachEvents($applozic);
                $mck_file_upload.on('click', function (e) {
                    e.preventDefault();
                    $mck_file_input.trigger('click');
                });

                $mck_group_icon_upload.on('change', function () {
                    var file = $applozic(this)[0].files[0];
                    _this.uplaodFileToAWS(file, UPLOAD_VIA[0]);
                    return false;
                });
                $mck_group_icon_change.on('change', function () {
                    var file = $applozic(this)[0].files[0];
                    _this.uplaodFileToAWS(file, UPLOAD_VIA[1]);
                    return false;
                });
                $mck_file_input.on('change', function () {
                    var file = $applozic(this)[0].files[0];
                    var tabId = $mck_msg_inner.data('mck-id');
                    if (file && SnapUI.isAttachmentV2(file.type)) {
                        Snap.attachmentService.getFileMeta(
                            file,
                            tabId,
                            function (file_meta, messagePxy, file) {
                                FILE_META = file_meta;
                                mckMessageService.sendMessage(
                                    messagePxy,
                                    file,
                                    function (msgProxy) {
                                        messagePxy['key'] = msgProxy.key;
                                        var params = {};
                                        params.file = file;
                                        params.name = file.name;
                                        Snap.attachmentService.uploadAttachment(
                                            params,
                                            messagePxy,
                                            MCK_CUSTOM_UPLOAD_SETTINGS
                                        );
                                    }
                                );
                            }
                        );
                    } else {
                        var params = {};
                        params.file = file;
                        params.name = file.name;
                        Snap.attachmentService.uploadAttachment(
                            params,
                            null,
                            MCK_CUSTOM_UPLOAD_SETTINGS
                        );
                    }
                });
                $applozic(d).on('click', '.mck-remove-file', function () {
                    var $currFileBox = $applozic(this).parents('.mck-file-box');
                    var currFileMeta = $currFileBox.data('mckfile');
                    $currFileBox.remove();
                    $mck_msg_sbmt.attr('disabled', false);
                    if ($file_box.find('.mck-file-box').length === 0) {
                        $file_box.removeClass('vis').addClass('n-vis');
                        $mck_text_box.attr('required', '');
                    }
                    if (typeof currFileMeta === 'object') {
                        alFileService.deleteFileMeta(currFileMeta.blobKey);
                        $applozic.each(FILE_META, function (i, fileMeta) {
                            if (
                                typeof fileMeta !== 'undefined' &&
                                fileMeta.blobKey === currFileMeta.blobKey
                            ) {
                                FILE_META.splice(i, 1);
                            }
                        });
                    }
                });

                $mck_autosuggest_search_input.on('input', function (e) {
                    // This code is to auto resize a textarea as you go on typing text in it.
                    _this.resizeTextarea(this);
                    if (
                        $mck_autosuggest_search_input.data('origin') ==
                        'KM_AUTO_SUGGEST'
                    ) {
                        return;
                    }
                    if (
                        $mck_autosuggest_search_input.data('source-url') != ''
                    ) {
                        mckMessageLayout.populateAutoSuggest({
                            sourceUrl: $mck_autosuggest_search_input.data(
                                'source-url'
                            ),
                            method: $mck_autosuggest_search_input.data(
                                'method'
                            ),
                            headers: $mck_autosuggest_search_input.data(
                                'headers'
                            ),
                        });
                    }
                });
            };

            _this.resizeTextarea = function (el) {
                var offset = el.offsetHeight - el.clientHeight;
                $applozic(el)
                    .css('height', 'auto')
                    .css('height', el.scrollHeight + offset);
            };
            // _this.generateDataURl =function (params) {

            // }
            _this.audioRecoder = function (params) {
                if (MCK_CUSTOM_UPLOAD_SETTINGS === 'awsS3Server') {
                    _this.uploadAttachment2AWS(params);
                } else if (MCK_CUSTOM_UPLOAD_SETTINGS === 'googleCloud') {
                    _this.customFileUpload(params);
                } else {
                    _this.uploadFile(params);
                }
            };
            _this.customFileUpload = function (params, messagePxy) {
                var file = params.file;
                var stopUpload = false;
                var data = new FormData();

                var uploadErrors = [];
                if (typeof file === 'undefined') {
                    return;
                }
                if ($applozic('.mck-file-box').length > 4) {
                    uploadErrors.push(
                        "Can't upload more than 5 files at a time"
                    );
                }
                if (file['size'] > MCK_FILEMAXSIZE * ONE_MB) {
                    uploadErrors.push(
                        'file size can not be more than ' +
                            MCK_FILEMAXSIZE +
                            ' MB'
                    );
                }
                if (uploadErrors.length > 0) {
                    alert(uploadErrors.toString());
                } else {
                    var randomId = mckUtils.randomId();
                    var fileboxList = [
                        {
                            fileIdExpr: randomId,
                            fileName: params.name,
                            fileNameExpr:
                                '<a href="#" target="_self" >' +
                                params.name +
                                '</a>',
                            fileSizeExpr: alFileService.getFilePreviewSize(
                                file.size
                            ),
                        },
                    ];
                    $applozic
                        .tmpl('fileboxTemplate', fileboxList)
                        .appendTo('#mck-file-box');
                    var $fileContainer = $applozic('.mck-file-box.' + randomId);
                    var $file_name = $applozic(
                        '.mck-file-box.' + randomId + ' .mck-file-lb'
                    );
                    var $file_progressbar = $applozic(
                        '.mck-file-box.' + randomId + ' .km-progress .km-bar'
                    );
                    var $file_progress = $applozic(
                        '.mck-file-box.' + randomId + ' .km-progress'
                    );
                    var $file_remove = $applozic(
                        '.mck-file-box.' + randomId + ' .mck-remove-file'
                    );
                    $file_progressbar.css('width', '0%');
                    messagePxy &&
                        Snap.attachmentEventHandler.progressMeter(
                            0,
                            messagePxy.key
                        );
                    $file_progress.removeClass('n-vis').addClass('vis');
                    $file_remove.attr('disabled', true);
                    $mck_file_upload.attr('disabled', true);
                    SnapUI.hideFileBox(file, $file_box, $mck_file_upload);
                    var currTab = $mck_msg_inner.data('mck-id');
                    var uniqueId = params.name + file.size;
                    TAB_FILE_DRAFT[uniqueId] = currTab;
                    $mck_msg_sbmt.attr('disabled', true);
                    data.append('files[]', file);
                    var xhr = new XMLHttpRequest();
                    (xhr.upload || xhr).addEventListener(
                        'progress',
                        function (e) {
                            var progress = parseInt(
                                (e.loaded / e.total) * 100,
                                10
                            );
                            $file_progressbar.css('width', progress + '%');
                            messagePxy &&
                                Snap.attachmentEventHandler.progressMeter(
                                    progress,
                                    messagePxy.key
                                );
                        }
                    );
                    xhr.addEventListener('load', function (e) {
                        var responseJson = $applozic.parseJSON(
                            this.responseText
                        );
                        if (typeof responseJson === 'object') {
                            var file_meta = responseJson.fileMeta;
                            if (messagePxy) {
                                messagePxy['fileMeta'] = file_meta;
                                var optns = {
                                    tabId: messagePxy.groupId,
                                };
                                stopUpload = SnapUI.getAttachmentStopUploadStatus(
                                    messagePxy.key
                                );
                                SnapUI.updateAttachmentTemplate(
                                    file_meta,
                                    messagePxy.key
                                );
                                !stopUpload &&
                                    mckMessageService.submitMessage(
                                        messagePxy,
                                        optns
                                    );
                                SnapUI.updateImageAttachmentPreview(
                                    file_meta,
                                    messagePxy.key
                                );
                                return;
                            }
                            var fileExpr =
                                typeof file_meta === 'object'
                                    ? '<a href="' +
                                      file_meta.url +
                                      '" target="_blank">' +
                                      file_meta.name +
                                      '</a>'
                                    : '';
                            var name = file_meta.name;
                            var size = file_meta.size;
                            var currTabId = $mck_msg_inner.data('mck-id');
                            var uniqueId = name + size;
                            var fileTabId = TAB_FILE_DRAFT[uniqueId];
                            if (currTab !== currTabId) {
                                mckMessageLayout.updateDraftMessage(
                                    fileTabId,
                                    file_meta
                                );
                                delete TAB_FILE_DRAFT[uniqueId];
                                return;
                            }
                            $file_remove.attr('disabled', false);
                            $mck_file_upload.attr('disabled', false);
                            $mck_msg_sbmt.attr('disabled', false);
                            delete TAB_FILE_DRAFT[uniqueId];
                            $file_name.html(fileExpr);
                            $file_progress.removeClass('vis').addClass('n-vis');
                            $applozic('.mck-file-box .progress')
                                .removeClass('vis')
                                .addClass('n-vis');
                            $mck_text_box.removeAttr('required');
                            FILE_META.push(file_meta);
                            $fileContainer.data('mckfile', file_meta);
                            $mck_file_upload.children('input').val('');
                            return false;
                        } else {
                            $file_remove.attr('disabled', false);
                            $mck_msg_sbmt.attr('disabled', false);
                            // FILE_META
                            // = '';
                            $file_remove.trigger('click');
                        }
                    });
                    var url = MCK_CUSTOM_URL + CUSTOM_FILE_UPLOAD_URL;

                    xhr.open('post', url, true);
                    window.Applozic.ALApiService.addRequestHeaders(xhr);
                    xhr.send(data);
                    return false;
                }
            };
            _this.uploadAttachemnt = function (params, messagePxy) {
                if (MCK_CUSTOM_UPLOAD_SETTINGS === 'awsS3Server') {
                    _this.uploadAttachment2AWS(params, messagePxy);
                } else if (MCK_CUSTOM_UPLOAD_SETTINGS === 'googleCloud') {
                    _this.customFileUpload(params, messagePxy);
                } else {
                    _this.uploadFile(params, messagePxy);
                }
            };
            _this.uploadFile = function (params, messagePxy) {
                var file = params.file;
                var data = new Object();
                var stopUpload = false;
                var uploadErrors = [];
                var $attchement_progressbar = '';
                if (typeof file === 'undefined') {
                    return;
                }
                if ($applozic('.mck-file-box').length > 4) {
                    uploadErrors.push(
                        "Can't upload more than 5 files at a time"
                    );
                }
                if (file['size'] > MCK_FILEMAXSIZE * ONE_MB) {
                    uploadErrors.push(
                        'file size can not be more than ' +
                            MCK_FILEMAXSIZE +
                            ' MB'
                    );
                }
                if (uploadErrors.length > 0) {
                    alert(uploadErrors.toString());
                } else {
                    var randomId = mckUtils.randomId();
                    var fileboxList = [
                        {
                            fileIdExpr: randomId,
                            fileName: params.name,
                            fileNameExpr:
                                '<a href="#" target="_self" >' +
                                params.name +
                                '</a>',
                            fileSizeExpr: alFileService.getFilePreviewSize(
                                file.size
                            ),
                        },
                    ];
                    $applozic
                        .tmpl('fileboxTemplate', fileboxList)
                        .appendTo('#mck-file-box');
                    var $fileContainer = $applozic('.mck-file-box.' + randomId);
                    var $file_name = $applozic(
                        '.mck-file-box.' + randomId + ' .mck-file-lb'
                    );
                    var $file_progressbar = $applozic(
                        '.mck-file-box.' + randomId + ' .km-progress .km-bar'
                    );
                    messagePxy &&
                        ($attchement_progressbar = $applozic(
                            '.km-msg-box-attachment .km-attachment-progress-bar-wrapper .km-attachment-progress-bar-success-' +
                                messagePxy.key
                        ));
                    var $file_progress = $applozic(
                        '.mck-file-box.' + randomId + ' .km-progress'
                    );
                    var $file_remove = $applozic(
                        '.mck-file-box.' + randomId + ' .mck-remove-file'
                    );
                    $file_progressbar.css('width', '0%');
                    messagePxy &&
                        Snap.attachmentEventHandler.progressMeter(
                            0,
                            messagePxy.key
                        );
                    $file_progress.removeClass('n-vis').addClass('vis');
                    $file_remove.attr('disabled', true);
                    $mck_file_upload.attr('disabled', true);
                    SnapUI.hideFileBox(file, $file_box, $mck_file_upload);
                    var currTab = $mck_msg_inner.data('mck-id');
                    var uniqueId = params.name + file.size;
                    TAB_FILE_DRAFT[uniqueId] = currTab;
                    $mck_msg_sbmt.attr('disabled', true);
                    data.files = [];
                    data.files.push(file);
                    var xhr = new XMLHttpRequest();
                    (xhr.upload || xhr).addEventListener(
                        'progress',
                        function (e) {
                            var progress = parseInt(
                                (e.loaded / e.total) * 100,
                                10
                            );
                            $file_progressbar.css('width', progress + '%');
                            $attchement_progressbar &&
                                $attchement_progressbar.css(
                                    'width',
                                    progress + '%'
                                );
                            messagePxy &&
                                Snap.attachmentEventHandler.progressMeter(
                                    progress,
                                    messagePxy.key
                                );
                        }
                    );
                    xhr.addEventListener('load', function (e) {
                        var responseJson = $applozic.parseJSON(
                            this.responseText
                        );
                        if (typeof responseJson.fileMeta === 'object') {
                            var file_meta = responseJson.fileMeta;
                            if (messagePxy) {
                                file_meta.url =
                                    MCK_FILE_URL +
                                    FILE_PREVIEW_URL +
                                    '/' +
                                    file_meta.blobKey;
                                messagePxy['fileMeta'] = file_meta;
                                var optns = {
                                    tabId: messagePxy.groupId,
                                };
                                stopUpload = SnapUI.getAttachmentStopUploadStatus(
                                    messagePxy.key
                                );
                                SnapUI.updateAttachmentTemplate(
                                    file_meta,
                                    messagePxy.key
                                );
                                !stopUpload &&
                                    mckMessageService.submitMessage(
                                        messagePxy,
                                        optns
                                    );
                                SnapUI.updateImageAttachmentPreview(
                                    file_meta,
                                    messagePxy.key
                                );
                                return;
                            }
                            var fileExpr = alFileService.getFilePreviewPath(
                                file_meta
                            );
                            file_meta.url =
                                MCK_FILE_URL +
                                FILE_PREVIEW_URL +
                                '/' +
                                file_meta.blobKey;
                            var name = file_meta.name;
                            var size = file_meta.size;
                            var currTabId = $mck_msg_inner.data('mck-id');
                            var uniqueId = name + size;
                            var fileTabId = TAB_FILE_DRAFT[uniqueId];
                            if (currTab !== currTabId) {
                                mckMessageLayout.updateDraftMessage(
                                    fileTabId,
                                    file_meta
                                );
                                delete TAB_FILE_DRAFT[uniqueId];
                                return;
                            }
                            $file_remove.attr('disabled', false);
                            $mck_file_upload.attr('disabled', false);
                            $mck_msg_sbmt.attr('disabled', false);
                            delete TAB_FILE_DRAFT[uniqueId];
                            $file_name.html(fileExpr);
                            $file_progress.removeClass('vis').addClass('n-vis');
                            $applozic('.mck-file-box .km-progress')
                                .removeClass('vis')
                                .addClass('n-vis');
                            $mck_text_box.removeAttr('required');
                            FILE_META.push(file_meta);
                            $fileContainer.data('mckfile', file_meta);
                            $mck_file_upload.children('input').val('');
                            return false;
                        } else {
                            $file_remove.attr('disabled', false);
                            $mck_msg_sbmt.attr('disabled', false);
                            // FILE_META
                            // = '';
                            $file_remove.trigger('click');
                        }
                    });
                    $applozic.ajax({
                        type: 'GET',
                        url: MCK_FILE_URL + FILE_UPLOAD_URL,
                        global: false,
                        data: 'data=' + new Date().getTime(),
                        crosDomain: true,
                        success: function (result) {
                            var fd = new FormData();
                            fd.append('files[]', file);
                            xhr.open('POST', result, true);
                            xhr.send(fd);
                        },
                        error: function () {},
                    });
                }
            };
            _this.uploadAttachment2AWS = function (params, messagePxy) {
                var file = params.file;
                var data = new FormData();
                var uploadErrors = [];
                var stopUpload = false;
                var $attchement_progressbar = '';
                if (typeof file === 'undefined') {
                    return;
                }
                if ($applozic('.mck-file-box').length > 4) {
                    uploadErrors.push(
                        "Can't upload more than 5 files at a time"
                    );
                }
                if (file['size'] > MCK_FILEMAXSIZE * ONE_MB) {
                    uploadErrors.push(
                        'file size can not be more than ' +
                            MCK_FILEMAXSIZE +
                            ' MB'
                    );
                }
                if (uploadErrors.length > 0) {
                    alert(uploadErrors.toString());
                } else {
                    var randomId = mckUtils.randomId();
                    var fileboxList = [
                        {
                            fileIdExpr: randomId,
                            fileName: params.name,
                            fileNameExpr:
                                '<a href="#" target="_self" >' +
                                params.name +
                                '</a>',
                            fileSizeExpr: alFileService.getFilePreviewSize(
                                file.size
                            ),
                        },
                    ];
                    $applozic
                        .tmpl('fileboxTemplate', fileboxList)
                        .appendTo('#mck-file-box');
                    var $fileContainer = $applozic('.mck-file-box.' + randomId);
                    var $file_name = $applozic(
                        '.mck-file-box.' + randomId + ' .mck-file-lb'
                    );
                    var $file_progressbar = $applozic(
                        '.mck-file-box.' + randomId + ' .km-progress .km-bar'
                    );
                    messagePxy &&
                        ($attchement_progressbar = $applozic(
                            '.km-msg-box-attachment .km-attachment-progress-bar-wrapper .km-attachment-progress-bar-success-' +
                                messagePxy.key
                        ));
                    var $file_progress = $applozic(
                        '.mck-file-box.' + randomId + ' .km-progress'
                    );
                    var $file_remove = $applozic(
                        '.mck-file-box.' + randomId + ' .mck-remove-file'
                    );
                    $file_progressbar.css('width', '0%');
                    messagePxy &&
                        Snap.attachmentEventHandler.progressMeter(
                            0,
                            messagePxy.key
                        );
                    $file_progress.removeClass('n-vis').addClass('vis');
                    $file_remove.attr('disabled', true);
                    $mck_file_upload.attr('disabled', true);
                    SnapUI.hideFileBox(file, $file_box, $mck_file_upload);
                    var currTab = $mck_msg_inner.data('mck-id');
                    var uniqueId = params.name + file.size;
                    TAB_FILE_DRAFT[uniqueId] = currTab;
                    $mck_msg_sbmt.attr('disabled', true);
                    data.append('file', file);
                    var xhr = new XMLHttpRequest();
                    (xhr.upload || xhr).addEventListener(
                        'progress',
                        function (e) {
                            var progress = parseInt(
                                (e.loaded / e.total) * 100,
                                10
                            );
                            $attchement_progressbar &&
                                $attchement_progressbar.css(
                                    'width',
                                    progress + '%'
                                );
                            $file_progressbar.css('width', progress + '%');
                            messagePxy &&
                                Snap.attachmentEventHandler.progressMeter(
                                    progress,
                                    messagePxy.key
                                );
                        }
                    );
                    xhr.addEventListener('load', function (e) {
                        var responseJson = $applozic.parseJSON(
                            this.responseText
                        );
                        if (typeof responseJson === 'object') {
                            var file_meta = responseJson;
                            if (messagePxy) {
                                messagePxy['fileMeta'] = file_meta;
                                var optns = {
                                    tabId: messagePxy.groupId,
                                };
                                stopUpload = SnapUI.getAttachmentStopUploadStatus(
                                    messagePxy.key
                                );
                                SnapUI.updateAttachmentTemplate(
                                    file_meta,
                                    messagePxy.key
                                );
                                !stopUpload &&
                                    mckMessageService.submitMessage(
                                        messagePxy,
                                        optns
                                    );
                                SnapUI.updateImageAttachmentPreview(
                                    file_meta,
                                    messagePxy.key
                                );
                                return;
                            }
                            var fileExpr =
                                typeof file_meta === 'object'
                                    ? '<a href="' +
                                      file_meta.url +
                                      '" target="_blank">' +
                                      file_meta.name +
                                      '</a>'
                                    : '';
                            var name = file_meta.name;
                            var size = file_meta.size;
                            var currTabId = $mck_msg_inner.data('mck-id');
                            var uniqueId = name + size;
                            var fileTabId = TAB_FILE_DRAFT[uniqueId];
                            if (currTab !== currTabId) {
                                mckMessageLayout.updateDraftMessage(
                                    fileTabId,
                                    file_meta
                                );
                                delete TAB_FILE_DRAFT[uniqueId];
                                return;
                            }
                            $file_remove.attr('disabled', false);
                            $mck_file_upload.attr('disabled', false);
                            $mck_msg_sbmt.attr('disabled', false);
                            delete TAB_FILE_DRAFT[uniqueId];
                            $file_name.html(fileExpr);
                            $file_progress.removeClass('vis').addClass('n-vis');
                            $applozic('.mck-file-box .km-progress')
                                .removeClass('vis')
                                .addClass('n-vis');
                            $mck_text_box.removeAttr('required');
                            FILE_META.push(file_meta);
                            $fileContainer.data('mckfile', file_meta);
                            $mck_file_upload.children('input').val('');
                            return false;
                        } else {
                            $file_remove.attr('disabled', false);
                            $mck_msg_sbmt.attr('disabled', false);
                            // FILE_META
                            // = '';
                            $file_remove.trigger('click');
                        }
                    });
                    var url = MCK_BASE_URL + ATTACHMENT_UPLOAD_URL;
                    xhr.open('post', url, true);
                    window.Applozic.ALApiService.addRequestHeaders(xhr);
                    xhr.send(data);
                }
            };
            _this.uplaodFileToAWS = function (file, medium) {
                var data = new FormData();
                var uploadErrors = [];
                if (typeof file === 'undefined') {
                    return;
                }
                if (file['type'].indexOf('image') === -1) {
                    uploadErrors.push('Please upload image file.');
                }
                if (uploadErrors.length > 0) {
                    alert(uploadErrors.toString());
                } else {
                    $mck_overlay.attr('disabled', true);
                    if (UPLOAD_VIA[0] === medium) {
                        $mck_group_create_icon_box
                            .find('.mck-overlay-box')
                            .removeClass('n-vis');
                        $mck_group_create_icon_box.removeClass('mck-hover-on');
                        $mck_group_create_icon_loading
                            .removeClass('n-vis')
                            .addClass('vis');
                    } else {
                        $mck_group_info_icon_box
                            .find('.mck-overlay-box')
                            .removeClass('n-vis');
                        $mck_group_info_icon_box.removeClass('mck-hover-on');
                        $mck_group_info_icon_loading
                            .removeClass('n-vis')
                            .addClass('vis');
                    }
                    var xhr = new XMLHttpRequest();
                    xhr.addEventListener('load', function (e) {
                        var fileUrl = this.responseText;
                        if (fileUrl) {
                            if (UPLOAD_VIA[0] === medium) {
                                $mck_group_create_icon.html(
                                    '<img src="' + fileUrl + '"/>'
                                );
                                $mck_group_create_icon.data('iconurl', fileUrl);
                                $mck_gc_overlay_label.html(
                                    MCK_LABELS['change.group.icon']
                                );
                                $mck_group_create_icon_loading
                                    .removeClass('vis')
                                    .addClass('n-vis');
                                $mck_group_create_icon_box.addClass(
                                    'mck-hover-on'
                                );
                            } else {
                                $mck_group_info_icon.html(
                                    '<img src="' + fileUrl + '"/>'
                                );
                                $mck_group_info_icon.data('iconurl', fileUrl);
                                $mck_group_info_icon_loading
                                    .removeClass('vis')
                                    .addClass('n-vis');
                                $mck_group_info_icon_box.addClass(
                                    'mck-hover-on'
                                );
                                setTimeout(function () {
                                    $mck_btn_group_icon_save
                                        .removeClass('n-vis')
                                        .addClass('vis');
                                }, 1500);
                            }
                            setTimeout(function () {
                                $mck_overlay_box.addClass('n-vis');
                            }, 1500);
                        }
                        $mck_overlay.attr('disabled', false);
                        UPLOAD_VIA[0] === medium
                            ? $mck_group_icon_upload.val('')
                            : $mck_group_icon_change.val('');
                        return false;
                    });
                    data.append('file', file);
                    xhr.open('post', MCK_BASE_URL + FILE_AWS_UPLOAD_URL, true);
                    window.Applozic.ALApiService.addRequestHeaders(xhr);
                    xhr.send(data);
                }
            };

            _this.addFileBox = function (file) {
                var fileboxId = mckUtils.randomId();
                var fileName = '';
                if (typeof file.fileMeta === 'object') {
                    fileboxId = file.fileMeta.createdAtTime;
                    fileName = file.fileMeta.name;
                }
                var fileboxList = [
                    {
                        fileNameExpr: file.filelb,
                        fileSizeExpr: file.filesize,
                        fileIdExpr: fileboxId,
                        fileName: fileName,
                    },
                ];
                $applozic
                    .tmpl('fileboxTemplate', fileboxList)
                    .appendTo('#mck-file-box');
                var $fileContainer = $applozic('.mck-file-box.' + fileboxId);
                var $file_remove = $fileContainer.find('.mck-remove-file');
                var $file_progress = $fileContainer.find('.progress');
                if (typeof file.fileMeta === 'object') {
                    $fileContainer.data('mckblob', file.fileMeta.blobKey);
                    $mck_text_box.removeAttr('required');
                    $mck_msg_sbmt.attr('disabled', false);
                    $file_remove.attr('disabled', false);
                    $file_progress.removeClass('vis').addClass('n-vis');
                    FILE_META.push(file.fileMeta);
                } else {
                    $mck_msg_sbmt.attr('disabled', true);
                    $file_remove.attr('disabled', true);
                    $file_progress.removeClass('n-vis').addClass('vis');
                }
            };
        }

        function MckNotificationService() {
            var _this = this;
            var $mck_sidebox;
            var $mck_msg_inner;
            var $mck_msg_preview;
            var $mck_preview_icon;
            var $mck_preview_name;
            var $mck_group_info_tab;
            var MCK_SW_SUBSCRIPTION;
            var $mck_sidebox_launcher;
            var $mck_preview_msg_content;
            var $mck_preview_file_content;
            var $mck_msg_preview_visual_indicator;
            var $mck_msg_preview_visual_indicator_text;
            var MCK_SW_REGISTER_URL = '/rest/ws/plugin/update/sw/id';
            _this.init = function () {
                $mck_sidebox = $applozic('#mck-sidebox');
                // $mck_msg_preview = $applozic("#mck-msg-preview");
                $mck_group_info_tab = $applozic('#mck-group-info-tab');
                $mck_sidebox_launcher = $applozic('#mck-sidebox-launcher');
                $mck_msg_inner = $applozic(
                    '#mck-message-cell .mck-message-inner'
                );
                // $mck_preview_icon = $applozic("#mck-msg-preview .mck-preview-icon");
                // $mck_preview_name = $applozic("#mck-msg-preview .mck-preview-cont-name");
                // $mck_preview_msg_content = $applozic("#mck-msg-preview .mck-preview-msg-content");
                // $mck_preview_file_content = $applozic("#mck-msg-preview .mck-preview-file-content");
                $mck_msg_preview_visual_indicator = $applozic(
                    '#mck-msg-preview-visual-indicator'
                );
                $mck_msg_preview_visual_indicator_text = $applozic(
                    '#mck-msg-preview-visual-indicator .mck-msg-preview-visual-indicator-text'
                );
            };
            _this.notifyUser = function (message) {
                if (message.alert === false) {
                    return;
                }
                if (message.type === 7) {
                    return;
                }
                if (message.metadata.alert === false) {
                    return;
                }
                var contact = message.groupId
                    ? mckGroupUtils.getGroup('' + message.groupId)
                    : mckMessageLayout.fetchContact(
                          '' + message.to.split(',')[0]
                      );
                var isGroup = false;
                if (message.groupId) {
                    isGroup = true;
                }

                alUserService.loadUserProfile(message.to);

                var displayName = mckMessageLayout.getTabDisplayName(
                    contact.contactId,
                    isGroup
                );
                var notificationsound = mckNotificationTone;
                mckInit.clearMsgTriggerAndChatPopuTimeouts();
                _this.showNewMessageNotification(message, contact, displayName);
                SNAP_VERSION === 'v2' &&
                    !OPEN_CONVERSATION_ON_NEW_MESSAGE &&
                    _this.handleIframeNotification();
                if (IS_MCK_NOTIFICATION && !IS_MCK_TAB_FOCUSED) {
                    var iconLink = MCK_NOTIFICATION_ICON_LINK;
                    var msg = mckMessageLayout.getTextForMessagePreview(
                        message,
                        contact
                    );
                    if (
                        typeof MCK_GETUSERIMAGE === 'function' &&
                        !contact.isGroup
                    ) {
                        var imgsrc = MCK_GETUSERIMAGE(contact.contactId);
                        if (imgsrc && typeof imgsrc !== 'undefined') {
                            iconLink = imgsrc;
                        }
                    }
                    FLASH_PAGE_TITLE = setInterval(function () {
                        if (parent.document.title === CURRENT_PAGE_TITLE) {
                            parent.document.title =
                                MCK_LABELS['page.title.on.new.message'] +
                                displayName;
                        } else {
                            parent.document.title = CURRENT_PAGE_TITLE;
                        }
                    }, 1000);
                    if (notificationsound) {
                        mckNotificationUtils.sendDesktopNotification(
                            displayName,
                            iconLink,
                            msg,
                            notificationsound
                        );
                    } else {
                        mckNotificationUtils.sendDesktopNotification(
                            displayName,
                            iconLink,
                            msg
                        );
                    }
                }
            };

            _this.clearFlashPageTitleInterval = function () {
                clearInterval(FLASH_PAGE_TITLE);
                parent.document.title = CURRENT_PAGE_TITLE;
            };

            _this.handleIframeNotification = function () {
                WIDGET_POSITION === SnapConstants.POSITION.LEFT &&
                    snapCommons.modifyClassList(
                        {
                            class: [
                                'mck-msg-preview-visual-indicator-container',
                                'mck-close-btn-container',
                            ],
                        },
                        'align-left'
                    );
                var kmIframe = parent.document.getElementById(
                    'snap-widget-iframe'
                );
                var notificationMessageWidth = document.getElementById(
                    'mck-msg-preview-visual-indicator'
                ).offsetWidth;
                var launcherIconWidth = document.getElementById(
                    'mck-sidebox-launcher'
                ).offsetWidth;
                kmIframe.classList.add('km-iframe-notification');
                kmIframe.style.width =
                    notificationMessageWidth + launcherIconWidth + 50 + 'px';
            };

            _this.hideMessagePreview = function () {
                var kmIframe = parent.document.getElementById(
                    'snap-widget-iframe'
                );
                $mck_msg_preview_visual_indicator
                    .removeClass('vis')
                    .addClass('n-vis');
                $mck_msg_preview_visual_indicator_text.html('');
                kmIframe.style.width = '';
            };

            _this.formatMessageForNotification = function (msg) {
                var WIDTH_MULTIPLIER = 7;
                var MAX_NOTIFICATION_CHAR = 86;
                var MAX_CHAR_IN_ONE_LINE = 28;
                var MAX_STRING_LENGTH = 80;
                var msgLength =
                    msg.textContent.length ||
                    msg.innerText.length ||
                    msg.length;
                var visualTextIndicator = document.getElementsByClassName(
                    'mck-msg-preview-visual-indicator-text'
                )[0];
                msgLength > MAX_CHAR_IN_ONE_LINE
                    ? (visualTextIndicator.style.width = '200px')
                    : (visualTextIndicator.style.width =
                          msgLength * WIDTH_MULTIPLIER + 'px');
                msgLength > MAX_NOTIFICATION_CHAR &&
                    (msg.innerHTML =
                        msg.innerHTML
                            .replace(/&nbsp;/g, ' ')
                            .substring(0, MAX_STRING_LENGTH) + ' ...');
                return msg;
            };

            _this.showNewMessageNotification = function (
                message,
                contact,
                displayName
            ) {
                if (
                    !IS_NOTIFICATION_ENABLED ||
                    message.contentType === 102 ||
                    message.metadata.KM_ASSIGN ||
                    message.metadata.KM_STATUS
                ) {
                    return;
                }
                var currTabId = $mck_msg_inner.data('mck-id');
                var isGroupTab = $mck_msg_inner.data('isgroup');
                if (
                    currTabId === contact.contactId &&
                    isGroupTab === contact.isGroup &&
                    !$mck_group_info_tab.hasClass('vis') &&
                    !MCK_TRIGGER_MSG_NOTIFICATION_TIMEOUT
                ) {
                    if (
                        message.conversationId &&
                        (IS_MCK_TOPIC_HEADER || IS_MCK_TOPIC_BOX)
                    ) {
                        var currConvId = $mck_msg_inner.data(
                            'mck-conversationid'
                        );
                        currConvId =
                            typeof currConvId !== 'undefined' &&
                            currConvId !== ''
                                ? currConvId.toString()
                                : '';
                        if (currConvId === message.conversationId.toString()) {
                            return;
                        }
                    } else {
                        return;
                    }
                }
                $mck_msg_preview_visual_indicator_text.data(
                    'isgroup',
                    contact.isGroup
                );
                // $mck_msg_preview.data('isgroup', contact.isGroup);
                var conversationId = message.conversationId
                    ? message.conversationId
                    : '';
                $mck_msg_preview_visual_indicator_text.data(
                    'mck-conversationid',
                    conversationId
                );
                // $mck_msg_preview.data('mck-conversationid', conversationId);
                var imgsrctag = mckMessageLayout.getContactImageLink(
                    contact,
                    displayName,
                    message
                );
                if (message.message) {
                    var msg = mckMessageLayout.getMessageTextForContactPreview(
                        message,
                        contact
                    );
                    // $mck_preview_msg_content.html('');
                    $mck_msg_preview_visual_indicator_text.html('');
                    $mck_msg_preview_visual_indicator_text.removeClass(
                        'mck-flexi'
                    );
                    if (typeof msg === 'object') {
                        // $mck_preview_msg_content.append(msg);
                        var finalMessage = _this.formatMessageForNotification(
                            msg
                        );
                        $mck_msg_preview_visual_indicator_text.append(
                            finalMessage
                        );
                    } else if (message.contentType === 3) {
                        var formattedMessage = snapCommons.removeHtmlTag(
                            message.message
                        );
                        var notificationContent = document.createElement('p');
                        notificationContent.appendChild(
                            document.createTextNode(formattedMessage)
                        );
                        var finalMessage = _this.formatMessageForNotification(
                            notificationContent
                        );
                        $mck_msg_preview_visual_indicator_text.append(
                            finalMessage
                        );
                    } else {
                        // $mck_preview_msg_content.html(msg);
                        $mck_msg_preview_visual_indicator_text.html(msg);
                    }
                    // $mck_preview_msg_content.removeClass('n-vis').addClass('vis');
                    $mck_msg_preview_visual_indicator
                        .removeClass('n-vis')
                        .addClass('vis');
                } else {
                    // $mck_preview_msg_content.html('');
                    $mck_msg_preview_visual_indicator_text.html('');
                }
                if (message.fileMetaKey) {
                    // $mck_preview_file_content.html(alFileService.getFileIcon(message));
                    $mck_msg_preview_visual_indicator_text.html(
                        alFileService.getFileIcon(message)
                    );
                    // $mck_preview_file_content.removeClass('n-vis').addClass('vis');
                    $mck_msg_preview_visual_indicator
                        .removeClass('n-vis')
                        .addClass('vis');
                    $mck_msg_preview_visual_indicator_text.addClass(
                        'mck-flexi'
                    );
                    // if ($mck_preview_msg_content.html() === '' || $mck_msg_preview_visual_indicator_text.html() === '') {
                    //     $mck_preview_msg_content.removeClass('vis').addClass('n-vis');
                    //     $mck_msg_preview_visual_indicator.removeClass('vis').addClass('n-vis');
                    // }
                } else if (message.contentType === 2) {
                    while (msg[msg.length - 1] === '.') msg = msg.slice(0, -1);
                    $mck_msg_preview_visual_indicator_text.html(msg);
                    $mck_msg_preview_visual_indicator
                        .removeClass('n-vis')
                        .addClass('vis');
                    $mck_msg_preview_visual_indicator_text.addClass(
                        'mck-flexi'
                    );
                }
                // else {
                //     // $mck_preview_file_content.html('');
                //     // $mck_preview_file_content.removeClass('vis').addClass('n-vis');
                //     // $mck_msg_preview_visual_indicator_text.html('');
                //     // $mck_msg_preview_visual_indicator.removeClass('vis').addClass('n-vis');
                // }
                // if (contact.isGroup === true && contact.type !== 10) {
                //     $mck_preview_name.html(displayName);
                // }
                // $mck_preview_icon.html(imgsrctag);
                if (!imgsrctag.indexOf('/avatars/default.png') != -1) {
                    $applozic('#launcher-agent-img-container').html(imgsrctag);
                    $applozic('#launcher-agent-img-container')
                        .addClass('vis')
                        .removeClass('n-vis');
                    $applozic('#launcher-svg-container')
                        .addClass('n-vis')
                        .removeClass('vis');
                } else {
                    $applozic('#launcher-agent-img-container')
                        .html('')
                        .addClass('n-vis')
                        .removeClass('vis');
                    $applozic('#launcher-svg-container')
                        .addClass('vis')
                        .removeClass('n-vis');
                }
                if (typeof CUSTOM_CHAT_LAUNCHER !== 'undefined') {
                    document
                        .getElementById('mck-sidebox-launcher')
                        .childNodes[0].childNodes[0].classList.add('n-vis');
                }
                // $mck_msg_preview.data('mck-id', contact.contactId);
                $mck_msg_preview_visual_indicator_text.data(
                    'mck-id',
                    contact.contactId
                );
                // $mck_msg_preview.show();
                // $mck_msg_preview_visual_indicator.show();
                // setTimeout(function () {
                //     $mck_msg_preview.fadeOut(1000);
                // }, 10000);
                Snap.KmEventHandler.notificationEvent(message);
                $applozic(d).on(
                    'click',
                    '#mck-msg-preview-visual-indicator .mck-close-btn',
                    function (e) {
                        var snapIframe = parent.document.getElementById(
                            'snap-widget-iframe'
                        );
                        snapIframe.classList.remove(
                            'km-iframe-dimension-no-popup'
                        );
                        snapIframe.classList.remove('km-iframe-notification');
                        snapIframe.classList.remove(
                            'km-iframe-dimension-with-popup'
                        );
                        document.getElementById(
                            'km-popup-close-button'
                        ).style.display = 'none';
                        _this.hideMessagePreview();
                        snapCommons.modifyClassList(
                            { id: ['applozic-badge-count'] },
                            '',
                            'n-vis'
                        );
                    }
                );
                $applozic(d).on(
                    'click',
                    ' #mck-msg-preview-visual-indicator .mck-msg-preview-visual-indicator-text',
                    function () {
                        _this.hideMessagePreview();
                        SnapUI.hideFaq();
                    }
                );
                !IS_MCK_TAB_FOCUSED &&
                    mckNotificationService.clearFlashPageTitleInterval();
            };
        }

        function MckInitializeChannel() {
            var _this = this;
            var $mck_sidebox = $applozic('#mck-sidebox');
            var $mck_tab_title = $applozic('#mck-tab-title');
            var $mck_typing_box = $applozic('.mck-typing-box');
            var $mck_tab_status = $applozic('#mck-tab-status');
            var $mck_offline_message_box = $applozic(
                '#mck-offline-message-box'
            );
            var $mck_typing_label = $applozic('#mck-typing-label');
            var $mck_message_inner = $applozic(
                '#mck-message-cell .mck-message-inner'
            );
            var $mck_msg_inner_content = $applozic('.mck-message-inner');
            var $mck_msg_inner = $applozic(
                '#mck-message-cell .mck-message-inner'
            );

            _this.connectToSocket = function (isFetchMessages) {
                if (
                    isFetchMessages &&
                    $mck_sidebox.css('display') === 'block'
                ) {
                    var currTabId = $mck_message_inner.data('mck-id');
                    if (currTabId) {
                        var isGroup = $mck_message_inner.data('isgroup');
                        var conversationId = $mck_message_inner.data(
                            'mck-conversationid'
                        );
                        var topicId = $mck_message_inner.data('mck-topicid');
                        //adding 1msec with latestMessageReceivedTime so API wont return the last message
                        var latestMessageReceivedTime =
                            $mck_msg_inner.data('last-message-received-time') +
                            1;
                        ALStorage.clearMckMessageArray();
                        mckMessageService.loadMessageList({
                            tabId: currTabId,
                            isGroup: isGroup,
                            conversationId: conversationId,
                            topicId: topicId,
                            latestMessageReceivedTime: latestMessageReceivedTime,
                            allowReload: true,
                        });
                    } else {
                        // Below code will update the all conversation list
                        ALStorage.clearMckMessageArray();
                        IS_SOCKET_INITIALIZED &&
                            mckMessageLayout.loadTab({
                                tabId: '',
                                isGroup: false,
                            });
                        IS_SOCKET_INITIALIZED = true;
                    }
                }
                if (!window.Applozic.ALSocket.stompClient.connected) {
                    window.Applozic.ALSocket.reconnect();
                }
            };
            _this.onTypingStatus = function (resp) {
                var typingSubscriber =
                    window.Applozic.ALSocket.typingSubscriber;
                if (
                    typingSubscriber != null &&
                    typingSubscriber.id === resp.headers.subscription
                ) {
                    var message = resp.body;
                    var publisher = message.split(',')[1];
                    var status = Number(message.split(',')[2]);
                    var tabId = resp.headers.destination.substring(
                        resp.headers.destination.lastIndexOf('-') + 1,
                        resp.headers.destination.length
                    );
                    var currTabId = $mck_message_inner.data('mck-id');
                    var isGroup = $mck_message_inner.data('isgroup');
                    var group = mckGroupUtils.getGroup(currTabId);
                    if (
                        !MCK_BLOCKED_TO_MAP[publisher] &&
                        !MCK_BLOCKED_BY_MAP[publisher]
                    ) {
                        if (status === 1) {
                            if (
                                (MCK_USER_ID !== publisher || !isGroup) &&
                                (currTabId === publisher || currTabId == tabId)
                            ) {
                                var isGroup = $mck_message_inner.data(
                                    'isgroup'
                                );
                                if (isGroup) {
                                    if (publisher !== MCK_USER_ID) {
                                        if (
                                            mckGroupService.authenticateGroupUser(
                                                group
                                            ) ||
                                            (group.type === 6 &&
                                                !MCK_OPEN_GROUP_SETTINGS.disableChatForNonGroupMember)
                                        ) {
                                            $mck_tab_title.addClass(
                                                'mck-tab-title-w-typing'
                                            );
                                            $mck_tab_status
                                                .removeClass('vis')
                                                .addClass('n-vis');
                                            var displayName = mckMessageLayout.getTabDisplayName(
                                                publisher,
                                                false
                                            );
                                            displayName = displayName.split(
                                                ' '
                                            )[0];
                                            $mck_typing_label.html(
                                                displayName +
                                                    ' ' +
                                                    MCK_LABELS['is.typing']
                                            );
                                        }
                                        if (group.type === 7) {
                                            $mck_tab_title.addClass(
                                                'mck-tab-title-w-typing'
                                            );
                                            $mck_typing_label.html(
                                                MCK_LABELS['is.typing']
                                            );
                                            $mck_tab_status.html('');
                                        }
                                    }
                                } else {
                                    $mck_tab_title.addClass(
                                        'mck-tab-title-w-typing'
                                    );
                                    $mck_tab_status
                                        .removeClass('vis')
                                        .addClass('n-vis');
                                }
                                $applozic('.km-typing-wrapper').remove();
                                $mck_msg_inner_content.append(
                                    '<div class="km-typing-wrapper"><div class="km-typing-indicator"></div><div class="km-typing-indicator"></div><div class="km-typing-indicator"></div></div>'
                                );
                                $mck_msg_inner_content.animate(
                                    {
                                        scrollTop: $mck_msg_inner_content.prop(
                                            'scrollHeight'
                                        ),
                                    },
                                    0
                                );

                                setTimeout(function () {
                                    $mck_tab_title.removeClass(
                                        'mck-tab-title-w-typing'
                                    );
                                    $applozic('.km-typing-wrapper').remove();
                                    if (
                                        $mck_tab_title.hasClass(
                                            'mck-tab-title-w-status' &&
                                                (typeof group === 'undefined' ||
                                                    group.type != 7)
                                        )
                                    ) {
                                        // $mck_tab_status.removeClass('n-vis').addClass('vis');
                                    }
                                    $mck_typing_label.html(
                                        MCK_LABELS['typing']
                                    );
                                }, 10000);
                            }
                        } else {
                            $mck_tab_title.removeClass(
                                'mck-tab-title-w-typing'
                            );
                            $mck_typing_box
                                .removeClass('vis')
                                .addClass('n-vis');
                            $applozic('.km-typing-wrapper').remove();
                            if (
                                $mck_tab_title.hasClass(
                                    'mck-tab-title-w-status'
                                ) &&
                                (typeof group === 'undefined' ||
                                    group.type != 7)
                            ) {
                                // $mck_tab_status.removeClass('n-vis').addClass('vis');
                            }
                            $mck_typing_label.html(MCK_LABELS['typing']);
                        }
                    }
                }
            };
            _this.onOpenGroupMessage = function (obj) {
                // TODO: In case this code breaks for socket encryption enabled refer to applozic.common.js file present in web-plugin repository.
                if (
                    window.Applozic.ALSocket.openGroupSubscriber.indexOf(
                        obj.headers.subscription
                    ) !== -1
                ) {
                    var resp = JSON.parse(obj.body);
                    var messageType = resp.type;
                    var message = resp.message;
                    // var userIdArray =
                    // mckMessageLayout.getUserIdFromMessage(message);
                    // mckContactService.getContactDisplayName(userIdArray);
                    // mckMessageLayout.openConversation();
                    if (messageType === 'APPLOZIC_03') {
                        ALStorage.updateLatestMessage(message);
                        if (message.type !== 0 && message.type !== 4) {
                            $applozic(
                                '.' + message.key + ' .mck-message-status'
                            )
                                .removeClass('mck-pending-icon')
                                .addClass('mck-sent-icon')
                                .attr('title', 'sent');
                            mckMessageLayout.addTooltip(message.key);
                        }
                        events.onMessageSentUpdate({
                            messageKey: message.key,
                        });
                    } else if (
                        messageType === 'APPLOZIC_01' ||
                        messageType === 'APPLOZIC_02' ||
                        messageType === 'MESSAGE_RECEIVED'
                    ) {
                        ALStorage.updateLatestMessage(message);
                        var contact = message.groupId
                            ? mckGroupUtils.getGroup(message.groupId)
                            : mckMessageLayout.getContact(message.to);
                        var $mck_sidebox_content = $applozic(
                            '#mck-sidebox-content'
                        );
                        var tabId = $mck_message_inner.data('mck-id');
                        if (
                            messageType === 'APPLOZIC_01' ||
                            messageType === 'MESSAGE_RECEIVED'
                        ) {
                            var messageFeed = mckMessageLayout.getMessageFeed(
                                message
                            );
                            events.onMessageReceived({
                                message: messageFeed,
                            });
                        } else if (messageType === 'APPLOZIC_02') {
                            var messageFeed = mckMessageLayout.getMessageFeed(
                                message
                            );
                            events.onMessageSent({
                                message: messageFeed,
                            });
                        }
                        if (message.conversationId) {
                            var conversationPxy =
                                MCK_CONVERSATION_MAP[message.conversationId];
                            if (
                                (IS_MCK_TOPIC_HEADER || IS_MCK_TOPIC_BOX) &&
                                (typeof conversationPxy !== 'object' ||
                                    typeof MCK_TOPIC_DETAIL_MAP[
                                        conversationPxy.topicId
                                    ] !== 'object')
                            ) {
                                alMessageService.getTopicId(
                                    {
                                        conversationId: message.conversationId,
                                        messageType: messageType,
                                        message: message,
                                        notifyUser: resp.notifyUser,
                                        async: false,
                                        populate: false,
                                    },
                                    function (params) {
                                        mckMessageLayout.populateMessage(
                                            params.messageType,
                                            params.message,
                                            params.notifyUser
                                        );
                                    }
                                );
                            }
                        }

                        if (typeof contact === 'undefined') {
                            var params = {
                                message: message,
                                messageType: messageType,
                                notifyUser: resp.notifyUser,
                            };
                            if (message.groupId) {
                                mckGroupLayout.getGroupFeedFromMessage(params);
                            } else {
                                var userIdArray = [];
                                userIdArray.push(message.to);
                                mckContactService.getUsersDetail(
                                    userIdArray,
                                    params
                                );
                            }
                            return;
                        }

                        mckMessageLayout.populateMessage(
                            messageType,
                            message,
                            resp.notifyUser
                        );
                    }
                }
            };

            _this.onMessage = function (resp) {
                // In case of encryption enabled, response is comming after getting decrypted from the parent function.
                typeof resp.message == 'object' &&
                    $mck_msg_inner.data(
                        'last-message-received-time',
                        resp.message.createdAtTime
                    );
                var messageType = resp.type;
                if (
                    messageType === 'APPLOZIC_04' ||
                    messageType === 'MESSAGE_DELIVERED'
                ) {
                    $applozic(
                        '.' +
                            resp.message.split(',')[0] +
                            ' .mck-message-status'
                    )
                        .removeClass('mck-pending-icon')
                        .removeClass('mck-sent-icon')
                        .addClass('mck-delivered-icon')
                        .attr('title', 'delivered');
                    mckMessageLayout.addTooltip(resp.message.split(',')[0]);
                    // events.onMessageDelivered({
                    //     'messageKey': resp.message.split(",")[0]
                    // });
                } else if (
                    messageType === 'APPLOZIC_08' ||
                    messageType === 'MT_MESSAGE_DELIVERED_READ'
                ) {
                    $applozic(
                        '.' +
                            resp.message.split(',')[0] +
                            ' .mck-message-status'
                    )
                        .removeClass('mck-pending-icon')
                        .removeClass('mck-sent-icon')
                        .removeClass('mck-delivered-icon')
                        .addClass('mck-read-icon');
                    mckMessageLayout.addTooltip(resp.message.split(',')[0]);
                    // events.onMessageRead({
                    //     'messageKey': resp.message.split(",")[0]
                    // });
                } else if (messageType === 'APPLOZIC_05') {
                    var key = resp.message.split(',')[0];
                    var tabId = resp.message.split(',')[1];
                    var isGroup =
                        resp.message.split(',')[2] === '1' ? true : false;
                    mckMessageLayout.removedDeletedMessage(key, tabId, isGroup);
                    var eventResponse = {
                        messageKey: resp.message.split(',')[0],
                    };
                    isGroup
                        ? (eventResponse['groupId'] = tabId)
                        : (eventResponse['userKey'] = tabId);
                    // events.onMessageDeleted(eventResponse);
                } else if (messageType === 'APPLOZIC_27') {
                    var userId = resp.message.split(',')[0];
                    var topicId = resp.message.split(',')[1];
                    if (typeof userId !== 'undefined') {
                        mckMessageLayout.removeConversationThread(
                            userId,
                            false
                        );
                        mckMessageLayout.updateUnreadCount(
                            'user_' + userId,
                            0,
                            true
                        );
                        var response = {
                            userId: userId,
                        };
                        if (topicId) {
                            response['topicId'] = topicId;
                        }
                        // events.onConversationDeleted(response);
                    }
                } else if (messageType === 'APPLOZIC_11') {
                    // user connected
                    var userId = resp.message;
                    var contact = mckMessageLayout.fetchContact(userId);
                    var tabId = $mck_message_inner.data('mck-id');
                    if (
                        !MCK_BLOCKED_TO_MAP[userId] &&
                        !MCK_BLOCKED_BY_MAP[userId]
                    ) {
                        if (
                            tabId === contact.contactId &&
                            !$mck_message_inner.data('isgroup')
                        ) {
                            $applozic('#mck-tab-status').html(
                                MCK_LABELS['online']
                            );
                            if (IS_OFFLINE_MESSAGE_ENABLED) {
                                mckMessageLayout.hideOfflineMessage();
                            }
                        } else {
                            var htmlId = mckContactUtils.formatContactId(
                                userId
                            );
                            $applozic('#li-user-' + htmlId + ' .mck-ol-status')
                                .removeClass('n-vis')
                                .addClass('vis');
                        }
                        $applozic('.mck-user-ol-status.' + htmlId)
                            .removeClass('n-vis')
                            .addClass('vis');
                        $applozic('.mck-user-ol-status.' + htmlId)
                            .next()
                            .html('(' + MCK_LABELS['online'] + ')');
                        w.MCK_OL_MAP[userId] = true;
                        alUserService.updateUserStatus(
                            {
                                userId: resp.message,
                                status: 1,
                            },
                            function (userIdArray) {
                                mckContactService.getUsersDetail(
                                    userIdArray,
                                    {}
                                );
                            }
                        );
                    }
                    // events.onUserConnect({
                    //     'userId': resp.message
                    // });
                } else if (messageType === 'APPLOZIC_12') {
                    // user disconnected
                    var userId = resp.message.split(',')[0];
                    var lastSeenAtTime = resp.message.split(',')[1];
                    var contact = mckMessageLayout.fetchContact(userId);
                    w.MCK_OL_MAP[userId] = false;
                    if (lastSeenAtTime) {
                        MCK_LAST_SEEN_AT_MAP[userId] = lastSeenAtTime;
                    }
                    if (
                        !MCK_BLOCKED_TO_MAP[userId] &&
                        !MCK_BLOCKED_BY_MAP[userId]
                    ) {
                        var tabId = $mck_message_inner.data('mck-id');
                        if (
                            tabId === contact.contactId &&
                            !$mck_message_inner.data('isgroup')
                        ) {
                            $applozic('#mck-tab-status').html(
                                mckDateUtils.getLastSeenAtStatus(lastSeenAtTime)
                            );
                            if (IS_OFFLINE_MESSAGE_ENABLED) {
                                mckInit.manageOfflineMessageTime(tabId);
                            }
                        }
                        $applozic('.mck-user-ol-status.' + contact.htmlId)
                            .removeClass('vis')
                            .addClass('n-vis');
                        $applozic('.mck-user-ol-status.' + contact.htmlId)
                            .next()
                            .html('(Offline)');
                        $applozic('#li-user-' + htmlId + ' .mck-ol-status')
                            .removeClass('vis')
                            .addClass('n-vis');
                        alUserService.updateUserStatus(
                            {
                                userId: userId,
                                status: 0,
                                lastSeenAtTime: lastSeenAtTime,
                            },
                            function (userIdArray) {
                                mckContactService.getUsersDetail(
                                    userIdArray,
                                    {}
                                );
                            }
                        );
                    }
                    // events.onUserDisconnect({
                    //     'userId': userId,
                    //     'lastSeenAtTime': lastSeenAtTime
                    // });
                } else if (messageType === 'APPLOZIC_29') {
                    var userId = resp.message.split(',')[0];
                    var topicId = resp.message.split(',')[1];
                    var contact = mckMessageLayout.fetchContact(userId);
                    mckMessageLayout.updateUnreadCount(
                        'user_' + contact.contactId,
                        0,
                        true
                    );
                    var tabId = $mck_message_inner.data('mck-id');
                    if (typeof tabId === 'undefined' || tabId === '') {
                        $applozic(
                            '#li-user-' +
                                contact.htmlId +
                                ' .mck-unread-count-text'
                        ).html(
                            mckMessageLayout.getUnreadCount(
                                'user_' + contact.contactId
                            )
                        );
                        $applozic(
                            '#li-user-' +
                                contact.htmlId +
                                ' .mck-unread-count-box'
                        )
                            .removeClass('vis')
                            .addClass('n-vis');
                    }
                    var response = {
                        userId: userId,
                    };
                    if (topicId) {
                        response['topicId'] = topicId;
                    }
                    // events.onConversationReadFromOtherSource(response);
                } else if (messageType === 'APPLOZIC_28') {
                    var userId = resp.message.split(',')[0];
                    var topicId = resp.message.split(',')[1];
                    var tabId = $mck_message_inner.data('mck-id');
                    if (tabId === userId) {
                        $applozic('.mck-msg-right .mck-message-status')
                            .removeClass('mck-pending-icon')
                            .removeClass('mck-sent-icon')
                            .removeClass('mck-delivered-icon')
                            .addClass('mck-read-icon');
                        $applozic('.mck-msg-right .mck-delivered-icon').attr(
                            'title',
                            'delivered and read'
                        );
                        var contact = mckMessageLayout.getContact(userId);
                        if (typeof contact === 'undefined') {
                            var userIdArray = [];
                            userIdArray.push(userId);
                            mckContactService.getUsersDetail(userIdArray, {});
                        }
                    }
                    var response = {
                        userId: userId,
                    };
                    if (topicId) {
                        response['topicId'] = topicId;
                    }
                    // events.onConversationRead(response);
                } else if (messageType === 'APPLOZIC_16') {
                    var status = resp.message.split(':')[0];
                    var userId = resp.message.split(':')[1];
                    var contact = mckMessageLayout.fetchContact(userId);
                    var tabId = $mck_message_inner.data('mck-id');
                    if (tabId === contact.contactId) {
                        if (status === BLOCK_STATUS_MAP[0]) {
                            MCK_BLOCKED_TO_MAP[contact.contactId] = true;
                            mckUserUtils.toggleBlockUser(tabId, true);
                        } else {
                            MCK_BLOCKED_BY_MAP[contact.contactId] = true;
                            $mck_tab_title.removeClass(
                                'mck-tab-title-w-status'
                            );
                            $mck_tab_status
                                .removeClass('vis')
                                .addClass('n-vis');
                            $mck_typing_box
                                .removeClass('vis')
                                .addClass('n-vis');
                        }
                    } else {
                        $applozic(
                            '#li-user-' + contact.htmlId + ' .mck-ol-status'
                        )
                            .removeClass('vis')
                            .addClass('n-vis');
                    }
                    // events.onUserBlocked({
                    //     'status': status,
                    //     'userId': userId
                    // });
                } else if (messageType === 'APPLOZIC_17') {
                    var status = resp.message.split(':')[0];
                    var userId = resp.message.split(':')[1];
                    var contact = mckMessageLayout.fetchContact(userId);
                    var tabId = $mck_message_inner.data('mck-id');
                    if (tabId === contact.contactId) {
                        if (status === BLOCK_STATUS_MAP[2]) {
                            MCK_BLOCKED_TO_MAP[contact.contactId] = false;
                            mckUserUtils.toggleBlockUser(tabId, false);
                        } else if (
                            w.MCK_OL_MAP[tabId] ||
                            MCK_LAST_SEEN_AT_MAP[tabId]
                        ) {
                            MCK_BLOCKED_BY_MAP[contact.contactId] = false;
                            if (!MCK_BLOCKED_TO_MAP[tabId]) {
                                if (w.MCK_OL_MAP[tabId]) {
                                    $mck_tab_status.html(MCK_LABELS['online']);
                                } else if (MCK_LAST_SEEN_AT_MAP[tabId]) {
                                    $mck_tab_status.html(
                                        mckDateUtils.getLastSeenAtStatus(
                                            MCK_LAST_SEEN_AT_MAP[tabId]
                                        )
                                    );
                                }
                                $mck_tab_title.addClass(
                                    'mck-tab-title-w-status'
                                );
                                // $mck_tab_status.removeClass('n-vis').addClass('vis');
                            }
                        }
                    } else if (w.MCK_OL_MAP[tabId]) {
                        $applozic(
                            '#li-user-' + contact.htmlId + ' .mck-ol-status'
                        )
                            .removeClass('n-vis')
                            .addClass('vis');
                    }
                    // events.onUserUnblocked({
                    //     'status': status,
                    //     'userId': userId
                    // });
                } else if (messageType === 'APPLOZIC_18') {
                    IS_MCK_USER_DEACTIVATED = false;
                    // events.onUserActivated();
                } else if (messageType === 'APPLOZIC_19') {
                    IS_MCK_USER_DEACTIVATED = true;
                    // events.onUserDeactivated();
                } else {
                    var message = resp.message;
                    // var userIdArray =
                    // mckMessageLayout.getUserIdFromMessage(message);
                    // mckContactService.getContactDisplayName(userIdArray);
                    // mckMessageLayout.openConversation();
                    if (messageType === 'APPLOZIC_03') {
                        ALStorage.updateLatestMessage(message);
                        if (message.type !== 0 && message.type !== 4) {
                            $applozic(
                                '.' + message.key + ' .mck-message-status'
                            )
                                .removeClass('mck-pending-icon')
                                .addClass('mck-sent-icon');
                            mckMessageLayout.addTooltip(message.key);
                        }
                        // events.onMessageSentUpdate({
                        //     'messageKey': message.key
                        // });
                    } else if (
                        messageType === 'APPLOZIC_01' ||
                        messageType === 'APPLOZIC_02' ||
                        messageType === 'MESSAGE_RECEIVED'
                    ) {
                        ALStorage.updateLatestMessage(message);
                        var contact = message.groupId
                            ? mckGroupUtils.getGroup(message.groupId)
                            : mckMessageLayout.getContact(message.to);
                        var $mck_sidebox_content = $applozic(
                            '#mck-sidebox-content'
                        );
                        var tabId = $mck_message_inner.data('mck-id');
                        if (resp.message.metadata.KM_STATUS) {
                            var groupId = 'li-group-' + resp.message.groupId;
                            var conversationStatus =
                                resp.message.metadata.KM_STATUS;
                            MCK_GROUP_MAP &&
                                MCK_GROUP_MAP[resp.message.groupId] &&
                                (MCK_GROUP_MAP[
                                    resp.message.groupId
                                ].metadata.CONVERSATION_STATUS =
                                    Snap.conversationHelper.status[
                                        conversationStatus.toUpperCase()
                                    ]);
                            CURRENT_GROUP_DATA.tabId = resp.message.groupId;
                            CURRENT_GROUP_DATA.conversationStatus =
                                Snap.conversationHelper.status[
                                    conversationStatus.toUpperCase()
                                ];
                            if (
                                resp.message.metadata.KM_STATUS ===
                                SnapConstants.CONVERSATION_CLOSED_STATUS
                            ) {
                                snapCommons.modifyClassList(
                                    {
                                        id: [groupId],
                                    },
                                    'mck-conversation-resolved',
                                    'mck-conversation-open'
                                );
                            } else if (
                                resp.message.metadata.KM_STATUS ===
                                SnapConstants.CONVERSATION_OPEN_STATUS
                            ) {
                                snapCommons.modifyClassList(
                                    {
                                        id: [groupId],
                                    },
                                    'mck-conversation-open',
                                    'mck-conversation-resolved'
                                );
                            }
                            SnapUI.handleConversationBanner();
                            resp &&
                                resp.message &&
                                SnapUI.handleWaitingQueueMessage();
                        }
                        if (
                            snapCommons.isObject(resp.message) &&
                            resp.message.groupId &&
                            resp.message.groupId == tabId &&
                            resp.message.metadata
                        ) {
                            CURRENT_GROUP_DATA.tabId = resp.message.groupId;
                            if (
                                resp.message.metadata.KM_STATUS ===
                                    SnapConstants.CONVERSATION_CLOSED_STATUS ||
                                resp.message.metadata.KM_STATUS ===
                                    SnapConstants.CONVERSATION_RESOLVED_STATUS
                            ) {
                                if (
                                    MCK_BOT_MESSAGE_DELAY !== 0 &&
                                    mckMessageLayout.isMessageSentByBot(
                                        resp.message,
                                        contact
                                    )
                                ) {
                                    setTimeout(function () {
                                        SnapUI.showClosedConversationBanner(
                                            true
                                        );
                                    }, MCK_BOT_MESSAGE_DELAY);
                                } else {
                                    SnapUI.isConvJustResolved = !!!SnapUI.isConvJustResolved;
                                    SnapUI.showClosedConversationBanner(true);
                                }
                            } else if (
                                resp.message.metadata.KM_STATUS ===
                                SnapConstants.CONVERSATION_OPEN_STATUS
                            ) {
                                SnapUI.showClosedConversationBanner(false);
                            }
                            if (
                                message &&
                                message.metadata &&
                                message.metadata.KM_ASSIGN &&
                                !(
                                    contact &&
                                    contact.metadata &&
                                    contact.metadata.KM_ORIGINAL_TITLE
                                )
                            ) {
                                var getUsersDetailparams = {
                                    cached: false,
                                };
                                getUsersDetailparams.callback = function (
                                    result
                                ) {
                                    if (
                                        result &&
                                        result.data &&
                                        result.data.response &&
                                        result.data.response.length !== 0
                                    ) {
                                        var updatedAssignee =
                                            result.data.response[0];
                                        mckMessageService.updateAssigneeDetails(
                                            updatedAssignee,
                                            tabId
                                        );
                                        if (
                                            updatedAssignee.roleType !=
                                            SnapConstants
                                                .APPLOZIC_USER_ROLE_TYPE.BOT
                                        ) {
                                            CURRENT_GROUP_DATA.CHAR_CHECK = false;
                                            mckGroupLayout.removeWarningsFromTextBox();
                                        } else {
                                            mckGroupLayout.checkBotDetail(
                                                updatedAssignee.userId
                                            );
                                        }
                                    }
                                };
                                mckContactService.getUsersDetail(
                                    [message.metadata.KM_ASSIGN],
                                    getUsersDetailparams
                                );
                            }
                        }
                        if (
                            messageType === 'APPLOZIC_01' ||
                            messageType === 'MESSAGE_RECEIVED'
                        ) {
                            var messageCopy = JSON.parse(
                                JSON.stringify(message)
                            );
                            messageCopy.userOverride = userOverride;
                            Snap.KmEventHandler.onMessageReceived(messageCopy);
                        } else if (messageType === 'APPLOZIC_02') {
                            Snap.KmEventHandler.onMessageSent(message);
                        }
                        if (message.conversationId) {
                            var conversationPxy =
                                MCK_CONVERSATION_MAP[message.conversationId];
                            if (
                                (IS_MCK_TOPIC_HEADER || IS_MCK_TOPIC_BOX) &&
                                (typeof conversationPxy !== 'object' ||
                                    typeof MCK_TOPIC_DETAIL_MAP[
                                        conversationPxy.topicId
                                    ] !== 'object')
                            ) {
                                alMessageService.getTopicId(
                                    {
                                        conversationId: message.conversationId,
                                        messageType: messageType,
                                        message: message,
                                        notifyUser: resp.notifyUser,
                                        async: false,
                                        populate: false,
                                    },
                                    function (params) {
                                        mckMessageLayout.populateMessage(
                                            params.messageType,
                                            params.message,
                                            params.notifyUser
                                        );
                                    }
                                );
                            }
                        }
                        if (typeof contact === 'undefined') {
                            var params = {
                                message: message,
                                messageType: messageType,
                                notifyUser: resp.notifyUser,
                            };

                            if (message.groupId) {
                                mckGroupLayout.getGroupFeedFromMessage(params);
                            } else {
                                var userIdArray = [];
                                userIdArray.push(message.to);
                                mckContactService.getUsersDetail(
                                    userIdArray,
                                    params
                                );
                            }
                            return;
                        }

                        if (message.contentType == 103) {
                            // no nedd to handle  message.type==4 and metadata.MSG_TYPE=="CALL_Rejected AND contnetType 103"
                        } else {
                            var params = {};
                            params.messageType = messageType;
                            params.message = message;
                            params.notifyUser = resp.notifyUser;
                            if (message.to) {
                                mckContactService.getUsersDetail(
                                    [message.to],
                                    params
                                );
                            }
                        }
                    }
                }
            };
        }
    }
})($applozic, window, document);
