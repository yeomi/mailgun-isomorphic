'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _domain = require('./mixins/domain');

var _domain2 = _interopRequireDefault(_domain);

var _message = require('./mixins/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mix = function mix(superclass) {
  return new MixinBuilder(superclass);
};

var MixinBuilder = function () {
  function MixinBuilder(superclass) {
    _classCallCheck(this, MixinBuilder);

    this.superclass = superclass;
  }

  _createClass(MixinBuilder, [{
    key: 'with',
    value: function _with() {
      for (var _len = arguments.length, mixins = Array(_len), _key = 0; _key < _len; _key++) {
        mixins[_key] = arguments[_key];
      }

      return mixins.reduce(function (c, mixin) {
        return mixin(c);
      }, this.superclass);
    }
  }]);

  return MixinBuilder;
}();

var Mailgun = function () {
  function Mailgun() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Mailgun);

    this.config = {
      base_url: 'https://api.mailgun.net/v3',
      hostName: 'api.mailgun.net',
      basePath: '/v3',
      apiUser: 'api',
      protocol: 'https',
      authMode: 'basic',
      responseType: 'json'
    };

    this.config = Object.assign(this.config, config);
  }

  _createClass(Mailgun, [{
    key: 'setApiKey',
    value: function setApiKey(apiKey) {
      this.config.apiKey = apiKey;
    }
  }, {
    key: 'testConnection',
    value: function testConnection(callback) {
      this.get('/domains').then(function (response) {
        return callback(response !== undefined && 'total_count' in response);
      });
    }

    /*** Requests **/

  }, {
    key: 'get',
    value: function get(path) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var config = this.config;

      var opts = {
        method: 'GET',
        mode: 'no-cors',
        headers: {
          'Authorization': 'Basic ' + _utils2.default._toBase64(config.apiUser + ':' + config.apiKey),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      return (0, _isomorphicFetch2.default)(config.base_url + path, opts).then(function (response) {
        if (response.status > 200) throw new Error(Mailgun._HttpErrorCodeGetMessage(response.status));

        return Mailgun._parseResponse(response);
      }).catch(function (err) {
        Mailgun._handleError(err);
      });
    }
  }, {
    key: 'post',
    value: function post(path) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var postData = _querystring2.default.stringify(params);
      var config = this.config;

      var opts = {
        method: 'POST',
        body: postData,
        headers: {
          'Authorization': 'Basic ' + _utils2.default._toBase64(config.apiUser + ':' + config.apiKey),
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      return (0, _isomorphicFetch2.default)(config.base_url + path, opts).then(function (response) {

        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) return Mailgun._parseResponse(response);else throw new Error("Invalid format received : " + contentType);
      }).catch(function (err) {
        Mailgun._handleError(err);
      });
    }
  }], [{
    key: '_handleError',
    value: function _handleError(e) {
      console.error('[Mailgun isomorphic]: ' + e.message);
      console.error(e);
    }
  }, {
    key: '_parseResponse',
    value: function _parseResponse(response) {
      return response.json().then(function (json) {
        if (response.status > 200 && 'message' in json) throw new Error(json.message);else if (response.status > 200) {
          throw new Error(this._HttpErrorCodeGetMessage(response));
        }

        return json;
      });
    }
  }, {
    key: '_HttpErrorCodeGetMessage',
    value: function _HttpErrorCodeGetMessage(response) {
      switch (response.status) {
        case 401:
          return 'Unauthorized, your API key might be wrong.';
        default:
          return 'Unknown error with code : ' + response.status;
      }
    }
  }]);

  return Mailgun;
}();

module.exports = function (_mix$with) {
  _inherits(_class, _mix$with);

  function _class() {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
  }

  return _class;
}(mix(Mailgun).with(_domain2.default, _message2.default));