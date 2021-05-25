/**
 * This file responsible for the all operations being performed after chat plugin initialized.
 * eg. subscribing the events etc.
 * this file use Snap Object. Put this file after snap.js while combining.
 */

Snap.postPluginInitialization = function (err, data) {
    // get the third party settings
    SnapKB.init(Snap.getBaseUrl());
    Snap.getFaqList(data);
};

//faq plugin
Snap.getFaqList = function (data) {
    SnapKB.getArticles({
        data: { appId: data.appId, query: '' },
        success: function (response) {
            if (
                response.data &&
                response.data.length > 0 &&
                $applozic('.km-kb-container').hasClass('n-vis')
            ) {
                $applozic('.km-kb-container')
                    .removeClass('n-vis')
                    .addClass('vis');
                SnapUI.adjustConversationTitleHeadingWidth(
                    snap._globals.popupWidget
                );
            }
            $applozic.each(response.data, function (i, faq) {
                var title =
                    faq &&
                    faq.title &&
                    snapCommons.formatHtmlTag(faq.title);
                $applozic('#km-faq-list-container').append(
                    '<li class="km-faq-list" aria-disabled="false" role="button" tabindex="0" data-source="' +
                        faq.source +
                        '" data-articleId="' +
                        faq.articleId +
                        '"><a class="km-faqdisplay"><div class="km-faqimage">' +
                        SnapUI.faqSVGImage +
                        '</div> <div class="km-faqanchor">' +
                        title +
                        '</div></a></li>'
                );
            });
            SnapUI.faqEvents(data);
        },
        error: function () {},
    });
};
