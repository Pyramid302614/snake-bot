const shopItems = require("./shop.json");

module.exports = {

    getAllItems() {
        return shopItems.catalog;
    }

}