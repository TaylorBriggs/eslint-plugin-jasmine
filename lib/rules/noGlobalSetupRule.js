'use strict';

/**
 * @fileoverview Disallow using setup and teardown methods outside a suite
 */

const TSLint = require('tslint');
const ts = require('typescript');

const SUITE_PATTERN = /^(f|x|d)?describe$/;
const SETUP_PATTERN = /^(before|after)(Each|All)?$/;

const formatFailureMessage = name => `Do not use \`${name}\` outside a \`describe\` except for in global helpers.`;

const walk = function walk(ctx) {
  const { sourceFile } = ctx;
  const { statements } = sourceFile;
  const { length } = statements;
  const failures = [];

  if (length) {
    let i = 0;
    let hasRootSuite = false;
    let node;
    let firstToken;

    while (i < length) {
      node = statements[i];

      if (ts.isCallExpression(node.getChildAt(0))) {
        firstToken = node.getFirstToken(sourceFile).text;
        hasRootSuite = hasRootSuite || SUITE_PATTERN.test(firstToken);

        if (!hasRootSuite && SETUP_PATTERN.test(firstToken)) {
          failures.push({ node, message: formatFailureMessage(firstToken) });
          i += 1;
          continue;
        }
      }

      i += 1;
    }
  }

  return failures.map(({ node, message }) => ctx.addFailureAtNode(node, message));
};

class Rule extends TSLint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithFunction(sourceFile, walk);
  }
}

exports.Rule = Rule;
