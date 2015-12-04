angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $rootScope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {

        $scope.username = AuthService.username();

        $scope.isAuthenticated = AuthService.isAuthenticated();

        $scope.setCurrentUsername = function(name) {
            $scope.username = name;
        };

        $scope.logout = function() {
            AuthService.logout();
            $state.go('main.login');
        };

    })

    .controller('LoginCtrl', function (
        $scope,
        $state,
        $http,
        $ionicPlatform,
        $ionicPopup,
        $cordovaOauth,
        AuthService,
        FACEBOOK,
        API_ENDPOINTS,
        USER_ROLES) {

        $scope.data = {};

        $scope.login = function(data) {
            AuthService.login(data.username, data.password).then(function(authenticated) {
                $state.go('main.dashboard', {}, {reload: true});
                $scope.setCurrentUsername(data.username);
            }, function(err) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Login failed!',
                    template: 'Please check your credentials!'
                });
            });
        };

        $ionicPlatform.ready(function () {

            $scope.facebookLogin = function() {
                $cordovaOauth.facebook(FACEBOOK.appId, ["email"]).then(function(result) {

                    AuthService.loginSocial(USER_ROLES.user, result.access_token);

                    $http({
                        url: API_ENDPOINTS.fb+'/me',
                        method: "GET",
                        params: {
                            fields: 'name,email,picture',
                            access_token: result.access_token
                        }
                    }).then(function successCallback(response) {

                        Ionic.io();
                        var push = new Ionic.Push();

                        var user = Ionic.User.current();
                        var callback = function (pushToken) {
                            $scope.token = pushToken.token;

                            if (!user.id) {
                                user.id = Ionic.User.anonymousId();
                            }

                            user.set('name', response.data.name);
                            user.set('email', response.data.email);
                            user.set('role', USER_ROLES.user);
                            user.set('image', response.data.picture.data.url);
                            user.addPushToken(pushToken);
                            user.save();
                        };

                        push.register(callback);

                        $scope.setCurrentUsername(response.data.name);
                        $state.go('main.dashboard');

                    }, function errorCallback(response) {
                        console.log(response);
                    });

                }, function(error) {
                    console.log(error);
                });
            };
        });
    })

    .controller('DashCtrl', function($scope, $state, $http, $ionicPopup, AuthService) {

        $scope.performValidRequest = function() {
            $http.get('http://localhost:8100/valid').then(
                function(result) {
                    $scope.response = result;
                    var alertPopup = $ionicPopup.alert({
                        title: 'Valid!',
                        template: 'You made a valid request'
                    });
                });
        };

        $scope.performUnauthorizedRequest = function() {
            $http.get('http://localhost:8100/notauthorized').then(
                function(result) {
                    // No result here..
                }, function(err) {
                    $scope.response = err;
                });
        };

        $scope.performInvalidRequest = function() {
            $http.get('http://localhost:8100/notauthenticated').then(
                function(result) {
                    // No result here..
                }, function(err) {
                    $scope.response = err;
                });
        };
    })

    .controller('PushCtrl', function($scope, $ionicPlatform, $cordovaClipboard) {

        $ionicPlatform.ready(function () {

            Ionic.io();
            var push = new Ionic.Push({
                "debug": true,
                "onNotification": function (notification) {
                    var payload = notification.payload;
                    console.log(notification, payload);
                },
                "onRegister": function (data) {
                    console.log(data.token);
                },
                "pluginConfig": {
                    "android": {
                        "iconColor": "#343434"
                    }
                }
            });

            var user = Ionic.User.current();
            var callback = function (pushToken) {
                $scope.token = pushToken.token;

                if (!user.id) {
                    user.id = Ionic.User.anonymousId();
                }

                user.addPushToken(pushToken);
                user.save();
            };

            push.register(callback);
        });

        $scope.toCopy = function () {
            console.log($scope.token);
            $cordovaClipboard.copy($scope.token);
        };
    })

    .controller('UserCtrl', function($scope, $ionicPlatform, $cordovaClipboard) {

    })

    .controller('AdminCtrl', function($scope, $ionicPlatform, $cordovaClipboard) {

    })

    .controller('TestCtrl', function($scope, $ionicPlatform, $cordovaClipboard) {

    });