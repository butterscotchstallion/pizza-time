"use strict";

// Declare app level module which depends on views, and components
var app = angular.module("pizzaTime", [
  "ngRoute",
  "ngAnimate",
  "LocalStorageModule",
  "angular-loading-bar",
  "ui.bootstrap",
  "angularMoment"
]);

app.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
	$routeProvider.when('/order/:guid', {
    	templateUrl: 'components/order-form/order-form.html',
    	controller: 'OrderFormController'
  	});

	$routeProvider.when('/account/dashboard', {
    	templateUrl: 'components/account/dashboard/index.html',
    	controller: 'DashboardController'
  	});

	$routeProvider.when('/account/sign-in', {
    	templateUrl: 'components/account/sign-in/index.html',
    	controller: 'SignInController'
  	});

  	$routeProvider.when("/order/find-a-location", {
    	templateUrl: "components/find-a-location/index.html",
    	controller: "FindALocationController"
  	});

  	$routeProvider.otherwise({
  		redirectTo: "/account/sign-in"
  	});

  	$locationProvider.html5Mode(true);
  	$locationProvider.hashPrefix('!');
}]);

app.run(["accountAccessTokenService", function (accountAccessTokenService) {
	accountAccessTokenService.populateSessionData();
}]);
