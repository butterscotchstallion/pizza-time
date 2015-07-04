'use strict';

// Declare app level module which depends on views, and components
angular.module('pizzaTime', [
  'ngRoute',
  'ngAnimate',
  'pizzaTime.orderForm',
  'pizzaTime.version',
  'angular-loading-bar',
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/order-form'});
}]);
