console.log('scripts.js sourced!');
/// == Global Variable Declarations == ///
var verbose = true; // if (verbose) {console.log('');}
var myApp = angular.module( 'myApp', ['ngRoute'] );
/// == Function Declarations == ///


/// == JavaScript == ///
myApp.controller( 'testController', [ '$scope', '$http', function( $scope, $http ){
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
myApp.config(["$routeProvider",function($routeProvider){
  $routeProvider.
    when("/home", {
      templateUrl: "/views/partials/home.html",
      controller: "homeController"
    }).
    when("/artist", {
      templateUrl: "/views/partials/artist.html",
      controller: "artistController"
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
