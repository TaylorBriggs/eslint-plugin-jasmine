'use strict'

/**
  * @fileoverview Enforce to have a new line between declarations inside describe
  */

const TSLint = require('tslint');
const ts = require('typescript');
const hasPaddingBetweenLines = require('../helpers/hasPaddingBetweenLines');
const isCallExpression = require('../helpers/isCallExpression');

const DECLARATIONS_PATTERN = /^((before|after)(Each|All)?)|^(f|x)?(it|describe)/
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

// var hasPaddingBetweenTokens = require('../helpers/hasPaddingBetweenTokens')

// var suiteRegexp = /^(f|x)?describe$/

// module.exports = function (context) {
//   return {
//     CallExpression: function (node) {
//       var declWithoutPadding = null
//       if (suiteRegexp.test(node.callee.name)) {
//         var declarations = getDescribeDeclarationsContent(node)
//         declarations.forEach((decl, i) => {
//           var next = declarations[i + 1]
//           if (next && !hasPaddingBetweenTokens(decl, next)) {
//             declWithoutPadding = decl
//           }
//         })
//       }
//       if (declWithoutPadding) {
//         context.report({
//           fix (fixer) {
//             return fixer.insertTextAfter(declWithoutPadding, '\n')
//           },
//           message: 'No new line between declarations',
//           node
//         })
//       }
//     }
//   }
// }

//  /**
//  * Returns list of declaration tokens (it, before,after/each,all) inside describe
//  * @param {Token} describe The first token
//  * @returns {Token[]} list of declaration tokens inside describe
//  */
// function getDescribeDeclarationsContent (describe) {
//   var declartionsRegexp = /^(((before|after)(Each|All))|^(f|x)?(it|describe))$/
//   var declarations = []
//   if (describe.arguments && describe.arguments[1] && describe.arguments[1].body && describe.arguments[1].body.body) {
//     var content = describe.arguments[1].body.body
//     content.forEach(node => {
//       if (node.type === 'ExpressionStatement' && node.expression.callee && declartionsRegexp.test(node.expression.callee.name)) {
//         declarations.push(node)
//       }
//     })
//   }
//   return declarations
// }
