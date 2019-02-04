'use strict'

/**
 * @fileoverview Returns a rule that check for duplicated blocks
 */

const TSLint = require('tslint');
const ts = require('typescript');
const isAssignmentExpression = require('./isAssignmentExpression');

const extractLiteral = function extractLiteral(node) {
  if (ts.isStringLiteral(node)) {
    return node.text;
  }

  if (ts.isBinaryExpression(node)) {
    return `${extractLiteral(node.left)}${extractLiteral(node.right)}`;
  }

  if (ts.isTemplateExpression(node)) {
    const values = {};
    let { parent } = node;
    let identifier;
    let isBinary;

    while (parent) {
      if (isAssignmentExpression(parent)) {
        isBinary = parent.left && parent.right;
        identifier = isBinary
          ? extractLiteral(parent.left.name)
          : extractLiteral(parent.name);

        if (identifier) {
          values[identifier] = isBinary
            ? extractLiteral(parent.right)
            : extractLiteral(parent.initializer);
        }

        parent = parent.parent;
      }
    }

    const substitutions = node.templateSpans.map(({ expression, literal }) => (
      `${values[expression.text]}${extractLiteral(literal)}`
    ));

    return `${extractLiteral(node.head)}${substitutions}`;

    return node.head.text + node.templateSpans.map(({ expression, literal }) =>
      `${values[expression.text]}${literal.text}`
    );
  }

  return null;
};

const isFound = (target, node) => target.indexOf(node.expression.text) > -1;

const noArgs = node => !node.arguments;

const getDescription = function getDescription(node) {
  if (noArgs(node)) return;

  const [ descriptionNode ] = node.arguments;

  return descriptionNode && extractLiteral(descriptionNode);
};

const getSuiteName = function getSuiteName(description, branches, isBranchMode = false) {
  if (isBranchMode && branches.length) {
    return [ ...branches, description ].join(' ');
  }

  return description;
};

module.exports = function noDupes(kind, branchBlocks, checkedBlocks) {
  const walk = function walk(ctx) {
    const isBranchMode = ctx.options && ctx.options[0] === 'branch';
    let suites = [];
    let branches = [];
    let branchCallback;
    let descriptionLiteral;
    let isBranch;
    let isChecked;
    let suite;

    const checkNode = function checkNode(node) {
      if (ts.isCallExpression(node)) {
        isBranch = isFound(branchBlocks, node);
        isChecked = isFound(checkedBlocks, node);

        if (!isBranch && !isChecked) return;

        descriptionLiteral = getDescription(node);

        if (!descriptionLiteral) return;

        if (isChecked) {
          suite = getSuiteName(descriptionLiteral, branches, isBranchMode);

          if (suites.indexOf(suite) !== -1) {
            suites = [];

            return ctx.addFailureAtNode(node, `Duplicate ${kind}: "${suite}."`);
          }

          suites.push(suite);
        }

        if (isBranch) {
          if (isBranchMode) {
            branches.push(descriptionLiteral);
          }

          branchCallback = node.arguments[1];

          if (branchCallback && branchCallback.body) {
            const { statements } = branchCallback.body;
            const { length } = statements;
            let i = 0;

            while(i < length) {
              checkNode(statements[i]);
              i += 1;
            }
          }

          if (isBranchMode) {
            branches.pop();
          }
        }

        return;
      }

      return ts.forEachChild(node, checkNode);
    };

    return ts.forEachChild(ctx.sourceFile, checkNode);
  };

  class Rule extends TSLint.Rules.AbstractRule {
    apply(sourceFile) {
      const options = this.getOptions();

      return this.applyWithFunction(sourceFile, walk, options.ruleArguments);
    }
  }

  return Rule;
}
