"use strict";

app.controller("FindALocationController", ["$scope", "$http", function ($scope, $http) {
	$scope.locations = [];
	$scope.errorFetchingLocations = false;

	$http.get("/api/v1/locations").success(function (data) {
		if (data && data.status === "OK") {
			$scope.locations = data.locations;
		} else {
			$scope.errorFetchingLocations = true;
		}
	})
	.error(function (xhr, status, error) {
		$scope.errorFetchingLocations = true;
	});
}]);
