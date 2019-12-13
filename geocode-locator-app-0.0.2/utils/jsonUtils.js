var JSONPARSER = require('json-parser');
var JSONIFY = require('json-stringify');
var propertiesreader = require('properties-reader');
require('dotenv').config();

function formatter (body) {
  //=====================================================
  //Contains special formatting requirements specific to that API
  //=====================================================
  var properties = propertiesreader(process.env.APP_PROPERTIES);
  var __HTTP_DATA_NOT_FOUND__ = Number(properties.get('global_HTTP_DATA_NOT_FOUND'));
  var __HTTP_SUCCESS__ = Number(properties.get('global_HTTP_SUCCESS'));
  var result = {};
  var jsonParsedResult = JSONPARSER.parse(body);
  result.length = jsonParsedResult.results[0].toString().length;
  if (result.length != 0){
    result.responseCode = __HTTP_SUCCESS__;
    var results = {
      iata_code: jsonParsedResult.results[0].iata_code,
      airport_name: jsonParsedResult.results[0].name,
      latitude_deg: jsonParsedResult.results[0].latitude_deg,
      longitude_deg: jsonParsedResult.results[0].longitude_deg
    }
    result.formattedBody = JSONIFY({results});
    console.log("responseCode: " + result.responseCode);
  }else{
    result.responseCode = __HTTP_DATA_NOT_FOUND__;
    console.log("responseCode: " + result.responseCode);
  }
  return result;
}

module.exports.formatter = formatter;
