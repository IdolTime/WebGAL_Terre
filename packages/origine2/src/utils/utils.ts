export function getWhenARGExpression(value = '') {
  return value.split(/([+\-*\/()><!]=?|>=|<=|==|&&|\|\||!=)/g);
}
