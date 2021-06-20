const socket = io(); 


const message = document.getElementById('message'), 
handle = document.getElementById('handle'), 
output = document.getElementById('output'), 
button = document.getElementById('button'); 
typing = document.getElementById('typing');

// show typing message
message.addEventListener('keypress', () =>{
    socket.emit('userTyping', handle.value)
})
message.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        button.click(); 
		return false;
    }
}); 

// send message to client
button.addEventListener('click', () => {
    socket.emit('userMessage', {
        handle:handle.value, 
        message:message.value
    }); 
    document.getElementById('message').value = ""; 
}); 

// listen for events from the server
socket.on("userMessage", (data) => {
    typing.innerHTML = ""; 
    output.innerHTML += '<p> <strong>' + data.handle + ' : </strong>' + data.message + ' </p> '
}); 
socket.on("userTyping", (data) => {
    typing.innerHTML = '<p><em>' + data + ' is typing... </em></p>';
    setTimeout(() =>{
        typing.innerHTML = ""; 
    }, 5000);  
}); 

 // <------------- video chat ----------->
 // get local vide oand dispkay with permission
 function getVideo(callback) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    var constraints={
        audio: true,
        video: true
    }
    navigator.getUserMedia(constraints, callback.success, callback.error)
 }

 function recStream(stream, elemid){
     var video = document.getElementById(elemid); 
     video.srcObject = stream; 
     window.peer_stream = stream;
 }
 getVideo({
     success: function(stream){
         window.localstream = stream; 
         recStream(stream,'lVideo');
     }, 
     error : function(error){
         alert('Cannot Access Camera'); 
         console.log(error);
     }
 }); 
 
 var conn, peer_id; 
 
 // create peer conn

 var peer = new Peer();

 // display the peer id on DOM

 peer.on('open', function(){
     document.getElementById("displayId").innerHTML = peer.id;
 }); 

 peer.on('connection', function(connection){
     conn = connection;
     peer_id = connection.peer; 
     document.getElementById('connId').value = peer_id;
    }); 
    peer.on('error', function(err){
        alert('Error occured: ' + err.message);
    }); 
    // onclick with conn button expose info
    document.getElementById('conn_button').addEventListener('click', function(){
        peer_id = document.getElementById('connId').value; 
        if(peer_id){
            conn = peer.connect(peer_id);
        }else{
            alert('Enter ID'); 
        }
    }); 
    
    // call on click (offer and answer is exachaged)
    peer.on('call', function(call){
        console.log(call);
        var acceptCall = confirm("Do you want to accept call? "); 
        console.log(acceptCall);
        if(acceptCall){
            call.answer(window.localstream); 
            call.on('stream', function(remoteStream){
                console.log("hello")
                console.log(remoteStream);
                window.peer_stream = remoteStream; 
                recStream(remoteStream, 'rVideo'); 
            }); 
            call.on('close', function(){
                alert('Call disconnected'); 
            }); 
        }
        else{
            console.log("Call Denied");
        }
    })
 // ask to call 
 document.getElementById('call_button').addEventListener('click', function(){
     console.log("Calling a peer with ID : " + peer_id);
     console.log(peer); 
     let call = peer.call(peer_id, window.localstream); 

     call.on('stream', function(remoteStream){
        console.log(remoteStream);
        window.peer_stream = remoteStream; 
        recStream(remoteStream, 'rVideo'); 
     })
 })
 // display the remote video and local video on client