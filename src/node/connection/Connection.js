/* eslint-disable node/no-extraneous-require */
const tunnel = require('tunnel');
const axios = require('axios');
const tls = require('tls');
const FormData = require('form-data');
const https = require('https');

const CONNECTION_CONST = require('./constant');
const BaseConnection = require('../../base/main').Connection;
const KintoneAPIException = require('../../base/main').KintoneAPIException;

const CONTENT_TYPE_KEY = 'Content-Type';
const FILE_RESPONSE_TYPE_KEY = 'responseType';
const FILE_RESPONSE_TYPE_VALUE = 'arraybuffer';

class Connection extends BaseConnection {
  /**
     * @param {Object} params
     * @param {String} params.domain
     * @param {Auth} params.auth
     * @param {Number} params.guestSpaceID
     */

  constructor({domain, auth, guestSpaceID} = {}) {
    super({domain, auth, guestSpaceID});
    this.setClientCert();
  }

  /**
   * Set certificate for request by data
   * @param {String} proxyHost
   * @param {String} proxyPort
   * @return {this}
   */
  setClientCert() {
    if (!this.auth.getClientCertData()) {
      return;
    }
    const httpsAgent = new https.Agent({
      pfx: this.auth.getClientCertData(),
      passphrase: this.auth.getPassWordCert()
    });
    this.addRequestOption({key: CONNECTION_CONST.BASE.HTTPS_AGENT, value: httpsAgent});
  }

  /**
   * Set http proxy for request
   * @param {Object} params
   * @param {String} params.proxyHost
   * @param {String} params.proxyPort
   * @param {String} params.proxyUsername
   * @param {String} params.proxyPassword
   * @return {this}
   */
  setProxy({proxyHost, proxyPort, proxyUsername, proxyPassword}) {
    const option = {
      proxy: {host: proxyHost, port: proxyPort}
    };
    if (proxyUsername && proxyPassword) {
      option.proxy.proxyAuth = `${proxyUsername}:${proxyPassword}`;
    }
    if (this.auth.getClientCertData()) {
      option.pfx = this.auth.getClientCertData();
      option.passphrase = this.auth.getPassWordCert();
    }
    const httpsAgent = tunnel.httpsOverHttp(option);
    this.addRequestOption({key: CONNECTION_CONST.BASE.HTTPS_AGENT, value: httpsAgent});
    return this;
  }

  /**
   * Set https proxy for request
   * @param {Object} params
   * @param {String} params.proxyHost
   * @param {String} params.proxyPort
   * @param {String} params.proxyUsername
   * @param {String} params.proxyPassword
   * @return {this}
   */
  setHttpsProxy({proxyHost, proxyPort, proxyUsername, proxyPassword}) {
    const option = {
      proxy: {host: proxyHost, port: proxyPort}
    };
    if (proxyUsername && proxyPassword) {
      option.proxy.proxyAuth = `${proxyUsername}:${proxyPassword}`;
    }
    if (this.auth.getClientCertData()) {
      option.pfx = this.auth.getClientCertData();
      option.passphrase = this.auth.getPassWordCert();
    }
    const httpsAgent = tunnel.httpsOverHttps(option);
    this.addRequestOption({key: CONNECTION_CONST.BASE.HTTPS_AGENT, value: httpsAgent});
    return this;
  }

  /**
   * upload file to kintone
   * @param {String} fileName
   * @param {String} fileContent
   * @return {Promise}
   */
  upload(fileName, fileContent) {
    const formData = new FormData();
    formData.append('file', fileContent, fileName);
    this.setHeader({key: CONTENT_TYPE_KEY, value: formData.getHeaders()['content-type']});
    return this.requestFile('POST', 'FILE', formData);
  }

  /**
   * request to URL
   * @param {String} methodName
   * @param {String} restAPIName
   * @param {Object} body
   * @return {Promise}
   */
  request(methodName, restAPIName, body) {
    // Set Header
    const headersRequest = {};
    // set header with credentials
    this.auth.createHeaderCredentials().forEach((httpHeaderObj) => {
      headersRequest[httpHeaderObj.getKey()] = httpHeaderObj.getValue();
    });
    this.headers.forEach((httpHeaderObj) => {
      const headerKey = httpHeaderObj.getKey();
      if (headersRequest.hasOwnProperty(headerKey) && headerKey === CONNECTION_CONST.BASE.USER_AGENT) {
        headersRequest[headerKey] += ' ' + httpHeaderObj.getValue();
      } else {
        headersRequest[headerKey] = httpHeaderObj.getValue();
      }
      this.USER_AGENT = headersRequest[CONNECTION_CONST.BASE.USER_AGENT];
    });
    // Set request options
    const requestOptions = this.options;
    requestOptions.method = String(methodName).toUpperCase();
    requestOptions.url = this.getUri(restAPIName);
    requestOptions.headers = headersRequest;

    if (requestOptions.hasOwnProperty('httpsAgent')) {
      try {
        tls.createSecureContext(requestOptions.httpsAgent.options);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // set data to param if using GET method
    if (requestOptions.method === 'GET') {
      requestOptions.params = body;
      requestOptions.paramsSerializer = this.serializeParams;
      delete requestOptions.data;
    } else {
      requestOptions.data = body;
    }
    // Execute request
    const request = axios(requestOptions).then(response => {
      return response.data;
    });
    // reset header
    this.refreshHeader();
    return request;
  }
  /**
   * request to URL
   * @param {String} methodName
   * @param {String} restAPIName
   * @param {String} body
   * @return {Promise}
   */
  requestFile(methodName, restAPIName, body) {
    // Set Header
    const headersRequest = {};
    // set header with credentials
    this.auth.createHeaderCredentials().forEach((httpHeaderObj) => {
      headersRequest[httpHeaderObj.getKey()] = httpHeaderObj.getValue();
    });
    this.headers.forEach((httpHeaderObj) => {
      const headerKey = httpHeaderObj.getKey();
      if (headersRequest.hasOwnProperty(headerKey) && headerKey === CONNECTION_CONST.BASE.USER_AGENT) {
        headersRequest[headerKey] += ' ' + httpHeaderObj.getValue();
      } else {
        headersRequest[headerKey] = httpHeaderObj.getValue();
      }
      this.USER_AGENT = headersRequest[CONNECTION_CONST.BASE.USER_AGENT];
    });

    // Set request options
    const requestOptions = this.copyObject(this.options);
    requestOptions.method = String(methodName).toUpperCase();
    requestOptions.url = this.getUri(restAPIName);
    requestOptions.headers = headersRequest;

    if (requestOptions.hasOwnProperty('httpsAgent')) {
      try {
        tls.createSecureContext(requestOptions.httpsAgent.options);
      } catch (err) {
        return Promise.reject(new KintoneAPIException(err));
      }
    }
    // set data to param if using GET method
    if (requestOptions.method === 'GET') {
      requestOptions.params = body;
      requestOptions[FILE_RESPONSE_TYPE_KEY] = FILE_RESPONSE_TYPE_VALUE;
    } else {
      requestOptions.data = body;
    }
    // Execute request
    const request = axios(requestOptions).then(response => {
      return response.data;
    }).catch(err => {
      throw new KintoneAPIException(err);
    });
    this.refreshHeader();
    return request;
  }
}
module.exports = Connection;
