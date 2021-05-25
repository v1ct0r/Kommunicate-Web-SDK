const app = require('./../app');
const express = require('express');
const webpluginController = require('../../webplugin/controller');

//router declaration
const home = express.Router();

//export routers
exports.home = home;

home.get('/', function (req, res) {
    console.log('req received at home routes');
    res.status(200).json({
        message: 'Welcome to snap',
    });
});

home.get('/snap.app', function (req, res) {
    // below is the code to handle the "forward".
    req.url = '/v1/snap.app';
    home.handle(req, res);
});
home.get('/:version/snap.app', webpluginController.getPlugin);
home.get('/chat', webpluginController.getPluginHTML);
