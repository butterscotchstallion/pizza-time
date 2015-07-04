'use strict';

angular.module('pizzaTime.version', [
  'pizzaTime.version.interpolate-filter',
  'pizzaTime.version.version-directive'
])

.value('version', '0.1');
