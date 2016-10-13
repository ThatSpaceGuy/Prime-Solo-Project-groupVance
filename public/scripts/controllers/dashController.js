myApp.controller('dashController', ['$scope', '$http', function($scope, $http){
  console.log('Dashboard Controller');
  //// Global variables
  // for testing - to be replaced by Auth0 logic
  $scope.loggedIn = true;
  $scope.stepDone = false;

  $scope.getMember = function(){
    console.log( 'in getMember()' );

    // Logic to find lastDay
    lastDay = moment().subtract(1, 'days').endOf('day').format();
    // assemble objectToSend
    var logInfoToSend = {
      fieldName: 'log_email',
      fieldValue: 'Lui.Matos@gmail.com'
    }; //end object to send
    $http({
      method: 'POST',
      url: '/getMemberDB',
      data: logInfoToSend
    }).then(function successCallback( response ){
      console.log( 'back from post:', response );
      // set latest Step information to currentUser
      $scope.currentUser = response.data[0];
      var dbUser = $scope.currentUser;
      // check to see if a preferred name exists
      if (!dbUser.pref_name){
        // if not, set it equal to first_name
        $scope.currentUser.pref_name = dbUser.first_name;
      }
      console.log('currentUser:',$scope.currentUser);
      //// Set initial step info for user
      // if user has ever taken a step
      if (dbUser.step_id){
        // count the number of steps taken
        $scope.userSteps = response.data.length;
        // check for step done after lastDay
        if (moment(lastDay).isBefore(dbUser.step_created)) {
          // then a step was taken today
          $scope.stepDone = true;
          // capture id of last step to be able to delete it
          $scope.currentStep = {id: dbUser.step_id};
        } else {
          // then no step was taken today
          $scope.stepDone = false;
        }
      } else {
        // They haven't taken a step yet, so count is 0
        $scope.userSteps = 0;
      }
      console.log('num steps:', $scope.userSteps);
      //// Set group info for user


    }); // end http POST call
  }; // end getMember


  // if a Member is loggedIn
  if ($scope.loggedIn){
    // get their info
    $scope.getMember();
  } else {
    // otherwise, call them "Guest"
    $scope.currentUser = {pref_name: 'Guest'};
  } // end loggedIn check

  //// Prayer Stats Box Code
  $scope.takeStep = function(){
    // First, double-check that a step hasn't been taken today
    if ($scope.currentStep){
      console.log('ERROR! Step already taken today!');
    } else {
      var stepInfoToSend ={
        // get the memberID, and send it
        memberID: $scope.currentUser.member_id,
        actionType: 1 // Currently Prayer (1) is only action
      }; //end object to send
      console.log('stepInfoToSend: ',stepInfoToSend);
      $http({
        method: 'POST',
        url: '/postStepDB',
        data: stepInfoToSend
      }).then(function successCallback( response ){
        console.log( 'back from post:', response );
        // set relevant part of response to currentStep
        $scope.currentStep = response.data;
        console.log($scope.currentStep);
        $scope.userSteps++;
      }); // end http POST call
      $scope.stepDone = true;
    }
  };

  $scope.undoStep = function(){
    // First, double-check that a step has been taken today
    if (!$scope.currentStep){
      console.log('ERROR! Step not taken today!');
    } else {
      var stepIDToSend ={
        // get the stepID, and send it
        stepID: $scope.currentStep.id,
      }; //end object to send
      $http({
        method: 'DELETE',
        url: '/deleteStepDB',
        data: stepIDToSend,
        headers: {"Content-Type": "application/json;charset=utf-8"}
      }).then(function successCallback( response ){
        console.log( 'back from post:', response );
        $scope.stepDone = false;
        $scope.currentStep = undefined;
        $scope.userSteps--;
      }); // end http DELETE call
    }
  };
}]);
