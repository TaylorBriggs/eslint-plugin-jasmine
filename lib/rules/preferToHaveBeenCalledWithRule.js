'use strict';

/**
 * @fileoverview Prefer toHaveBeenCalledWith insteaf of toHaveBeenCalled
 */

const TSLint = require('tslint');
const ts = require('typescript');

// module.exports = function (context) {
//   return {
//     Identifier: function (node) {
//       if (node.name === 'toHaveBeenCalled') {
//         const tokensBefore = context.getTokensBefore(node, 2)
//         if (tokensBefore[1] && tokensBefore[1].type === 'Punctuator' && tokensBefore[1].value === '.' &&
//             tokensBefore[0] && tokensBefore[0].type === 'Identifier' && tokensBefore[0].value === 'not') {
//           return
//         }
//         context.report({
//           message: 'Prefer toHaveBeenCalledWith',
//           node
//         })
//       }
//     }
//   }
// }

const isNegated = node => (
  ts.isPropertyAccessExpression(node) &&
  ts.isPropertyAccessExpression(node.expression) &&
  node.expression.name.getText() === 'not'
);

const walk = function walk(ctx) {
  const checkNode = function checkNode(node) {
    if (ts.isIdentifier(node) && node.getText() === 'toHaveBeenCalled') {
      const { parent } = node;

      if (isNegated(parent)) return;

      return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
    }

    return ts.forEachChild(node, checkNode);
  };

  return ts.forEachChild(ctx.sourceFile, checkNode);
};

class Rule extends TSLint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithFunction(sourceFile, walk);
  }
}

Rule.FAILURE_STRING = 'Prefer `toHaveBeenCalledWith.`';

exports.Rule = Rule;
