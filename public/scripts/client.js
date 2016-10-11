console.log('scripts.js sourced!');
/// == Global Variable Declarations == ///
var verbose = true; // if (verbose) {console.log('');}
var myApp = angular.module( 'myApp', ['ngRoute'] );
/// == Function Declarations == ///


/// == JavaScript == ///
myApp.controller( 'navController', [ '$scope', function( $scope ){
  console.log( 'NG' );
  $scope.linkList =[
    {route:'home',text:'Home'},
    {route:'dashboard',text:'Dashboard'},
    {route:'donate',text:'Log In'}];

}]); // end navController

// Angular Routing Set-up
myApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $routeProvider.
    when('/home', {
      templateUrl: '/views/partials/home.html',
      controller: 'homeController'
    }).
    when('/dashboard', {
      templateUrl: '/views/partials/dashboard.html',
      controller: 'dashController'
    }).
    when('/donate', {
      templateUrl: '/views/partials/donate.html',
      controller: 'donateController'
    }).
    otherwise({
      redirectTo: '/home'
    });

    // use the HTML5 History API for pretty URLs
    $locationProvider.html5Mode(true);
}]);// end NG-routing
