'use strict'

/**
  * @fileoverview Enforce to have a new line between declarations inside describe
  */

const TSLint = require('tslint');
const ts = require('typescript');
const hasPaddingBetweenLines = require('../helpers/hasPaddingBetweenLines');

const DECLARATIONS_PATTERN = /^((before|after)(Each|All)?)|^(f|x)?(i?it|d?describe)/;
const SUITE_PATTERN = /^(f|x|d)?describe$/;

const getDescribeDeclarationsContent = (describe, sourceFile) => {
  const declarations = [];

  if (
    describe.arguments &&
    describe.arguments[1] &&
    describe.arguments[1].body
  ) {
    const { statements = [] } = describe.arguments[1].body;

    statements.forEach((node) => {
      if (
        ts.isExpressionStatement(node) &&
        DECLARATIONS_PATTERN.test(node.getFirstToken(sourceFile).text)
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
    if (ts.isCallExpression(node) && SUITE_PATTERN.test(node.expression.text)) {
      const declarations = getDescribeDeclarationsContent(node, sourceFile);
      const { length } = declarations;
      let i = 0;
      let declaration;
      let next;

      while (i < length) {
        declaration = declarations[i];
        next = declarations[i + 1];

        if (next && !hasPaddingBetweenLines(declaration, next, sourceFile)) {
          const fix = new TSLint.Replacement(
            declaration.getStart(sourceFile),
            declaration.getWidth(sourceFile),
            `${declaration.text}\n`
          );

          ctx.addFailureAtNode(next, Rule.FAILURE_STRING, fix);
        }

        i += 1;
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

Rule.FAILURE_STRING = 'No new line between declarations.';

exports.Rule = Rule;
