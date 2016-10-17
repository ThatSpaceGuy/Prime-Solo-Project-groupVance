console.log('scripts.js sourced!');
/// == Global Variable Declarations == ///
var verbose = true; // if (verbose) {console.log('');}
var myApp = angular.module( 'myApp', ['ngRoute', 'ui.grid','ui.grid.autoResize'] );

var lock = new Auth0Lock( 'mPWbEGWKhuLu7BazXT3IUpFq3P0KV2uM', 'thatspaceguy.auth0.com');

/// == Function Declarations == ///



/// == JavaScript == ///
myApp.controller( 'navController', [ '$scope', function( $scope ){
  console.log( 'NG' );
  $scope.linkList =[
    {route:'home',text:'Home'},
    {route:'dashboard',text:'Dashboard'},
    {route:'donate',text:'Map'}

  ];
  // log out url, from Auth0
  $scope.logOutUrl = 'https://accounts.google.com/logout';

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
      } // end no error
    }); //end lock.show
  }; // end scope.logIn


  $scope.logOut = function(){
    localStorage.removeItem( 'userProfile' );
    localStorage.removeItem( 'userToken' );
    $scope.loggedIn = false;
    $scope.currentUser = {pref_name: 'Guest'};
    console.log( 'loggedOut:', $scope.userProfile, $scope.currentUser );
  };

  if( JSON.parse( localStorage.getItem( 'userProfile' ) ) ){
    // if so, save userProfile as $scope.userProfile
    $scope.userProfile = JSON.parse( localStorage.getItem( 'userProfile' ) );
    console.log( 'loggedIn:', $scope.userProfile );
    $scope.loggedIn = true;
  }
  else{
    // if not, make sure we are logged out and empty
    $scope.logOut();
  }
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
