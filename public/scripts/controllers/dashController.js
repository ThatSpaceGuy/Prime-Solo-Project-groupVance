myApp.controller('dashController', ['$scope', '$http','uiGridConstants',
function($scope, $http,uiGridConstants){
  console.log('Dashboard Controller');
  //// Global variables
  // for testing
  $scope.loggedIn = true; // to be replaced by Auth0 logic

  // initialize values
  $scope.userSteps = 0;
  $scope.stepDone = false;
  $scope.currentGroup = {data: [{}]};
  $scope.messageList = {data: [{}]};
  // Logic to find lastDay and last week
  var lastDay = moment(new Date()).subtract(1, 'days').endOf('day').format();
  var lastWeek = moment(lastDay).subtract(6, 'days').format();
  console.log('lastDay:',lastDay,'lastWeek:',lastWeek);
  var dayOne = moment(lastWeek).add(1,'days').format('dd');
  var searchDays = [dayOne];
  // build searchDays array
  for (var k = 1; k < 7; k++) {
    searchDays[k]=moment(searchDays[k-1],'dd',true).add(1,'days').format('dd');
  }
  console.log('searchDays:',searchDays);

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

  // Function Delcarations
  $scope.getGroupStatsHeight = function() {
    var rowHeight = 30;
    var headerHeight = 30;
    return {
      height: ($scope.currentGroup.data.length * rowHeight + headerHeight) + "px"
    };
  };

  $scope.getMember = function(){
    console.log( 'in getMember()' );

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
      // store all group and message data
      var dbGroup = response.data[0];
      var dbShouts = response.data[1];
      // set latest Step information to currentUser
      var dbUser = dbGroup[0];
      $scope.currentUser = dbUser;
      // check to see if a preferred name exists
      if (!dbUser.pref_name){
        // if not, set it equal to first_name
        $scope.currentUser.pref_name = dbUser.first_name;
      }
      $scope.currentUser.memberHandle = $scope.currentUser.pref_name + dbUser.member_id;
      console.log('currentUser:',$scope.currentUser);
      //// Set initial step info for user
      // if user has ever taken a step
      if (dbUser.step_id){
        // check if last step was taken today
        console.log('lastStep:',dbUser.step_created,'lastDay:',lastDay);
        if (moment(dbUser.step_created).isAfter(moment(lastDay))) {
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
        memberStep = dbGroup[j].step_created;
        memberName = dbGroup[j].pref_name;
        if (!memberName){
          memberName = dbGroup[j].first_name;
        }
        memberHandle = memberName+dbGroup[j].member_id;
        console.log('memberHandle:',memberHandle);
        if (!groupData[memberHandle]){
          // if ther is no entry yet, then initialize everything for that member
          groupData[memberHandle]={};
          groupData[memberHandle].prefName = memberName;
          groupData[memberHandle].numSteps = 0;
          groupData[memberHandle].stepArray = [];
          groupData[memberHandle].member_id = dbGroup[j].member_id;
        }
        // count this step
        groupData[memberHandle].numSteps++;

        // check if step was taken within the past week
        if (moment(memberStep).isAfter(moment(lastWeek))) {
          // if so, then keep track of it for display
          groupData[memberHandle].stepArray.push(memberStep);
        }
      }
      console.log('groupData:',groupData);
      $scope.groupInfo = groupData;
      // grab steps of currentUser for personal stats box
      $scope.userSteps = groupData[dbUser.memberHandle].numSteps;
      console.log('num steps:', $scope.userSteps);

      // Now that the group data is ready, build gridData
      // initialize variables
      var memberIndex = -1;
      var dayOfStep;
      var stepsToCheck;
      // loop over every property in groupData
      for (var groupMember in groupData) {
        // if the property is actually a groupMember
        if (groupData.hasOwnProperty(groupMember)) {
          console.log('found:',groupMember);
          memberIndex++; // Prepare the memberIndex
          if (groupData[groupMember].member_id == $scope.currentUser.member_id){
            $scope.currentUser.memberIndex = memberIndex;
          }
          console.log('memberIndex',memberIndex);
          gridData[memberIndex]={};
          // set prefName for Member column
          gridData[memberIndex].Member = groupData[groupMember].prefName;
          stepsToCheck = groupData[groupMember].stepArray; // grab for DRYness
          // loop over every day in the last week
          for (var l = 0; l < searchDays.length; l++) {
            // grab the weekday for the column name
            ColumnDate = searchDays[l];
            console.log('ColumnDate:',ColumnDate);
            // initialize empty value for ColumnDate - overridden if appropriate
            gridData[memberIndex][ColumnDate] = '';
            // loop over every step the member took in the last week
            for (var i = 0; i < stepsToCheck.length; i++) {
              // grab the weekday that the step was taken
              dayOfStep = moment(stepsToCheck[i]).format('dd');
              // if it matches the column name
              if (dayOfStep === ColumnDate){
                // then make an X in that column
                gridData[memberIndex][ColumnDate] = 'X';
              }
            }
          }
        }
      } // end loop over every property in groupData

      console.log(gridData);
      // assign the gridData to be displayed by ui-grid
      $scope.currentGroup = {data: gridData};

      // Populate the Group message box
      $scope.numShouts = dbShouts.length;
      console.log('dbShouts:', dbShouts);
      $scope.shoutList = [];
      for (var m = 0; m < $scope.numShouts; m++) {
        $scope.shoutList[m] = {};
        var thisPrefName = dbShouts[m].fan_pref_name;
        if (!thisPrefName){
          $scope.shoutList[m].Member = dbShouts[m].fan_first_name;
        } else {
          $scope.shoutList[m].Member = thisPrefName;
        }
        switch (dbShouts[m].cheer_type){
          case 'High Five':
            $scope.shoutList[m].Message = 'gave you a High Five!';
            break;
          case 'Light A Fire':
            $scope.shoutList[m].Message = 'is lighting a fire under you!';
            break;
          default:
            $scope.shoutList[m].Message = 'wants to encourage you!';
            break;
        }
      }


      console.log('shoutList:', $scope.shoutList);
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

  $scope.thankClick = function(){};
  $scope.removeClick = function(){};

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
        $scope.currentStep = response.data[0];
        console.log($scope.currentStep);
        // increment the counter accordingly
        $scope.userSteps++;
        // add the appropriate X to the gridData
        // [$scope.currentUser.memberIndex] is index of currentUser in data
        // searchDays[6] is current Day's property in the Object
        $scope.currentGroup.data[$scope.currentUser.memberIndex][searchDays[6]]='X';
        $scope.stepDone = true;
      }); // end http POST call
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
        // remove the appropriate X to the gridData
        // [$scope.currentUser.memberIndex] is index of currentUser in data
        // searchDays[6] is current Day's property in the Object
        $scope.currentGroup.data[$scope.currentUser.memberIndex][searchDays[6]]='';
      }); // end http DELETE call
    }
  };
}]);
