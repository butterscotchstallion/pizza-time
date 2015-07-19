app.controller('SignInController', [
	"$scope", 
	"$http",
	"$location",
	"accountAccessTokenService",
	function ($scope, $http, $location, accountAccessTokenService) {
		"use strict";

		$scope.account = {};
		$scope.signInMessage = "";

		$scope.signIn = function (signInForm) {
			if (signInForm.$valid) {
				accountAccessTokenService.signIn($scope.account)
					.then(function (data) {
						$location.path("/account/dashboard");
					}, function (error) {
						$scope.signInMessage = error;
					});
			}
		};
	}
]);