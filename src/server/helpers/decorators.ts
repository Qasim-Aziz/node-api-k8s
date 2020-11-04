export function validation(conf) {
  return (target, property) => {
    Object.assign(target[property], { validation: conf });
  };
}

export class Auth {
  static for(authorizations, paramsGetters = {}) {
    return (target, property) => Object.assign(target[property], {
      forAll: false,
      authorizedFor: authorizations,
      authorizedForGetters: paramsGetters,
    });
  }

  static forAll() {
    return (target, property) => Object.assign(target[property], {
      forAll: true,
    });
  }
}
