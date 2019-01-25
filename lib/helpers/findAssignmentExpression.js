const ts = require('typescript');
const findParentFromNode = require('./findParentFromNode');

/**
 * Finds the parent of a node that is an assignment expression
 * @param {Node} node
 * @returns {Node} The parent node which is the variable or property assignment
 */
module.exports = function isAssignmentExpression(node) {
  return findParentFromNode(node, parent => (
    ts.isPropertyAssignment(parent) || ts.isVariableDeclaration(parent) ||
    (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken)
  ));
}
