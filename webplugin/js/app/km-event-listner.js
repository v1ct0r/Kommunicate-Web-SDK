Snap.initilizeEventListners = function () {
    w.addEventListener('online', function () {
        Snap.internetStatus = true;
    });
    w.addEventListener('offline', function () {
        Snap.internetStatus = false;
    });
};
