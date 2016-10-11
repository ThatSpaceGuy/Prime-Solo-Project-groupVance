console.log('scripts.js sourced!');
/// == Global Variable Declarations == ///
var verbose = true; // if (verbose) {console.log('');}
var myApp = angular.module( 'myApp', ['ngRoute'] );
/// == Function Declarations == ///


/// == JavaScript == ///
myApp.controller( 'navController', [ '$scope', '$http', function( $scope, $http ){
  console.log( 'NG' );
  $scope.testArray =[];
  $scope.counter=0;
  $scope.testPost = function(){
    console.log( 'in test post' );
    // assemble objectToSend
    var objectToSend ={
      myField: 'asdf'
    }; //end object to send
    $http({
      method: 'POST',
      url: '/postRoute',
      data: objectToSend,
    }).then(function successCallback( response ){
      console.log( 'back from post:', response );
    });
  }; // end testPost
}]); // end testController

// Angular Routing Set-up
myApp.config(["$routeProvider","$locationProvider", function($routeProvider,$locationProvider){
  $routeProvider.
    when("/home", {
      templateUrl: "/views/partials/home.html",
      controller: "homeController"
    }).
    when("/dashboard", {
      templateUrl: "/views/partials/dashboard.html",
      controller: "dashController"
    }).
    when("/donate", {
      templateUrl: "/views/partials/donate.html",
      controller: "donateController"
    }).
    otherwise({
      redirectTo: "/home"
    });

    // use the HTML5 History API for pretty URLs
    $locationProvider.html5Mode(true);
}]);// end NG-routing
