const ts = require('typescript');

module.exports = function isCallExpression(node) {
  return node.kind === ts.SyntaxKind.CallExpression;
};
