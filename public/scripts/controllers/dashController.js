myApp.controller('dashController', ['$scope', '$http', function($scope, $http){
  console.log('Dashboard Controller');
  //// Global variables
  // for testing - to be replaced by Auth0 logic
  $scope.loggedIn = true;
  $scope.stepDone = false;

  $scope.getMember = function(){
    console.log( 'in getMember()' );

    // Logic to find today
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {dd='0'+dd;} if(mm<10) {mm='0'+mm;}

    today = yyyy+'-'+mm+'-'+dd+' 00:00:00';
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
      // if user has ever taken a step
      if (dbUser.step_id){
        // count the number of steps taken
        $scope.userSteps = response.data.length;
        // check for step done today
        console.log('lastStep:',dbUser.step_created);
        console.log('today:', today);
        if (dbUser.step_created>today) {
          $scope.stepDone = true;
          $scope.currentStep = {id: dbUser.step_id};
        } else {
          $scope.stepDone = false;
        }
      } else {
        $scope.userSteps = 0;
      }

      console.log('num steps:', $scope.userSteps);
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
