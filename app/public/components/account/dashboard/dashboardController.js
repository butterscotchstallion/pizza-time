app.controller('DashboardController', [
	"$scope", 
	"$http",
	"$location",
	"accountAccessTokenService",

	function ($scope, $http, $location, accountAccessTokenService) {
		"use strict";

		$scope.session = accountAccessTokenService.session;
		$scope.account = accountAccessTokenService.account;
	}
]);