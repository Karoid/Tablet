var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    item_index: {type: Number},
    item_name: {type: String},
    item_name_eng: {type: String},
    item_price: {type: Number},
    like: {type: Number},
    order_count: {type: Number},
    item_discount: {type: Boolean},
    item_discount_price: {type: Number},
    img_dir: {type: String},
    created_at: {type: Date}
});
userSchema.pre('save', function (next) {
    //console.log(this.item_name);
    now = new Date();
    if (!this.order_count) {
        this.order_count = 0;
    }
    if (!this.bestable) {
        this.bestable = true;
    }
    if (!this.item_name_eng) {
        //console.log("없다!");
        this.item_name_eng = "test";
    }
    next();
});
var Item_data = mongoose.model('Item_data', userSchema, "Item_data");
module.exports = Item_data;

/*
 "page_index" : 0,
 "page_info" : "today menu"
 , "item_name" : "orange",
 "item_price" : 5000,
 "item_discount" : true,
 "item_discount_price" : 4500
 , "img_dir" : "http://www.tutorialspoint.com/mongodb/images/mongodb-mini-logo.jpg" }

 */