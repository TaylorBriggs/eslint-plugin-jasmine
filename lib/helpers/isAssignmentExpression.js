const ts = require('typescript');

module.exports = function isAssignmentExpression(parent) {
  return (
    ts.isPropertyAssignment(parent) || ts.isVariableDeclaration(parent) ||
    (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken)
  );
};
