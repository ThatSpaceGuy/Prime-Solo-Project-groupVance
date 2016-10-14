myApp.controller('dashController', ['$scope', '$http', function($scope, $http){
  console.log('Dashboard Controller');
  //// Global variables
  // for testing
  $scope.loggedIn = false; // to be replaced by Auth0 logic

  // initialize values
  $scope.userSteps = 0;
  $scope.currentGroup = {data: [{}]};
  $scope.demoGroup = {data: [
      {'Member': 'Agent1',
      'Su':'X', 'Mo':'', 'Tu':'X', 'We':'X', 'Th':'', 'Fr':'X', 'Sa':'X'},
      {'Member': 'Agent2',
      'Su':'X', 'Mo':'X', 'Tu':'X', 'We':'', 'Th':'', 'Fr':'X', 'Sa':'X'},
      {'Member': 'Agent3',
      'Su':'X', 'Mo':'', 'Tu':'X', 'We':'X', 'Th':'X', 'Fr':'X', 'Sa':''},
      {'Member': 'Agent4',
      'Su':'X', 'Mo':'', 'Tu':'X', 'We':'X', 'Th':'X', 'Fr':'', 'Sa':'X'},
      {'Member': 'Agent5',
      'Su':'X', 'Mo':'X', 'Tu':'', 'We':'X', 'Th':'X', 'Fr':'X', 'Sa':'X'},
  ]};

  $scope.getMember = function(){
    console.log( 'in getMember()' );

    // Logic to find lastDay and last week
    var currentTime = moment();
    var lastDay = moment(currentTime).subtract(1, 'days').endOf('day');
    var lastWeek = lastDay.subtract(6, 'days');
    console.log('currentTime:',currentTime,'lastDay:',lastDay,'lastWeek:',lastWeek);
    // assemble objectToSend
    var logInfoToSend = {
      memberValue: 'Lui.Matos@gmail.com'
    }; //end object to send
    $http({
      method: 'POST',
      url: '/getMemberDB',
      data: logInfoToSend
    }).then(function successCallback( response ){
      console.log( 'back from post:', response );
      // store all group data
      var dbGroup = response.data;
      // set latest Step information to currentUser
      var dbUser = dbGroup[0];
      $scope.currentUser = dbUser;
      // check to see if a preferred name exists
      if (!dbUser.pref_name){
        // if not, set it equal to first_name
        $scope.currentUser.pref_name = dbUser.first_name;
      }
      console.log('currentUser:',$scope.currentUser);
      //// Set initial step info for user
      // if user has ever taken a step
      if (dbUser.step_id){
        // check if last step was taken today
        if (moment(dbUser.step_created).isAfter(lastDay)) {
          // then a step was taken today
          $scope.stepDone = true;
          // capture id of last step to be able to delete it
          $scope.currentStep = {id: dbUser.step_id};
        }
      }
      //// Set group info for user
      // initialize variables
      var groupData = {};
      var gridData = [{}];
      // loop over every record in dbGroup - all data returned from DB
      for (var j = 0; j < dbGroup.length; j++) {
        // Grabbing info for DRYness
        memberEmail = dbGroup[j].log_email;
        memberStep = dbGroup[j].step_created;
        memberName = dbGroup[j].pref_name;

        if (!groupData[memberEmail]){
          // if ther is no entry yet, then initialize everything for that member
          groupData[memberEmail]={};
          groupData[memberEmail].numSteps = 0;
          groupData[memberEmail].stepArray = [];
          if (!memberName){
            groupData[memberEmail].prefName = dbGroup[j].first_name;
          } else {
            groupData[memberEmail].prefName = memberName;
          }
        }
        // count this step
        groupData[memberEmail].numSteps++;

        // check if step was taken within the past week
        if (moment(memberStep).isAfter(lastWeek)) {
          // if so, then keep track of it for display
          groupData[memberEmail].stepArray.push(memberStep);
        }
      }
      console.log('groupData:',groupData);
      // Now that the group data is ready, build gridData
      // initialize variables
      var dayOne = lastWeek.add(1,'days').format('dd');
      var searchDays = [dayOne];
      // build searchDays array
      for (var k = 1; k < 7; k++) {
        searchDays[k]=moment(searchDays[k-1],'dd',true).add(1,'days').format('dd');
      }
      console.log('searchDays:',searchDays);
      var memberIndex = -1;
      var dayOfStep;
      var stepsToCheck;
      // loop over ever property in groupData
      for (var groupMember in groupData) {
        // if the property is actually a groupMember
        if (groupData.hasOwnProperty(groupMember)) {
          console.log('found:',groupMember);
          memberIndex++; // Prepare the memberIndex
          console.log('memberIndex',memberIndex);
          gridData[memberIndex]={};
          // set prefName for Member column
          gridData[memberIndex].Member = groupData[groupMember].prefName;
          stepsToCheck = groupData[groupMember].stepArray; // grab for DRYness
          // loop over every day in the last week
          for (var l = 0; l < searchDays.length; l++) {
            // grab the weekday for the column name
            dateCol = searchDays[l];
            console.log('dateCol:',dateCol);
            // initialize empty value for dateCol - overridden if appropriate
            gridData[memberIndex][dateCol] = '';
            // loop over every step the member took in the last week
            for (var i = 0; i < stepsToCheck.length; i++) {
              // grab the weekday that the step was taken
              console.log('stepsToCheck:',stepsToCheck,'i:',i);
              dayOfStep = moment(stepsToCheck[i]).format('dd');
              console.log('dayOfStep:',dayOfStep);
              // if it matches the column name
              if (dayOfStep === dateCol){
                // then make an X in that column
                gridData[memberIndex][dateCol] = 'X';
              }
            }
          }
        }
      }
      console.log(gridData);
      // assign the gridData to be displayed by ui-grid
      $scope.currentGroup = {data: gridData};
      // grab steps of currentUser for personal stats box
      $scope.userSteps = groupData[dbUser.log_email].numSteps;
      console.log('num steps:', $scope.userSteps);
    }); // end http POST call
  }; // end getMember


  // if a Member is loggedIn
  if ($scope.loggedIn){
    // get their info
    $scope.getMember();
  } else {
    // otherwise, call them 'Guest'
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
        // increment the counter accordingly
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
        headers: {'Content-Type': 'application/json;charset=utf-8'}
      }).then(function successCallback( response ){
        console.log( 'back from post:', response );
        // reset flags and variables
        $scope.stepDone = false;
        $scope.currentStep = undefined;
        // decrement the counter accordingly
        $scope.userSteps--;
      }); // end http DELETE call
    }
  };
}]);
