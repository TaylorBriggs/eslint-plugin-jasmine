'use strict';

/**
 * @fileoverview Enforce spies to be declared in before/after/it blocks
 */

const TSLint = require('tslint');
const ts = require('typescript');
const findParentFromNode = require('../helpers/findParentFromNode');

const WHITELIST = /^(((before|after)(All|Each)?)|((f|i|x)?it))$/;

const hasWhitelistedParent = function hasWhitelistedParent(node) {
  const whitelistedParent = findParentFromNode(node, parent => (
    ts.isCallExpression(parent) &&
    WHITELIST.test(parent.expression.getText())
  ));

  return !!whitelistedParent;
}

const isSpy = node => (
  node.expression.getText() === 'spyOn' ||
  (
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.expression.getText() === 'jasmine' &&
    (
      node.expression.name.getText() === 'createSpy' ||
      node.expression.name.getText() === 'createSpyObj'
    )
  )
);

const walk = function walk(ctx) {
  const checkNode = function checkNode(node) {
    if (ts.isCallExpression(node)) {
      if (isSpy(node) && !hasWhitelistedParent(node)) {
        return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
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

Rule.FAILURE_STRING = 'Spy declared outside of before/after/it block.';

exports.Rule = Rule;

// module.exports = function (context) {
//   return {
//     CallExpression: function (node) {
//       if (
//         node.callee.name !== 'spyOn' &&
//         !(
//           (node.callee.object && node.callee.object.name === 'jasmine') &&
//           (
//             (node.callee.property && node.callee.property.name === 'createSpy') ||
//             (node.callee.property && node.callee.property.name === 'createSpyObj')
//           )
//         )
//       ) { return }

//       if (blocksWhitelistRegexp.test(getParentJasmineBlock(context.getAncestors()))) { return }

//       context.report({
//         message: 'Spy declared outside of before/after/it block',
//         node
//       })
//     }
//   }
// }
