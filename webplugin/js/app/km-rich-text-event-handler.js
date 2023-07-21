/**
 * Attach all event listeners.
 */
var messageCellQuickReplySelector = '#mck-message-cell, #quick-reply-container';

Snap.attachEvents = function ($applozic) {
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-increment-guest-count',
        Snap.richMsgEventHandler.incrementGuestCount
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-decrement-guest-count',
        Snap.richMsgEventHandler.decrementGuestCount
    ); //
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-btn-add-more-rooms',
        Snap.richMsgEventHandler.addMoreRoom
    ); //
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-done-button',
        Snap.richMsgEventHandler.processSelectedRoom
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-card-message-footer-button',
        Snap.richMsgEventHandler.processHotelBookClick
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.mck-form-submit-button',
        Snap.richMsgEventHandler.handleFormSubmit
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-cta-button',
        Snap.richMsgEventHandler.handleRichButtonClick
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-submit-person-detail',
        Snap.richMsgEventHandler.handlleSubmitPersonDetail
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-block-room-button',
        Snap.richMsgEventHandler.processBookRoomClick
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-quick-replies',
        Snap.richMsgEventHandler.processQuickReplies
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-list-item-handler',
        Snap.richMsgEventHandler.processClickOnListItem
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-list-button-item-handler',
        Snap.richMsgEventHandler.processClickOnButtonItem
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-faq-dialog-button',
        Snap.richMsgEventHandler.processClickOnDialogButton
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-progress-meter-container',
        Snap.attachmentEventHandler.manageUploadAttachment
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-link-button',
        Snap.richMsgEventHandler.handleLinkButtonClick
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-attachment-icon',
        Snap.attachmentEventHandler.handleSendingAttachment
    );
    $applozic(messageCellQuickReplySelector).on(
        'touchstart click',
        '.email',
        Snap.richMsgEventHandler.handleEmail
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.km-link-button',
        Snap.richMsgEventHandler.formUserBehaviorInfo
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.quick-reply-checkbox',
        Snap.richMsgEventHandler.changeCheckbox
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.map-button',
        Snap.richMsgEventHandler.showMapBox
    );
    $applozic(messageCellQuickReplySelector).on(
        'click',
        '.filters-button',
        Snap.richMsgEventHandler.showFilters
    );
};

/**
 * define your event listeners.
 */
