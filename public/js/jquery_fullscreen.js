(function ($) {

    $.fn.fullscreen = function () {

        return this.each(function () {
            if (this.webkitRequestFullscreen) {
                this.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else {
                if (this.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                } else {
                    this.requestFullscreen();
                }
            }
        });
    };

    $.exitFullscreen = function () {
        console.log("Exiting fullscreen mode...");
        var cancelFullScreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen;
        cancelFullScreen.call(document);
    };

    $.fn.exitFullscreen = $.exitFullscreen;
})(jQuery);