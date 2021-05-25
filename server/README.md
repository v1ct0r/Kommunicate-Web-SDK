# Instructions to deploy Snap on your server.

## Prerequisites:
- Node version: v10.16.0 or higher
- Git installed in the server machine.
- Clone Snap-Web-SDK repository on your machine. ([How to clone a Github repository ?](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository))


## Steps to deploy Snap server.
Step-1: Open Terminal on your machine.

Step-2: Change the current working directory to Snap-Web-SDK directory.

Step-3: Move to the server folder in Snap-Web-SDK directory.
> $ cd server

Step-4  To run the node server run the below command.
> $ NODE_ENV=prod node app

Step-5: Open your web browser and enter http://localhost:3030 to run the demo.

## How to point Snap script to your server?

- Update the source URL in the Snap script.
> s.src = "http://localhost:3030/v2/snap.app";

```javascript
<script type="text/javascript">
    (function (d, m) {
        var snapSettings = {
            "appId": "<APP_ID>", // replace with your application id which you can find from the install section in the dashboard.
            "automaticChatOpenOnNavigation": true,
            "popupWidget": true
        };
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.src = "http://localhost:3030/v2/snap.app";
        var h = document.getElementsByTagName("head")[0];
        h.appendChild(s);
        window.snap = m;
        m._globals = snapSettings;
    })(document, window.snap || {});
</script>

```
- You have to also update the hostUrl parameter in the config-env.js file as per your server host URL.
> Example : hostUrl: https://your.hosturl.io

> **Note**: Do not update any other parameter in config-env file other than hostUrl for all environments. 
 

