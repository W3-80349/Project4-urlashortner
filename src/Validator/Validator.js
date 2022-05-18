const urlModel = require("../Model/urlModel")
const validUrl = require("valid-url")

const isValid = function (value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length > 0) return true;
    return false;
};

const isRequestBodyValid = function (object) {
    if (Object.keys(object).length == 1) return true;
    return false;
};


const isValidUrl = function(value) {
    let regexForUrl1 = /(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1})?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@?^=%&amp;~+#-_.]+))*)$/;
    let regexForUrl2 = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/    
     if(regexForUrl1.test(value) || regexForUrl2.test(value)){
         return true
     }
     return false
};


const isAlreadyShortned = async function (value) {
    let URL = await urlModel.findOne({ longURL: value })
    if (URL) return URL
    return false
}


module.exports = { isValid, isRequestBodyValid, isValidUrl, isAlreadyShortned};


