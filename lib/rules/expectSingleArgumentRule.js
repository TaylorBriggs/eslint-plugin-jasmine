'use strict'

const TSLint = require('tslint');
const ts = require('typescript');

/**
 * @fileoverview Enforce expect having a single argument.
 */

const walk = function walk(ctx) {
  const checkNode = function checkNode(node) {
    if (
      node.kind === ts.SyntaxKind.CallExpression &&
      node.expression.text === 'expect'
    ) {
      if (!node.arguments.length) {
        return ctx.addFailureAtNode(node, Rule.NO_ARGUMENTS);
      }
      if (node.arguments.length > 1) {
        return ctx.addFailureAtNode(node, Rule.MORE_THAN_ONE_ARGUMENT);
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

const BASE_ERROR = 'Expect must have a single argument.';

Rule.NO_ARGUMENTS = `${BASE_ERROR} No arguments were provided.`;
Rule.MORE_THAN_ONE_ARGUMENT = `${BASE_ERROR} More than one argument was provided.`;

exports.Rule = Rule;
