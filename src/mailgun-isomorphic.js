import querystring from 'querystring'
import fetch from 'isomorphic-fetch'
import Utils from './utils'

import domainMixin from './mixins/domain'
import messageMixin from './mixins/message'

let mix = (superclass) => new MixinBuilder(superclass);

class MixinBuilder {
  constructor(superclass) {
    this.superclass = superclass;
  }

  with(...mixins) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass);
  }
}

class Mailgun {

  constructor(config = {}) {
    this.config = {
      base_url: 'https://api.mailgun.net/v3',
      hostName: 'api.mailgun.net',
      basePath: '/v3',
      apiUser: 'api',
      protocol: 'https',
      authMode: 'basic',
      responseType: 'json'
    }

    this.config = Object.assign(this.config, config)
  }

  setApiKey(apiKey) {
    this.config.apiKey = apiKey
  }

  testConnection(callback) {
    this.get('/domains')
      .then(response => {
        return callback(response !== undefined && 'total_count' in response)
      })
  }

  
  /*** Requests **/
  get(path, params = []) {
    const config = this.config

    let opts = {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        'Authorization': 'Basic ' + Utils._toBase64(`${config.apiUser}:${config.apiKey}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    return fetch(config.base_url + path, opts)
      .then(function(response) {
        if (response.status > 200)
          throw new Error(Mailgun._HttpErrorCodeGetMessage(response.status));

        return Mailgun._parseResponse(response)
      })
      .catch(function(err) {
        Mailgun._handleError(err)
      });
  }

  post(path, params = []) {
    let postData = querystring.stringify(params);
    const config = this.config

    let opts = {
      method: 'POST',
      body: postData,
      headers: {
        'Authorization': 'Basic ' + Utils._toBase64(`${config.apiUser}:${config.apiKey}`),
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    return fetch(config.base_url + path, opts)
      .then(function(response) {

        let contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1)
          return Mailgun._parseResponse(response)
        else
          throw new Error("Invalid format received : " + contentType)

      })
      .catch(function(err) {
        Mailgun._handleError(err)
      });
  }

  static _handleError(e) {
    console.error(`[Mailgun isomorphic]: ${e.message}`)
    console.error(e)
  }

  static _parseResponse(response) {
    return response.json().then(function(json) {
      if (response.status > 200 && 'message' in json)
        throw new Error(json.message)
      else if (response.status > 200) {
        throw new Error(this._HttpErrorCodeGetMessage(response))
      }

      return json
    });
  }

  static _HttpErrorCodeGetMessage(response) {
    switch (response.status) {
      case 401:
        return 'Unauthorized, your API key might be wrong.'
      default:
        return 'Unknown error with code : ' + response.status
    }
  }

}


module.exports = class extends mix(Mailgun).with(
  domainMixin,
  messageMixin
) {}