Snap.attachmentEventHandler = {
    manageUploadAttachment: function (e) {
        var stopUploadIconHidden = $applozic(e.target)
            .closest('.km-msg-box-attachment')
            .find('.km-progress-stop-upload-icon')
            .hasClass('n-vis');
        var uploadIconHidden = $applozic(e.target)
            .closest('.km-msg-box-attachment')
            .find('.km-progress-upload-icon')
            .hasClass('n-vis');
        var attachmentDiv = $applozic(e.target)
            .closest('.km-msg-box-attachment')
            .children();
        var msgkey = attachmentDiv[0].dataset.msgkey;
        var deliveryStatusDiv = $applozic(e.target)
            .closest('.mck-clear')
            .find('.mck-msg-right-muted');
        var fileMetaKey = attachmentDiv[0].dataset.filemetakey;
        var file = KM_PENDING_ATTACHMENT_FILE[msgkey];
        SnapUI.updateAttachmentStopUploadStatus(msgkey, true);
        if (Snap.internetStatus) {
            if (!stopUploadIconHidden && uploadIconHidden) {
                Snap.attachmentEventHandler.progressMeter(100, msgkey);
                $applozic('.km-progress-stop-upload-icon-' + msgkey)
                    .removeClass('vis')
                    .addClass('n-vis');
                $applozic('.km-progress-upload-icon-' + msgkey)
                    .removeClass('n-vis')
                    .addClass('vis');
                Snap.attachmentEventHandler.progressMeter(100, msgkey);
                $applozic('.mck-timestamp-' + msgkey)
                    .removeClass('n-vis')
                    .addClass('vis');
                deliveryStatusDiv[0].querySelector(
                    '.mck-sending-failed'
                ).style.display = 'block';
            } else {
                var fileName = attachmentDiv[0].dataset.filename;
                var fileSize = attachmentDiv[0].dataset.filesize;
                var fileUrl = attachmentDiv[0].dataset.fileurl;
                var fileType = attachmentDiv[0].dataset.filetype;
                var groupId = attachmentDiv[0].dataset.groupid;
                var thumbnailUrl = attachmentDiv[0].dataset.thumbnailurl;
                if (
                    fileSize &&
                    fileUrl &&
                    fileMetaKey &&
                    fileName &&
                    fileType
                ) {
                    SnapUI.updateAttachmentStopUploadStatus(msgkey, false);
                    messagePxy = {
                        contentType: 1,
                        groupId: groupId,
                        fileMeta: {
                            blobKey: fileMetaKey,
                            url: fileUrl,
                            contentType: fileType,
                            size: fileSize,
                            key: fileMetaKey,
                            thumbnailUrl: fileUrl,
                            name: fileName,
                        },
                        message: '',
                        type: 5,
                        metadata: {},
                        key: msgkey,
                    };
                    var optns = {
                        tabId: groupId,
                    };
                    var params = {
                        messagePxy: messagePxy,
                        optns: optns,
                    };
                    $applozic.fn.applozic('submitMessage', params);
                    $applozic(e.target)
                        .closest('.km-msg-box-progressMeter')
                        .children()
                        .removeClass('km-progress-meter-back-drop');
                    $applozic(e.target)
                        .closest('.km-msg-box-progressMeter')
                        .addClass('n-vis');
                    $applozic('.mck-timestamp-' + msgkey)
                        .removeClass('n-vis')
                        .addClass('vis');
                    deliveryStatusDiv[0].querySelector(
                        '.mck-sending-failed'
                    ).style.display = 'none';
                } else if (thumbnailUrl && groupId && msgkey && file) {
                    messagePxy = {
                        contentType: 1,
                        groupId: groupId,
                        key: msgkey,
                        fileMeta: {
                            thumbnailUrl: thumbnailUrl,
                            contentType: 1,
                            isUploaded: false,
                        },
                        message: '',
                        type: 5,
                        metadata: {},
                    };
                    params = {
                        params: {
                            file: file,
                            name: file.name,
                        },
                        messagePxy: messagePxy,
                    };
                    SnapUI.updateAttachmentStopUploadStatus(msgkey, false);
                    $applozic.fn.applozic('uploadAttachemnt', params);
                    $applozic('.mck-timestamp-' + msgkey)
                        .removeClass('n-vis')
                        .addClass('vis');
                    deliveryStatusDiv[0].querySelector(
                        '.mck-sending-failed'
                    ).style.display = 'none';
                    delete KM_PENDING_ATTACHMENT_FILE[msgkey];
                    $applozic(e.target)
                        .closest('.km-msg-box-progressMeter')
                        .children()
                        .removeClass('km-progress-meter-back-drop');
                }
            }
        } else {
            SnapUI.displayUploadIconForAttachment(msgkey, false);
            SnapUI.updateAttachmentStopUploadStatus(msgkey, true);
        }
    },
    progressMeter: function (value, key) {
        var control = document.getElementById('km-progress-meter-input');
        var selector = '.progress-meter-' + key + ' .km-progress-value';
        var stopUpload = SnapUI.getAttachmentStopUploadStatus(key);
        if (stopUpload) {
            value = 100;
        }
        var progressValue = document.querySelector(selector);
        if (progressValue) {
            progressValue.style.strokeDasharray = KM_PROGRESS_METER_CIRCUMFERENCE;
            var progress = value / 100;
            var dashoffset = KM_PROGRESS_METER_CIRCUMFERENCE * (1 - progress);
            progressValue.style.strokeDashoffset = dashoffset;
            // value == 100 && !stopUpload && SnapUI.deleteProgressMeter(key);
        }
    },
    handleSendingAttachment: function (e) {
        var stopSending =
            !Snap.internetStatus ||
            $applozic(e.target)
                .closest('.km-msg-box-attachment')
                .find('.km-attachment-cancel-icon')
                .hasClass('vis');
        var upload = $applozic(e.target)
            .closest('.km-msg-box-attachment')
            .find('.km-attachment-upload-icon')
            .hasClass('vis');
        var attachmentDiv = $applozic(e.target)
            .closest('.km-msg-box-attachment')
            .children();
        var msgKey = attachmentDiv[0].dataset.msgkey;
        var deliveryStatusDiv = $applozic(e.target)
            .closest('.mck-clear')
            .find('.mck-msg-right-muted');
        var file = KM_PENDING_ATTACHMENT_FILE[msgKey];
        var fileMetaKey = attachmentDiv[0].dataset.filemetakey;

        if (stopSending) {
            SnapUI.updateAttachmentStopUploadStatus(msgKey, true);
            snapCommons.modifyClassList(
                {
                    class: [
                        'km-attachment-progress-bar-success-' + msgKey,
                        'km-attachment-progress-bar-wrapper-' + msgKey,
                    ],
                },
                'n-vis',
                'vis'
            );
            snapCommons.modifyClassList(
                { class: ['mck-timestamp-' + msgKey] },
                'vis',
                'n-vis'
            );
            $applozic('.km-attachment-cancel-icon-' + msgKey)
                .removeClass('vis')
                .addClass('n-vis');
            $applozic('.km-attachment-upload-icon-' + msgKey)
                .removeClass('n-vis')
                .addClass('vis');
            deliveryStatusDiv[0].querySelector(
                '.mck-sending-failed'
            ).style.display = 'block';
        } else {
            var fileName = attachmentDiv[0].dataset.filename;
            var fileSize = attachmentDiv[0].dataset.filesize;
            var fileType = attachmentDiv[0].dataset.filetype;
            var groupId = attachmentDiv[0].dataset.groupid;
            var thumbnailUrl = attachmentDiv[0].dataset.thumbnailurl;
            var fileUrl = attachmentDiv[0].dataset.fileurl;
            if (fileSize && fileMetaKey && fileName && fileType && fileUrl) {
                SnapUI.updateAttachmentStopUploadStatus(msgKey, false);
                messagePxy = {
                    contentType: 1,
                    groupId: groupId,
                    fileMeta: {
                        blobKey: fileMetaKey,
                        contentType: fileType,
                        size: fileSize,
                        key: fileMetaKey,
                        name: fileName,
                        url: fileUrl,
                        thumbnailUrl: fileUrl,
                    },
                    message: '',
                    type: 5,
                    metadata: {},
                    key: msgKey,
                };
                var optns = {
                    tabId: groupId,
                };
                var params = {
                    messagePxy: messagePxy,
                    optns: optns,
                };
                $applozic.fn.applozic('submitMessage', params);
                $applozic('.km-attachment-cancel-icon-' + msgKey)
                    .removeClass('vis')
                    .addClass('n-vis');
                $applozic('.km-attachment-upload-icon-' + msgKey)
                    .removeClass('vis')
                    .addClass('n-vis');
                deliveryStatusDiv[0].querySelector(
                    '.mck-sending-failed'
                ).style.display = 'none';
                snapCommons.modifyClassList(
                    { class: ['mck-timestamp-' + msgKey] },
                    'n-vis',
                    'vis'
                );
            } else if (thumbnailUrl && groupId && msgKey && file) {
                messagePxy = {
                    contentType: 1,
                    groupId: groupId,
                    key: msgKey,
                    fileMeta: {
                        thumbnailUrl: thumbnailUrl,
                        contentType: 1,
                        isUploaded: false,
                    },
                    message: '',
                    type: 5,
                    metadata: {},
                };
                params = {
                    params: {
                        file: file,
                        name: file.name,
                    },
                    messagePxy: messagePxy,
                };
                SnapUI.updateAttachmentStopUploadStatus(msgKey, false);
                $applozic.fn.applozic('uploadAttachemnt', params);
                snapCommons.modifyClassList(
                    { class: ['mck-timestamp-' + msgKey] },
                    'vis',
                    'n-vis'
                );
                deliveryStatusDiv[0].querySelector(
                    '.mck-sending-failed'
                ).style.display = 'none';
                delete KM_PENDING_ATTACHMENT_FILE[msgKey];
            }
        }
    },
};

