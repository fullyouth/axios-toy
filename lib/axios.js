const defaultConfig = require('./defaults');
const buildUrl = require('./buildUrl')
const utils = require('./utils')

function transformData(data, headers, fns) {
  fns.forEach(function (fn) {
    data = fn(data, headers);
  });

  return data;
};

function parseHeaders(headers) {
  var parsed = {}, key, val, i;

  if (!headers) return parsed;

  utils.forEach(headers.split('\n'), function(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};

function axios(config) {
  // 1. config的处理
  config = {
    ...defaultConfig,
    ...config
  }

  let promise = new Promise((resolve, reject) => {
    // 创建请求
    let xhr
    if (window.XMLHttpRequest) {
      //Firefox、 Opera、 IE7 和其它浏览器使用本地 JavaScript 对象
      xhr = new XMLHttpRequest();
    } else {
      //IE 5 和 IE 6 使用 ActiveX 控件
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    let data = transformData(config.data, config.headers, config.transformRequest)

    // open
    xhr.open(config.method, buildUrl(config.url, config.params), true)
    // 设置监听
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        // response 请求成功
        var headers = parseHeaders(xhr.getAllResponseHeaders());
        var response = {
          data: transformData(
            xhr.responseText,
            headers,
            config.transformResponse
          ),
          status: xhr.status,
          headers: headers,
          config: config
        };
        (xhr.status >= 200 && xhr.status < 300
          ? resolve
          : reject)(
            response.data,
            response.headers,
            response.status,
            response.config
          );

        // Clean up request
        xhr = null;
      }
    }

    // 设置请求
    let headers = {
      ...defaultConfig.headers[config.method],
      ...defaultConfig.headers.common,
      ...config.headers || {}
    }



    Reflect.ownKeys(headers).forEach((key) => {
      if (!data && key === 'content-type') {
        delete headers[key]
      } else {
        xhr.setRequestHeader(key, headers[key]);
      }
    })

    // 同源问题 todo

    if (config.responseType) {
      request.responseType = config.responseType;
    }

    // send
    xhr.send(data);
  })

  // Provide alias for success
  promise.success = function success(fn) {
    promise.then(function (response) {
      fn(response);
    });
    return promise;
  };

  // Provide alias for error
  promise.error = function error(fn) {
    promise.then(null, function (response) {
      fn(response);
    });
    return promise;
  };

  return promise;

}

module.exports = axios