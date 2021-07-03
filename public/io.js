var socket = io();

// io.on('connection', (socket) => {
//     console.log('a user connected');
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });

// });
socket.on('log', (log) => {
    $("#logs").prepend(`<li class="border-b-2 border-purple-800 rounded-b bg-purple-300 p-1">${log}</li>`);
});

socket.on('txid', (txid) => {
    $("#txid").append(`<option value="${txid[1]}">${txid[0]}</option>`);
});

socket.on('state', (conStatr) => {
    $("stateId").text(JSON.stringify());
});


$(document).ready(function () {
    $("form").submit(function (e) {
        e.preventDefault();
        socket.emit('input', $("#json").val(), $("#caller").val(), $("#conid").val());
        $("#json").val("");
    });
    const height = 0.715 * screen.height
    // jQuery
    $('#state').height(height)
});


/*/ socket.on('input', (txid) => {
//     $( "#txid" ).append( `<option value="${txid[1]}">${txid[0]}</option>` );

var p = document.querySelector(".language-json");
function ltrim(str) {
    if(!str) return str;
    return str.replace(/^\s+/g, '');
}
p.textContent = ltrim(p.textContent);

});/*/

  