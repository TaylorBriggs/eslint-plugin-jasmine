const findAssignmentExpression = require('./findAssignmentExpression');

/**
 * Gets the identifier of an assignment expression
 * @param {Node} node
 * @returns {string} Name of the variable or property that was assigned
 */
module.exports = function findIdentifier(node) {
  const assignmentNode = findAssignmentExpression(node);

  if (assignmentNode) {
    const { left, name } = assignmentNode;

    if (name) {
      return name.text;
    }

    if (left) {
      return left.name ? left.name.text : left.text;
    }
  }
};
