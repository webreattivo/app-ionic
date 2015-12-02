angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $ionicPopup, $state) {

    })

    .controller('LoginCtrl', function ($scope, $state, $ionicPopup, LoginService, $cordovaOauth) {

        $scope.loginData = {};

        $scope.doLogin = function() {
            LoginService.loginUser($scope.loginData.username, $scope.loginData.password).success(function(data) {
                $state.go('app.dashboard');
            }).error(function(data) {
                $ionicPopup.alert({
                    title: 'Login failed!',
                    template: 'Please check your credentials!'
                });
            });
        };

        $scope.facebookLogin = function() {
            $cordovaOauth.facebook("1520497348260580", ["email"]).then(function(result) {
                console.log("success");
                console.log(result);
                $state.go('app.dashboard');
            }, function(error) {
                // error
                console.log("error");
                console.log(error);
            });
        };
    })

    .controller('DashCtrl', function($scope) {

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
    });
