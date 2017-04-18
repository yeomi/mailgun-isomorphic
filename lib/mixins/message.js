'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./../utils');

var _utils2 = _interopRequireDefault(_utils);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (superclass) {
  return function (_superclass) {
    _inherits(_class, _superclass);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: 'messages',
      value: function messages() {
        var self = this;

        return {
          send: function send(mailingData) {
            var _this2 = this;

            var promise = new Promise(function (resolve, reject) {
              resolve(mailingData);
            });
            promise
            // Prepare mailing.
            .then(this._prepareMailing);

            // Sending.
            promise = promise.then(function (mailingData) {

              if (!_this2.controlRequiredParams(mailingData)) throw new Error("Some required parameters are missing.");

              // Sub-promise to run each send requests.
              var progressionPromise = new Promise(function (resolve, reject) {
                resolve(Object.assign(mailingData, { success: 0, intent: 0, error: 0 }));
              });

              // Splitting sending into several promises in order to control progression.
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                var _loop = function _loop() {
                  var postQuery = _step.value;

                  progressionPromise = progressionPromise.then(function (mailingData) {

                    return self.post('/' + mailingData.domain + '/messages', postQuery).then(function (res) {

                      if (res == undefined || !('id' in res)) {
                        mailingData.intent++;
                        mailingData.error++;
                        return mailingData;
                      }

                      if (res.id !== undefined && /Queued/.test(res.message)) {
                        mailingData.success++;
                        mailingData.intent++;
                      }
                      return mailingData;
                    }).catch(function (err) {
                      mailingData.intent++;
                      mailingData.error++;
                      return mailingData;
                    });
                  });
                };

                for (var _iterator = _this2.getPostFieldsGroups(mailingData)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  _loop();
                }
              } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
                }
              }

              return progressionPromise;
            }).catch(function (e) {
              console.error('[Mailgun isomorphic]: ' + e.message);
              throw e;
            });

            return promise;
          },
          _prepareMailing: function _prepareMailing(mailingData) {
            if (_utils2.default.isEmpty(mailingData.content_url)) return mailingData;

            return (0, _isomorphicFetch2.default)(mailingData.content_url).then(function (response) {
              return response.text();
            }).then(function (html) {
              mailingData.content = html;
              return mailingData;
            }).catch(function (e) {
              throw new Error(e.message);
            });
          },
          controlRequiredParams: function controlRequiredParams(mailingData) {
            if (_utils2.default.isEmpty(mailingData.recipients)) throw new Error("Recipients list is empty or missing.");

            // if (Utils.isEmpty(this.config.recipients_test)) {
            //   console.error('Recipients value is missing.')
            //   return false
            // }

            if (_utils2.default.isEmpty(mailingData.domain)) throw new Error("No domain has been set for this mailing.");

            if (_utils2.default.isEmpty(mailingData.from)) throw new Error("You need to give a value for 'from' parameter.");

            if (_utils2.default.isEmpty(mailingData.content)) throw new Error("No content has been set for this mailing.");

            if (_utils2.default.isEmpty(mailingData.subject)) throw new Error("No subject has been set for this mailing.");

            return true;
          },
          getDomain: function getDomain() {
            return this.config.domain;
          },
          getBaseParams: function getBaseParams(mailingData) {
            var postFields = {
              from: mailingData.from,
              subject: mailingData.subject,
              html: mailingData.content
            };

            if (!_utils2.default.isEmpty(mailingData.reply_to)) postFields['h:Reply-to'] = mailingData.reply_to;

            if (!_utils2.default.isEmpty(mailingData.campaign)) postFields['o:campaign'] = mailingData.campaign;

            postFields['o:tracking-clicks'] = mailingData.tracking_click ? 'yes' : 'no';
            return postFields;
          },
          getPostFieldsGroups: function getPostFieldsGroups(mailingData) {

            var postFieldsBase = this.getBaseParams(mailingData);
            var recipientGroups = this._getBatchGroups(mailingData);
            var postFieldsGroups = [];

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = Object.keys(recipientGroups)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var group_key = _step2.value;


                var postField = Object.assign({}, postFieldsBase),
                    recipient_variables = {},
                    group = recipientGroups[group_key];

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                  for (var _iterator3 = Object.keys(group)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var user_key = _step3.value;

                    var email = group[user_key];
                    postField['to[' + user_key + ']'] = email;

                    // Add required recipient vars and extra if provided in config.
                    var recipientVars = { id: user_key };
                    if (email in mailingData.recipients_vars) {
                      recipientVars = Object.assign(recipientVars, mailingData.recipients_vars[email]);
                    }
                    recipient_variables[email] = recipientVars;
                  }
                } catch (err) {
                  _didIteratorError3 = true;
                  _iteratorError3 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                      _iterator3.return();
                    }
                  } finally {
                    if (_didIteratorError3) {
                      throw _iteratorError3;
                    }
                  }
                }

                postField['recipient-variables'] = JSON.stringify(recipient_variables);
                postFieldsGroups.push(postField);
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            return postFieldsGroups;
          },
          _getBatchGroups: function _getBatchGroups(mailingData) {
            var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'recipients';

            if (type !== 'recipients' && type !== 'recipients_test') throw new Error('Value \'' + type + '\' is not authorized as recipient type.');

            return _utils2.default.arrayChunk(mailingData[type], 1);
          }
        };
      }
    }]);

    return _class;
  }(superclass);
};