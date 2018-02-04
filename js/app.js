"use strict";

angular.module('texasorfrance', []).config(['$routeProvider',
function($routeProvider) {

	$routeProvider.when('/home', {
		templateUrl : 'partials/home.tpl.html',
		controller : GameCtrl
	}).

	//TODO: This kind of stinks and I think there may be a fix for this with optional parameters
	when('/highscores', {
		templateUrl : 'partials/highscores.tpl.html',
		controller : HighScoresCtrl
	}).when('/faq', {
		templateUrl : 'partials/faq.tpl.html'
	}).otherwise({
		redirectTo : '/home'
	});
}])

.controller('TabCtrl', function($scope, $location) {
    $scope.isActive = function(route) {
        return route === $location.path();
    }
});


$(document).ready(function() {
	if (navigator.userAgent.indexOf('iPhone') != -1 || navigator.userAgent.indexOf('Android') != -1) {
		addEventListener("load", function() {
			setTimeout(hideURLbar, 0);
		}, false);
	}

	//Parse.initialize("LuQ8DbYQ3PTEx6T0FZbMeSVG5aoIuKvHnR5sJ0Mz", "pEHxZExUhn0MqLTMnIaKVpCLzXuMndJLSMgS2VBD");
});

