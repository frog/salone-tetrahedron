define(['socket.io', 'tetralogo_multi'], function () {
    $(document).ready(function () {
        console.log("Document ready");
        // Configure panel configuration
        $('.config').hover(function () {
            $(this).fadeTo(1, 1);

        }, function () {
            $(this).fadeTo(1, 0);

        });
        $('#configform').submit(function () {
            var row = $('.row').val();
            var column = $('.column').val();

            socket.emit('config', { row: row, column: column });

            return false;
        });

        // Setup socket connection
        var socket = io.connect();
        socket.on('update', function (data) {
            $('body').css('background-color', data.bgcolor);
        });
        socket.on('position', function (data) {
            $('#currentpos').html('Current row no: ' + data.row + '<br>Current row sequence no: ' + data.column + '<br><br>');
        });
    });
})