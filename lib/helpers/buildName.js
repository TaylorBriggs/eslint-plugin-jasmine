const ts = require('typescript');
const isCallExpression = require('./isCallExpression');
const isPropertyAccessExpression = require('./isPropertyAccessExpression');

module.exports = function buildName(node) {
  if (isCallExpression(node)) {
    return `${buildName(node.expression)}()`;
  }
  if (isPropertyAccessExpression(node)) {
    return `${buildName(node.expression)}.${node.name.text}`;
  }
  if (node.kind === ts.SyntaxKind.Identifier) {
    return node.text;
  }
};
