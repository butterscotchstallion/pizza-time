'use strict';

// Declare app level module which depends on views, and components
angular.module('pizzaTime', [
  'ngRoute',
  'ngAnimate',
  //'templateCacheModule',
  'angular-loading-bar',
  'pizzaTime.orderForm',
  'ui.bootstrap'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/order-form'});
}]);
