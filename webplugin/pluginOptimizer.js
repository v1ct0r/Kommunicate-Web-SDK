const minify = require('@node-minify/core');
const terser = require('@node-minify/terser');
const noCompress = require('@node-minify/no-compress');
const gcc = require('@node-minify/google-closure-compiler');
const cleanCSS = require('@node-minify/clean-css');
const path = require('path');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const version = require('child_process')
    .execSync('git rev-parse --short HEAD', {
        cwd: __dirname,
    })
    .toString()
    .trim();
const buildDir = path.resolve(__dirname, 'build');
const config = require('../server/config/config-env');
const pluginClient = require('../server/src/pluginClient');
const MCK_CONTEXT_PATH = config.urls.hostUrl;
const MCK_STATIC_PATH = MCK_CONTEXT_PATH + '/plugin';
const PLUGIN_SETTING = config.pluginProperties;
const MCK_THIRD_PARTY_INTEGRATION = config.thirdPartyIntegration;
const CDN_HOST_URL = MCK_THIRD_PARTY_INTEGRATION.aws.cdnUrl;
const pluginVersions = ['v1', 'v2'];
PLUGIN_SETTING.snapApiUrl =
    PLUGIN_SETTING.snapApiUrl || config.urls.snapBaseUrl;
PLUGIN_SETTING.botPlatformApi =
    PLUGIN_SETTING.botPlatformApi || config.urls.botPlatformApi;
PLUGIN_SETTING.applozicBaseUrl =
    PLUGIN_SETTING.applozicBaseUrl || config.urls.applozicBaseUrl;
let PLUGIN_FILE_DATA = new Object();
let isAwsUploadEnabled = argv.upload;
let BUILD_URL = isAwsUploadEnabled
    ? CDN_HOST_URL + '/' + version
    : MCK_STATIC_PATH + '/build';
// Change "env" to "false" to un-compress all files.
let env = config.getEnvId() !== 'development';
let jsCompressor = !env ? noCompress : gcc;
let terserCompressor = !env ? noCompress : terser;
let cssCompressor = !env ? noCompress : cleanCSS;

