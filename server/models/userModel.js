/**
 * Created by ivokroon on 16/12/2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userModel = new Schema({
    user_name:String,
    pass:String,
    sunShine:{type:Number, default:0},
    socket_id:String,
    //this is for communication.
    hash:String
});

module.exports = mongoose.model('User', userModel);