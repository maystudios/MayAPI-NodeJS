const db = require("../db/db.js");

module.exports = {
  createInventory: (id) => {
    /**
     * Inventory object containing items array.
     * @typedef {Object} Inventory
     * @property {Array} items - Array of items in the inventory.
     * @property {string} items[].name - Name of the item.
     * @property {string} items[].type - Type of the item.
     */

    /**
     * Inventory object.
     * @type {Inventory}
     */
    const inv = {
      items: [
        {
          name: "test",
          type: "dev",
        },
        {
          name: "test2",
          type: "dev",
        },
      ],
    };

    const invJSON = JSON.stringify(inv);
    let sql = `INSERT IGNORE INTO inventory (id, inventory) VALUES ('${id}', '${invJSON}')`;
    db.query(sql, (err, result) => {
      console.log(result);
      if (err) {
        throw err;
      }
    });
  },

  getInventory: (id) => {
    const r = [];
    let sql = `SELECT inventory FROM inventory WHERE id = '${id}'`;
    db.query(sql, (err, result) => {
      if (err) {
        throw err;
      } else {
        console.log(result);
        r.push(result[0]);
        return r;
      }
    });
  },
};
