const ts = require('typescript');
const isCallExpression = require('./isCallExpression');
const isPropertyAccessExpression = require('./isPropertyAccessExpression');

/**
 * Returns a formatted name from a node
 * @param {Node} node
 * @returns {string}
 */
module.exports = function buildName(node) {
  if (isCallExpression(node)) {
    return `${buildName(node.expression)}()`;
  }
  if (isPropertyAccessExpression(node)) {
    return `${buildName(node.expression)}.${node.name.getText()}`;
  }
  if (node.kind === ts.SyntaxKind.Identifier) {
    return node.getText();
  }
};
