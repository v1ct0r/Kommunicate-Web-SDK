function getParams(url) {
  var params = {};
  var parser = document.createElement("a");
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
}

function findCookieDomain(domain) {
  var i = 0;
  var parts = domain.split(".");
  var value = "km_" + new Date().getTime();
  //check value is added in cookie else continue the iteration
  while (
    i < parts.length - 1 &&
    document.cookie.indexOf(value + "=" + value) == -1
  ) {
    //join the parts of domain
    domain = parts.slice(-1 - ++i).join(".");
    //set value in cookie
    document.cookie = value + "=" + value + ";domain=" + domain + ";";
  }
  //delete value from cookie
  document.cookie =
    value + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=" + domain + ";";
  return domain;
}

function getSubDomain() {
  var hostName = parent.window.location.hostname;
  var domainLength = findCookieDomain(document.domain).length;
  var subDomain = hostName.substr(0, hostName.length - domainLength);

  return subDomain;
}

function getCookiePrefix() {
  var cookiePrefix = getSubDomain();

  return cookiePrefix + "_";
}

function getCookieFullName(cname, skipPrefix) {
  var cookiePrefix = this.getCookiePrefix();

  return (skipPrefix ? cname : cookiePrefix + cname) + "=";
}

function checkIfDomainIsIP(str) {
  const regexExp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;

  return regexExp.test(str);
}

function getCookieValue(cname, skipPrefix) {
  var name = getCookieFullName(cname, skipPrefix);
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getHashFromUrl() {
  return window.location.hash.substr(1);
}

function showSessionAlert() {
  setTimeout(() => {
    if (getHashFromUrl() === "timeout") {
      alert(
        "Your session has been timed out. If you'd like to start over, please click on the URL link from text message."
      );
    }
  }, 2000);
}

window.sessionTimeoutInitializer = () => {
  var delay = 1800000; //30 minutes delay
  // var delay = 10000;
  var hash = window.location.hash.substr(1);
  const excludeAppId = "e7b8fe8886f7f8830785d893e3d36fd1";

  if (snap._globals.appId === excludeAppId || hash === "timeout") return;

  if (window.sessionTimeout) {
    clearTimeout(window.sessionTimeout);
  }

  window.sessionTimeout = setTimeout(function () {
    let domain = document.domain
    let isNeedToAddDot = !checkIfDomainIsIP(findCookieDomain(domain))
    document.cookie = `${getCookieFullName("km_id")}; domain=${isNeedToAddDot ? '.' : ''}${findCookieDomain(domain)}; expires=${new Date(0).toUTCString()}`;
    window.location.replace(window.location.href.split('?s=')[0] + "#timeout");
  }, delay);
};
