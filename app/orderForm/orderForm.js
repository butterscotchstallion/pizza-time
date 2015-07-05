'use strict';

angular.module('pizzaTime.orderForm', ['ngRoute', 'checklist-model'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/order-form', {
    templateUrl: 'orderForm/order-form.html',
    controller: 'OrderFormController'
  });
}])

.controller('CouponController', ["$scope", "$http", function ($scope, $http) {
	$scope.coupons = [];
	$scope.invalidCoupon = false;
	$scope.coupon = "";

	$http.get("orderForm/coupons.json").success(function (data) {
		$scope.coupons = data.coupons;
	})
	.error(function (xhr, status, error) {
		console.error(error);
	});

	$scope.addCoupon = function () {
		var isValidCoupon = false;
		var coupon = false;

		if ($scope.coupon.length > 0) {
			coupon = getCouponByCode($scope.coupon);

			if (coupon) {
				applyCoupon(coupon);
				$scope.invalidCoupon = false;
				$scope.coupon = "";
			} else {
				$scope.invalidCoupon = true;
			}
		} else {
			$scope.invalidCoupon = true;
		}
	};

	function getCouponByCode(couponCode) {
		var coupon = false;
		var coupons = $scope.coupons;
		var code = couponCode.toLowerCase();

		for (var j = 0; j < coupons.length; j++) {
			if (coupons[j].code.toLowerCase() === code) {
				coupon = coupons[j];

				if (coupon.subType === "freeDelivery") {
					coupon.price = $scope.deliveryFee;
					$scope.removeDeliveryFee();
				}

				break;
			}
		}

		return coupon;
	};

	function applyCoupon(coupon) {
		$scope.addLineItem(coupon);
	}
}])

.controller('OrderFormController', ["$scope", "$http", function ($scope, $http) {
	$scope.orderIsValid = false;
	$scope.deliveryFee = 0;
	$scope.settings = {
		minimumOrderAmount: 0
	};

	$scope.order = {
		total: 0,
		pieSize: "Large",
		items: [],
		deliveryMethod: "carryout"
	};

	$scope.onDeliveryMethodChanged = function (method) {
		if (method.price === 0) {
			$scope.removeDeliveryFee();
		} else {
			var fee = {
				"name": "Delivery Fee",
				"price": method.price,
				"type": method.type,
				"code": method.code,
				"quantity": 1,
				"maxQuantity": 1
			};

			$scope.deliveryFee = fee.price;

			/**
			 * Don't add the delivery fee if they have the free
			 * delivery coupon.
			 *
			 */
			if (!hasFreeDeliveryCoupon()) {
				$scope.addLineItem(fee);
			}
		}
	};
	
	function hasFreeDeliveryCoupon() {
		var coupons = $scope.order.items.filter(function (item) {
			return item.subType === "freeDelivery";
		});

		return coupons.length > 0;
	};
	
	$http.get("orderForm/order-form.json").success(function (data) {
		$scope.pieSizes = data.pieSizes;
		$scope.settings = data.settings;
		$scope.sideItems = data.sideItems;

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

	}).error(function (xhr, status, error) {
		console.error(error);
	});

	$scope.$watchCollection('order.items', function (newItems, oldItems) {	
		calculateTotal(newItems);
	});

	function calculateTotal(items) {
		var price;
		var minOrderAmountSatisfied = false;
		var discountAmount;
		var hasPies = false;
		var typeCountMap = {}; 
		var hasFee = false;
		var orderIsJustDeliveryFee = false;
		$scope.order.total = 0;

		angular.forEach(items, function (item, key) {
			if (typeof typeCountMap[item.type] === "undefined") {
				typeCountMap[item.type] = 0;
			}

			typeCountMap[item.type]++;

			if (item.type !== "coupon") {
				$scope.order.total += item.price * item.quantity;
			}
		});

		// Apply discounts after calculating the whole order
		if (typeCountMap['coupon'] > 0) {
			angular.forEach(items, function (item, key) {
				if (item.type === "coupon") {
					if (item.subType === "percentageDiscount") {
						discountAmount = getPercentageFromTotal(item.amount);
						item.price = discountAmount;
					}

					$scope.order.total -= item.price * item.quantity;
				}
			});
		}

		minOrderAmountSatisfied = $scope.order.total >= $scope.settings.minimumOrderAmount;
		hasFee = typeof typeCountMap['serviceMethod'] !== "undefined" && typeCountMap['serviceMethod'] > 0;
		orderIsJustDeliveryFee = items.length === 1 && hasFee;

		// Order is not valid unless the minimum amount has been satisfied
		// and the order consists of more than just a delivery fee.
		$scope.orderIsValid = items.length > 0 && minOrderAmountSatisfied && !orderIsJustDeliveryFee;
	}

	function getPercentageFromTotal(percentage) {
		var decimalPercentage = "." + percentage;
		var orderTotal = $scope.order.total;
		var discountAmount = orderTotal * decimalPercentage;

		return discountAmount;
	};

	$scope.addLineItem = function (item) {
		var items = $scope.order.items;
		var exists = false;

		for (var j = 0; j < items.length; j++) {
			// Item already in order
			if (items[j] === item) {
				if (item.quantity < items[j].maxQuantity) {
					items[j].quantity += 1;

					calculateTotal(items);
				}

				exists = true;
			}
		}

		// New line item
		if (!exists) {
			items.push(item);
		}
	};

	$scope.modifyLineItemQuantity = function (item) {
		for (var j = 0; j < $scope.order.items.length; j++) {
			// Item found
			if ($scope.order.items[j] === item) {
				// If there is one left, it's effectively removed
				if (item.quantity === 1) {
					$scope.order.items.splice(j, 1);

					// If this is a free delivery coupon, add the delivery fee
					// back to the order

				} else {
					// If there is more than one of this item, decrement quantity
					if (item.quantity > 1) {
						item.quantity -= 1;
					}
				}

				break;
			}
		}
	};

	$scope.removeDeliveryFee = function() {
		var items = $scope.order.items;

		for (var j = 0; j < items.length; j++) {
			if (items[j].type === "serviceMethod" && items[j].price > 0) {
				items = items.splice(j, 1);
			}
		}
	}
}]);