const removeExistingFile = function (dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    } else {
        try {
            var files = fs.readdirSync(dirPath);
        } catch (e) {
            return;
        }
        files &&
            files.map((file) => {
                if (fs.statSync(dirPath + '/' + file).isFile()) {
                    fs.unlinkSync(dirPath + '/' + file);
                }
            });
    }
};
// Add already minified files only in the below compressor code.
const compressAndOptimize = () => {
    minify({
        compressor: jsCompressor,
        input: [
            path.resolve(__dirname, 'lib/js/mck-ui-widget.min.js'),
            path.resolve(__dirname, 'lib/js/howler-2.1.2.min.js'),
            path.resolve(__dirname, 'lib/js/tiny-slider-2.9.2.js'),
            path.resolve(__dirname, 'lib/js/mustache.js'),
            path.resolve(__dirname, 'lib/js/sentry-error-tracker.js'),
            path.resolve(__dirname, 'lib/js/flatpickr.min.js'),
            path.resolve(__dirname, 'lib/js/imask.js'),
        ],
        output: path.resolve(
            __dirname,
            `${buildDir}/snapThirdParty.min.js`
        ),
        options: {
            compilationLevel: 'WHITESPACE_ONLY',
        },
        callback: function (err, min) {
            if (!err) {
                console.log(
                    `snapThirdParty.min.js combined successfully`
                );
            } else {
                console.log(
                    `err while minifying snapThirdParty.min.js`,
                    err
                );
            }
        },
    });

    // minify applozic css files into a single file
    minify({
        compressor: cssCompressor,
        input: [
            path.resolve(__dirname, 'lib/css/mck-combined.min.css'),
            path.resolve(__dirname, 'css/app/mck-sidebox-1.0.css'),
            path.resolve(__dirname, 'css/app/km-rich-message.css'),
            path.resolve(__dirname, 'css/app/km-login-model.css'),
            path.resolve(__dirname, 'lib/css/tiny-slider-2.9.2.css'),
            path.resolve(__dirname, 'css/app/km-sidebox.css'),
            path.resolve(__dirname, 'lib/css/flatpickr.min.css'),
        ],
        output: path.resolve(
            __dirname,
            `${buildDir}/snap.${version}.min.css`
        ),
        options: {
            level: 1, // (default)
            compatibility: '*', // (default) - Internet Explorer 10+ compatibility mode
        },
        callback: function (err, min) {
            if (!err) {
                console.log(
                    `snap.${version}.min.css combined successfully`
                );
            } else {
                console.log(
                    `err while minifying snap.${version}.min.css`,
                    err
                );
            }
        },
    });

    minify({
        compressor: terserCompressor,
        input: [
            path.resolve(__dirname, 'lib/js/jquery.linkify.js'),
            path.resolve(__dirname, 'js/app/km-utils.js'),
            path.resolve(__dirname, 'js/app/applozic.jquery.js'),
            path.resolve(__dirname, 'knowledgebase/common.js'),
            path.resolve(__dirname, 'knowledgebase/kb.js'),
            path.resolve(__dirname, 'js/app/labels/default-labels.js'),
            path.resolve(__dirname, 'js/app/snap-client.js'),
            path.resolve(
                __dirname,
                'js/app/conversation/km-conversation-helper.js'
            ),
            path.resolve(
                __dirname,
                'js/app/conversation/km-conversation-service.js'
            ),
            path.resolve(__dirname, 'js/app/snap.js'),
            path.resolve(__dirname, 'js/app/km-richtext-markup-1.0.js'),
            path.resolve(__dirname, 'js/app/km-message-markup-1.0.js'),
            path.resolve(__dirname, 'js/app/km-event-listner.js'),
            path.resolve(__dirname, 'js/app/km-attachment-service.js'),
            path.resolve(__dirname, 'js/app/mck-sidebox-1.0.js'),
            path.resolve(__dirname, 'js/app/snap.custom.theme.js'),
            path.resolve(__dirname, 'js/app/snapCommons.js'),
            path.resolve(__dirname, 'js/app/km-rich-text-event-handler.js'),
            path.resolve(__dirname, 'js/app/snap-ui.js'),
            path.resolve(__dirname, 'js/app/events/applozic-event-handler.js'),
            path.resolve(__dirname, 'js/app/km-post-initialization.js'),
            path.resolve(__dirname, 'js/app/mck-ringtone-service.js'),
            path.resolve(__dirname, 'js/app/media/typing-area-dom-service.js'),
            path.resolve(__dirname, 'js/app/media/media-service.js'),
            path.resolve(__dirname, 'js/app/media/media-dom-event-listener.js'),
        ],
        options: {
            compress: {
                drop_console: true,
            },
        },
        output: path.resolve(
            __dirname,
            `${buildDir}/snap-plugin.min.js`
        ),
        callback: function (err, min) {
            if (!err)
                console.log(`snap-plugin.min.js combined successfully`);
            else {
                console.log(
                    `err while minifying snap-plugin.min.js`,
                    err
                );
            }
        },
    });
};

const combineJsFiles = () => {
    var paths = [
        path.resolve(__dirname, `${buildDir}/mck-app.js`),
        path.resolve(__dirname, `${buildDir}/snapThirdParty.min.js`),
        path.resolve(__dirname, `${buildDir}/snap-plugin.min.js`),
    ];
    minify({
        compressor: terserCompressor,
        input: paths,
        options: {
            compress: {
                drop_console: true,
                keep_fnames: true,
            },
            mangle: {
                keep_fnames: true,
            },
        },
        output: path.resolve(
            __dirname,
            `${buildDir}/snap.${version}.min.js`
        ),
        callback: function (err, min) {
            if (!err) {
                console.log(`snap.${version}.js combined successfully`);
                paths.forEach(async function (value) {
                    await deleteFilesUsingPath(value);
                });
                isAwsUploadEnabled && uploadFilesToCdn(buildDir, version);
            } else {
                console.log(
                    `err while minifying snap.${version}.js`,
                    err
                );
            }
        },
    });
};

