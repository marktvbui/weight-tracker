$(document).ready(() => {
  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyAxqm5yO6zVMr4P1nSHbAQrNJstCct6dxA",
    authDomain: "weight-tracker-825bd.firebaseapp.com",
    databaseURL: "https://weight-tracker-825bd.firebaseio.com",
    projectId: "weight-tracker-825bd",
    storageBucket: "weight-tracker-825bd.appspot.com",
    messagingSenderId: "379472156297"
  };
  firebase.initializeApp(config);

  // setting varibles
  const database = firebase.database();
  let weight = '';
  let date = '';
  let weightLost = '';
  const email = '';
  const password = '';
  let userid = '';
  // function to display the calendar
  $(() => {
    $('#datepicker').datepicker();
  });

  // on click function, retrieving data from input fields
  $('#submit-Info').on('click', event => {
    // prevents page from refreshing when submit is clicked
    event.preventDefault();
    //setting weight and date variables to what was inputed
    weight = $('.weight-input').val().trim();
    date = $('#datepicker').val().trim();
    // number check, making sure weight was entered as numbers only
    const numberRegex = /^\d*\.?\d*$/;
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
    // grabbing the most recent child, comparing previous weight to current weight to get weight lost amount
    const previousData = database.ref(userid).child('user').child('weight').limitToLast(1);
    // if statement needed to prevent app from breaking on initial weight entry
    if (!previousData) {
      weightLost = 0;
    } else {
      // simple function to grab previous child's weight, to calculate weight lost
      previousData.on('child_added', event => {
        const previousWeight = event.val();
        weightLost = (previousWeight.weight - weight).toFixed(2);
      })
    };
    // setting object (firebase only accepts objects)
    currentWeight = {
      weight: weight,
      date: date,
      lost: weightLost
    }
    const user = firebase.auth().currentUser;
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
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();
    const auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(error => {
      console.log(error.code);
      if (error.code === 'auth/wrong-password') {
        alertModal('wrong-password');
        $('.modalSignin').show();
      } else {
        $('.modalSignin').hide();
        alertModal('welcome-back');
      }
    });
  });


  $('#registerUser').on('click', event = (events) => {
    events.preventDefault();
    $('.modalSignin').hide();
    $('.modalRegister').show();
  });

  $('.logOut').on('click', events => {
    firebase.auth().signOut();
    alertModal('logged-out');
  });

  firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
      // console.log(firebaseUser);
      DisplayWeightLost();
      $('.modalSignin').hide();
      $('.navbar-right').show();
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
    $('#myModal .close').on('click', () => {
      $('#myModal').hide();
    })
  };

  $('#submitRegistration').on('click', () => {
    const userName = $('#userName').val().trim();
    const email = $('#signUpEmail').val().trim();
    const targetWeight = $('#targetWeight').val().trim();
    const password = $('#signUpPass').val().trim();
    firebase.auth().createUserWithEmailAndPassword(email, password).then(user => {
      console.log('user is authenticated, saving to database now...');
      saveUser(userName, email, targetWeight, password);
      }, error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('warning, error: ' + errorCode + '. ' + errorMessage);
      });
    $('.modalRegister').hide();
    DisplayWeightLost();
  });

  function saveUser(userName, email, targetWeight, password){
    const user = firebase.auth().currentUser;
    const userNode = database.ref(user.uid).child('user');
    const createduser = {
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
    database.ref(userid).child('user').child('weight').on('child_added', snapshot => {
      // sets weightStatus variable to current child added to firebase
      const weightStatus = snapshot.val();
      const key = snapshot.key;
      // setting up table tr, td elements
      const row = $('<tr>');
      row.append($('<td>').html(weightStatus.date));
      row.append($('<td>').html(weightStatus.weight));
      row.append($('<td>').html(weightStatus.lost));
      // setting each div to their respective unique key (generated by firebase)
      row.append($('<td><a data-key="'+ key + '">&times;</a></td>'));
      // appending row items to the table
      $('#weight-table').append(row);
    }, errorObject => {
      console.log('read failed: ' + errorObject);
    })
  };

  const changeTab = 'changeTab';
  $('.sideLi').on('click', function() {
    console.log('this link clicked');
    $('.sideLi').removeClass(changeTab);
    $(this).addClass(changeTab);
  });

});

