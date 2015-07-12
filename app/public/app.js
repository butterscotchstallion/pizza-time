'use strict';

// Declare app level module which depends on views, and components
angular.module('pizzaTime', [
  'ngRoute',
  'ngAnimate',
  //'templateCacheModule',
  'angular-loading-bar',
  'pizzaTime.findALocation',
  'pizzaTime.orderForm',
  'ui.bootstrap'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({
  	redirectTo: "/order/find-a-location"
  });
}]);
