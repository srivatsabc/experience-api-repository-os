//Lets require/import the HTTP module
var express = require('express');
var app = express();
var request = require('request');
var url = require('url');
var config = require('./config');
var geocodeLocator = require('./appLocator-request');
let header = require('./utils/header');
const zlib = require('zlib');
var propertiesreader = require('properties-reader');

app.get("/exapi/v2/geocodes/:iata_code", function(req, res) {
  var properties = propertiesreader(process.env.APP_PROPERTIES);
  if (req.headers.authorization == null){
    console.log("Unauthorized Error");
    res = header.setHeaders(res, properties.get('global_HTTP_UNAUTHORIZED'));
    body = properties.get('eror_msg_template_UNAUTHORIZED');
    zlib.gzip(body, function (_, result){
      res.end(result);
    });
  }else{
    var token = header.getToken(req.headers.authorization);
    authorized(req, res, token);
  }
});

//Connect to googleapis to authorize
var authorized = function(req, res, token){
  var __HTTP_SUCCESS__ = Number(config['HTTP_SUCCESS']);
  request.get({
    url: config['googleapis_url'] + token},
    function(error, response, body) {
        if (!error && response.statusCode == __HTTP_SUCCESS__) {
          geocodeLocator.getEndpoint('default_filter', req.params.iata_code.toUpperCase(), req, res);
        }else {
          console.log("Unauthorized Error : " + response.statusCode);
          res = header.setHeaders(res, response.statusCode);
          zlib.gzip(body, function (_, result){
            res.end(result);
          });
        }
    }
  );
};

var server = app.listen(8074, function () {
   console.log("Example app listening at http on tcp/8074")
})
