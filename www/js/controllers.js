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

    .controller('LoginCtrl', function ($scope, $state, $location, $ionicPopup, AuthService, $cordovaOauth, FACEBOOK) {

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
        }

        $scope.facebookLogin = function() {
            $cordovaOauth.facebook(FACEBOOK.appId, ["email"]).then(function(result) {
                console.log(result);
                $state.go('main.dashboard');
            }, function(error) {
                console.log(error);
            });
        };
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