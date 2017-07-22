$(document).ready(function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAxqm5yO6zVMr4P1nSHbAQrNJstCct6dxA",
    authDomain: "weight-tracker-825bd.firebaseapp.com",
    databaseURL: "https://weight-tracker-825bd.firebaseio.com",
    projectId: "weight-tracker-825bd",
    storageBucket: "weight-tracker-825bd.appspot.com",
    messagingSenderId: "379472156297"
  };
  firebase.initializeApp(config);

  // setting varibles
  var database = firebase.database();
  var weight = '';
  var date = '';
  var weightLost = '';
  var email = '';
  var password = '';
  var userid = '';
  // function to display the calendar
  $(function() {
    $('#datepicker').datepicker();
  });

  // on click function, retrieving data from input fields
  $('#submit-Info').on('click', function(event) {
    // prevents page from refreshing when submit is clicked
    event.preventDefault();
    //setting weight and date variables to what was inputed
    weight = $('.weight-input').val().trim();
    date = $('#datepicker').val().trim();
    // number check, making sure weight was entered as numbers only
    var numberRegex = /^\d*\.?\d*$/;
    if (!numberRegex.test(weight)) {
      alertModal('number-input');
      return false;
    }
    // making sure both weight and date fields are entered
    if ((weight === '') || (date === '')) {
      alertModal('date-input');
      return false;
    }
    userid = firebase.auth().currentUser.uid;
    // console.log(userid);
    // grabbing the most recent child, comparing previous weight to current weight to get weight lost amount
    var previousData = database.ref(userid).child('user').child('weight').limitToLast(1);
    // if statement needed to prevent app from breaking on initial weight entry
    if (!previousData) {
      weightLost = 0;
    } else {
      // simple function to grab previous child's weight, to calculate weight lost
      previousData.on('child_added', function(event) {
        var previousWeight = event.val();
        weightLost = (previousWeight.weight - weight).toFixed(2);
      })
    };
    // setting object (firebase only accepts objects)
    currentWeight = {
      weight: weight,
      date: date,
      lost: weightLost
    }
    var user = firebase.auth().currentUser;
    // pushing the currentWeight object into the database, only if a user is signed in
    if (user) {
      database.ref(userid).child('user').child('weight').push(currentWeight);
    }
    // clears the input values after submit
    $('.weight-input').val('');
    $('#datepicker').val('');
  });

  // onclick event on my table, targetting the a tag (x)
  $('table').on('click','a',function(e){
    e.preventDefault();
    // referring to the database, of 'this' child, targetting the data-key, and removing it
    database.ref(userid).child('user').child('weight').child($(this).attr('data-key')).remove();
    // removes the deleted element from the screen
    $(this).parents('tr').remove();
    // sends an alert
    alertModal('removed-item');
  });

  $('#submit-User').on('click', events => {
    events.preventDefault();
    var email = $('#email').val().trim();
    var password = $('#password').val().trim();
    var auth = firebase.auth();
    var promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e, message));
    $('.modalSignin').hide();
    alertModal('welcome-back');
    $('.navbar-right').show();
  });


  $('#registerUser').on('click', event = (events) => {
    events.preventDefault();
    $('.modalSignin').hide();
    $('.modalRegister').show();
  });

  $('.logOut').on('click', function(events) {
    firebase.auth().signOut();
    alertModal('logged-out');
  });

  firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
      // console.log(firebaseUser);
      DisplayWeightLost();
    } else {
      console.log('not logged in');
    }
  });

  function alertModal(input) {
    // setting modal to hidden status
    $('[data-modal-option]').hide();
    // passes through the input to correctly pick the right modal
    $('.modal-' + input).show();
    // shows the correct modal
    $('#myModal').show();
    // sets the x button to close the modal, and closes the modal
    $('#myModal .close').on('click', function() {
      $('#myModal').hide();
    })
  };

  $('#submitRegistration').on('click', function() {
    var userName = $('#userName').val().trim();
    var email = $('#signUpEmail').val().trim();
    var targetWeight = $('#targetWeight').val().trim();
    var password = $('#signUpPass').val().trim();
    // var tempUserName;
    // localStorage.setItem(tempUserName, userName);
    // var temptargetWeight;
    // localStorage.setItem(temptargetWeight, targetWeight);
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
      console.log('user is authenticated, saving to database now...');
      // var user = firebase.auth().currentUser;
      // console.log(user);
      saveUser(userName, email, targetWeight, password);
      }, function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('warning, error: ' + errorCode + '. ' + errorMessage);
      });
    $('.modalRegister').hide();
    DisplayWeightLost();
  });

  function saveUser(userName, email, targetWeight, password){
    var user = firebase.auth().currentUser;
    var userNode = database.ref(user.uid).child('user');
    var createduser = {
      userName: userName,
      email: email,
      targetWeight: targetWeight,
      password: password
    };
    console.log(createduser);
    userNode.push(createduser);
  };


  function DisplayWeightLost() {
    userid = firebase.auth().currentUser.uid;
    // accessing the database, each time a new element is added, function will automatically run
    database.ref(userid).child('user').child('weight').on('child_added', function(snapshot) {
      // sets weightStatus variable to current child added to firebase
      var weightStatus = snapshot.val();
      var key = snapshot.key;
      // setting up table tr, td elements
      var row = $('<tr>');
      row.append($('<td>').html(weightStatus.date));
      row.append($('<td>').html(weightStatus.weight));
      row.append($('<td>').html(weightStatus.lost));
      row.append($('<td><a data-key="'+ key + '">&times;</a></td>'));
      // appending row items to the table
      $('#weight-table').append(row);
    }, function(errorObject) {
      console.log('read failed: ' + errorObject);
    })
  };

  var changeTab = 'changeTab';
  $('.sideLi').on('click', function() {
    console.log('this link clicked');
    $('.sideLi').removeClass(changeTab);
    $(this).addClass(changeTab);
  });

});

