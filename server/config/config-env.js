const configEnv = {
    development: {
        port: '3030',
        urls: {
            applozicBaseUrl: 'https://apps-test.applozic.com',
            snapBaseUrl: 'https://api-test.snap.io',
            botPlatformApi: 'https://bots-test.snap.io',
            hostUrl: 'http://localhost:3030',
            // sendUserBehaviorInfoUrl: 'https://ohl5011637183.gera-it-dev.com/frontend_interaction_behavior',
            sendUserBehaviorInfoUrl: 'https://devpython.onehealthlink.com/frontend_interaction_behavior'
        },
        pluginProperties: {
            pseudoNameEnabled: true,
        },
        thirdPartyIntegration: {
            sentry: {
                dsn:
                    'https://b1187d11fbdc4632b29259b258dd9053@o418176.ingest.sentry.io/5338197',
                enabled: false,
            },
            aws: {
                cdnUrl: 'https://cdn-test.snap.io',
                bucket: 'cdn-snap',
            },
        },
    },
    test: {
        port: '3030',
        urls: {
            applozicBaseUrl: 'https://apps-test.applozic.com',
            snapBaseUrl: 'https://api-test.snap.io',
            botPlatformApi: 'https://bots-test.snap.io',
            hostUrl: 'https://widget-test.snap.io',
            // sendUserBehaviorInfoUrl: 'https://ohl5011637183.gera-it-dev.com/frontend_interaction_behavior',
            sendUserBehaviorInfoUrl: 'https://devpython.onehealthlink.com/frontend_interaction_behavior'
        },
        pluginProperties: {
            pseudoNameEnabled: true,
        },
        thirdPartyIntegration: {
            sentry: {
                dsn:
                    'https://b1187d11fbdc4632b29259b258dd9053@o418176.ingest.sentry.io/5338197',
                enabled: true,
            },
            aws: {
                cdnUrl: 'https://cdn-test.snap.io',
                bucket: 'cdn-snap',
            },
        },
    },
    staging: {
        port: '3031',
        urls: {
            applozicBaseUrl: 'https://apps-test.applozic.com',
            snapBaseUrl: 'https://api-staging.snap.io',
            botPlatformApi: 'https://bots-test.snap.io',
            hostUrl: 'https://widget-staging.snap.io',
            // sendUserBehaviorInfoUrl: 'https://ohl5011637183.gera-it-dev.com/frontend_interaction_behavior',
            sendUserBehaviorInfoUrl: 'https://devpython.onehealthlink.com/frontend_interaction_behavior'
        },
        pluginProperties: {
            pseudoNameEnabled: true,
        },
        thirdPartyIntegration: {
            sentry: {
                dsn:
                    'https://b1187d11fbdc4632b29259b258dd9053@o418176.ingest.sentry.io/5338197',
                enabled: true,
            },
            aws: {
                cdnUrl: 'https://cdn-test.snap.io',
                bucket: 'cdn-snap',
            },
        },
    },
    prod: {
        port: '3030',
        urls: {
            applozicBaseUrl: 'https://chat.snap.io',
            snapBaseUrl: 'https://api.snap.io',
            botPlatformApi: 'https://bots.snap.io',
            hostUrl: 'https://widget.snap.io',
        },
        pluginProperties: {
            pseudoNameEnabled: true,
        },
        thirdPartyIntegration: {
            sentry: {
                dsn:
                    'https://9f71614ef8184d0cab00074555dad9a7@sentry.io/1321911',
                enabled: false,
            },
            aws: {
                cdnUrl: 'https://cdn.snap.io',
                bucket: 'snap-cdn',
            },
        },
    },
    prod_ca: {
        port: '3030',
        urls: {
            applozicBaseUrl: 'https://chat-ca.snap.io',
            snapBaseUrl: 'https://api-ca.snap.io',
            hostUrl: 'https://widget-ca.snap.io',
        },
        pluginProperties: {
            pseudoNameEnabled: true,
        },
        thirdPartyIntegration: {
            sentry: {
                dsn:
                    'https://9f71614ef8184d0cab00074555dad9a7@sentry.io/1321911',
                enabled: false,
            },
            aws: {
                cdnUrl: 'https://cdn.snap.io',
                bucket: 'snap-cdn',
            },
        },
    },

    prod_in: {
        port: '3030',
        urls: {
            applozicBaseUrl: 'https://chat-in.snap.io',
            snapBaseUrl: 'https://api-in.snap.io',
            botPlatformApi: 'https://bots-in.snap.io',
            hostUrl: 'https://widget-in.snap.io',
        },
        pluginProperties: {
            pseudoNameEnabled: true,
        },
        thirdPartyIntegration: {
            sentry: {
                dsn:
                    'https://9f71614ef8184d0cab00074555dad9a7@sentry.io/1321911',
                enabled: false,
            },
            aws: {
                cdnUrl: 'https://cdn.snap.io',
                bucket: 'snap-cdn',
            },
        },
    },
    prod_ire: {
        port: '3030',
        urls: {
            applozicBaseUrl: 'https://chat-ire.snap.io',
            snapBaseUrl: 'https://api-ire.snap.io',
            hostUrl: 'https://widget-ire.snap.io',
        },
        pluginProperties: {
            pseudoNameEnabled: true,
        },
        thirdPartyIntegration: {
            sentry: {
                plugin: {
                    dsn:
                        'https://a7fe0d3754264f649630801e7349da27@sentry.io/1324243',
                    enable: false,
                },
                server: {
                    dsn:
                        'https://93e611ec9efc4ce396769bdbbff587d2@sentry.io/1325823',
                    enable: true,
                },
            },
        },
    },
    prod_enterprise: {
        port: '3033',
        urls: {
            applozicBaseUrl: 'https://chat.snap.io',
            snapBaseUrl: 'https://api-enterprise.snap.io',
            botPlatformApi: 'https://bots.snap.io',
            hostUrl: 'https://widget-enterprise.snap.io',
        },
        pluginProperties: {
            pseudoNameEnabled: true,
        },
        thirdPartyIntegration: {
            sentry: {
                dsn:
                    'https://9f71614ef8184d0cab00074555dad9a7@sentry.io/1321911',
                enabled: false,
            },
            aws: {
                cdnUrl: 'https://cdn.snap.io',
                bucket: 'snap-cdn',
            },
        },
    },
    prod_beta: {
        port: '3034',
        urls: {
            applozicBaseUrl: 'https://chat.snap.io',
            snapBaseUrl: 'https://api.snap.io',
            botPlatformApi: 'https://bots.snap.io',
            hostUrl: 'https://widget-beta.snap.io',
        },
        pluginProperties: {
            pseudoNameEnabled: true,
        },
        thirdPartyIntegration: {
            sentry: {
                dsn:
                    'https://9f71614ef8184d0cab00074555dad9a7@sentry.io/1321911',
                enabled: false,
            },
            aws: {
                cdnUrl: 'https://cdn.snap.io',
                bucket: 'snap-cdn',
            },
        },
    },
    commonResources: {
        // add common resources for all environments below
    },
};

const getEnvId = function () {
    return process.env.NODE_ENV || 'development';
};

const config = configEnv[getEnvId()];

module.exports = config;
module.exports.getEnvId = getEnvId;
