export class Utils {
  static isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  static isNil(obj) {
    return obj == null;
  }

  static pick(object, fileds) {
    return fileds.reduce((o, k) => { Object.assign(o, { [k]: object[k] }); return o; }, {});
  }

  static snakeCase(str: string) {
    return str.replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join('_');
  }

  static omit(obj: Record<string, unknown>, keys: string[]) {
    if (!keys.length) return obj;
    const { [keys.pop()]: omitted, ...rest } = { ...obj };
    return Utils.omit(rest, keys);
  }

  static isEmpty(arr: unknown[]) {
    return arr.length === 0;
  }
}
