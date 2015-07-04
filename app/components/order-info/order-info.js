'use strict';

angular.module('pizzaTime.orderInfo', [])

.controller('OrderFormCtrl', ["$scope", function ($scope) {
	$scope.order = {
		total: 0
	};
}]);