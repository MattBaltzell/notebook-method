/** Database */

const pg = require('pg');

const db = new pg.Client('postgresql:///homeschool-helper');

db.connect();

module.exports = db;
