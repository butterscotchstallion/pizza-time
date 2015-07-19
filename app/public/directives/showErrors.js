/**
 * showErrors - only show errors on a form input when 
 * it's dirty and invalid, and remove errors when the field
 * is blurred
 *
 */
angular.module("pizzaTime").
	directive("showErrors", function () {
		return {
			restrict: "A",
			require: "^form",

			link: function (scope, el, attrs, formCtrl) {
				var textInputEl = el[0].querySelector("[name]");
				var ngEl = angular.element(textInputEl);
				var inputName = ngEl.attr("name");

				function toggleErrorClass() {
					el.toggleClass("has-error", formCtrl[inputName].$invalid);
				}

				ngEl.bind("blur", function () {
					toggleErrorClass();
				});

				scope.$on("show-errors-check-validity", function () {
					toggleErrorClass();
				});
			}
		};
	});