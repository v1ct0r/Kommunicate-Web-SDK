(function (window) {
    'use strict';
    function define_SnapKB() {
        var SnapKB = {};
        var KM_API_URL = 'https://api.snap.io';
        var KB_URL = '/kb/search?appId=:appId';
        var SOURCES = { snap: 'SNAP' };
        var SEARCH_ELASTIC = '/kb/_search';

        //SnapKB.init("https://api.snap.io");
        SnapKB.init = function (url) {
            KM_API_URL = url;
        };

        SnapKB.getArticles = function (options) {
            try {
                var articles = [];
                SnapKB.getFaqs({
                    data: options.data,
                    success: function (response) {
                        for (var i = 0; i < response.data.length; i++) {
                            var article = response.data[i];
                            articles.push({
                                articleId: article.id,
                                title: article.name,
                                description: article.content,
                                status: article.status,
                                body: article.content,
                                source: SOURCES.snap,
                            });
                        }
                        if (options.success) {
                            var res = new Object();
                            res.status = 'success';
                            res.data = articles;
                            options.success(res);
                        }
                    },
                    error: function (err) {
                        if (typeof options.error === 'function') {
                            options.error(err);
                        }
                    },
                });
            } catch (e) {
                options.error(e);
            }
        };

        SnapKB.getArticle = function (options) {
            SnapKB.getFaq({
                data: options.data,
                success: function (response) {
                    var faq = response.data.data[0];

                    var article = {
                        articleId: faq.id,
                        title: faq.name,
                        description: faq.content,
                        body: faq.content,
                        status: faq.status,
                        source: SOURCES.snap,
                    };

                    if (options.success) {
                        var res = new Object();
                        res.status = 'success';
                        res.data = article;
                        options.success(res);
                    }
                },
                error: function (e) {
                    options.error(e);
                },
            });
        };

        //SnapKB.getFaqs({data: {appId: 'snap-support', query: 'apns'}, success: function(response) {console.log(response);}, error: function() {}});
        SnapKB.getFaqs = function (options) {
            var url = KM_API_URL + KB_URL.replace(':appId', options.data.appId);
            if (options.data.query) {
                url = url + '&query=' + options.data.query;
            }

            //Todo: if query is present then call machine learning server to get answer ids.
            //curl -H "Content-Type: application/json" -d '{ "text":"how to setup notification", "appId":"snap-support" }' https://machine.snap.io/queries.json

            var response = new Object();
            KMCommonUtils.ajax({
                url: url,
                async:
                    typeof options.async !== 'undefined' ? options.async : true,
                type: 'get',
                success: function (data) {
                    response.status = 'success';
                    response.data = data.data;
                    if (options.success) {
                        options.success(response);
                    }
                    return;
                },
                error: function (xhr, desc, err) {
                    response.status = 'error';
                    if (options.error) {
                        options.error(response);
                    }
                },
            });
        };

        SnapKB.searchFaqs = function (options) {
            var data = {
                query: {
                    bool: {
                        must: {
                            multi_match: {
                                query: options.data.query,
                                type: 'phrase_prefix',
                                fields: ['content', 'name'],
                            },
                        },
                        filter: {
                            bool: {
                                must: [
                                    {
                                        term: {
                                            'applicationId.keyword':
                                                options.data.appId,
                                        },
                                    },
                                    {
                                        term: {
                                            'type.keyword': 'faq',
                                        },
                                    },
                                    {
                                        term: {
                                            deleted: false,
                                        },
                                    },
                                    {
                                        term: {
                                            'status.keyword': 'published',
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            };
            var url = KM_API_URL + SEARCH_ELASTIC;

            var response = new Object();
            KMCommonUtils.ajax({
                url: url,
                async:
                    typeof options.async !== 'undefined' ? options.async : true,
                type: 'post',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (data) {
                    response.status = 'success';
                    response.data = data.data;
                    if (options.success) {
                        options.success(response);
                    }
                    return;
                },
                error: function (xhr, desc, err) {
                    response.status = 'error';
                    if (options.error) {
                        options.error(response);
                    }
                },
            });
        };

        //SnapKB.getFaq({data: {appId: 'snap-support', articleId: 1}, success: function(response) {console.log(response);}, error: function() {}});
        //Note: server side not supported yet
        SnapKB.getFaq = function (options) {
            var response = new Object();

            var url = KM_API_URL + KB_URL.replace(':appId', options.data.appId);
            if (options.data && options.data.articleId) {
                url += '&articleId=' + options.data.articleId;
            }

            KMCommonUtils.ajax({
                url: url,
                async:
                    typeof options.async !== 'undefined' ? options.async : true,
                type: 'get',
                success: function (data) {
                    response.status = 'success';
                    response.data = data;
                    if (options.success) {
                        options.success(response);
                    }
                    return;
                },
                error: function (xhr, desc, err) {
                    response.status = 'error';
                    if (options.error) {
                        options.error(response);
                    }
                },
            });
        };

        return SnapKB;
    }
    //define globally if it doesn't already exist
    if (typeof SnapKB === 'undefined') {
        window.SnapKB = define_SnapKB();
    } else {
        console.log('SnapKB already defined.');
    }
})(window);
