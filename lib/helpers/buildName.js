const ts = require('typescript');

/**
 * Returns a formatted name from a node
 * @param {Node} node
 * @returns {string}
 */
module.exports = function buildName(node) {
  if (ts.isCallExpression(node)) {
    return `${buildName(node.expression)}()`;
  }
  if (ts.isPropertyAccessExpression(node)) {
    return `${buildName(node.expression)}.${node.name.text}`;
  }
  if (ts.isIdentifier(node)) {
    return node.text;
  }
};
