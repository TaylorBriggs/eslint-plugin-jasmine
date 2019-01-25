'use strict'

/**
 * @fileoverview Disallow variables within the describe block
 */

const TSLint = require('tslint');
const ts = require('typescript');

const SUITE_PATTERN = /^(f|x)?describe$/;

const walk = function walk(ctx) {
  const checkNode = function checkNode(node) {
    if (ts.isCallExpression(node) && SUITE_PATTERN.test(node.expression.getText())) {
      const callback = node.arguments[1];

      if (callback && callback.body) {
        const { statements } = callback.body;
        const { length } = statements;
        let i = 0;
        let currentNode;

        while (i < length) {
          currentNode = statements[i];

          if (ts.isVariableStatement(currentNode)) {
            return ctx.addFailureAtNode(currentNode, Rule.FAILURE_STRING);
          }

          i += 1;
        }
      }
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

Rule.FAILURE_STRING = 'Test has variable declaration in the describe block.';

exports.Rule = Rule;

// function report (context, node) {
//   context.report({
//     message: 'Test has variable declaration in the describe block',
//     node
//   })
// }

// module.exports = function (context) {
//   return {
//     'CallExpression[callee.name="describe"] > FunctionExpression > BlockStatement > VariableDeclaration': report.bind(this, context),
//     'CallExpression[callee.name="xdescribe"] > FunctionExpression > BlockStatement > VariableDeclaration': report.bind(this, context),
//     'CallExpression[callee.name="fdescribe"] > FunctionExpression > BlockStatement > VariableDeclaration': report.bind(this, context)
//   }
// }
