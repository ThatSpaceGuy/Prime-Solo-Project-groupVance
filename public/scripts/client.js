console.log('scripts.js sourced!');
/// == Global Variable Declarations == ///
var verbose = true; // if (verbose) {console.log('');}
var myApp = angular.module( 'myApp', ['ngRoute', 'ui.grid','ui.grid.autoResize'] );

var lock = new Auth0Lock( 'mPWbEGWKhuLu7BazXT3IUpFq3P0KV2uM', 'thatspaceguy.auth0.com');

/// == JavaScript == ///
myApp.controller( 'navController', [ '$scope','$location', function( $scope, $location ){
  console.log( 'NG' );
  $scope.linkList =[
    {route:'home',text:'Home'},
    {route:'dashboard',text:'Dashboard'}
  ];

  // log out url, from Auth0
  // $scope.logOutUrl = 'https://thatspaceguy.auth0.com/v2/logout?returnTo=http%3A%2F%2Flocalhost%3A3000/dashboard';
  $scope.logOutUrl = 'https://accounts.google.com/logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3030/';

  $scope.logIn = function(){
    // call out logIn function from auth0.js
    console.log( 'in logIn' );
    lock.show( function( err, profile, token ) {
      if (err) {
        console.error( "auth error: ", err);
      } // end error
      else {
        console.log('Auth0 success, Profile: ', profile);
        // save token to localStorage
        localStorage.setItem( 'userToken', token );
        // save user profile to localStorage
        localStorage.setItem( 'userProfile', JSON.stringify( profile ) );
        // relaod Page
        location.reload();
      } // end no error
    }); //end lock.show
  }; // end scope.logIn


  $scope.logOut = function(path){
    localStorage.removeItem( 'userProfile' );
    localStorage.removeItem( 'userToken' );
    // $location.path( 'https://accounts.google.com/logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3030/'+path );
    $location.path('/'+path);
    $scope.loggedIn = false;
    $scope.currentUser = {pref_name: 'Guest'};
    console.log( 'loggedOut:', $scope.userProfile, $scope.currentUser );
  };

  $scope.logInCheck = function(){
    if( JSON.parse( localStorage.getItem( 'userProfile' ) ) ){
      // if so, save userProfile as $scope.userProfile
      $scope.userProfile = JSON.parse( localStorage.getItem( 'userProfile' ) );
      console.log( 'loggedIn:', $scope.userProfile );
      $scope.loggedIn = true;
    }
    else{
      // if not, make sure we are logged out and empty
      $scope.logOut($scope.currentView);
    }
  };
}]); // end navController

// Angular Routing Set-up
myApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  console.log('$routeProvider:',$routeProvider);

  $routeProvider.
  when('/home', {
    templateUrl: '/views/partials/home.html',
    controller: 'homeController'
  }).
  when('/dashboard', {
    templateUrl: '/views/partials/dashboard.html',
    controller: 'dashController'
  }).
  otherwise({
    redirectTo: '/home'
  });

  // use the HTML5 History API for pretty URLs
  $locationProvider.html5Mode(true);
}]);// end NG-routing
