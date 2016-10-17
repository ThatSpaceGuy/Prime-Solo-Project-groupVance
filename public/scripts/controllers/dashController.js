myApp.controller('dashController', ['$scope', '$http', '$window','uiGridConstants',
function($scope, $http, $window, uiGridConstants){
  console.log('Dashboard Controller');
  $scope.currentView = 'dashboard';

  // initialize values
  $scope.userSteps = 0;
  $scope.stepDone = false;
  $scope.cheerSent = {total: 0};
  $scope.currentGroup = {data: [{}]};
  $scope.messageList = {data: [{}]};
  $scope.shoutConfirm = '';
  $scope.openGroups = {};
  $scope.groupSize = 0;
  $scope.numCheers = 2; // should ideally be set from the database
  // Logic to find lastDay and last week
  var userNow = moment(new Date()).format();
  var lastDay = moment(userNow).subtract(1, 'days').endOf('day').format();
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
    {'Member': 'Member1',
    'Su':'X', 'Mo':'', 'Tu':'X', 'We':'X', 'Th':'', 'Fr':'X', 'Sa':'X'},
    {'Member': 'Member2',
    'Su':'X', 'Mo':'X', 'Tu':'X', 'We':'', 'Th':'', 'Fr':'X', 'Sa':'X'},
    {'Member': 'Member3',
    'Su':'X', 'Mo':'', 'Tu':'X', 'We':'X', 'Th':'X', 'Fr':'X', 'Sa':''},
    {'Member': 'Member4',
    'Su':'X', 'Mo':'', 'Tu':'X', 'We':'X', 'Th':'X', 'Fr':'', 'Sa':'X'},
    {'Member': 'Member5',
    'Su':'X', 'Mo':'X', 'Tu':'', 'We':'X', 'Th':'X', 'Fr':'X', 'Sa':'X'},
  ]};


  // Function Delcarations
  $scope.getDemoStatsHeight = function() {
    var rowHeight = 30;
    var headerHeight = 30;
    return {
      height: ($scope.demoGroup.data.length * rowHeight + headerHeight) + "px"
    };
  };
  $scope.getGroupStatsHeight = function() {
    var rowHeight = 30;
    var headerHeight = 30;
    return {
      height: ($scope.currentGroup.data.length * rowHeight + headerHeight) + "px"
    };
  };

  $scope.getMember = function(){
    console.log( 'in getMember()' );
    console.log('Profile again:', $scope.userProf);
    // assemble objectToSend
    var logInfoToSend = {
      memberEmail: $scope.userProfile.email,
      firstName: $scope.userProfile.given_name,
      lastName: $scope.userProfile.family_name
    }; //end object to send
    console.log('logInfoToSend:',logInfoToSend);
    $http({
      method: 'POST',
      url: '/getMemberDB',
      data: logInfoToSend
    }).then(function successCallback( response ){
      console.log( 'back from post:', response );
      // store all group and message data
      var dbGroup = response.data[0];
      // set latest Step information to currentUser
      var dbUser = dbGroup[0];
      $scope.currentUser = dbUser;
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
        memberHandle = memberName+dbGroup[j].member_id;
        console.log('memberHandle:',memberHandle);
        if (!groupData[memberHandle]){
          // if ther is no entry yet, then initialize everything for that member
          groupData[memberHandle]={};
          groupData[memberHandle].prefName = memberName;
          groupData[memberHandle].numSteps = 0;
          groupData[memberHandle].stepArray = [];
          groupData[memberHandle].member_id = dbGroup[j].member_id;
          $scope.groupSize++;
        }
        // count this step
        if(memberStep){
          groupData[memberHandle].numSteps++;
        }

        // check if step was taken within the past week
        if (moment(memberStep).isAfter(moment(lastWeek))) {
          // if so, then keep track of it for display
          groupData[memberHandle].stepArray.push(memberStep);
        }
      }
      console.log('groupData:',groupData, 'length:', groupData.length);
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
      $scope.dbShouts = response.data[1];
      console.log('dbShouts:', $scope.dbShouts);
      $scope.shoutList = [];
      var thisShout;
      $scope.numShouts = 0;
      var listIndex;
      for (var m = 0; m < $scope.dbShouts.length; m++) {
        thisShout = $scope.dbShouts[m];
        console.log('thisShout:', thisShout);
        // if the shouter is the same as the currentUser
        console.log('fan_id:', thisShout.fan_id, 'user_id:', $scope.currentUser.member_id);
        if (thisShout.fan_id == $scope.currentUser.member_id){
          // then if thisShout was send today and it's not a 'Thanks!'
          if (moment(lastDay).isBefore(moment(thisShout.shout_created)) && thisShout.cheer_type !== 'Thanks') {
            // mark this cheer as already sent so that it does not show up as an option today
            if (!$scope.cheerSent[thisShout.runner_id.toString()]){
              $scope.cheerSent[thisShout.runner_id.toString()]={};
            }
            $scope.cheerSent[thisShout.runner_id.toString()][thisShout.cheer_type] = true;
            $scope.cheerSent.total++;
          }
          console.log('cheerSent:', $scope.cheerSent);
        } else {
          $scope.numShouts++;
          listIndex = $scope.numShouts-1; // set the correct index
          $scope.shoutList[listIndex] = {};
          $scope.shoutList[listIndex].member = thisShout.fan_pref_name;

          switch (thisShout.cheer_type){
            case 'High Five':
            $scope.shoutList[listIndex].message = 'gave you a High Five!';
            break;
            case 'Light A Fire':
            $scope.shoutList[listIndex].message = 'is lighting a fire under you!';
            break;
            case 'Thanks':
            $scope.shoutList[listIndex].message = 'thanked you for your shout!';
            break;
            default:
            $scope.shoutList[listIndex].message = 'wants to encourage you!';
            break;
          } // end switch
        }
      }
      console.log('shoutList:', $scope.shoutList);

      //if necessary, compile the openGroups information
      if ($scope.currentUser.group_title === 'None'){
        $scope.openGroups = response.data[2];
        console.log('openGroups:',$scope.openGroups);
      }
    }); // end http POST call
  }; // end getMember


  $scope.thankClick = function(shoutIndex, toName, thisShout, toID){
    var thankInfoToSend ={
      // organize the info, and send it
      runnerID: toID,
      fanID: $scope.currentUser.member_id,
      shoutID: thisShout
    }; //end object to send
    console.log('thankInfoToSend: ',thankInfoToSend);
    $http({
      method: 'POST',
      url: '/postThanksDB',
      data: thankInfoToSend
    }).then(function successCallback( response ){
      $scope.shoutList.splice(shoutIndex, 1);
      $scope.dbShouts.splice(shoutIndex, 1);
      $scope.shoutConfirm = toName+' has been thanked!';
      $scope.numShouts--;
    }); // end http POST call
  }; // end thankClick

  $scope.joinClick = function(groupToJoin, userAction){
    if ($window.confirm('Please confirm you want to join the '+groupToJoin+' group.')) {
      var joinInfoToSend ={
        // organize this info, and send it
        groupTitle: groupToJoin,
        memberID: $scope.currentUser.member_id,
        actionID: userAction
      }; //end object to send
      console.log('joinInfoToSend: ',joinInfoToSend);
      $http({
        method: 'POST',
        url: '/postJoinDB',
        data: joinInfoToSend
      }).then(function successCallback( response ){
        alert('You successfully joined the '+groupToJoin+' group!');
        // re-load page info
        $scope.getMember();

      }); // end http POST call
    } else {
      alert('Join request cancelled.');
    }
  }; // end joinClick

  $scope.shoutClick = function(toID, cheer){
    var shoutInfoToSend ={
      // get the info, organize it, and send it
      runnerID: toID,
      fanID: $scope.currentUser.member_id,
      cheerType: cheer
    }; //end object to send
    console.log('shoutInfoToSend: ',shoutInfoToSend);
    $http({
      method: 'POST',
      url: '/postShoutDB',
      data: shoutInfoToSend
    }).then(function successCallback( response ){
      var cheerText;
      console.log(cheer);
      switch (cheer) {
        case 1:
        cheerText = 'High Five';
        break;
        case 2:
        cheerText = 'Light A Fire';
        break;
        default:
        console.log('Error in switch!');
        break;
      }
      if (!$scope.cheerSent[toID.toString()]){
        $scope.cheerSent[toID.toString()]={};
      }
      $scope.cheerSent[toID.toString()][cheerText]=true;
      $scope.cheerSent.total++;

      console.log('cheerSent['+toID.toString()+']['+cheerText+']:',$scope.cheerSent[toID.toString()][cheerText]);
    }); // end http POST call
  }; // end shoutClick

  $scope.heardClick = function(shoutIndex, thisShout){
    var heardInfoToSend ={
      // get the shout ID and send it
      shoutID: thisShout
    }; //end object to send
    console.log('heardInfoToSend: ',heardInfoToSend);
    $http({
      method: 'PUT',
      url: '/putHeardDB',
      data: heardInfoToSend
    }).then(function successCallback( response ){
      $scope.shoutList.splice(shoutIndex, 1);
      $scope.dbShouts.splice(shoutIndex, 1);
      $scope.numShouts--;
    }); // end http POST call
  }; // end heardClick

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

  //// LoggedIn check
  $scope.logCheckDash = function(){
    if( JSON.parse( localStorage.getItem( 'userProfile' ) ) ){
      // if so, save userProfile as $scope.userProfile
      $scope.userProfile = JSON.parse( localStorage.getItem( 'userProfile' ) );
      console.log( 'loggedIn:', $scope.userProfile );
      $scope.loggedIn = true;
      // if a Member is loggedIn get their info
      $scope.getMember();
    }
    else{
      // if not, make sure we are logged out and empty
      $scope.logOut('dashboard');
    }
  };
}]); // end dashController
