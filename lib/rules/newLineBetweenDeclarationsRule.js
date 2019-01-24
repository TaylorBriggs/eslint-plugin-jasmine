'use strict'

/**
  * @fileoverview Enforce to have a new line between declarations inside describe
  */

const TSLint = require('tslint');
const ts = require('typescript');
const hasPaddingBetweenLines = require('../helpers/hasPaddingBetweenLines');
const isCallExpression = require('../helpers/isCallExpression');

const DECLARATIONS_PATTERN = /^((before|after)(Each|All)?)|^(f|x)?(it|describe)/;
const SUITE_PATTERN = /^(f|x)?describe$/;

const getDescribeDeclarationsContent = (describe) => {
  const declarations = [];

  if (
    describe.arguments &&
    describe.arguments[1] &&
    describe.arguments[1].body
  ) {
    const { statements = [] } = describe.arguments[1].body;

    statements.forEach((node) => {
      if (
        node.kind === ts.SyntaxKind.ExpressionStatement &&
        DECLARATIONS_PATTERN.test(node.getText())
      ) {
        declarations.push(node);
      }
    });
  }

  return declarations;
}

const walk = function walk(ctx) {
  const { sourceFile } = ctx;

  const checkNode = function checkNode(node) {
    if (isCallExpression(node) && SUITE_PATTERN.test(node.expression.getText())) {
      const declarations = getDescribeDeclarationsContent(node);
      const { length } = declarations;
      let i = 0;
      let declaration;
      let next;

      while (i < length) {
        declaration = declarations[i];
        next = declarations[i + 1];

        if (next && !hasPaddingBetweenLines(declaration, next, sourceFile)) {
          return ctx.addFailureAtNode(next, Rule.FAILURE_STRING);
        }

        i += 1;
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

Rule.FAILURE_STRING = 'No new line between declarations.';

exports.Rule = Rule;
