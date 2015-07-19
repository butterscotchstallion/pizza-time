
app.controller("NavigationController", [
	"$scope",
	"$log",
	"accountAccessTokenService",
	"$location"
, function ($scope, $log, accountAccessTokenService, $location) {
	$scope.session  = accountAccessTokenService.session;
	$scope.account  = accountAccessTokenService.account;
	$scope.signedIn = $scope.session;

	$scope.signOut = function (event) {
		event.preventDefault();
		
		accountAccessTokenService.signOut();

		$location.path("/account/sign-in");
	};
}]);