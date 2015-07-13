'use strict';

angular.module('pizzaTime.orderForm', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
  	$routeProvider.when('/order/:guid', {
    	templateUrl: 'components/order-form/order-form.html',
    	controller: 'OrderFormController'
  	});
}])
.controller('CouponController', ["$scope", "$http", function ($scope, $http) {
	$scope.coupons = [];
	$scope.invalidCoupon = false;
	$scope.coupon = "";

	$http.get("components/order-form/coupons.json").success(function (data) {
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
				$scope.coupon = "";

				/**
				 * If this is a free delivery coupon and this isn't a delivery order,
				 * the coupon is not valid and should not be applied.
				 * 
				 */
				if (coupon.subType === "freeDelivery" && $scope.deliveryMethod !== "delivery") {
					$scope.invalidCoupon = true;
					return;
				}

				applyCoupon(coupon);
				$scope.invalidCoupon = false;
				
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

.controller('OrderFormController', ["$scope", "$http", "$routeParams", function ($scope, $http, $routeParams) {
	$scope.orderIsValid = false;
	$scope.location = {
		minOrderAmount: 10
	};
	$scope.order = {
		total: 0,
		items: [],
		serviceMethodTypeID: 2,
		deliveryMethod: "carryout"
	};

	$scope.onDeliveryMethodChanged = function (method) {
		$scope.deliveryMethod = method;

		if ($scope.deliveryMethod === "carryout") {
			$scope.removeDeliveryFee();
			removeFreeDeliveryCoupon();
		} else {
			var fee = {
				"name": "Delivery Fee",
				"price": $scope.location.deliveryFee,
				"inventoryTypeID": 6,
				"inventoryTypeCode": "deliveryFee",
				"code": $scope.deliveryMethod,
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
			} else {
				removeFreeDeliveryCoupon();
			}
		}
	};
	
	function removeFreeDeliveryCoupon() {
		$scope.order.items = $scope.order.items.filter(function (item) {
			return item.subType !== "freeDelivery";
		});
	}
	
	function hasFreeDeliveryCoupon() {
		var coupons = $scope.order.items.filter(function (item) {
			return item.subType === "freeDelivery";
		});

		return coupons.length > 0;
	};

	$http.get("/api/v1/locations/" + $routeParams.guid).success(function (data) {
		if (data.status === "OK") {
			$scope.location = data.location;
		} else {
			$scope.errorFetchingLocation = true;
		}
	}).error(function (xhr, status, error) {
		$scope.errorFetchingLocation = true;
	});

	$http.get("/api/v1/inventory").success(function (data) {
		if (data.status === "OK") {
			$scope.pieSizes = data.inventory.filter(function (item) {
				return item.typeName === "pie";
			});

			$scope.sideItems = data.inventory.filter(function (item) {
				return item.typeName === "sideItem";
			});

			$scope.toppings = data.inventory.filter(function (item) {
				return item.typeName === "topping";
			});
		}
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

		minOrderAmountSatisfied = $scope.order.total >= $scope.location.minOrderAmount;
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
			if (items[j].inventoryTypeID === item.inventoryTypeID) {
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

	/**
	 * Because items can have a quantity, we cannot simply
	 * empty the order items array. Each item must have its quantity
	 * reduced to zero in order for the buttons to work properly.
	 *
	 */
	$scope.emptyCart = function () {
		var minItems = 0;
		var isDelivery = $scope.deliveryMethod === "delivery";

		if (isDelivery) {
			minItems = 1;
		}

		while ($scope.order.items.length > minItems) {
			angular.forEach($scope.order.items, function (item, key) {
				// Don't remove delivery fees
				if (item.inventoryTypeCode !== "deliveryFee") {
					$scope.modifyLineItemQuantity(item);
				}
			});
		}
	};

	$scope.modifyLineItemQuantity = function (item) {
		for (var j = 0; j < $scope.order.items.length; j++) {
			// Item found
			if ($scope.order.items[j] === item) {
				// If there is one left, it's effectively removed
				if (item.quantity === 1) {
					$scope.order.items.splice(j, 1);
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
		$scope.order.items = $scope.order.items.filter(function (item) {
			return item.inventoryTypeCode !== "deliveryFee";
		});
	}
}]);