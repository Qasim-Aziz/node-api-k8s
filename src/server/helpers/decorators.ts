export function validation(conf) {
  return (target, property) => {
    target[property].validation = conf;
  };
}
