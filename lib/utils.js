"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, null, [{
    key: "_toBase64",
    value: function _toBase64(string) {
      return new Buffer(string).toString('base64');
    }
  }, {
    key: "isEmpty",
    value: function isEmpty(value) {
      if (typeof value === "undefined") return true;

      if (typeof value === "string" && value === "") return true;

      if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" && value.length < 1) return true;

      return false;
    }
  }, {
    key: "arrayChunk",
    value: function arrayChunk(arr, chunk_size) {
      var i = void 0,
          j = arr.length,
          outputArr = [];
      for (i = 0; i < j; i += chunk_size) {
        outputArr.push(arr.slice(i, i + chunk_size));
      }return outputArr;
    }

    // @todo needs validator
    // static filterAndValidateEmails(emails) {
    //   let objectList = {}
    //   for (let email of emails) {
    //     if (validator.isEmail(email))
    //       objectList[email] = email;
    //   }
    //   return Object.keys(objectList);
    // }

  }]);

  return Utils;
}();

exports.default = Utils;