

function sendContract() {
    $.ajax({
        // Your server script to process the upload
        url: '/contracts',
        type: 'POST',

        // Form data
        data: new FormData($('form')[0]),

        // Tell jQuery not to process data or worry about content-type
        // You *must* include these options!
        cache: false,
        contentType: false,
        processData: false,

        // Custom XMLHttpRequest
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                // For handling the progress of the upload
                myXhr.upload.addEventListener('progress', function (e) {
                    if (e.lengthComputable) {
                        // $('#progress').attr({
                        //     value: e.loaded,
                        //     max: e.total,
                        // });
                        let percent = ((e.loaded/e.total)*100)
                        console.log('current percent:', percent, e.loaded, e.total)
                        $('#progressBar')[0].style.width = (percent + '%')
                    }
                }, false);
            }
            return myXhr;
        }
    });
}
let fileList;
$( document ).ready(function() {

    let fileDrop = $('#fileInput');
    fileDrop.change(function(){
        fileList = this.files;


        if (fileList.length <= 1 | fileList.length > 2)
            return  $( "#logs" ).prepend( `<li class="border-b-2 border-purple-800 rounded-b bg-purple-300 p-1">
            ⚠️⚠️ you can only input 2 files at a time! ⚠️⚠️
            </li>` );
        if (fileList[0].name.split('.').slice(0, -1).join('.') != fileList[1].name.split('.').slice(0, -1).join('.'))
            return  $( "#logs" ).prepend( `<li class="border-b-2 border-purple-800 rounded-b bg-purple-300 p-1">
            ⚠️⚠️ "${fileList[0].name}" and "${fileList[1].name}" do not have batching file names! ⚠️⚠️
            </li>` );
        sendContract()
        fileDrop.val('')
        console.log( 'ready!' );

    })
});