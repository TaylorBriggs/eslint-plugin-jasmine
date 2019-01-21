const ts = require('typescript');
const isPropertyAccessExpression = require('./isPropertyAccessExpression');

module.exports = function findIdentifier(node) {
  let { parent } = node;

  while (parent) {
    if (
      parent.kind === ts.SyntaxKind.BinaryExpression &&
      parent.operatorToken &&
      parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      parent.left
    ) {
      const { left } = parent;

      if (isPropertyAccessExpression(left)) {
        return left.name.text;
      }

      if (left.kind === ts.SyntaxKind.Identifier) {
        return left.text;
      }
    }

    if (
      parent.kind === ts.SyntaxKind.VariableDeclaration ||
      parent.kind === ts.SyntaxKind.PropertyAssignment
    ) {
      return parent.name.text;
    }

    parent = parent.parent
  }
};
