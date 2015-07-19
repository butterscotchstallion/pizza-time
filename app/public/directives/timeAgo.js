
app.directive("timeAgo", function ($q) {
	return {
		restrict: "C",

		scope: {
			title: "@"
		},

		link: function (scope, element, attrs) {
			var parsed = $q.defer();

			parsed.promise.then(function () {
				jQuery(element).timeago();
			})

			attrs.$observe("title", function (newValue) {
				parsed.resolve(newValue);
			});
		}
	};
});