'use strict';

/**
 * @fileoverview Disallow the use of duplicate spec names
 */

const noDupes = require('../helpers/noDupes');

const branchBlocks = ['describe'];
const checkedBlocks = ['it'];

exports.Rule = noDupes('spec', branchBlocks, checkedBlocks);
