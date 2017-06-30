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

  var database = firebase.database();
  var weight = '';
  var date = '';
  var weightLost = '';

  $(function() {
    $('#datepicker').datepicker();
  });

  $('#submit-Info').on('click', function(event) {
    event.preventDefault();
    weight = $('.weight-input').val().trim();
    date = $('#datepicker').val().trim();

    var numberRegex = /^\d+$/;
    if (!numberRegex.test(weight)) {
      return false;
    }
    if ((weight === '') || (date === '')) {
      return false;
    }

    var previousData = database.ref('weightStatus').limitToLast(1);
    previousData.on('child_added', function(event) {
      var previousWeight = event.val();
      weightLost = (previousWeight.weight - weight).toFixed(2);
    });

    currentWeight = {
      weight: weight,
      date: date,
      lost: weightLost
    }

    database.ref('weightStatus').push(currentWeight);
    $('.weight-input').val('');
    $('#datepicker').val('');
  })

  function DisplayWeightLost() {
    database.ref('weightStatus').on('child_added', function(snapshot) {
      var weightStatus = snapshot.val();
      var row = $('<tr>');
      row.append($('<td>').html(weightStatus.date));
      row.append($('<td>').html(weightStatus.weight));
      row.append($('<td>').html(weightStatus.lost));
      row.append($('<td><a href="#">&times;</a></td>'));
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

  $(function(){
    $('table').on('click','tr a',function(e){
       e.preventDefault();
      $(this).parents('tr').remove();
    });
  });

  DisplayWeightLost();
});