Snap.richMsgEventHandler = {
    svg: {
        arrow:
            '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="11" viewBox="0 0 10 19"><path fill="#5B5959" fill-rule="evenodd" d="M9.076 18.266c.21.2.544.2.753 0a.53.53 0 0 0 0-.753L1.524 9.208 9.829.903a.53.53 0 0 0 0-.752.546.546 0 0 0-.753 0L.026 9.208l9.05 9.058z"/></svg>',
    },
    closeLeftBox: function () {
        w.console.log($('#map-script'))
        $('#map-script').remove();
        $applozic('.left-box').remove();
    },
    getDesktopBoxLayout: function (styles) {
        const { width, height } = styles;
        return `<div style="height: ${height};width: ${width}" class="left-box leftOpen">
                    <div class="box-wrapper">
                        <div class="close-left-box">
                            <svg class="close-svg" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                <path d="M0 0h24v24H0z" fill="none" />
                            </svg>
                        </div>
                    </div>
                </div>`;
    },
    getMobileBoxLayout: function () {
        return `<div class="left-box left-box-sm mobile-box">
                    <div class="box-wrapper">
                        <div class="close-left-box">
                            <svg class="close-svg" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                <path d="M0 0h24v24H0z" fill="none" />
                            </svg>
                        </div>
                    </div>
                </div>`;
    },
    initLeftSideBox: function () {

        if ($applozic('.left-box').length > 0) {
            this.Snap.richMsgEventHandler.closeLeftBox();
            return;
        }
                
            if(parent.document.body.clientWidth <= 600) {
                    $applozic
                    .tmpl(this.getMobileBoxLayout())
                    .appendTo('.mck-box-open');
                    
            } else {
                parent.document.getElementById('snap-widget-iframe').style.width =
                $applozic('#mck-sidebox').width() * 2 + 50;

                const leftBoxStyles = {
                    height: $applozic('#mck-sidebox').height(),
                    width: $applozic('#mck-sidebox').width(),
                };

                $applozic(this.getDesktopBoxLayout(leftBoxStyles)).prependTo('.mck-box-open');
            }
        
            $applozic('.close-left-box').on('click', () => {
                Snap.richMsgEventHandler.closeLeftBox();
            })
    },
    showMapBox: () => {
        this.Snap.richMsgEventHandler.initLeftSideBox();
        let markersData =  snap._globals.coordinates;
        let infoWindow = null;

        const sliderLayout = Mustache.to_html(Snap.markup.getCarouselTemplate(), snap._globals.carouselPayload);    
        
            const head= document.getElementsByTagName('head')[0];
            const script= document.createElement('script');
            script.type= 'text/javascript';
            script.id = 'map-script'
            script.src= 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBg9_RbO1w_xgzcss-p3oAmQ8QhthsW2v0&map_ids=6a4519983a205786&callback=initMap';
            head.appendChild(script);
            w.initMap = function() {
                w.console.log(snap._globals.coordinates);
                const {lat, long} = snap._globals.coordinates[0];
                const newLat = +lat - 0.3;
                const myLatlng = new google.maps.LatLng(newLat, long);
                const zoom = 9;
                
                const myOptions = {
                    
                    zoom,
                    // maxZoom: zoom + 2,
                    // minZoom: zoom - 5,
                    center: myLatlng,
                    mapTypeControl: false,
                    scaleControl: false,
                    navigationControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: false,
                    mapId: '6a4519983a205786',
                }
                $applozic('<div id="map_canvas"></div>').appendTo('.box-wrapper');
                map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

                $applozic('<div class="box-slider km-slick-container km-slider-multiple-cards-container"></div>')
                .appendTo('.box-wrapper');
                $applozic(sliderLayout).appendTo('.box-slider');

                w.slider = this.Snap.richMsgEventHandler.addCarousel();


                infoWindow = new google.maps.InfoWindow();
    
                google.maps.event.addListener(map, 'click', function() {
                    infoWindow.close();
                });
    
                addMarkers(map);
            }

        function addMarkers(map) {
            let markers = [];
            markersData = markersData.map( item => ({...item, color: '#fff'}));
            markersData.forEach( ({lat, long, color, title}, i) => {
                const marker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(lat, long),
                    icon: pinSymbol(color),
                    originalColor: color,
                    title,
                    id: i
                });
                marker.addListener('click', () => {
                    changeColor(marker, markers);
                    w.slider.goTo(marker.id);
                    infoWindow.setContent(marker.getTitle());
                    infoWindow.open(map, marker);
                });
                markers.push(marker);
            })

            changeColor(markers[0], markers);
            changeIconColorOnSliderToggle("[data-controls='prev']", markers, infoWindow);
            changeIconColorOnSliderToggle("[data-controls='next']", markers, infoWindow);
        }

        function changeIconColorOnSliderToggle(attribute, markersArr, infoWindow) {
            $applozic(`.box-slider ${attribute}`).on('click', () => {
                const index = attribute.includes('prev') ? w.slider.getInfo().index - 1 : w.slider.getInfo().index + 1;
                const marker = markersArr[index];
                changeColor(marker, markersArr);
                infoWindow.close();
            })
        }
    
        function pinSymbol(color) {
            return {
                path: 'M21.4321 11.75C21.4321 10.6009 21.2067 9.46312 20.7686 8.40152C20.3306 7.33992 19.6886 6.37533 18.8792 5.56282C18.0699 4.7503 17.109 4.10578 16.0515 3.66605C14.9941 3.22633 13.8607 3 12.7161 3C11.5714 3 10.438 3.22633 9.38056 3.66605C8.32308 4.10578 7.36223 4.7503 6.55287 5.56282C5.74351 6.37533 5.10149 7.33992 4.66347 8.40152C4.22545 9.46312 4 10.6009 4 11.75C4 13.4838 4.51051 15.0963 5.37589 16.4563H5.36593C8.30449 21.075 12.7161 28 12.7161 28L20.0662 16.4563H20.0575C20.9545 15.0517 21.4315 13.4184 21.4321 11.75ZM12.7161 15.5C11.7254 15.5 10.7752 15.1049 10.0747 14.4017C9.37416 13.6984 8.9806 12.7446 8.9806 11.75C8.9806 10.7554 9.37416 9.80161 10.0747 9.09835C10.7752 8.39509 11.7254 8 12.7161 8C13.7068 8 14.6569 8.39509 15.3574 9.09835C16.058 9.80161 16.4515 10.7554 16.4515 11.75C16.4515 12.7446 16.058 13.6984 15.3574 14.4017C14.6569 15.1049 13.7068 15.5 12.7161 15.5Z',
                fillColor: color,
                fillOpacity: 1,
                strokeColor: '#c5c5c5',
                strokeWeight: 2,
                scale: 1
            };
        }
    
        function restoreColors(markersArr) {
            for (let i=0; i<markersArr.length; i++) {
                markersArr[i].setIcon(pinSymbol(markersArr[i].originalColor));
            }
        }

        function changeColor(marker, markersArr) {
            restoreColors(markersArr);
            marker.setIcon(pinSymbol('#29529D'));
        }
    
        function panToNewCanter(marker) {
            const newCenterMap = new google.maps.LatLng(marker.getPosition().lat(), marker.getPosition().lng());
            map.panTo(newCenterMap);
        }

    },
    addCarousel: function() {
        return tns({
            container: $applozic('.box-slider .km-div-slider')[0],
            items: 2,
            gutter: 15,
            slideBy: 1,
            loop: false,
            center: true,
            controlsText: [
                Snap.richMsgEventHandler.svg.arrow,
                Snap.richMsgEventHandler.svg.arrow,
            ],
            mouseDrag: false,
            arrowKeys: true,
            onInit: function () {
                console.log('tiny-slider initilized');
            },
        });
    },
    initDropdown: function(data) {},
    initSort: function(data) {},
    showFilters: function() {
        Snap.richMsgEventHandler.initLeftSideBox();
        $applozic(`
        <div class="filters-container">
        <div class="title">All filters</div>
        <div class="dropdowns-container"></div>
        <div class="filter-buttons">
        <button class="submit-btn">Submit</button>
        <button class="reset-btn">Reset</button>
        </div></div>`).appendTo('.box-wrapper');
        $(".box-wrapper").css("display", "block");

        const filters = snap._globals.filters;
        filters.sort = [
            {label: 'Best for Your Plan'},
            {label: 'Distance'},
            {label: 'Patient Rating'},
            {label: 'Name: A to Z'},
            {label: 'Name: Z to A'}
        ];
        w.console.log(filters);
        const parentSelectButtonLayout = 
        '<div class="dropdown"> <div id="${name}" class="select-btn">' +
        '<span class="btn-text">${parentName}</span><span class="arrow-dwn">' + 
        ' <svg xmlns="http://www.w3.org/2000/svg" height="1792" viewBox="0 0 1792 1792" width="1792"><path d="M1395 736q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z"/></svg></span>' + 
        '</div> <ul id="${listId}" class="list-items"></ul> </div>';
        const checkBoxMarkup = '<li id="${label}" class="item"><span class="checkbox"></span><span class="item-text">${label}</span></li>';

        filters.dropdowns.forEach( dropdown => {
            $.tmpl(parentSelectButtonLayout, dropdown ).appendTo('.dropdowns-container');
            $.template( "movieTemplate", checkBoxMarkup );

            $.tmpl( "movieTemplate", dropdown.children )
            .appendTo( '#' + dropdown.listId );

            const selectBtn = $("#" + dropdown.name)
            const items = $("#" + dropdown.listId + " .item");
            selectBtn.on("click", () => {
                selectBtn.toggleClass("open");
            });

            items.each(function() {
                $(this).on('click', () => {
                    $(this).toggleClass('checked');
                }) 
            })

        })

        const sortBoxLayout = `
        <div class="sort-container">
        <div class="title">Sort by</div>
            <ul class="sort-list"></ul>
        </div>
        `
        const radioButtonItem = 
        '<li class="item"><input data-label=${label} type="radio" id="contactChoice1"name="contact" value="email"><label for="contactChoice1">${label}</label> </li>';
            $.tmpl(sortBoxLayout).insertBefore('.filter-buttons');
            $.template( "radioButtonItemTemplate", radioButtonItem );

            $.tmpl( "radioButtonItemTemplate", filters.sort )
            .appendTo('.sort-list');



        $('.submit-btn').on('click', submitForm);
        $('.reset-btn').on('click', resetForm);

        function submitForm() {
            const messageKey = $applozic(
                "#mck-message-cell .mck-message-inner div[name='message']:last-child"
            ).data('msgkey');
            const message = ALStorage.getMessageByKey(messageKey);
            const {groupId, type, source} = message;
            const arr = [];
            $('.item.checked').each(function() {
                arr.push($(this).text())
            })
            if(filters.sort) {
                arr.push($('input[type="radio"]:checked').next().text())
            }
            const payload = {
                filters: arr,
                groupId,
                type,
                source,
                key: mckUtils.randomId(),
            }
            w.console.log(payload);
            Snap.richMsgEventHandler.closeLeftBox();
        }

        function resetForm() {
            $('.item.checked').each(function() {
                $(this).removeClass('checked');
            })
        }
        
    },
    initializeSlick: function ($cardMessageContainer) {
        if ($cardMessageContainer.length > 0) {
            const slider = tns({
                container: $cardMessageContainer[0],
                items: 1.5,
                gutter: 15,
                slideBy: 1,
                loop: false,
                center: true,
                controlsText: [
                    Snap.richMsgEventHandler.svg.arrow,
                    Snap.richMsgEventHandler.svg.arrow,
                ],
                mouseDrag: true,
                arrowKeys: true,
                onInit: function () {
                    console.log('tiny-slider initilized');
                },
            });
        }
    },
    decrementGuestCount: function (e) {
        var target = e.target || e.srcElement;
        var type = target.dataset.type;
        if (type == 'guest') {
            target.parentElement
                .getElementsByClassName('km-room-number-field')[0]
                .stepDown();
        } else if (type == 'children') {
            target.parentElement
                .getElementsByClassName('km-person-number-field')[0]
                .stepDown();
        }
    },

    incrementGuestCount: function (e) {
        var target = e.target || e.srcElement;
        var type = target.dataset.type;
        if (type == 'guest') {
            target.parentElement
                .getElementsByClassName('km-room-number-field')[0]
                .stepUp();
        } else if (type == 'children') {
            target.parentElement
                .getElementsByClassName('km-person-number-field')[0]
                .stepUp();
        }
    },

    decrementPersonCount: function () {
        document.getElementById('km-person-number-field').stepDown();
    },
    incrementPersonCount: function () {
        document.getElementById('km-person-number-field').stepUp();
    },
    addMoreRoom: function (e) {
        var container = e.target.parentElement.parentElement.parentElement;
        var roomCount = Number(e.target.dataset.roomcount) + 1;
        e.target.setAttribute('data-roomcount', roomCount);
        var roomInfoElem = document.createElement('div');
        roomInfoElem.innerHTML = Snap.markup.getSingleRoomPaxInfo(roomCount);
        container
            .getElementsByClassName('km-room-person-selector-container')[0]
            .appendChild(roomInfoElem);
    },
    processSelectedRoom: function (e) {
        //TODO : handle multiple room select
        var roomGuestJson = [];
        var roomGuest = $(e.target)
            .closest('.mck-msg-box-rich-text-container')
            .find(
                '.km-room-person-selector-container input.km-room-number-field'
            );
        var NoOfChild = $(e.target)
            .closest('.mck-msg-box-rich-text-container')
            .find(
                '.km-room-person-selector-container input.km-person-number-field'
            );
        // TODO: process number of child if required

        var message = '';
        for (var i = 0; i < roomGuest.length; i++) {
            var noOfChild = NoOfChild[i].value;
            var arr = Array(noOfChild * 1).fill(10);
            roomGuestJson.push({
                NoOfAdults: roomGuest[i].value,
                NoOfChild: noOfChild,
                ChildAge: arr,
            });
            message +=
                'Room ' + (i + 1) + ' Guest ' + roomGuest[i].value + '\n';
        }
        //send message to group
        //[{"NoOfAdults":1,"NoOfChild":2,"ChildAge":[8,9]}]
        var messagePxy = {
            message: message, //message to send
            metadata: {
                isRoomGuestJSON: true,
                roomGuestJson: JSON.stringify(roomGuestJson),
                guestTypeId: 'ADULTS',
            },
        };

        Snap.sendMessage(messagePxy);
    },
    processHotelBookClick: function (e) {
        var target = e.target || e.srcElement;
        var sessionId = target.dataset.sessionid;
        var resultIndex = target.dataset.resultindex;
        var hotelName = target.dataset.name;

        var messagePxy = {
            message: 'Get room detail of ' + hotelName.replace('_', ' '), //message to send
            metadata: {
                hotelSelected: true,
                sessionId: sessionId,
                resultIndex: resultIndex,
                skipDialogflow: true,
            },
        };

        Snap.sendMessage(messagePxy);
    },

    processBookRoomClick: function (e) {
        var target = e.target || e.srcElement;
        var sessionId = target.dataset.sessionid;
        var RoomIndex = target.dataset.roomindex;
        var NoOfRooms = target.dataset.noofrooms;
        var HotelName =
            target.dataset.hotelname == 'undefined'
                ? ''
                : target.dataset.hotelname;
        var HotelResultIndex = target.dataset.hotelresultindex;
        var messagePxy = {
            message: 'Book ' + HotelName.replace('_', ' '),
            metadata: {
                sessionId: sessionId,
                RoomIndex: RoomIndex,
                NoOfRooms: NoOfRooms,
                blockHotelRoom: true,
                skipDialogflow: true,
                HotelResultIndex: HotelResultIndex,
            },
        };
        var $mck_msg_inner = $applozic('#mck-message-cell .mck-message-inner');
        var $mck_msg_to = $applozic('#mck-msg-to');

        if ($mck_msg_inner.data('isgroup') === true) {
            messagePxy.groupId = $mck_msg_to.val();
        } else {
            messagePxy.to = $mck_msg_to.val();
        }
        //console.log('messagePxy........# ', messagePxy)
        $applozic.fn.applozic('sendGroupMessage', messagePxy);
    },

    handleRichButtonClick: function (e) {
        var validationResults = [];
        var validString = '';
        var inputElement = '';
        var target = e.target || e.srcElement;
        let { buttontype, buttontitle, customcontext} = target.dataset;
        let requestType = target.dataset.requesttype;
        var mainMessageTemplate = '';
        var form = 
            target.parentElement.getElementsByClassName(
                'km-btn-hidden-form'
            )[0] || target.parentElement;
        if (buttontype === 'quickReply') {
            form.reset();
        }
        let data = {};
        let postBackData = {};
        let isActionableForm =
            form.className.indexOf('mck-actionable-form') != -1;
        let postBackToSnap = isActionableForm
            ? JSON.parse(target.dataset.postBackToSnap.toLowerCase())
            : false;
        let replyText = target.title || target.innerHTML;
        let formElements = [];
        formElements = Array.prototype.concat.apply(
            formElements,
            form.getElementsByTagName('input')
        );
        formElements = Array.prototype.concat.apply(
            formElements,
            form.getElementsByTagName('select')
        );
        formElements = Array.prototype.concat.apply(
            formElements,
            form.getElementsByTagName('textarea')
        );
        let name = '';
        let type = '';
        let value = '';
        for (var i = 0; i < formElements.length; i++) {
            name = formElements[i].name;
            type = formElements[i].type;
            value = formElements[i].value;

            let isCheckboxOrRadio = type === 'radio' || type === 'checkbox';
            let wrapper = isCheckboxOrRadio
                ? formElements[i].closest('.mck-form-radio-wrapper')
                      .previousElementSibling
                : formElements[i].closest('.mck-form-text-wrapper');

            let labelText = isCheckboxOrRadio
                ? wrapper.textContent
                : wrapper.querySelector('label').textContent;

            if (wrapper && labelText) {
                isAvailableColon = labelText.indexOf(':') !== -1;
                labelText += isAvailableColon ? ' ' : ': ';
            }

            switch (type) {
                case 'radio':
                    if (formElements[i].checked) {
                        data[name] = value;
                        mainMessageTemplate += labelText + value + '\n';
                    }
                    break;
                case 'checkbox':
                    if (formElements[i].checked) {
                        !data[name] && (data[name] = []);
                        data[name].push(value);
                        mainMessageTemplate += labelText + value + '\n';
                    }
                    break;
                case 'select-one': //dropdown
                    data[name] = value;
                    if (formElements[i].dataset.errorText) {
                        Snap.richMsgEventHandler.handleFormErrorMessage(
                            form,
                            name,
                            formElements[i].dataset.errorText,
                            !value
                        );
                        validationResults.push(value ? 'success' : 'failed');
                    }

                    mainMessageTemplate += labelText + value + '\n';
                    break;
                default:
                    data[name] = value;
                    try {
                        if (formElements[i].dataset.regex) {
                            validString = Snap.richMsgEventHandler.isValidString(
                                formElements[i].dataset.regex,
                                value
                            );
                            validationResults.push(
                                validString ? 'success' : 'failed'
                            );
                            Snap.richMsgEventHandler.handleFormErrorMessage(
                                form,
                                name,
                                formElements[i].dataset.errorText ||
                                    MCK_LABELS['rich.form'].errorText,
                                !validString
                            );
                        }

                        if (value) {
                            mainMessageTemplate += labelText + value + '\n';
                        }
                    } catch (e) {
                        console.log(e);
                    }
            }
            if (
                SnapConstants.FORM_POST_BACK_MESSAGE_UNSUPPORTED_FIELDS.indexOf(
                    type
                ) == -1
            ) {
                postBackData[name] = data[name];
            }
        }
        if (isActionableForm && validationResults.indexOf('failed') != -1) {
            return;
        }
        // if(data.hasOwnProperty('Date')){
        //     const newDate = new Date(data.Date);
        //     data.Date = newDate.toLocaleDateString("en-US");
        // }
        if (requestType == 'json') {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    // for success response : this.responseText
                }
            };
            xhr.open('POST', form.action);
            xhr.send(JSON.stringify(data));
        } else {
            w.console.log('FORM: ', form)
            !isActionableForm && form.submit(); // called for submit button
            isActionableForm &&
                SnapUtils.isURL(form.action) &&
                $applozic.post(form.action, data).done(function (data) {
                    // console.log("ResponseText:" + data);
                });
        }
        let messagePxy = {};
        let msgMetadata = {};

        let template = '';
        //  = mainMessageTemplate
        //     ? mainMessageTemplate.substring(0, mainMessageTemplate.length - 1)
        //     : 'The form was sent without data.';
        if(mainMessageTemplate) {
            template = mainMessageTemplate.substring(0, mainMessageTemplate.length - 1);
        } else {
            template = buttontitle
        }

        //message to send
        messagePxy.message = replyText;
        messagePxy.messageTemplate = template;

        isActionableForm &&
            requestType == SnapConstants.POST_BACK_TO_BOT_PLATFORM &&
            buttontype === 'submit' &&
            (msgMetadata['KM_CHAT_CONTEXT'] = { formData: data });
        
            if(customcontext) {
                msgMetadata['KM_CHAT_CONTEXT'] = JSON.parse(customcontext);
            }

        let formDataMessageTemplate =
            postBackToSnap &&
            Snap.markup.getFormDataMessageTemplate(postBackData);
        formDataMessageTemplate &&
            Snap.sendMessage({
                message: formDataMessageTemplate,
                type: SnapConstants.MESSAGE_CONTENT_TYPE.TEXT_HTML,
            });
        Object.keys(msgMetadata).length > 0 &&
            (messagePxy['metadata'] = msgMetadata);
        (Object.keys(msgMetadata).length > 0 ||
            Object.keys(messagePxy).length > 0) &&
            Snap.sendMessage(messagePxy);
    },
    handleFormErrorMessage: function (form, name, errorText, validationFailed) {
        var element = form.getElementsByClassName(
            ('mck-form-error-' + name).toLowerCase().replace(/ +/g, '')
        )[0];
        element.innerHTML = validationFailed ? errorText : '';
    },
    handlleSubmitPersonDetail: function (e) {
        var title = $applozic(e.target)
            .closest('.km-guest-details-container')
            .find('.km-title-select option:selected')
            .text();
        var age = $applozic(e.target)
            .closest('.km-guest-details-container')
            .find('.km-guest-detail-form input.km-age-input');
        var fname = $applozic(e.target)
            .closest('.km-guest-details-container')
            .find('.km-guest-detail-form input.first-name-input');
        var mname = $applozic(e.target)
            .closest('.km-guest-details-container')
            .find('.km-guest-detail-form input.middle-name-input');
        var lname = $applozic(e.target)
            .closest('.km-guest-details-container')
            .find('.km-guest-detail-form input.last-name-input');
        var email = $applozic(e.target)
            .closest('.km-guest-details-container')
            .find('.km-guest-detail-form input.e-mail-input');
        var phone = $applozic(e.target)
            .closest('.km-guest-details-container')
            .find('.km-guest-detail-form input.number-input');

        if (
            fname[0].value == '' ||
            lname[0].value == '' ||
            email[0].value == '' ||
            phone[0].value == ''
        ) {
            $applozic(e.target)
                .closest('.km-guest-details-container')
                .find('.km-mandatory-field-error')
                .removeClass('n-vis')
                .addClass('vis');
            return;
        }
        var personDetail = {
            Title: title === 'title' ? '' : title,
            Age: age[0].value,
            FirstName: fname[0].value,
            MiddleName: mname[0].value,
            LastName: lname[0].value,
            EmailId: email[0].value,
            PhoneNo: phone[0].value,
        };
        var target = e.target || e.srcElement;
        var sessionId = target.dataset.sessionid;
        var messagePxy = {
            message:
                personDetail.Title +
                ' ' +
                personDetail.FirstName +
                ' ' +
                personDetail.LastName +
                '\n' +
                personDetail.EmailId +
                '\n' +
                personDetail.PhoneNo,
            metadata: {
                sessionId: sessionId,
                guestDetail: true,
                skipDialogflow: true,
                personInfo: JSON.stringify(personDetail),
            },
        };
        Snap.sendMessage(messagePxy);
        console.log('passenger detail submitted');
    },
    processQuickReplies: function (e) {
        var message = e.target.title;
        var metadata = {};
        var buttonId = e.target.dataset.buttonid;
        var payload = e.target.dataset.payload;
        try {
            metadata = JSON.parse(e.target.dataset.metadata);
        } catch (e) {}
        var languageCode = e.target.dataset.languagecode;
        languageCode && Snap.updateUserLanguage(languageCode);
        var messagePxy = {
            message: message, //message to send
            metadata: metadata,
            buttonId: buttonId,
            payload: payload,
        };
        document
            .getElementById('mck-text-box')
            .setAttribute('data-quick-reply', true);
        Snap.sendMessage(messagePxy);

        if (snap._globals.hidePostCTA) {
            var isClickedOnKmLinkButton = e.target.classList.contains(
                'km-link-button'
            );

            if (!isClickedOnKmLinkButton) {
                Snap.hideMessage(e.target);
            }
        }
    },
    processClickOnListItem: function (e) {
        var target = e.currentTarget;
        var reply = target.dataset.reply;
        var type = target.dataset.type;
        var articleId = target.dataset.articleid;
        var source = target.dataset.source;
        var languageCode = target.dataset.languagecode;
        var metadata = {};
        try {
            metadata = JSON.parse(target.dataset.metadata);
        } catch (e) {}
        metadata.KM_FAQ_ID = articleId;
        metadata.source = source;
        if (type && type == 'quick_reply') {
            languageCode && Snap.updateUserLanguage(languageCode);
            var messagePxy = {
                message: reply, //message to send
                metadata: metadata,
            };

            Snap.sendMessage(messagePxy);
        } else if (type && type == 'submit') {
            //TODO : support for post request with data.
        }
    },
    processClickOnButtonItem: function (e) {
        e.preventDefault();
        var target = e.currentTarget;
        let { reply, type, languagecode, context } = target.dataset;
        // var reply = target.dataset.reply;
        // var type = target.dataset.type;
        // var languageCode = target.dataset.languagecode;
        var metadata = (target.dataset && target.dataset.metadata) || {};

        metadata.KM_BUTTON_CLICKED = true;
        metadata.currentContext = context;
        if (type && type == 'quick_reply') {
            languagecode && Snap.updateUserLanguage(languagecode);
            var messagePxy = {
                message: reply, //message to send
                metadata: metadata,
            };

            Snap.sendMessage(messagePxy);
        } else if (type && type == 'submit') {
            //TODO : support for post request with data.
        }
    },
    processClickOnDialogButton: function (e) {
        var target = e.currentTarget;
        var reply = target.dataset.reply;
        var metadata = {};
        try {
            metadata = JSON.parse(target.dataset.metadata);
        } catch (e) {}

        // default value for  metadata.skipBot is true for backward compatibility
        metadata.skipBot =
            typeof metadata.skipBot != 'undefined' ? metadata.skipBot : true;
        var messagePxy = {
            message: reply, //message to send
            metadata: metadata,
        };

        Snap.sendMessage(messagePxy);
    },
    handleLinkButtonClick: function (e) {
        var url = decodeURI(e.currentTarget.dataset.url);
        window.open(url, e.currentTarget.dataset.target);
    },
    handleFormSubmit: function (e) {
        e.preventDefault();
        Snap.hideMessage(e.target);
        $applozic('#mck-text-box').attr('data-text', '');
        $applozic('#mck-text-box').attr('data-label', '');
        $applozic('#mck-text-box').attr('aria-label', '');
    },
    isValidString: function (str, value) {
        return new RegExp(str).test(value);
    },
    handleEmail: function (e) {
        const email = e.target.getAttribute('data-email');
        window.open('mailto:' + email, '_blank');

        const browserInfo = detect.parse(navigator.userAgent);
        const body = {
            sender_id: snap._globals.userId,
            group_id: CURRENT_GROUP_DATA.tabId.toString(),
            browser: `${browserInfo.browser.family} ${browserInfo.browser.version}`,
            event_type: 'click email',
            email_name: email,
            conversation_key: SnapUtils.getSettings('KM_CHAT_CONTEXT').trigger
        };

        Snap.richMsgEventHandler.sendUserBehaviorInfo(body);
    },
    formUserBehaviorInfo: function (e) {
        document.activeElement.blur();
        const browserInfo = detect.parse(navigator.userAgent);
        const buttonId = e.target.dataset.buttonid;
        const buttonType = e.target.dataset.buttontype;
        const buttonAction = e.target.dataset.buttonaction
            ? JSON.parse(decodeURIComponent(e.target.dataset.buttonaction))
            : {};
        const behaviorInfo = {
            sender_id: snap._globals.userId,
            group_id: CURRENT_GROUP_DATA.tabId.toString(),
            url: '',
            session_id: '',
            browser_parameter: `${browserInfo.browser.family} ${browserInfo.browser.version}`,
            event_type: 'follow the link',
            message_id: CURRENT_GROUP_DATA.messageId,
            button_id: `${buttonId}`.trim(),
            button_name: `${e.target.title}`.trim(),
            button_type: `${buttonType}`.trim(),
            button_url: `${e.target.dataset.url}`.trim(),
            timestamp: new Date().getTime(),
            payload: buttonAction.payload,
            event_type: 'click button',
            conversation_key: SnapUtils.getSettings('KM_CHAT_CONTEXT').trigger
        };
        Snap.richMsgEventHandler.sendUserBehaviorInfo(behaviorInfo);
        window.Applozic.ALSocket.reconnect();
    },
    sendUserBehaviorInfo: function (data) {
        try {
            const url = Snap.getSendUserBehaviorInfoUrl();

            fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).catch((error) => {
                throw error;
            });
        } catch {}
    },
    changeCheckbox: function (e) {
        // let rule = e.target.getAttribute("data-rule");
        // if(rule === 's1'){
        if (e.target.checked) {
            if (e.target.getAttribute('data-selector') === 'anytime') {
                $('.quick-reply-checkbox')
                    .not('[data-selector="anytime"]')
                    .prop('checked', false);
                $('.quick-reply-checkbox')
                    .not('[data-selector="anytime"]')
                    .prop('disabled', true);
            } else if (
                e.target.getAttribute('data-selector') === 'all of above'
            ) {
                $('.quick-reply-checkbox')
                    .not('[data-selector="anytime"]')
                    .prop('checked', true);
            } else {
                $('.quick-reply-checkbox[data-selector="anytime"]').prop(
                    'checked',
                    false
                );
                $('.quick-reply-checkbox[data-selector="anytime"]').prop(
                    'disabled',
                    true
                );
                $('.quick-reply-checkbox[data-selector="all of above"]').prop(
                    'checked',
                    false
                );
                $('.quick-reply-checkbox[data-selector="all of above"]').prop(
                    'disabled',
                    true
                );
            }
        } else {
            if (
                !$('.quick-reply-checkbox[data-selector="anytime"]:checked')
                    .length
            ) {
                $('.quick-reply-checkbox')
                    .not('[data-selector="anytime"]')
                    .prop('disabled', false);
            }
            if (
                !$('.quick-reply-checkbox:checked').not(
                    '[data-selector="anytime"]'
                ).length
            ) {
                $('.quick-reply-checkbox[data-selector="anytime"]').prop(
                    'disabled',
                    false
                );
                $('.quick-reply-checkbox[data-selector="all of above"]').prop(
                    'disabled',
                    false
                );
            }
        }
        // }
    },
};
