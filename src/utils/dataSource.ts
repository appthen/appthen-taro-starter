import Taro from '@tarojs/taro'
import * as utils from './index'
import { __beforeRequest, __afterRequest } from './utils'
const { objectToQuery } = utils as any

export function requestHandle(config?: Record<string, unknown>) {
  return function (options: any) {
    return new Promise(async (resolve, reject) => {
      let _options = options
      // hook
      if (__beforeRequest) {
        _options = __beforeRequest(options)
        if (_options.then && typeof _options.then === 'function') {
          _options = await __beforeRequest(options)
        }
      }

      const { contentType, params, method, headers = {}, timeout } = _options;
      let uri = _options.uri;
      const { __query, __pathParams } = (params || {}) as any;
      // console.log('[HTTP_REQUEST] ', uri, _options)
      if (__query) {
        if (uri.indexOf('?') > -1) {
          uri += '&';
        } else {
          uri += '?';
        }
        uri += objectToQuery(__query as object, false);
        delete params.__query;
      }
      if (__pathParams) {
        const _pathParams: Record<string, any> = {
          ...(_options as any).pathParams,
          ...__pathParams,
        };
        if (Object.keys(_pathParams).length > 0) {
          uri = uri.replace(/:(\w+)/g, (_, $1) => {
            if (_pathParams[$1]) {
              return _pathParams[$1];
            } else {
              throw new Error(`Path params ${$1} is not defined`);
            }
          });
        }
        delete params.__pathParams;
      }

      let data = ''
      if (contentType === 'FORM') {
        for (const k in params) {
          if (typeof params[k] !== 'undefined') {
            if (
              typeof params[k] !== 'string' &&
              typeof params[k] !== 'number'
            ) {
              console.warn('API PARAMS 参数值只可以为字符串或数值 字段名: ' + k)
            }
            data += '\r\n--XXX'
            data += `\r\nContent-Disposition: form-data; name="${k}"`
            data += '\r\n'
            data += `\r\n${params[k]}`
          }
        }
        data += '\r\n--XXX--'
      }

      Taro.request({
        url: uri,
        data: contentType === 'FORM' ? data : params,
        header: {
          'content-type': contentType === 'JSON'
            ? 'application/json'
            : contentType === 'application/x-www-form-urlencoded'
            ? 'application/x-www-form-urlencoded'
            : 'multipart/form-data; boundary=XXX',
          ...headers
        },
        method,
        timeout: timeout || 10000,
        success: async res => {
          // hook
          let response = res
          response = __afterRequest(response)
          // @ts-ignore
          if (response.then && typeof response.then === 'function') {
            response = await __afterRequest(res)
          }
          // console.log('[HTTP_RESPONSE] ', uri, response, res)
          resolve(response)
        },
        fail: e => {
          console.log('[api fail] ', uri, e)
          reject(e)
        }
      })
    })
  }
}
