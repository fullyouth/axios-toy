const utils = require('./utils')
var JSON_START = /^\s*(\[|\{[^\{])/;
var JSON_END = /[\}\]]\s*$/;
var PROTECTION_PREFIX = /^\)\]\}',?\n/;
var CONTENT_TYPE_APPLICATION_JSON = {
  'Content-Type': 'application/json;charset=utf-8'
};

const config = {
  methods: 'get',
  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    },
    patch: { ...CONTENT_TYPE_APPLICATION_JSON },
    post: { ...CONTENT_TYPE_APPLICATION_JSON },
    put: { ...CONTENT_TYPE_APPLICATION_JSON },
  },
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  withCredentials: false, // 一个布尔值，表示跨域请求时，用户信息（比如 Cookie 和认证的 HTTP 头信息）是否会包含在请求之中，默认为false，即向example.com发出跨域请求时，不会发送example.com设置在本机上的 Cookie（如果有的话）。如果需要跨域 AJAX 请求发送Cookie，需要withCredentials属性设为true。注意，同源的请求不需要设置这个属性。
  transformRequest: [
    function (data) {
      return utils.isObject(data) ? JSON.stringify(data) : null
    }
  ],
  transformResponse: [function (data) { // todo
    if (typeof data === 'string') {
      data = data.replace(PROTECTION_PREFIX, '');
      if (JSON_START.test(data) && JSON_END.test(data)) {
        data = JSON.parse(data);
      }
    }
    return data;
  }],
}

module.exports = config