/**
 * Add all Snap UI Manipulation in this file.
 *
 */
var snapCommons = new SnapCommons();
SnapUI = {
    awayMessageInfo: {},
    awayMessageScroll: true,
    leadCollectionEnabledOnAwayMessage: false,
    welcomeMessageEnabled: false,
    leadCollectionEnabledOnWelcomeMessage: false,
    anonymousUser: false,
    showResolvedConversations: false,
    isCSATtriggeredByUser: false,
    isConvJustResolved: false,
    faqSVGImage:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><circle class="km-custom-widget-fill" cx="12" cy="12" r="12" fill="#1D50A2" fill-rule="nonzero" opacity=".654"/><g transform="translate(6.545 5.818)"><polygon fill="#FFF" points=".033 2.236 .033 12.057 10.732 12.057 10.732 .02 3.324 .02"/><rect class="km-custom-widget-fill" width="6.433" height="1" x="2.144" y="5.468" fill="#1D50A2" fill-rule="nonzero" opacity=".65" rx=".5"/><rect class="km-custom-widget-fill" width="4.289" height="1" x="2.144" y="8.095" fill="#1D50A2" fill-rule="nonzero" opacity=".65" rx=".5"/><polygon class="km-custom-widget-fill" fill="#1D50A2" points="2.656 .563 3.384 2.487 1.162 3.439" opacity=".65" transform="rotate(26 2.273 2.001)"/></g></g></svg>',
    CONSTS: {},
    updateLeadCollectionStatus: function (err, message, data) {
        SnapUI.awayMessageInfo = {};
        if (
            !err &&
            (message.code == 'SUCCESS' || message.code == 'AGENTS_ONLINE')
        ) {
            SnapUI.leadCollectionEnabledOnAwayMessage =
                message.data.collectEmailOnAwayMessage;
            if (
                message.code != 'AGENTS_ONLINE' &&
                message.data.messageList.length > 0
            ) {
                SnapUI.awayMessageInfo['eventId'] =
                    message.data.messageList[0].eventId;
                SnapUI.awayMessageInfo['isEnabled'] = true;
            }
            SnapUI.leadCollectionEnabledOnWelcomeMessage =
                message.data.collectEmailOnWelcomeMessage;
            SnapUI.welcomeMessageEnabled =
                message.data.welcomeMessageEnabled;
            SnapUI.anonymousUser = message.data.anonymousUser;
            SnapUI.displayLeadCollectionTemplate(data);
        }
    },
    populateAwayMessage: function (err, message) {
        var conversationWindowNotActive = $applozic(
            '#mck-tab-individual'
        ).hasClass('n-vis');
        var closedConversation = $applozic(
            '#mck-conversation-status-box'
        ).hasClass('vis');
        if (
            !err &&
            message.code == 'SUCCESS' &&
            message.data.messageList.length > 0 &&
            !conversationWindowNotActive &&
            !closedConversation
        ) {
            awayMessage = message.data.messageList[0].message;
            awayMessage = snapCommons.formatHtmlTag(awayMessage);
            $applozic('#mck-away-msg').html(awayMessage);
            $applozic('#mck-away-msg').linkify({
                target: '_blank',
            });
            $applozic('#mck-away-msg-box').removeClass('n-vis').addClass('vis');
        } else {
            $applozic('#mck-away-msg-box').removeClass('vis').addClass('n-vis');
        }
        var messageBody = document.querySelectorAll(
            '.mck-message-inner.mck-group-inner'
        )[0];
        if (SnapUI.awayMessageScroll && messageBody) {
            messageBody.scrollTop = messageBody.scrollHeight;
            SnapUI.awayMessageScroll = false;
        }
    },
    showAwayMessage: function () {
        var conversationWindowNotActive = $applozic(
            '#mck-tab-individual'
        ).hasClass('n-vis');
        if (
            SnapUI.awayMessageInfo &&
            SnapUI.awayMessageInfo.isEnabled &&
            !conversationWindowNotActive
        ) {
            $applozic('#mck-email-collection-box')
                .removeClass('vis')
                .addClass('n-vis');
            $applozic('#mck-away-msg-box').removeClass('n-vis').addClass('vis');
        }
    },
    hideAwayMessage: function () {
        // $applozic("#mck-away-msg").html("");
        $applozic('#mck-away-msg-box').removeClass('vis').addClass('n-vis');
    },

    displayLeadCollectionTemplate: function (messageList) {
        var countMsg = 0;
        if (messageList && messageList.length) {
            var countMsg = 0;
            for (var i = 0; i < messageList.length; i++) {
                if (messageList[i].type == 5) {
                    countMsg++;
                    if (countMsg == 2) {
                        break;
                    }
                }
            }
            if (countMsg == 1) {
                if (
                    (SnapUI.leadCollectionEnabledOnAwayMessage &&
                        SnapUI.awayMessageInfo.isEnabled &&
                        SnapUI.awayMessageInfo.eventId == 1) ||
                    (SnapUI.welcomeMessageEnabled &&
                        SnapUI.leadCollectionEnabledOnWelcomeMessage &&
                        SnapUI.anonymousUser)
                ) {
                    this.populateLeadCollectionTemplate();
                    this.hideAwayMessage();
                }
            } else {
                this.hideLeadCollectionTemplate();
            }
        } else if (messageList == null) {
            this.populateLeadCollectionTemplate();
            this.hideAwayMessage();
        }
    },
    displayProgressMeter: function (key, uploadStatus) {
        $applozic('.progress-meter-' + key)
            .removeClass('n-vis')
            .addClass('vis');
        $applozic('.mck-attachment-' + key)
            .next()
            .removeClass('n-vis')
            .addClass('vis');
        $applozic('.mck-attachment-' + key + ' .mck-image-download').addClass(
            'n-vis'
        );
    },
    deleteProgressMeter: function (key, uploadStatus) {
        $applozic('.progress-meter-' + key).remove();
        uploadStatus &&
            $applozic('.mck-attachment-' + key)
                .next()
                .removeClass('vis')
                .addClass('n-vis');
    },
    displayUploadIconForAttachment: function (key, uploadStatus) {
        $applozic('.progress-meter-' + key + ' .km-progress-upload-icon')
            .removeClass('n-vis')
            .addClass('vis');
        $applozic('.progress-meter-' + key + ' .km-progress-stop-upload-icon')
            .removeClass('vis')
            .addClass('n-vis');
        Snap.attachmentEventHandler.progressMeter(100, key);
        !uploadStatus &&
            $applozic('.mck-attachment-' + key)
                .next()
                .removeClass('n-vis')
                .addClass('vis');
    },
    updateImageAttachmentPreview: function (fileMeta, key) {
        var template = $applozic('.mck-attachment-' + key)[0];
        var thumbnailUrl =
            template && template.dataset && template.dataset.thumbnailurl;
        thumbnailUrl &&
            $applozic('.mck-attachment-' + key + ' .file-preview-link').attr(
                'data-url',
                thumbnailUrl
            );
    },
    hideFileBox: function (file, $file_box, $mck_file_upload) {
        if (SnapUI.isAttachmentV2(file.type)) {
            $file_box.removeClass('vis').addClass('n-vis');
            $mck_file_upload.attr('disabled', false);
        } else {
            $file_box.removeClass('n-vis').addClass('vis');
        }
    },
    isAttachmentV2: function (mediaType) {
        if (!mediaType) {
            return true;
            // if attachment has no file type/media type considering as v2 attachment. for example java file doesn't have media type.
        }
        var type = mediaType.substring(0, mediaType.indexOf('/'));
        return KM_ATTACHMENT_V2_SUPPORTED_MIME_TYPES.indexOf(type) != -1;
    },
    updateAttachmentTemplate: function (file_meta, key) {
        var attachment;
        var template = document.querySelector(
            '.mck-message-inner.mck-group-inner'
        );
        template &&
            key &&
            (attachment = template.querySelector('.mck-attachment-' + key));
        if (attachment) {
            file_meta.blobKey &&
                attachment.setAttribute('data-filemetakey', file_meta.blobKey);
            file_meta.name &&
                attachment.setAttribute('data-filename', file_meta.name);
            attachment.setAttribute(
                'data-fileurl',
                file_meta.thumbnailUrl || file_meta.url
            );
            file_meta.size &&
                attachment.setAttribute('data-filesize', file_meta.size);
            attachment.setAttribute(
                'data-filetype',
                file_meta.contentType || file_meta.fileMeta.contentType
            );
            file_meta.url &&
                $applozic('.km-attachment-preview-href-' + key).attr(
                    'href',
                    file_meta.url
                );
        }
    },
    updateAttachmentStopUploadStatus: function (key, status) {
        var template = document.querySelector(
            '.mck-message-inner.mck-group-inner'
        );
        var attachment =
            template && template.querySelector('.mck-attachment-' + key);
        attachment && attachment.setAttribute('data-stopupload', status);
    },
    getAttachmentStopUploadStatus: function (key) {
        var stopUpload = $applozic('.mck-attachment-' + key).attr(
            'data-stopupload'
        );
        stopUpload = stopUpload == 'true' ? true : false;
        return stopUpload;
    },
    populateLeadCollectionTemplate: function () {
        SnapUI.hideAwayMessage();
        $applozic('#mck-email-collection-box')
            .removeClass('n-vis')
            .addClass('vis');
        $applozic('#mck-btn-attach-box').removeClass('vis').addClass('n-vis');
        $applozic('#mck-text-box').blur();
        $applozic('#mck-text-box').attr('data-text', 'Your email ID');
    },
    hideLeadCollectionTemplate: function () {
        $applozic('#mck-email-collection-box')
            .removeClass('vis')
            .addClass('n-vis');
        $applozic('#mck-email-error-alert-box')
            .removeClass('vis')
            .addClass('n-vis');
        $applozic('#mck-btn-attach-box').removeClass('n-vis').addClass('vis');
        $applozic('#mck-text-box').attr(
            'data-text',
            MCK_LABELS['input.message']
        );
    },
    validateEmail: function (sendMsg) {
        var mailformat = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
        if (sendMsg.match(mailformat)) {
            $applozic('#mck-email-error-alert-box')
                .removeClass('vis')
                .addClass('n-vis');
            this.hideLeadCollectionTemplate();
            window.$applozic.fn.applozic('updateUser', {
                data: { email: sendMsg },
            });
            // SnapUI.showAwayMessage();  lead collection feature improvement- [WIP]
            return true;
        } else {
            $applozic('#mck-email-error-alert-box')
                .removeClass('n-vis')
                .addClass('vis');
            $applozic('#mck-email-collection-box')
                .removeClass('vis')
                .addClass('n-vis');
            return false;
        }
    },

    faqEvents: function (data) {
        var mcktimer;

        $applozic(d).on(
            'click',
            '#mck-msg-preview, #mck-msg-preview-visual-indicator .mck-msg-preview-visual-indicator-text',
            function () {
                SnapUI.showChat();
            }
        );

        // On Click of Individual List Items their respective answers will show.
        $applozic(d).on('click', '.km-faq-list', function () {
            $applozic('#km-faqanswer').empty();
            MCK_EVENT_HISTORY[MCK_EVENT_HISTORY.length - 1] !==
                'km-faq-answer-list' &&
                MCK_EVENT_HISTORY.push('km-faq-answer-list');
            var articleId = $(this).attr('data-articleid');
            var source = $(this).attr('data-source');
            SnapKB.getArticle({
                data: {
                    appId: data.appId,
                    articleId: articleId,
                    source: source,
                },
                success: function (response) {
                    var faqDetails = response && response.data;
                    if (
                        faqDetails &&
                        $applozic('#km-faqanswer .km-faqanswer-list').length ==
                            0
                    ) {
                        var faqTitle =
                            faqDetails.title &&
                            snapCommons.formatHtmlTag(faqDetails.title);
                        // FAQ description is already coming in formatted way from the dashboard FAQ editor.
                        $applozic('#km-faqanswer').append(
                            '<div class="km-faqanswer-list km-faqanswerscroll ql-snow"><div class="km-faqquestion">' +
                                faqTitle +
                                '</div> <div class="km-faqanchor km-faqanswer ql-editor">' +
                                faqDetails.body +
                                '</div></div>'
                        );
                        $applozic('#km-contact-search-input-box')
                            .removeClass('vis')
                            .addClass('n-vis');
                        $applozic('#km-faqdiv')
                            .removeClass('vis')
                            .addClass('n-vis');
                        $applozic('#km-faqanswer')
                            .removeClass('n-vis')
                            .addClass('vis');
                        $applozic('#mck-tab-individual')
                            .removeClass('n-vis')
                            .addClass('vis');
                        $applozic('#mck-tab-conversation')
                            .removeClass('vis')
                            .addClass('n-vis');
                        $applozic('#mck-no-conversations')
                            .removeClass('vis')
                            .addClass('n-vis');
                        $applozic('#km-faqanswer .km-faqanswer').linkify({
                            target: '_blank',
                        });
                    }
                },
                error: function (error) {
                    throw new Error('Error while fetching faq details', error);
                },
            });
            $applozic('.km-contact-input-container')
                .removeClass('vis')
                .addClass('n-vis');
        });

        // On Click of FAQ button the FAQ List will open.
        $applozic(d).on('click', '#km-faq', function () {
            MCK_MAINTAIN_ACTIVE_CONVERSATION_STATE &&
                SnapUtils.removeItemFromLocalStorage(
                    'mckActiveConversationInfo'
                );
            SnapUI.showHeader();
            SnapUI.awayMessageScroll = true;
            MCK_EVENT_HISTORY[MCK_EVENT_HISTORY.length - 1] !== 'km-faq-list' &&
                MCK_EVENT_HISTORY.push('km-faq-list');
            MCK_BOT_MESSAGE_QUEUE = [];
            $applozic('#km-contact-search-input-box')
                .removeClass('n-vis')
                .addClass('vis');
            $applozic('#km-faq').removeClass('vis').addClass('n-vis');
            $applozic('#mck-no-conversations')
                .removeClass('vis')
                .addClass('n-vis');
            $applozic('.faq-common').removeClass('n-vis').addClass('vis');
            $applozic('.mck-conversation ')
                .removeClass('vis')
                .addClass('n-vis');
            $applozic('#km-faqdiv').removeClass('n-vis').addClass('vis');
            $applozic('.mck-conversation-back-btn')
                .removeClass('n-vis')
                .addClass('vis');
            $applozic('#mck-tab-title')
                .html('FAQ')
                .removeClass('n-vis')
                .addClass('vis');
            $applozic('#mck-away-msg-box').addClass('n-vis').removeClass('vis');
            $applozic('#mck-sidebox-ft').addClass('n-vis').removeClass('vis');
            $applozic('#mck-contacts-content')
                .addClass('n-vis')
                .removeClass('vis');
            $applozic('#mck-msg-new').attr('disabled', false);
            $applozic('.km-contact-input-container')
                .removeClass('n-vis')
                .addClass('vis');
            $applozic('.mck-agent-image-container')
                .removeClass('vis')
                .addClass('n-vis');
            $applozic('.mck-agent-status-text')
                .removeClass('vis')
                .addClass('n-vis');
            $applozic(
                '#mck-tab-individual .mck-tab-link.mck-back-btn-container'
            )
                .removeClass('n-vis')
                .addClass('vis-table');
            $applozic(
                '#mck-tab-individual .mck-name-status-container.mck-box-title'
            ).removeClass('padding');
            snapCommons.modifyClassList(
                {
                    id: ['km-widget-options'],
                },
                'n-vis'
            );
            SnapUI.checkSingleThreadedConversationSettings(true);
        });

        $applozic(d).on('click', '#km-faqanswer a', function (e) {
            e.preventDefault();
            window.open(e.target.href);
        });
        $applozic('#km-faq-search-input').keyup(function (e) {
            var searchQuery = e.target.value;
            if (searchQuery.length > 0) {
                $applozic('.km-clear-faq-search-icon')
                    .addClass('vis')
                    .removeClass('n-vis');
            } else {
                $applozic('.km-clear-faq-search-icon')
                    .addClass('n-vis')
                    .removeClass('vis');
            }
            if (e.which == 32 || e.which == 13) {
                SnapUI.searchFaqs(data);
                return;
            }
            clearTimeout(mcktimer);
            mcktimer = setTimeout(function validate() {
                SnapUI.searchFaqs(data);
            }, 500);
        });

        $applozic(d).on('click', '.km-clear-faq-search-icon', function () {
            $applozic('#km-faq-search-input').val('');
            $applozic('.km-clear-faq-search-icon')
                .addClass('n-vis')
                .removeClass('vis');
            // this is being used to simulate an Enter Key Press on the search input.
            var e = jQuery.Event('keyup');
            e.which = 13;
            $applozic('#km-faq-search-input').trigger(e);
        });

        $applozic(d).on('click', '#mck-conversation-back-btn', function () {
            $applozic('.km-contact-input-container')
                .removeClass('vis')
                .addClass('n-vis');
            MCK_MAINTAIN_ACTIVE_CONVERSATION_STATE &&
                SnapUtils.removeItemFromLocalStorage(
                    'mckActiveConversationInfo'
                );
            SnapUI.awayMessageScroll = true;
            SnapUI.hideAwayMessage();
            SnapUI.hideLeadCollectionTemplate();
            snapCommons.modifyClassList(
                {
                    id: ['km-widget-options'],
                },
                'n-vis'
            );
            MCK_BOT_MESSAGE_QUEUE = [];
            if (MCK_EVENT_HISTORY.length >= 2) {
                if (
                    MCK_EVENT_HISTORY[MCK_EVENT_HISTORY.length - 2] ==
                    'km-faq-list'
                ) {
                    SnapUI.showHeader();
                    $applozic('#km-faqdiv')
                        .removeClass('n-vis')
                        .addClass('vis');
                    $applozic('#km-faqanswer')
                        .removeClass('vis')
                        .addClass('n-vis');
                    $applozic('.km-no-results-found-container')
                        .addClass('n-vis')
                        .removeClass('vis');
                    $applozic('#km-contact-search-input-box')
                        .removeClass('n-vis')
                        .addClass('vis');
                    $applozic('#mck-msg-new').attr('disabled', false);
                    $applozic('.km-contact-input-container')
                        .removeClass('n-vis')
                        .addClass('vis');
                    MCK_EVENT_HISTORY.splice(MCK_EVENT_HISTORY.length - 1, 1);
                    return;
                } else if (
                    typeof MCK_EVENT_HISTORY[MCK_EVENT_HISTORY.length - 2] ==
                    'object'
                ) {
                    $applozic('.mck-conversation ')
                        .removeClass('n-vis')
                        .addClass('vis');
                    $applozic('#mck-tab-conversation')
                        .removeClass('n-vis')
                        .addClass('vis');
                    $applozic('#km-faqdiv')
                        .removeClass('vis')
                        .addClass('n-vis');
                    $applozic('.km-no-results-found-container')
                        .addClass('n-vis')
                        .removeClass('vis');
                    $applozic('#km-faqanswer')
                        .removeClass('vis')
                        .addClass('n-vis');
                    $applozic('#km-contact-search-input-box')
                        .removeClass('vis')
                        .addClass('n-vis');
                    $applozic('#km-faq').removeClass('n-vis').addClass('vis');
                    $applozic('.km-talk-to-human-div')
                        .addClass('n-vis')
                        .removeClass('vis');
                    $applozic('.mck-agent-image-container')
                        .removeClass('n-vis')
                        .addClass('vis');
                    $applozic('.mck-agent-status-text')
                        .removeClass('n-vis')
                        .addClass('vis');
                    var elem = MCK_EVENT_HISTORY[MCK_EVENT_HISTORY.length - 2];
                    $applozic.fn.applozic('openChat', elem);
                    MCK_EVENT_HISTORY.splice(MCK_EVENT_HISTORY.length - 1, 1);
                    SnapUI.activateTypingField();
                    return;
                } else {
                    $applozic('#km-faq').removeClass('n-vis').addClass('vis');
                    $applozic('#mck-msg-new').attr('disabled', false);
                    MCK_EVENT_HISTORY.splice(MCK_EVENT_HISTORY.length - 1, 1);
                    MCK_EVENT_HISTORY.length = 0;
                    return;
                }
            } else {
                $applozic('.mck-conversation ')
                    .removeClass('n-vis')
                    .addClass('vis');
                $applozic('#km-faqdiv').removeClass('vis').addClass('n-vis');
                $applozic('#km-faqanswer').removeClass('vis').addClass('n-vis');
                $applozic('.km-no-results-found-container')
                    .addClass('n-vis')
                    .removeClass('vis');
                $applozic('#km-contact-search-input-box')
                    .removeClass('vis')
                    .addClass('n-vis');
                $applozic('.km-talk-to-human-div')
                    .addClass('n-vis')
                    .removeClass('vis');
                $applozic('#km-faq').removeClass('n-vis').addClass('vis');
                $applozic('#mck-msg-new').attr('disabled', false);
                $applozic('.mck-agent-status-text')
                    .removeClass('vis')
                    .addClass('n-vis');
                $applozic('.mck-agent-image-container')
                    .removeClass('vis')
                    .addClass('n-vis');
                $applozic(
                    '.mck-agent-image-container .mck-agent-status-indicator'
                )
                    .removeClass('vis')
                    .addClass('n-vis');
                snapCommons.modifyClassList(
                    { class: ['mck-rating-box'] },
                    '',
                    'selected'
                );
                snapCommons.modifyClassList(
                    { id: ['mck-rate-conversation'] },
                    '',
                    'n-vis'
                );
                document.getElementById('mck-tab-title').textContent = '';
                MCK_EVENT_HISTORY.length = 0;
                SnapUI.handleConversationBanner();
                return;
            }
        });
    },
    searchFaqUI: function (response) {
        if (
            response.data &&
            response.data.length === 0 &&
            $applozic('.km-no-results-found-container').hasClass('n-vis')
        ) {
            snapCommons.modifyClassList(
                {
                    class: [
                        'km-no-results-found-container',
                        'km-talk-to-human-div',
                    ],
                },
                'vis',
                'n-vis'
            );
            document.querySelector('.km-talk-to-human-div p').innerHTML =
                MCK_LABELS['no-faq-found'];
        } else {
            snapCommons.modifyClassList(
                {
                    class: ['km-no-results-found-container'],
                },
                'n-vis',
                'vis'
            );
            document.querySelector('.km-talk-to-human-div p').innerHTML =
                MCK_LABELS['looking.for.something.else'];
            snapCommons.modifyClassList(
                {
                    class: ['km-talk-to-human-div'],
                },
                'vis',
                'n-vis'
            );
        }
        document.getElementById('km-faq-list-container').innerHTML = '';
        $applozic.each(response.data, function (i, faq) {
            var id = faq.id || faq.articleId;
            var title = faq.name || faq.title;
            title = title && snapCommons.formatHtmlTag(title);
            document.getElementById('km-faq-list-container').innerHTML +=
                '<li class="km-faq-list"  data-articleId="' +
                id +
                '"><a class="km-faqdisplay"> <div class="km-faqimage">' +
                SnapUI.faqSVGImage +
                '</div><div class="km-faqanchor">' +
                title +
                '</div></a></li>';
        });
    },
    searchFaqs: function (data) {
        if (!document.getElementById('km-faq-search-input').value) {
            SnapKB.getArticles({
                data: {
                    appId: data.appId,
                    query: document.getElementById('km-faq-search-input').value,
                },
                success: function (response) {
                    SnapUI.searchFaqUI(response);
                },
                error: function () {
                    console.log('error while searching faq', err);
                },
            });
        } else {
            SnapKB.searchFaqs({
                data: {
                    appId: data.appId,
                    query: document.getElementById('km-faq-search-input').value,
                },
                success: function (response) {
                    SnapUI.searchFaqUI(response);
                },
                error: function (err) {
                    console.log('error while searching faq', err);
                },
            });
        }
    },
    hideFaq: function () {
        $applozic('#km-contact-search-input-box')
            .removeClass('vis')
            .addClass('n-vis');
        $applozic('.km-faqdiv').removeClass('vis').addClass('n-vis');
        $applozic('#mck-msg-new').attr('disabled', false);
    },
    hideMessagePreview: function () {
        $applozic('#mck-msg-preview-visual-indicator')
            .removeClass('vis')
            .addClass('n-vis');
        $applozic(
            '#mck-msg-preview-visual-indicator .mck-msg-preview-visual-indicator-text'
        ).html('');
    },

    showChat: function () {
        snapCommons.setWidgetStateOpen(true);
        $applozic('.faq-common').removeClass('vis').addClass('n-vis');
        $applozic('.mck-conversation').removeClass('n-vis').addClass('vis');
        $applozic('#km-faq').removeClass('n-vis').addClass('vis');
        $applozic('#mck-msg-new').attr('disabled', false);
        if (
            $applozic(
                "#mck-message-cell .mck-message-inner div[name='message']"
            ).length === 0 &&
            isFirstLaunch == true
        ) {
            isFirstLaunch = false;
        } else {
            $applozic(
                '#mck-tab-individual .mck-tab-link.mck-back-btn-container'
            ).removeClass('n-vis');
            $applozic(
                '#mck-tab-individual .mck-name-status-container.mck-box-title'
            ).removeClass('padding');
        }
    },
    showHeader: function () {
        $applozic('#mck-tab-individual').removeClass('n-vis').addClass('vis');
        $applozic('#mck-tab-conversation').removeClass('vis').addClass('n-vis');
        $applozic('#mck-msg-new').attr('disabled', false);
    },

    sendFaqQueryAsMsg: function (groupId) {
        var messageInput = $applozic('#km-faq-search-input').val();
        var msgTemplate =
            MCK_LABELS['faq.query.message'].QUERY_REGARDING +
            ' \n"' +
            messageInput +
            '"\n\n' +
            MCK_LABELS['faq.query.message'].HELP_YOU;
        if (messageInput !== '') {
            var messagePxy = {
                groupId: groupId,
                type: 5,
                contentType: 0,
                message: msgTemplate,
            };
            // Snap.sendMessage(messagePxy);
            $applozic.fn.applozic('sendGroupMessage', messagePxy);
        } else {
            return;
        }
    },
    activateTypingField: function () {
        !snapCommons.checkIfDeviceIsHandheld() &&
            $applozic('#mck-text-box').focus();
    },
    setAvailabilityStatus: function (status) {
        $applozic('.mck-agent-image-container')
            .removeClass('n-vis')
            .addClass('vis');
        $applozic('.mck-agent-image-container .mck-agent-status-indicator')
            .removeClass('mck-status--online')
            .removeClass('mck-status--offline')
            .removeClass('mck-status--away')
            .removeClass('n-vis')
            .addClass('vis mck-status--' + status);
        $applozic('#mck-agent-status-text')
            .text(MCK_LABELS[status])
            .addClass('vis')
            .removeClass('n-vis');
    },
    toggleVoiceOutputOverride: function (voiceOutput) {
        if (voiceOutput) {
            snapCommons.modifyClassList(
                { id: ['user-overide-voice-output-svg-off'] },
                'n-vis'
            );
            snapCommons.modifyClassList(
                { id: ['user-overide-voice-output-svg-on'] },
                '',
                'n-vis'
            );
            document.getElementById(
                'user-overide-voice-output-text'
            ).innerText =
                MCK_LABELS[
                    'conversation.header.dropdown'
                ].USER_OVERIDE_VOICE_OUTPUT_OFF;
        } else {
            snapCommons.modifyClassList(
                { id: ['user-overide-voice-output-svg-on'] },
                'n-vis'
            );
            snapCommons.modifyClassList(
                { id: ['user-overide-voice-output-svg-off'] },
                '',
                'n-vis'
            );
            document.getElementById(
                'user-overide-voice-output-text'
            ).innerText =
                MCK_LABELS[
                    'conversation.header.dropdown'
                ].USER_OVERIDE_VOICE_OUTPUT_ON;
        }
    },
    triggerCSAT: function () {
        var isCSATenabled = snap._globals.collectFeedback;
        if (!SnapUI.isConvJustResolved) {
            SnapUI.isCSATtriggeredByUser = true;
        }

        if (isCSATenabled) {
            document.getElementById('mck-submit-comment').disabled = false;
            snapCommons.modifyClassList(
                { class: ['mck-rating-box'] },
                '',
                'selected'
            );
            snapCommons.modifyClassList(
                {
                    class: ['mck-box-form'],
                },
                'n-vis',
                'vis'
            );
            snapCommons.modifyClassList(
                {
                    id: ['mck-sidebox-ft'],
                },
                'km-mid-conv-csat'
            );
            snapCommons.modifyClassList(
                {
                    id: ['csat-1'],
                },
                'vis',
                'n-vis'
            );
            SnapUI.isConvJustResolved = false;
        }
    },
    showClosedConversationBanner: function (isConversationClosed) {
        var messageText = MCK_LABELS['closed.conversation.message'];
        var conversationStatusDiv = document.getElementById(
            'mck-conversation-status-box'
        );
        var isCSATenabled = snap._globals.collectFeedback;
        var isCSATtriggeredByUser = SnapUI.isCSATtriggeredByUser;
        var isConvJustResolved = SnapUI.isConvJustResolved;
        var $mck_msg_inner = $applozic('#mck-message-cell .mck-message-inner');
        isConversationClosed &&
            snapCommons.modifyClassList(
                {
                    class: ['mck-box-form'],
                },
                'n-vis'
            );
        if (
            isCSATenabled &&
            isConversationClosed &&
            !snapCommons.isConversationClosedByBot() &&
            !isCSATtriggeredByUser &&
            !isConvJustResolved
        ) {
            mckUtils.ajax({
                type: 'GET',
                url:
                    Snap.getBaseUrl() +
                    '/feedback' +
                    '/' +
                    CURRENT_GROUP_DATA.tabId,
                global: false,
                contentType: 'application/json',
                success: function (data) {
                    var feedback = data.data;
                    CURRENT_GROUP_DATA.currentGroupFeedback = feedback;
                    snapCommons.modifyClassList(
                        {
                            class: ['mck-box-form'],
                        },
                        'n-vis'
                    );
                    snapCommons.modifyClassList(
                        {
                            class: ['mck-csat-text-1'],
                        },
                        '',
                        'n-vis'
                    );
                    snapCommons.modifyClassList(
                        {
                            id: ['mck-sidebox-ft'],
                        },
                        'mck-closed-conv-banner'
                    );
                    snapCommons.modifyClassList(
                        {
                            id: ['csat-1', 'csat-2', 'csat-3'],
                        },
                        'n-vis'
                    );
                    snapCommons.modifyClassList(
                        {
                            id: ['km-widget-options'],
                        },
                        'n-vis'
                    );
                    /*
                csat-1 : csat rating first screen where you can rate via emoticons.
                csat-2 : csat rating second screen where you can add comments.
                csat-3 : csat result screen where you show overall feedback.
                */
                    if (!feedback) {
                        // no rating given after conversation is resolved
                        snapCommons.modifyClassList(
                            {
                                id: ['csat-1'],
                            },
                            '',
                            'n-vis'
                        );
                        document.getElementById(
                            'mck-submit-comment'
                        ).disabled = false;
                    }
                    $mck_msg_inner.animate(
                        {
                            scrollTop: $mck_msg_inner.prop('scrollHeight'),
                        },
                        0
                    );
                },
                error: function (err) {
                    console.log('Error fetching feedback', err);
                },
            });
        } else if (
            isConversationClosed &&
            SnapUI.isCSATtriggeredByUser
        ) {
            SnapUI.isCSATtriggeredByUser = false;
            snapCommons.modifyClassList(
                {
                    id: ['csat-1', 'csat-2', 'csat-3', 'mck-rated'],
                },
                'n-vis',
                ''
            );
            snapCommons.modifyClassList(
                {
                    id: ['mck-sidebox-ft'],
                },
                '',
                'km-mid-conv-csat'
            );
            snapCommons.modifyClassList(
                {
                    id: ['mck-conversation-status-box'],
                },
                'n-vis',
                'vis'
            );
            snapCommons.modifyClassList(
                {
                    class: ['mck-box-form'],
                },
                '',
                'n-vis'
            );
            snapCommons.modifyClassList(
                {
                    class: ['mck-csat-text-1'],
                },
                'n-vis'
            );
        } else if (isConversationClosed && SnapUI.isConvJustResolved) {
            SnapUI.triggerCSAT();
        } else if (isConversationClosed) {
            conversationStatusDiv &&
                (conversationStatusDiv.innerHTML = messageText);
            snapCommons.modifyClassList(
                {
                    id: ['mck-sidebox-ft'],
                },
                'mck-closed-conv-banner'
            );
            snapCommons.modifyClassList(
                {
                    id: ['mck-conversation-status-box'],
                },
                'vis',
                'n-vis'
            );
            snapCommons.modifyClassList(
                {
                    class: ['mck-box-form'],
                },
                '',
                'n-vis'
            );
            snapCommons.modifyClassList(
                {
                    id: ['km-widget-options'],
                },
                'n-vis'
            );
        } else {
            snapCommons.modifyClassList(
                {
                    id: ['csat-1', 'csat-2', 'csat-3', 'mck-rated'],
                },
                'n-vis',
                ''
            );
            snapCommons.modifyClassList(
                {
                    id: ['mck-sidebox-ft'],
                },
                '',
                'mck-closed-conv-banner'
            );
            snapCommons.modifyClassList(
                {
                    id: ['mck-sidebox-ft'],
                },
                '',
                'km-mid-conv-csat'
            );
            snapCommons.modifyClassList(
                {
                    id: ['mck-conversation-status-box'],
                },
                'n-vis',
                'vis'
            );
            snapCommons.modifyClassList(
                {
                    class: ['mck-box-form'],
                },
                '',
                'n-vis'
            );
            snapCommons.modifyClassList(
                {
                    class: ['mck-csat-text-1'],
                },
                'n-vis'
            );
        }
    },
    handleAttachmentIconVisibility: function (
        enableAttachment,
        msg,
        groupReloaded
    ) {
        if (
            !groupReloaded &&
            typeof msg.metadata === 'object' &&
            msg.metadata.KM_ENABLE_ATTACHMENT
        ) {
            msg.metadata.KM_ENABLE_ATTACHMENT == 'true' &&
                snapCommons.modifyClassList(
                    { id: ['mck-attachfile-box', 'mck-file-up'] },
                    'vis',
                    'n-vis'
                );
            msg.metadata.KM_ENABLE_ATTACHMENT == 'false' &&
                snapCommons.modifyClassList(
                    { id: ['mck-attachfile-box', 'mck-file-up'] },
                    'n-vis',
                    'vis'
                );
        } else if (groupReloaded && enableAttachment) {
            enableAttachment == 'true' &&
                snapCommons.modifyClassList(
                    { id: ['mck-attachfile-box', 'mck-file-up'] },
                    'vis',
                    'n-vis'
                );
            enableAttachment == 'false' &&
                snapCommons.modifyClassList(
                    { id: ['mck-attachfile-box', 'mck-file-up'] },
                    'n-vis',
                    'vis'
                );
        }
    },
    displayPopupChatTemplate: function (
        popupChatContent,
        chatWidget,
        mckChatPopupNotificationTone
    ) {
        var enableGreetingMessage =
            snapCommons.isObject(chatWidget) &&
            chatWidget.hasOwnProperty('enableGreetingMessageInMobile')
                ? chatWidget.enableGreetingMessageInMobile
                : true;
        var isPopupEnabled =
            snapCommons.isObject(chatWidget) &&
            chatWidget.popup &&
            (snapCommons.checkIfDeviceIsHandheld()
                ? enableGreetingMessage
                : true);
        var delay =
            popupChatContent && popupChatContent.length
                ? popupChatContent[0].delay
                : -1;
        var popupTemplateKey =
            (popupChatContent &&
                popupChatContent.length &&
                popupChatContent[0].templateKey) ||
            SnapConstants.CHAT_POPUP_TEMPLATE.HORIZONTAL;
        if (isPopupEnabled && delay > -1) {
            MCK_CHAT_POPUP_TEMPLATE_TIMER = setTimeout(function () {
                SnapUI.togglePopupChatTemplate(
                    popupTemplateKey,
                    true,
                    mckChatPopupNotificationTone
                );
            }, delay);
        }
    },
    togglePopupChatTemplate: function (
        popupTemplateKey,
        showTemplate,
        mckChatPopupNotificationTone
    ) {
        var snapIframe = parent.document.getElementById(
            'snap-widget-iframe'
        );
        var playPopupTone = SnapUtils.getDataFromKmSession(
            'playPopupNotificationTone'
        );

        if (showTemplate && !snapCommons.isWidgetOpen()) {
            if (playPopupTone == null || playPopupTone) {
                mckChatPopupNotificationTone &&
                    mckChatPopupNotificationTone.play();
                SnapUtils.storeDataIntoKmSession(
                    'playPopupNotificationTone',
                    false
                );
            }

            popupTemplateKey ===
                SnapConstants.CHAT_POPUP_TEMPLATE.HORIZONTAL &&
                snapCommons.modifyClassList(
                    { id: ['mck-sidebox-launcher', 'launcher-svg-container'] },
                    'km-no-box-shadow',
                    ''
                );
            popupTemplateKey ===
            SnapConstants.CHAT_POPUP_TEMPLATE.HORIZONTAL
                ? snapIframe.classList.add(
                      'chat-popup-widget-horizontal'
                  )
                : snapIframe.classList.add('chat-popup-widget-vertical');
            snapCommons.modifyClassList(
                { id: ['launcher-svg-container'] },
                'km-animate',
                ''
            );
            snapCommons.modifyClassList(
                { id: ['chat-popup-widget-container'] },
                'km-animate',
                'n-vis'
            );
            if(snapIframe.classList.contains("chat-popup-widget-vertical")){
                var heightOfPopup = document.getElementById("chat-popup-widget-container").offsetHeight + 15;
                var css = 'iframe#snap-widget-iframe.chat-popup-widget-vertical { height:'+ heightOfPopup +'px!important;}';
                parent.document.querySelector("style#snap-style-sheet").innerText += css;
            };
            var WIDGET_POSITION =
                snap &&
                snap._globals &&
                snap._globals.widgetSettings &&
                snap._globals.widgetSettings.hasOwnProperty('position')
                    ? snap._globals.widgetSettings.position
                    : SnapConstants.POSITION.RIGHT;
            WIDGET_POSITION === SnapConstants.POSITION.LEFT &&
                snapCommons.modifyClassList(
                    {
                        class: [
                            'chat-popup-widget-close-btn-container',
                            'chat-popup-widget-container--vertical',
                            'chat-popup-widget-text-wrapper',
                            'chat-popup-widget-container--horizontal',
                        ],
                    },
                    'align-left'
                );
        } else {
            snapCommons.modifyClassList(
                { id: ['mck-sidebox-launcher', 'launcher-svg-container'] },
                '',
                'km-no-box-shadow'
            );
            snapCommons.modifyClassList(
                { id: ['launcher-svg-container'] },
                '',
                'km-animate'
            );
            snapIframe &&
                snapIframe.classList.remove(
                    'chat-popup-widget-horizontal'
                );
            snapIframe &&
                snapIframe.classList.remove(
                    'chat-popup-widget-vertical'
                );
            snapCommons.modifyClassList(
                { id: ['chat-popup-widget-container'] },
                'n-vis',
                'km-animate'
            );
        }
    },
    handleConversationBanner: function (showBanner) {
        var totalConversations =
            document.querySelectorAll('ul#mck-contact-list li') &&
            document.querySelectorAll('ul#mck-contact-list li').length;
        var showAllBannerHtml = '<div id="mck-conversation-filter"><span id="mck-conversation-banner-heading">'
            .concat(
                MCK_LABELS['filter.conversation.list'].ACTIVE_CONVERSATIONS,
                '</span><span id="mck-conversation-banner-action" onclick="SnapUI.toggleShowResolvedConversationsStatus(),SnapUI.handleResolvedConversationsList()">'
            )
            .concat(
                MCK_LABELS['filter.conversation.list'].HIDE_RESOLVED,
                '</span></div>'
            );
        var resolvedConversations =
            document.getElementsByClassName('mck-conversation-resolved') &&
            document.getElementsByClassName('mck-conversation-resolved').length;
        var openConversations =
            document.getElementsByClassName('mck-conversation-open') &&
            document.getElementsByClassName('mck-conversation-open').length;
        var bannerParent = document.querySelector(
            '.mck-conversation.vis .mck-message-inner'
        );
        var conversationFilterBanner = document.getElementById(
            'mck-conversation-filter'
        );
        if (
            totalConversations !== openConversations &&
            totalConversations !== resolvedConversations &&
            !conversationFilterBanner &&
            bannerParent
        ) {
            bannerParent.insertAdjacentHTML('afterbegin', showAllBannerHtml);
        } else if (totalConversations === resolvedConversations) {
            conversationFilterBanner &&
                conversationFilterBanner.parentNode.removeChild(
                    conversationFilterBanner
                );
            SnapUI.showResolvedConversations = true;
        } else if (
            conversationFilterBanner &&
            totalConversations == openConversations
        ) {
            conversationFilterBanner &&
                conversationFilterBanner.parentNode.removeChild(
                    conversationFilterBanner
                );
            SnapUI.showResolvedConversations = false;
        }
        SnapUI.handleResolvedConversationsList();
    },
    toggleShowResolvedConversationsStatus: function () {
        SnapUI.showResolvedConversations = !SnapUI.showResolvedConversations;
    },
    handleResolvedConversationsList: function () {
        var bannerHeading = document.getElementById(
            'mck-conversation-banner-heading'
        );
        var bannerAction = document.getElementById(
            'mck-conversation-banner-action'
        );
        if (SnapUI.showResolvedConversations) {
            snapCommons.modifyClassList(
                { class: ['mck-conversation-resolved'] },
                'mck-show-resolved-conversation'
            );
            bannerHeading &&
                (bannerHeading.innerHTML =
                    MCK_LABELS['filter.conversation.list'].ALL_CONVERSATIONS);
            bannerAction &&
                (bannerAction.innerHTML =
                    MCK_LABELS['filter.conversation.list'].HIDE_RESOLVED);
        } else {
            snapCommons.modifyClassList(
                { class: ['mck-conversation-resolved'] },
                '',
                'mck-show-resolved-conversation'
            );
            bannerHeading &&
                (bannerHeading.innerHTML =
                    MCK_LABELS[
                        'filter.conversation.list'
                    ].ACTIVE_CONVERSATIONS);
            bannerAction &&
                (bannerAction.innerHTML =
                    MCK_LABELS['filter.conversation.list'].SHOW_RESOLVED);
        }
    },
    adjustConversationTitleHeadingWidth: function (isPopupWidgetEnabled) {
        var titleClassName = 'mck-title-width-wo-faq-with-close-btn';
        var mckTabTitle = document.getElementById('mck-tab-title');
        mckTabTitle.classList.remove(titleClassName);
        if (
            document.querySelector('.km-kb-container').classList.contains('vis')
        ) {
            titleClassName = isPopupWidgetEnabled
                ? 'mck-title-width-with-faq'
                : 'mck-title-width-with-faq-close-btn';
        }
        mckTabTitle.classList.add(titleClassName);
    },
    checkSingleThreadedConversationSettings: function (
        hasMultipleConversations
    ) {
        if (
            snapCommons.isObject(snap._globals.widgetSettings) &&
            snap._globals.widgetSettings.isSingleThreaded
        ) {
            var startConversationButton = document.getElementById(
                'mck-contacts-content'
            );
            var backButton = document.querySelector('.mck-back-btn-container');
            startConversationButton.classList.add('force-n-vis');
            hasMultipleConversations
                ? backButton.classList.remove('force-n-vis')
                : backButton.classList.add('force-n-vis');
        }
    },
        handleWaitingQueueMessage: function () {
            var group = CURRENT_GROUP_DATA;
            var groupId = group && group.tabId;
            var waitingStatus = group && group.conversationStatus == Snap.conversationHelper.status.WAITING;
            window.Applozic.ALApiService.ajax({
                type: 'GET',
                url: MCK_BASE_URL + '/rest/ws/group/waiting/list',
                global: false,
                contentType: 'application/json',
                success: function (res) {
                    if (res.status === "success") {
                        WAITING_QUEUE = res.response;
                        var isGroupPresentInWaitingQueue = WAITING_QUEUE.indexOf(parseInt(groupId))>-1;
                        // var waitingQueueNumber = document.getElementById('waiting-queue-number');
                        if (waitingStatus && isGroupPresentInWaitingQueue && WAITING_QUEUE.length) {
                            // waitingQueueNumber.innerHTML = "#" + parseInt(WAITING_QUEUE.indexOf(parseInt(groupId)) + 1);
                            snapCommons.modifyClassList({
                                id: ["mck-waiting-queue"]
                            }, "vis", "n-vis");
                        } else {
                            snapCommons.modifyClassList({
                                id: ["mck-waiting-queue"]
                            }, "n-vis", "vis");
                        }
                    }
                },
            error: function (err) {
                throw new Error('Error while fetching waiting list', err);
            },
        });
    },
};
