angular.module('starter')

    .constant('AUTH_EVENTS', {
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized',
        valid: 'valid'
    })

    .constant('USER_ROLES', {
        admin: 'admin_role',
        user: 'user_role'
    });