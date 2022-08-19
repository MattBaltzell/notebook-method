const { BadRequestError } = require('../expressError');

/** Sets the SQL columns to update and sets values for those columns.
 *
 * Creates SET parameters in SQL (Example: "SET first_name=$1, user_type_id=$2")
 *
 * Creates VALUES parameters in SQL (Example: "VALUES ("Jeff", 2)")
 *
 * Returns {setCols: string of SQL SET parameters, values: [array of values]}
 *
 * Throws BadRequestError if not found.
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError('No data');

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(', '),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