const generateBuildFiles = () => {
    // Generate mck-sidebox.html file for build folder.
    fs.copyFile(
        path.join(__dirname, 'template/mck-sidebox.html'),
        `${buildDir}/mck-sidebox.${version}.html`,
        (err) => {
            if (err) {
                console.log('error while generating mck-sidebox.html', err);
            }
            console.log('mck-sidebox.html generated successfully');
        }
    );
    // Generate plugin.js file for build folder.
    fs.readFile(
        path.join(__dirname, 'plugin.js'),
        'utf8',
        function (err, data) {
            if (err) {
                console.log('error while generating plugin.js', err);
            }
            var mckApp = data.replace(
                'SNAP_MIN_JS',
                `"${BUILD_URL}/snap.${version}.min.js"`
            );
            fs.writeFile(`${buildDir}/plugin.js`, mckApp, function (err) {
                if (err) {
                    console.log('plugin.js generation error');
                }
                generateFilesByVersion('build/plugin.js');
            });
        }
    );
    // Generate mck-app.js file for build folder.
    fs.readFile(
        path.join(__dirname, 'js/app/mck-app.js'),
        'utf8',
        function (err, data) {
            if (err) {
                console.log('error while generating mck app', err);
            }
            var mckApp = data
                .replace(
                    'SNAP_MIN_CSS',
                    `"${BUILD_URL}/snap.${version}.min.css"`
                )
                .replace(
                    'MCK_SIDEBOX_HTML',
                    `"${BUILD_URL}/mck-sidebox.${version}.html"`
                );
            fs.writeFile(`${buildDir}/mck-app.js`, mckApp, function (err) {
                if (err) {
                    console.log('mck-file generation error');
                }
                combineJsFiles();
            });
        }
    );
};

const generateFilesByVersion = (location) => {
    fs.readFile(path.join(__dirname, location), 'utf8', function (err, data) {
        if (err) {
            console.log('error while generating plugin.js', err);
        }
        try {
            var plugin = data
                .replace(':MCK_CONTEXTPATH', MCK_CONTEXT_PATH)
                .replace(
                    ':MCK_THIRD_PARTY_INTEGRATION',
                    JSON.stringify(MCK_THIRD_PARTY_INTEGRATION)
                )
                .replace(':MCK_STATICPATH', MCK_STATIC_PATH)
                .replace(':PRODUCT_ID', 'snap')
                .replace(':PLUGIN_SETTINGS', JSON.stringify(PLUGIN_SETTING));

            for (var i = 0; i < pluginVersions.length; i++) {
                var data = plugin.replace(
                    ':MCK_PLUGIN_VERSION',
                    pluginVersions[i]
                );
                PLUGIN_FILE_DATA[pluginVersions[i]] = data;
            }
            console.log('plugin files generated for all versions successfully');
        } catch (error) {
            console.log(error);
        }
    });
};

const deleteFilesUsingPath = (path) => {
    // Assuming that 'path/file.txt' is a regular file.
    try {
        fs.unlinkSync(path);
    } catch (error) {
        console.log(error);
    }
};

const uploadFilesToCdn = async (buildDir, version) => {
    try {
        await pluginClient.upload(buildDir, version);
        console.log('Uploaded all files to CDN');
    } catch (error) {
        console.log(
            'The server has stopped due to some error, please check server logs for better understanding.',
            error
        );
        process.kill(process.pid);
    }
};
removeExistingFile(buildDir);
compressAndOptimize();
generateBuildFiles();

exports.pluginVersion = version;
exports.pluginVersionData = PLUGIN_FILE_DATA;
