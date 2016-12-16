var mongoose = require('mongoose');// // gebruikt mongoose voor db connectie net zoals bij entity framework.
var app = require('express')();
var uuid = require('node-uuid');

var http = require('http').Server(app);
var io = require('socket.io')(http);

var db = mongoose.connect("mongodb://localhost/sockettestauth");
var User = require('./models/userModel');

var timeinterval;

// User.create({user_name:'karel', pass:'niks1234'});

// User.find({ _id:"5853f186f906669584fabef0" }).remove().exec();
// var query = { _id: '5853f191ed8d02958953ed09' };
// User.update(query, { socket_id: 'test' },function (err, data) {
//     if(!err){
//         console.log("updated")
//     }
// });
// var users = User.find({}, function (err, data) {
//     if (!err) {
//         console.log(data);
//     }
//
// });


io.on('connection', function (socket) {
    console.log("Connected");
    //set the login
    socket.on('login', function (logInData) {
        login(logInData, socket);
    });

    //when the user disconnects we have to shut down the interval.
    socket.on("disconnect", function () {
        console.log("disconnection");
        clearInterval(timeinterval);
    });

    socket.on('clicked', function (data) {
        console.log(data.hash);
        //check the user and after that do the update function.
        auth(data.hash, updateValue);
    });
});

function login(logInData, socket) {
    //check if the user isn't already logged in.
    User.findOne({'socket_id': socket.id}, function (err, check_data) {
        if (!check_data) {
            //Nope not logged in let's find the user and his info.
            User.findOne({'user_name': logInData.user_name}, function (err, user) {
                if (!user) {
                    console.log("Username doesn't exist");
                    return false
                }

                //Found the user now we update the users socket_id.
                if (user.pass == logInData.pass) {
                    var query = {_id: user.id};
                    var user_hash = uuid.v4();
                    User.update(query, {socket_id: socket.id, hash: user_hash}, function (err, data) {
                        if (!err) {
                            //Yeah, the user logged in
                            //send the hash to the user
                            io.to(socket.id).emit('onlogin', {hash: user_hash});
                            gameLoop(socket, user.id);
                        } else {
                            io.to(socket.id).emit('onlogin', false);
                        }
                    });
                } else {
                    console.log("Error pass is not correct");
                    io.to(socket.id).emit('onlogin', false);
                }
            });
        }
    });
}

function auth(hash, callback) {
    // console.log(hash);
    User.findOne({hash: hash}, function (err, data) {
        // console.log(data);
        if (!err) {
            // console.log(data);
            callback(data.id, 100);
        }
    })
}

function updateValue(id, amount) {
    //first we need the user for the sunshine status
    //after that we need it for the socket_id.
    User.findOne({_id: id}, function (err, user) {
        if (err) {
            return false;
        } else {
            var query = {_id: id};
            User.update(query, {sunShine: user.sunShine + amount}, function (err) {
                if (!err) {
                    io.to(user.socket_id).emit("sunshine", {sunshine: user.sunShine + amount});
                }
            })
        }
    });
}

function gameLoop(socket, id) {
    // socket.emit("sunshine");
    timeinterval = setInterval(function () {
        updateValue(id, 10);
    }, 1000);
}

http.listen(3000, function () {
    console.log('socketnode list on *3000');
});
