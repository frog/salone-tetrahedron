/**
 * Splats a selector to fullscreen mode, platform independent
 */
(function ($) {

    /**
     * Stretches a dom element to cover full screen
     * In case selector matches more than one element, only the first will be
     * set to fullscreen.
     * @returns {boolean} if an element has been instructed to go to fullscreen
     */
    $.fn.fullscreen = function () {
        if (this.size() > 0) {
            var elem = this.get(0);
            console.log("Entering fullscreen mode on", elem);
            if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else {
                if (elem.mozRequestFullScreen) {
                    elem.
                        mozRequestFullScreen();
                } else {
                    elem.requestFullscreen();
                }
            }
            return true;
        } else {
            return false;
        }
    };

    /**
     * exits full screen. Method is also replicated in selector for utility,
     * but doesn't depend on an explicit DOM element to be called on.
     */
    $.exitFullscreen = function () {
        console.log("Exiting fullscreen mode.");
        var cancelFullScreen = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen;
        cancelFullScreen.call(document);
    };

    $.fn.exitFullscreen = $.exitFullscreen;
})(jQuery);