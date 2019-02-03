'use strict';

const ts = require('typescript');

module.exports = function prohibit(terms) {
  const PROHIBITED_PATTERN = new RegExp(`^(${terms.join('|')})$`);

  return function walk(ctx) {
    const checkNode = function checkNode(node) {
      if (ts.isCallExpression(node)) {
        const name = node.expression.getText();

        if (PROHIBITED_PATTERN.test(name)) {
          return ctx.addFailureAtNode(node, `Unexpected ${name}.`);
        }

        return ts.forEachChild(node, checkNode);
      }

      return ts.forEachChild(node, checkNode);
    };

    return ts.forEachChild(ctx.sourceFile, checkNode);
  };
}
