const linesDelta = require('./linesDelta');

module.exports = function hasPaddingBetweenLines(node1, node2, sourceFile) {
  return linesDelta(node1, node2, sourceFile) > 1;
};
