'use strict';

angular.module('pizzaTime.orderForm', ['ngRoute', 'checklist-model'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/order-form', {
    templateUrl: 'orderForm/order-form.html',
    controller: 'OrderFormController'
  });
}])

.controller('OrderFormController', ["$scope", "$http", function ($scope, $http) {
	$scope.order = {		
		total: 0,
		pieSize: "Large",
		items: []
	};

	$http.get("orderForm/order-form.json").success(function (data) {
		$scope.toppings = {
			meat: (function () {
				var items = [];

				for (var j = 0; j < data.toppings.length; j++) {
					if (data.toppings[j].isMeat) {
						items.push(data.toppings[j]);
					}
				}

				return items;
			})(),

			nonMeat: (function () {
				var items = [];

				for (var j = 0; j < data.toppings.length; j++) {
					if (!data.toppings[j].isMeat) {
						items.push(data.toppings[j]);
					}
				}

				return items;
			})()
		};

		$scope.pieSizes = data.pieSizes;
		$scope.minimumOrderAmount = data.settings.minimumOrderAmount;

	}).error(function (xhr, status, error) {
		console.error(error);
	});

	$scope.$watchCollection('order.items', function (newItems, oldItems) {	
		calculateTotal(newItems);
	});

	function calculateTotal(items) {
		var price;

		$scope.order.total = 0;
		
		angular.forEach(items, function (value, key) {
			price = parseFloat(value.price, 10);

			$scope.order.total += price * value.quantity;
		});
	}

	$scope.addLineItem = function (item) {
		var items = $scope.order.items;
		var exists = false;

		for (var j = 0; j < items.length; j++) {
			if (items[j] === item) {
				if (item.quantity < items[j].maxQuantity) {
					items[j].quantity += 1;
				}

				exists = true;
			}
		}

		if (!exists) {
			items.push(item);
		}
	};

	$scope.modifyLineItemQuantity = function (item) {
		for (var j = 0; j < $scope.order.items.length; j++) {
			if ($scope.order.items[j] === item) {
				if (item.quantity === 1) {
					item.quantity = 0;
					$scope.order.items.splice(j, 1);			
				} else {
					item.quantity -= 1;
				}

				break;
			}
		}
	};

	$scope.isOrderValid = function () {
		$scope.order.total >= minOrderAmount;
	};
}]);