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
    // grabbing the most recent child, comparing previous weight to current weight to get weight lost amount
    var previousData = database.ref('weightStatus').limitToLast(1);
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
    // pushing the currentWeight object into the database
    database.ref('weightStatus').push(currentWeight);
    // clears the input values after submit
    $('.weight-input').val('');
    $('#datepicker').val('');
  })

  function DisplayWeightLost() {
    // accessing the database, each time a new element is added, function will automatically run
    database.ref('weightStatus').on('child_added', function(snapshot) {
      // sets weightStatus variable to current child added to firebase
      var weightStatus = snapshot.val();
      var key = snapshot.key;
      console.log(key);
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
  }

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

  // onclick event on my table, targetting the a tag (x)
  $('table').on('click','tr a',function(e){
    e.preventDefault();
    // referring to the database, of 'this' child, targetting the data-key, and removing it
    database.ref('weightStatus').child($(this).attr('data-key')).remove();
    // removes the deleted element from the screen
    $(this).parents('tr').remove();
    // sends an alert
    alertModal('removed-item');
  });

    // calling function to always display weight lost table
  DisplayWeightLost();
});