const ts = require('typescript');
const findParentFromNode = require('./findParentFromNode');
const isPropertyAccessExpression = require('./isPropertyAccessExpression');

module.exports = function findIdentifier(node) {
  const varOrPropAssignment = findParentFromNode(node, ({ kind }) => (
    kind === ts.SyntaxKind.VariableDeclaration ||
    kind === ts.SyntaxKind.PropertyAssignment
  ));

  if (varOrPropAssignment) {
    return varOrPropAssignment.name.text;
  }

  const binaryNode = findParentFromNode(node, parent => (
    parent.kind === ts.SyntaxKind.BinaryExpression &&
    parent.operatorToken &&
    parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
    parent.left
  ));

  if (binaryNode) {
    const { left } = binaryNode;

    if (isPropertyAccessExpression(left)) {
      return left.name.text;
    }

    if (left.kind === ts.SyntaxKind.Identifier) {
      return left.text;
    }
  }
};
