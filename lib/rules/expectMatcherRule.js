'use strict';

const Lint = require('tslint');
const ts = require('typescript');

/**
 * @fileoverview Enforce expect having a corresponding matcher.
 */

const walk = function walk(ctx) {
  const checkNode = function checkNode(node) {
    if (
      node.kind === ts.SyntaxKind.CallExpression &&
      node.expression &&
      node.expression.text === 'expect' &&
      node.parent &&
      node.parent.parent &&
      node.parent.parent.kind !== ts.SyntaxKind.CallExpression &&
      node.parent.parent.kind !== ts.SyntaxKind.PropertyAccessExpression
    ) {
      return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
    }

    return ts.forEachChild(node, checkNode);
  };

  return ts.forEachChild(ctx.sourceFile, checkNode);
};

class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithFunction(sourceFile, walk);
  }
}

Rule.FAILURE_STRING = 'Expect must have a corresponding matcher call.';

exports.Rule = Rule;
