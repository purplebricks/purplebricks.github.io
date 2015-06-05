$(document).ready(function() {
    var Blog = (function () {
        function Blog($) {
            var _this = this;
            this.context = $('body');
            this.toggleMenu = function() {
                _this.context.toggleClass('mOpen locked');
                _this.context.find('.mobileLeft').toggleClass('mOpenSmall');
                _this.context.find('.master').toggleClass('mOpen');
            };
            this.resetMenu = function() {
                _this.context.removeClass('mOpen locked');
                _this.context.find('.mobileLeft').removeClass('mOpenSmall');
                _this.context.find('.master').removeClass('mOpen');
            };
            this.onResizeEvents = function () {
                if ($(window).width() > 991 && _this.context.hasClass('mOpen')) {
                    _this.resetMenu();
                }
            };
            this.show = function () {
                _this.context.find('.navToggle, .mobileBg').on('click', _this.toggleMenu);
                $(window).on('resize', function () {
                    return _this.onResizeEvents();
                });
            };
            this.show();
        }
        return Blog;
    })();

    var blog;
    $(function () {
        blog = new Blog($);
    });
});