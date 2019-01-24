const getLineNumber = require('./getLineNumber');

module.exports = function linesDelta(node1, node2, sourceFile) {
  const diff = getLineNumber(node1, sourceFile) - getLineNumber(node2, sourceFile);

  return Math.abs(diff);
};
