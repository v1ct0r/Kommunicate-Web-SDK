/**
 * https://github.com/uudashr/jquery-linkify
 * Version: https://github.com/uudashr/jquery-linkify/blob/9053e5a7184e3532c65908c3337c64066934ec14/jquery.linkify.js
 */
function linkify(string, buildHashtagUrl, includeW3, target, noFollow) {
    relNoFollow = "";
    if (noFollow) {
        relNoFollow = " rel=\"nofollow\"";
    }
    /**
     * Below .replace queries are added as improvement to the library.
     * Regex to detect links inside a message. [https://github.com/Snap-io/Snap-Web-SDK/pull/76]
     * Updated regex in dashboard to support spaces between text and links. [https://github.com/Snap-io/Snap-Web-SDK/pull/91]
     * Fix XSS issue for this library.
     */
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Below code will capture the regex match and update it according to callback function logic below.
    string = string.replace(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/gi, function (captured) {
        var uri;
        if (captured.toLowerCase().indexOf("www.") == 0) {
            if (!includeW3) {
                return captured;
            }
            uri = "http://" + captured;
        } else {
            uri = captured;
        }
        return "<a href=\"" + uri + "\" target=\"" + target + "\"" + relNoFollow + ">" + captured + "</a>";
    });

    if (buildHashtagUrl) {
        string = string.replace(/\B#(\w+)/g, "<a href=" + buildHashtagUrl("$1") + " target=\"" + target + "\"" + relNoFollow + ">#$1</a>");
    }
    return string;
}

(function ($) {
    $.fn.linkify = function (opts) {
        return this.each(function () {
            var $this = $(this);
            var buildHashtagUrl;
            var includeW3 = true;
            var target = '_self';
            var noFollow = true;
            if (opts) {
                if (typeof opts == "function") {
                    buildHashtagUrl = opts;
                } else {
                    if (typeof opts.hashtagUrlBuilder == "function") {
                        buildHashtagUrl = opts.hashtagUrlBuilder;
                    }
                    if (typeof opts.includeW3 == "boolean") {
                        includeW3 = opts.includeW3;
                    }
                    if (typeof opts.target == "string") {
                        target = opts.target;
                    }
                    if (typeof opts.noFollow == "boolean") {
                        noFollow = opts.noFollow;
                    }
                }
            }
            $this.html(
                $.map(
                    $this.contents(),
                    function (n, i) {
                        if (n.nodeType == 3) {
                            return linkify(n.data, buildHashtagUrl, includeW3, target, noFollow);
                        } else {
                            return n.outerHTML;
                        }
                    }
                ).join("")
            );
        });
    }
})(jQuery);
