var registerPlugin = require("./jquery.lace.js");

registerPlugin("alertbar", {
	type: "info",
	parent: "body"
}, {
	/**
	 * Show an alert message.
	 * @constructor
	 */
	init: function() {
		var self = this,
			settings = self.settings,
			$alert = settings.id ? $("#" + settings.id) : $(),
			$container = $(".alert-container"),
			$wrapper = $("<div>").addClass("alert-bar " + settings.type),
			$elem = $wrapper.append(
				$(self.element).addClass("alert-content"),
				$("<span>").addClass("alert-remove")
			).attr("id", settings.id || ("alert-bar-" + new Date().getTime()));

		// If a container doesn't exist, create a new one
		if (!$container.length) {
			$container = $("<div>").addClass("alert-container");
			$container.appendTo(settings.parent);
		}

		// If an alertbar with same ID exists, remove it
		if ($alert.length && $alert.hasClass("alert-bar")) {
			$alert.remove();
		}

		$elem.appendTo($container);

		// Add a close button to dismiss the alertbar
		$elem.find(".alert-remove").on("click", function() {
			self.dismiss();
		});

		// If a timeout is given, hide the alertbar after the given period
		if (settings.timeout && typeof settings.timeout === "number") {
			setTimeout(function() {
				self.dismiss();
			}, settings.timeout);
		}

		// Alertbar is now initialized
		$.event.trigger("alertbarInited", [ $(self.element) ]);
	},

	/**
	 * Dismiss alert message(s).
	 * @constructor
	 * @param {String} [element]
	 */
	dismiss: function(element) {
		var $element = element ? $(element) : this.element ? $(this.element).closest(".alert-bar") : $(".alert-bar"),
			$container = $(".alert-container"),
			triggerEvents = function() {
				// No alertbars left, safe to remove the container
				if (!$container.children().length) {
					$container.remove();
				}

				// Alertbar is now dismissed
				$.event.trigger("alertbarDismissed", [ $element ]);
			};

		// Element doesn't exist
		if (!$element.length) {
			return;
		}

		// Remove the lement from DOM
		if ($.fn.velocity) {
			// Fade out the alertbar, then remove margin, padding and animate height to 0
			// So that other alertbars don't jump to top, but smoothly move
			$element.velocity({
				opacity: 0
			}, 150).velocity({
				height: 0,
				paddingTop: 0,
				paddingBottom: 0,
				marginTop: 0,
				marginBottom: 0
			}, 150, function() {
				$element.remove();
				triggerEvents();
			});
		} else {
			$element.remove();
			triggerEvents();
		}
	}
});
