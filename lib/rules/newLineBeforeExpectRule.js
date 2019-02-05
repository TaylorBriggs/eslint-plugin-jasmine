'use strict'

/**
  * @fileoverview Enforce new line before expect inside a suite
*/

const TSLint = require('tslint');
const ts = require('typescript');
const getLineNumber = require('../helpers/getLineNumber');
const hasPaddingBetweenLines = require('../helpers/hasPaddingBetweenLines');
const linesDelta = require('../helpers/linesDelta');

const EXPECT_TOKEN = 'expect';
const IT_PATTERN = /^(f|x|i)?it$/;

const getItDeclarationContent = (it) => {
  if (it.arguments && it.arguments[1]) {
    const callback = it.arguments[1];

    if (callback.kind === ts.SyntaxKind.FunctionExpression) {
      return callback.body.statements;
    }

    if (
      ts.isCallExpression(callback) &&
      callback.arguments &&
      callback.arguments[0].kind === ts.SyntaxKind.FunctionExpression
    ) {
      return callback.arguments[0].body.statements;
    }
  }
};

const isFirstExpectOnLine = (node, siblings, sourceFile) => {
  const position = node.getStart(sourceFile);
  const lineNumber = getLineNumber(position, sourceFile);
  let siblingLineNumber;
  let siblingPosition;

  return siblings.filter((sibling) => {
    siblingPosition = sibling.getEnd();
    siblingLineNumber = getLineNumber(siblingPosition, sourceFile);

    return siblingLineNumber === lineNumber && siblingPosition <= position;
  })
    .map(node => node.getFirstToken(sourceFile).text)
    .filter(token => token === EXPECT_TOKEN)
    .length === 0;
};

const walk = function walk(ctx) {
  const { sourceFile } = ctx;
  let lastExpectNode;

  const checkItBlock = function checkItBlock(node) {
    const content = getItDeclarationContent(node);

    if (!content) return;

    const { length } = content;
    let i = 0;
    let currentNode;
    let prevNode;

    while (i < length) {
      currentNode = content[i];
      prevNode = content[i - 1];

      if (!prevNode || currentNode.getFirstToken(sourceFile).text !== EXPECT_TOKEN) {
        i += 1;
        continue;
      }

      if (
        lastExpectNode &&
        linesDelta(currentNode, lastExpectNode, sourceFile) === 1
      ) {
        lastExpectNode = currentNode;
        i += 1;
        continue;
      }

      lastExpectNode = currentNode;

      if (
        !hasPaddingBetweenLines(prevNode, currentNode, sourceFile) &&
        isFirstExpectOnLine(currentNode, content, sourceFile)
      ) {
        const fix = new TSLint.Replacement(
          currentNode.getFullStart(sourceFile),
          currentNode.getFullWidth(sourceFile),
          `\n${currentNode.getFullText(sourceFile)}`
        );

        ctx.addFailureAtNode(currentNode, Rule.FAILURE_STRING, fix);
      }

      i += 1;
    }
  };

  const checkNode = function checkNode(node) {
    if (ts.isCallExpression(node) && IT_PATTERN.test(node.expression.text)) {
      lastExpectNode = null;

      return checkItBlock(node);
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

Rule.FAILURE_STRING = 'No new line before expect.';

exports.Rule = Rule;
