module.exports = function findParentFromNode(node, predicate) {
  let { parent } = node;

  while (parent) {
    if (predicate(parent)) {
      return parent;
    }

    parent = parent.parent;
  }
};
