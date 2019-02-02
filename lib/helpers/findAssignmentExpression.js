const ts = require('typescript');
const findParentFromNode = require('./findParentFromNode');
const isAssignmentExpression = require('./isAssignmentExpression');

/**
 * Finds the parent of a node that is an assignment expression
 * @param {Node} node
 * @returns {Node} The parent node which is the variable or property assignment
 */

module.exports = function findAssignmentExpression(node) {
  return findParentFromNode(node, isAssignmentExpression);
}
