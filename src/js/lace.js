/* jslint browser: true, indent: 4, regexp: true */
/* global $ */

/**
 * @fileOverview User interface components.
 * @author Satyajit Sahoo <satya@scrollback.io>
 * @requires jQuery, Velocity, setCursorEnd
 */

var Lace = (function() {
    return function() {
        var _this = this;

        _this.progress = {
            /**
             * Show a progress indicator.
             * @constructor
             */
            show: function() {
                var $progress = $(".progress");

                if ($progress.length) {
                    $progress.remove();
                }

                $progress = $("<div>").addClass("progress loading");
                $progress.appendTo("body");

                return $progress;
            },

            /**
             * Set progress by percentage
             * @constructor
             * @param {Number} amount
             */
            set: function(amount) {
                $(".progress").removeClass("loading").css({ "width": amount + "%" });
            },

            /**
             * Hide progress indicator.
             * @constructor
             */
            hide: function() {
                _this.progress.set(100);

                setTimeout(function() {
                    $(".progress").remove();
                }, 500);
            }
        };

        _this.multientry = {
            /**
             * Add event handlers for multientry.
             * @constructor
             */
            init: function() {
                if (_this.multientry.init.done) {
                    return;
                }

                $(document).on("blur", ".multientry", function() {
                    _this.multientry.add($(this), $(this).children().last().text());
                });

                $(document).on("keydown", ".multientry .item", function(e) {
                    if (e.keyCode === 13 || e.keyCode === 32 || e.keyCode === 188) {
                        e.preventDefault();
                        _this.multientry.add($(this).parent(".multientry"), $(this).text());
                    }
                });

                $(document).on("paste", ".multientry .item", function(e) {
                    e.preventDefault();

                    var items = e.originalEvent.clipboardData.getData("Text");

                    _this.multientry.add($(this).parent(".multientry"), items);
                });

                $(document).on("keydown", ".multientry .item", function(e) {
                    if (e.keyCode === 8 && $(this).text().match(/^\s*$/)) {
                        e.preventDefault();

                        $(this).text($(this).prev().find(".item-text").text());
                        $(this).prev().remove();

                        if ($.fn.setCursorEnd) {
                            $(this).setCursorEnd();
                        }
                    }
                });

                $(document).on("click", ".multientry .item-remove", function() {
                    _this.multientry.remove($(this).parent());
                });

                $(document).on("click", ".multientry", function() {
                    $(this).children().last().focus();
                });

                _this.multientry.init.done = true;
            },

            /**
             * Create the markup required for multientry.
             * @constructor
             * @return {Object}
             */
            create: function() {
                _this.multientry.init();

                var $multientry = $("<span>").addClass("multientry").append(
                    $("<span>").addClass("item").attr({ "contenteditable": true })
                );

                return $multientry;
            },

            /**
             * Add items to multientry.
             * @constructor
             * @param {String} element
             * @param {String[]} content
             */
            add: function(element, content) {
                var $element = $(element);

                if (content) {
                    if (!(content instanceof Array)) {
                        content = content.split(/[\s,]+/);
                    }

                    content.forEach(function(text) {
                        if (!text.match(/^\s*$/) ) {
                            $("<span>")
                            .addClass("item done")
                            .append($("<span>").addClass("item-text").text(text.trim()))
                            .append($("<span>").addClass("item-remove"))
                            .insertBefore(($element.children().last()).empty());
                        }
                    });
                }
            },

            /**
             * Remove an item from multientry.
             * @constructor
             * @param {String} [element]
             */
            remove: function(element) {
                var $element;

                if (element) {
                    $element = $(element);
                } else {
                    $element = $(".multientry .item.done");
                }

                if (!$element.hasClass("item")) {
                    return;
                }

                _this.animate("fadeOut", $element, function() {
                    $(this).remove();
                });
            },

            /**
             * Get items from multientry.
             * @constructor
             * @param {String} [element]
             * @return {String[]}
             */
            items: function(element) {
                var $element;

                if (element) {
                    $element = $(element);
                } else {
                    $element = $(".multientry");
                }

                var elems = $element.find(".item-text"),
                    items = new Array(elems.length);

                for (var i = 0; i < elems.length; i++) {
                    items[i] = $(elems[i]).text();
                }

                return items;
            }
        };

        _this.modal = {
            /**
             * Add event handlers for modal dialog.
             * @constructor
             */
            init: function() {
                if (_this.modal.init.done) {
                    return;
                }

                $(document).on("keydown", function(e) {
                    if (e.keyCode === 27 && _this.modal.dismiss) {
                        _this.modal.hide();
                    }
                });

                _this.modal.init.done = true;
            },

            /**
             * Show a modal dialog.
             * @constructor
             * @param {{ body: String, dismiss: Boolean, backdrop: Boolean }} modal
             */
            show: function(options) {
                _this.modal.init();

                var $modal = $(".modal"),
                    $backdrop = $(".backdrop");

                if (typeof options.dismiss !== "boolean" || options.dismiss) {
                    _this.modal.dismiss = true;
                } else {
                    _this.modal.dismiss = false;
                }

                if (typeof options.backdrop !== "boolean" || options.backdrop) {
                    if (!$backdrop.length) {
                        $backdrop = $("<div>").addClass("backdrop").on("click", function() {
                            if (_this.modal.dismiss) {
                                _this.modal.hide();
                            }
                        });

                        $backdrop.appendTo("body");
                    }
                } else if ($backdrop.length) {
                    $backdrop.remove();
                }

                if ($modal.length) {
                    $modal.empty().html(options.body);
                } else {
                    $modal = $("<div>").addClass("modal").html(options.body);
                    $modal.appendTo("body");
                }

                $modal.css({
                    "margin-top": $modal.outerHeight() / -2,
                    "margin-left": $modal.outerWidth() / -2
                });

                $modal.find(".modal-remove").on("click", _this.modal.hide);

                return $modal;
            },

            /**
             * Hide modal dialog.
             * @constructor
             */
            hide: function() {
                [ ".backdrop", ".modal" ].forEach(function(el) {
                    _this.animate("fadeOut", el, function() {
                        $(this).remove();
                    });
                });
            }
        };

        _this.popover = {
            /**
             * Show a popover.
             * @constructor
             * @param {{ body: String, origin: String, heading: String, menu: Object }} popover
             */
            show: function(options) {
                var $popover = $(".popover-body"),
                    $layer = $(".popover-layer"),
                    $origin = $(options.origin),
                    spacetop = $origin.offset().top - $(document).scrollTop() + $origin.height(),
                    spacebottom = $(window).height() - spacetop,
                    spaceleft = $origin.offset().left - $(document).scrollLeft() + ( $origin.width() / 2 ),
                    spaceright = $(window).width() - spaceleft;

                if (!$layer.length) {
                    $layer = $("<div>").addClass("popover-layer").on("click", _this.popover.hide);
                    $layer.appendTo("body");
                }

                if ($popover.length) {
                    $popover.remove();
                }

                $popover = $("<div>").addClass("popover-body").html(options.body);
                $popover.appendTo("body");

                if ($popover.outerWidth() >= spaceleft) {
                    $popover.addClass("arrow-left");
                    spaceleft = $origin.width() / 2;
                } else if ($popover.outerWidth() >= spaceright) {
                    $popover.addClass("arrow-right");
                    spaceleft = $(window).width() - ( $origin.width() / 2 ) - $popover.outerWidth();
                } else {
                    spaceleft = spaceleft - ( $popover.outerWidth() / 2 );
                }

                if ($origin.height() >= $(window).height()) {
                    $popover.addClass("popover-bottom");
                    spacetop = $(window).height() / 2;
                } else if ($popover.outerHeight() >= spacebottom) {
                    $popover.addClass("popover-top");
                    spacetop = spacetop - $origin.height() - $popover.outerHeight();
                } else {
                    $popover.addClass("popover-bottom");
                }

                $popover.css({
                    "top": spacetop,
                    "left": spaceleft
                });

                return $popover;
            },

            /**
             * Hide popover.
             * @constructor
             */
            hide: function() {
                _this.animate("fadeOut", ".popover-body", function() {
                    $(this).remove();
                    $(".popover-layer").remove();
                });
            }
        };

        _this.alert = {
            /**
             * Show an alert message.
             * @constructor
             * @param {{ type: String, body: String, id: String, timeout: Number }} alert
             */
            show: function(options) {
                if (!options.type) {
                    options.type = "info";
                }

                if ((!options.id)) {
                    options.id = "lace-alert-" + new Date().getTime();
                }

                var $alert = $("#" + options.id),
                    $container = $(".alert-container");

                if (!$container.length) {
                    $container = $("<div>").addClass("alert-container");
                    $container.appendTo("body");
                }

                if ($alert.length && $alert.hasClass("alert-bar")) {
                    $alert.removeClass().addClass("alert-bar " + options.type)
                    .find(".alert-content").empty().html(options.body);
                } else {
                    $alert = $("<div>")
                             .addClass("alert-bar " + options.type)
                             .attr("id", options.id)
                             .append($("<span>").addClass("alert-content").html(options.body))
                             .append($("<span>").addClass("alert-remove"));

                    $alert.appendTo($container);
                    $alert.find(".alert-remove").on("click", function() {
                        _this.alert.hide($alert);
                    });
                }

                if (options.timeout) {
                    setTimeout(function() {
                        _this.alert.hide($alert);
                    }, options.timeout);
                }

                return $alert;
            },

            /**
             * Hide alert message(s).
             * @constructor
             * @param {String} [element]
             */
            hide: function(element) {
                var $element,
                    $container = $(".alert-container");

                if (element) {
                    $element = $(element);
                } else {
                    $element = $(".alert-bar");
                }

                if (!$element.hasClass("alert-bar")) {
                    return;
                }

                _this.animate("fadeOut", $element, function() {
                    $(this).remove();

                    if (!$container.children().length) {
                        $container.remove();
                    }
                });
            }
        };
    };
}());

window.lace = new Lace();
