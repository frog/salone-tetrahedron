define(['comm', 'tetralogo'], function (comm, tetralogo) {
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

            comm.sendConfig({ row: row, column: column });

            return false;
        });

        // Setup socket connection
        comm.registerForUpdate(function (data) {
            $('body').css('background-color', data.bgcolor);
        });
        comm.registerForPosition(function (data) {
            $('#currentpos').html('Current row no: ' + data.row + '<br>Current row sequence no: ' + data.column + '<br><br>');
        });
    });
})