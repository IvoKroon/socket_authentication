var socket = io('http://localhost:3000');

document.getElementById("submitter").addEventListener("click", function () {

    //standard login data
    var user_name = document.getElementById("username").value;
    var password = document.getElementById("pass").value;
    var hash = "";

    //send the login data to the server
    socket.emit('login', {user_name: user_name, pass: password});
    //check if the data is true.
    socket.on('onlogin', function (data) {
        if(data) {
            console.log("logged in!");
            hash = data.hash;
        }else{
            console.log("Error");
        }
    });

    socket.on("sunshine", function (data) {
        document.getElementById("sunShine").innerHTML = data.sunshine;
    });

    //When there is clicked on the more sunlight button
    document.getElementById("clicker").addEventListener("click", function () {
        socket.emit("clicked", {hash: hash});
        socket.on("return", function (data) {
        })
    });
});


