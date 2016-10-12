myApp.controller('dashController', ['$scope', '$http', function($scope, $http){
  console.log('Dashboard Controller');
  // Global variables
  // for testing - to be replaced by Auth0 logic
  var loggedIn = true;

  $scope.getMember = function(){
    console.log( 'in test post' );
    // assemble objectToSend
    var objectToSend ={
      fieldName: 'log_email',
      fieldValue: 'ReachLuis@gmail.com'
    }; //end object to send
    $http({
      method: 'GET',
      url: '/getMemberDB',
      data: objectToSend,
    }).then(function successCallback( response ){
      console.log( 'back from post:', response );
      // set relevant part of response to currentUser
      $scope.currentUser = response.data[0];
      // check to see if a preferred name exists
      if (!$scope.currentUser.pref_name){
        // if not, set it equal to first_name
        $scope.currentUser.pref_name = $scope.currentUser.first_name;
      }
      console.log($scope.currentUser);
    });
  }; // end getMember

  // if a Member is loggedIn
  if (loggedIn){
    // get their info
    $scope.getMember();
  } else {
    // otherwise, call them "Guest"
    $scope.currentUser = {pref_name: 'Guest'};
  }
}]);
