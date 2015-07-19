/**
 * apiToken - retrieves an API token
 *
 */
app.factory('accountAccessTokenService', ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {
	var baseURL = "/api/v1/session/";
	var tokenServiceFactory = {};

	tokenServiceFactory.session = null;
	tokenServiceFactory.account = null;

	tokenServiceFactory.signIn = function (data) {
		var payload = {
			name: data.name,
			password: data.password
		};

		var deferred = $q.defer();

		$http.post(baseURL, payload)
			.success(function (data) {
				if (data && data.status === "OK") {
					tokenServiceFactory.session = data.session;
					tokenServiceFactory.account = data.account;

					localStorageService.set("session", tokenServiceFactory.session);
					localStorageService.set("account", tokenServiceFactory.account);

					deferred.resolve(data);

				} else {
					deferred.reject(data.message);
				}
			}).error(function (err, status) {
				tokenServiceFactory.signOut();
				deferred.reject(err);
			});

		return deferred.promise;
	};

	tokenServiceFactory.signOut = function () {
		localStorageService.remove("session");
		localStorageService.remove("account");

		tokenServiceFactory.session = null;
		tokenServiceFactory.account = null;
	};

	tokenServiceFactory.populateSessionData = function () {
		var lsSession = localStorageService.get("session");
		var lsAccount = localStorageService.get("account");

		if (lsSession) {
			tokenServiceFactory.session = lsSession;
		}

		if (lsAccount) {
			tokenServiceFactory.account = lsAccount;
		}
	};

	return tokenServiceFactory;
}]);

