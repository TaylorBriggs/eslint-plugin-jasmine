'use strict'

/**
  * @fileoverview Enforce jasmine matchers are used instead of comparison within expect
*/

const TSLint = require('tslint');
const ts = require('typescript');
const findParentFromNode = require('../helpers/findParentFromNode');

const BLOCK_PATTERN = /^(f|i|x)?it$/;
const OPERATORS = [
  '===',
  '==',
  '!==',
  '!=',
  '>',
  '<',
  '>=',
  '<='
];

const isComparison = (arg, sourceFile) => (
  ts.isBinaryExpression(arg) &&
  OPERATORS.indexOf(arg.operatorToken.getText(sourceFile)) > -1
);

const isInsideBlock = node => findParentFromNode(node, parent => (
  ts.isCallExpression(parent) &&
  BLOCK_PATTERN.test(parent.expression.text)
));

const walk = function walk(ctx) {
  const { sourceFile } = ctx;

  const checkNode = function checkNode(node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.text === 'expect' &&
      isInsideBlock(node)
    ) {
      let [ expectArg ] = node.arguments;

      if (!expectArg) return;

      if (ts.isParenthesizedExpression(expectArg)) {
        expectArg = expectArg.expression;
      }

      if (isComparison(expectArg, sourceFile)) {
        return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
      }
    }

    return ts.forEachChild(node, checkNode);
  };

  return ts.forEachChild(sourceFile, checkNode);
};

class Rule extends TSLint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithFunction(sourceFile, walk);
  }
}

Rule.FAILURE_STRING = 'Prefer jasmine matcher instead of comparison.';

exports.Rule = Rule;
