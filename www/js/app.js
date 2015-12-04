// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic.service.core', 'starter.controllers', 'starter.services', 'ngCordova','ngMockE2E'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .run(function ($rootScope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {

        $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {

            if ('data' in next && 'authorizedRoles' in next.data) {
                var authorizedRoles = next.data.authorizedRoles;
                if (!AuthService.isAuthorized(authorizedRoles)) {

                    event.preventDefault();
                    $state.go($state.current, {}, {reload: true});
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                    console.log('$stateChangeStart emit notAuthorized');
                }
            }

            if (!AuthService.isAuthenticated()) {
                console.log('$stateChangeStart check notAuthenticated');
            }

        });

        $rootScope.$on(AUTH_EVENTS.notAuthorized, function(event) {
             var alertPopup = $ionicPopup.alert({
             title: 'Unauthorized!',
             template: 'You are not allowed to access this resource.'
             });
        });

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
            var alertPopup = $ionicPopup.alert({
                title: 'Not Authenticated!',
                template: 'You are not Authenticated'
            });
        });


    })

    .run(function($httpBackend) {
        //mocking api
        $httpBackend.whenGET('http://localhost:8100/valid')
            .respond({message: 'This is my valid response!'});
        $httpBackend.whenGET('http://localhost:8100/notauthenticated')
            .respond(401, {message: "Not Authenticated"});
        $httpBackend.whenGET('http://localhost:8100/notauthorized')
            .respond(403, {message: "Not Authorized"});

        $httpBackend.whenGET(/templates\/\w+.*/).passThrough();
        $httpBackend.whenGET(/^https:\/\/graph.facebook.com\/v2.5\/me\?.*/).passThrough();
    })

    .config(function ($stateProvider, $urlRouterProvider, USER_ROLES) {
        $stateProvider

            .state('main', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })

            .state('main.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            })

            .state('main.dashboard', {
                cache: false,
                url: '/dashboard',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dashboard.html',
                        controller: 'DashCtrl'
                    }
                }
            })

            .state('main.user', {
                url: '/user',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/user.html',
                        controller: 'UserCtrl'
                    }
                },
                data: {
                    authorizedRoles: [USER_ROLES.user, USER_ROLES.admin]
                }
            })
            .state('main.admin', {
                url: '/admin',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/admin.html',
                        controller: 'AdminCtrl'
                    }
                },
                data: {
                    authorizedRoles: [USER_ROLES.admin]
                }
            })
            .state('main.push-notification', {
                url: '/push-notification',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/push-notification.html',
                        controller: 'PushCtrl'
                    }
                }
            });

        //HOME
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise(function ($injector, $location) {
            var $state = $injector.get("$state");
            $state.go("main.dashboard");
        });
    });
