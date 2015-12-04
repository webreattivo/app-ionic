angular.module('starter.services',[])

    .service('AuthService', function($q, $http, USER_ROLES) {
        var LOCAL_TOKEN_KEY = 'token';

        function storeUserCredentials(roleUser, name, token) {
            window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
            window.localStorage.setItem('username', name);
            window.localStorage.setItem('isAuthenticated', true);
            window.localStorage.setItem('role', roleUser);
            // Set the token as header for your requests!
            $http.defaults.headers.common['X-Auth-Token'] = token;
        }

        function destroyUserCredentials() {
            window.localStorage.removeItem(LOCAL_TOKEN_KEY);
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('isAuthenticated');
            window.localStorage.removeItem('role');
            // unset the token as header for your requests!
            $http.defaults.headers.common['X-Auth-Token'] = undefined;
        }

        var login = function(name, pw) {
            return $q(function(resolve, reject) {
                //server call, this is a mock login
                if (name == 'admin' && pw == '1') {
                    // Make a request and receive your auth token from your server
                    storeUserCredentials(USER_ROLES.admin, name, '.yourServerToken');
                    resolve('Login success.');
                } else {
                    reject('Login Failed.');
                }
            });
        };

        var loginSocial = function(name, token) {
            return $q(function(resolve) {
                storeUserCredentials(USER_ROLES.user, name, token);
                resolve('Login success.');
            });
        };

        var logout = function() {
            destroyUserCredentials();
        };

        var getUsername = function () {
            return window.localStorage.getItem('username');
        }

        var isAuthenticated = function() {
            return window.localStorage.getItem('isAuthenticated');
        }

        var getRole = function() {
            return window.localStorage.getItem('role');
        }

        var isAuthorized = function(authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (isAuthenticated() && authorizedRoles.indexOf(getRole()) !== -1);
        };

        return {
            login: login,
            loginSocial: loginSocial,
            logout: logout,
            isAuthorized: isAuthorized,
            isAuthenticated: isAuthenticated,
            getUsername: getUsername,
            role: getRole
        };
    })

    .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        return {
            /* https://docs.angularjs.org/api/ng/service/$http */
            responseError: function (response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized
                }[response.status], response);
                return $q.reject(response);
            }
        };
    })

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    });