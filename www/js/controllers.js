angular.module('starter.controllers', [])

    .controller('AppCtrl', function (
        $scope,
        $rootScope,
        $state,
        $ionicPopup,
        $ionicHistory,
        AuthService,
        AUTH_EVENTS) {

        $scope.getUsername = function() {
            return AuthService.getUsername();
        };

        $scope.isAuthenticated = function() {
            return AuthService.isAuthenticated();
        };

        $scope.logout = function() {
            AuthService.logout();
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('main.login');
        };
    })

    .controller('LoginCtrl', function (
        $scope,
        $state,
        $http,
        $ionicPlatform,
        $ionicPopup,
        $ionicHistory,
        $cordovaOauth,
        $cordovaToast,
        AuthService,
        FACEBOOK,
        API_ENDPOINTS,
        USER_ROLES) {

        $scope.login = function(data) {
            AuthService.login(data.username, data.password).then(function(authenticated) {
                $cordovaToast.showLongBottom('Logged with local system');
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('main.dashboard', {}, {reload: true});
                window.plugins.nativepagetransitions.slide({
                    'direction': 'left'
                });
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

                        AuthService.loginSocial(response.data.name, result.access_token);
                        $cordovaToast.showLongBottom('Logged with Facebook :)');
                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });
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

    .controller('DashCtrl', function(
        $scope,
        $state,
        $http,
        $ionicPopup,
        $cordovaVibration
    ) {

        $scope.vibrate = function() {
            $cordovaVibration.vibrate(1000);
        };

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

    .controller('PushCtrl', function($scope, $ionicPlatform, $cordovaClipboard, $cordovaToast) {

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
            $cordovaClipboard.copy($scope.token).then(function() {
                $cordovaToast.showLongBottom('Copied Token!');
            });
        };
    })

    .controller('ChartsCtrl', function($scope) {

        $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
        $scope.series = ['Series A', 'Series B'];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
    })

    .controller('FlashLightCtrl', function($scope, $cordovaFlashlight, $cordovaToast) {

        var avail = false;
        $cordovaFlashlight.available().then(function(availability) {
            avail = availability;
        });

        $scope.flash = function () {

            if(!avail) {
                $cordovaToast.showLongBottom('FlashLight Not Available!');
            }

            $cordovaFlashlight.toggle()
                .then(function (success) {
                    /* success */
                }, function (error) {
                    $cordovaFlashlight.switchOff();
                });
        };


    })

    .controller('SmsCtrl', function($scope, $cordovaSms, $cordovaToast) {
        document.addEventListener("deviceready", function () {

            $scope.sendSms = function(data) {

                var options = {
                    replaceLineBreaks: false,
                    android: {
                        //intent: 'INTENT'  // send SMS with the native android SMS messaging
                    }
                };

                $cordovaSms
                    .send(data.phone, data.message, options)
                    .then(function() {
                        $cordovaToast.showLongBottom('SMS was sent :)');
                    }, function(error) {
                        $cordovaToast.showLongBottom('SMS not sent');
                    });
            };
        });
    })

    .controller('DeviceCtrl', function($scope, $cordovaDevice) {
        document.addEventListener("deviceready", function () {

            $scope.device = $cordovaDevice.getDevice();

            $scope.model = $cordovaDevice.getModel();

            $scope.platform = $cordovaDevice.getPlatform();

            $scope.uuid = $cordovaDevice.getUUID();

            $scope.version = $cordovaDevice.getVersion();

        }, false);
    })

    .controller('UserCtrl', function($scope) {

    })

    .controller('AdminCtrl', function($scope) {

    });