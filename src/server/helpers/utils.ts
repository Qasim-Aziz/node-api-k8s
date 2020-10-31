export class Utils {
  static isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
  }

  static isNil(obj) {
    return obj == null;
  }
}
