'use strict';

/**
 * @fileoverview Disallow the use of duplicate suite names
 */

const noDupes = require('../helpers/noDupes');

const branchAndCheckedBlocks = ['describe'];

exports.Rule = noDupes('suite', branchAndCheckedBlocks, branchAndCheckedBlocks);
