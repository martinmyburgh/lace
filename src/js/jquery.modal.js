"use strict";

var registerPlugin = require("./jquery.lace.js");

registerPlugin("modal", {
    dismiss: true,
    backdrop: true,
    parent: "body"
}, {

    /**
     * Show a modal dialog.
     */
    init: function() {
        var self = this,
            settings = self.settings,
            $parent = $(settings.parent),
            $oldmodal = $parent.find(".modal"),
            $oldbackdrop = $parent.find(".backdrop"),
            $modal = $(self.element).addClass("modal"),
            $backdrop;

        // Add event listener to buttons which can dismiss the modal
        $modal.on("click.modal", ".modal-dismiss, .modal-close", function() {
            self.dismiss();
        });

        // Add the modal to the DOM
        // We are attaching it early so we can get width and height
        // Which is needed for calculating position for centering
        if ($oldmodal.length) {
            $oldmodal.replaceWith($modal);
        } else {
            $modal.appendTo($parent);
        }

        // Add a dark semi-transparent backdrop if specified
        if (settings.backdrop) {
            if ($oldbackdrop.length) {
                $backdrop = $oldbackdrop;
            } else {
                $backdrop = $("<div>").addClass("backdrop");
                $backdrop.appendTo(settings.parent);
            }

            if (settings.dismiss) {
                $backdrop.on("click.modal", function() {
                    self.dismiss();
                });
            } else {
                $backdrop.off("click.modal");
            }

            $modal.data("modal-backdrop", $backdrop);
        } else if ($oldbackdrop.length) {
            $oldbackdrop.remove();
        }

        // Add event listener to dismiss the modal
        $(document).off("keydown.modal").on("keydown.modal", function(e) {
            if (e.which === 27 && settings.dismiss) {
                self.dismiss();
            }
        });

        // Modal is now initialized
        $.event.trigger("modalInited", [ $(self.element) ]);
    },

    /**
     * Cleanup modal dialog.
     */
    destroy: function() {
        var $modal = this.element ? $(this.element) : $(".modal");

        // The element doesn't exist
        if (!$modal.length) {
            return;
        }

        // Cleanup event listeners
        $modal.off("click.modal").removeClass("modal");

        // Remove event listeners
        $(document).off("keydown.modal");
    },

    /**
     * Dismiss modal dialog.
     */
    dismiss: function() {
        var self = this,
            $modal = this.element ? $(this.element) : $(".modal"),
            $backdrop = $modal.data("modal-backdrop"),
            cleanup = function() {
                self.destroy();
                $modal.remove().removeClass("out");

                if ($backdrop.length) {
                    $backdrop.remove().removeClass("out");
                }

                // Modal is now dismissed
                $.event.trigger("modalDismissed", [ $modal ]);
            };

        $backdrop = ($backdrop && $backdrop.length) ? $backdrop : $(".backdrop");

        // Element doesn't exist
        if (!$modal.length) {
            return;
        }

        // Animate out and remove the element from DOM
        $modal.addClass("out");

        if ($backdrop.length) {
            $backdrop.addClass("out");
        }

        setTimeout(function() {
            cleanup();
        }, 300);
    }
});
