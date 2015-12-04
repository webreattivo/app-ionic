angular.module('starter.services',[])

    .service('AuthService', function($q, $http, USER_ROLES) {
        var LOCAL_TOKEN_KEY = 'token';
        var username = '';
        var isAuthenticated = false;
        var role = '';
        var authToken;

        function loadUserCredentials() {
            var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
            if (token) {
                useCredentials(token);
            }
        }

        function storeUserCredentials(roleUser, token) {
            window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
            useCredentials(roleUser, token);
        }

        function useCredentials(roleUser, token) {
            isAuthenticated = true;
            authToken = token;

            if (roleUser == USER_ROLES.admin) {
                role = USER_ROLES.admin
            } else {
                role = USER_ROLES.user
            }

            // Set the token as header for your requests!
            $http.defaults.headers.common['X-Auth-Token'] = token;
        }

        function destroyUserCredentials() {
            authToken = undefined;
            username = '';
            isAuthenticated = false;
            $http.defaults.headers.common['X-Auth-Token'] = undefined;
            window.localStorage.removeItem(LOCAL_TOKEN_KEY);
        }

        var login = function(name, pw) {
            return $q(function(resolve, reject) {

                //server call, this is a mock login
                if (name == 'admin' && pw == '1') {
                    // Make a request and receive your auth token from your server
                    storeUserCredentials(USER_ROLES.admin, name + '.yourServerToken');
                    resolve('Login success.');
                } else {
                    reject('Login Failed.');
                }
            });
        };

        var loginSocial = function(userRole, token) {
            return $q(function(resolve) {
                storeUserCredentials(userRole, token);
                resolve('Login success.');
            });
        };

        var logout = function() {
            destroyUserCredentials();
        };

        var isAuthorized = function(authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
        };

        loadUserCredentials();

        return {
            login: login,
            loginSocial: loginSocial,
            logout: logout,
            isAuthorized: isAuthorized,
            isAuthenticated: function() {return isAuthenticated;},
            username: function() {return username;},
            role: function() {return role;}
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