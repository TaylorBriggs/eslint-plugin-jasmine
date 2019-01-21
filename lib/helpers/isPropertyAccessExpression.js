const ts = require('typescript');

module.exports = function isPropertyAccessExpression(node) {
  return node.kind === ts.SyntaxKind.PropertyAccessExpression;
}
