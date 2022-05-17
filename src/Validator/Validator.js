

const isValid = function(value) {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length > 0) return true;
    return false;
};

const isRequestBodyEmpty = function(object) {
    return Object.keys(object).length > 0;
};


const isValidUrl = function(value) {
    let regexForUrl =
        /(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1})?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@?^=%&amp;~+#-_.]+))*)$/;
    return regexForUrl.test(value);
};

module.exports = { isValid, isRequestBodyEmpty, isValidUrl };