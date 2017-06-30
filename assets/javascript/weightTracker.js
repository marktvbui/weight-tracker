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

	$(function () {
	    $('#datepicker').datepicker();
	});

    $('#submit-Info').on('click', function(event){
        event.preventDefault();
        weight = $('.weight-input').val().trim();
        date = $('#datepicker').val().trim();

        if ((weight === '') || (date === '')) {
            alert('Please fill out all input fields.');
            return false;
        }

        currentWeight = {
        weight: weight,
        date: date
        }

        database.ref('weightStatus').push(currentWeight);
        $('.weight-input').val('');
        $('#datepicker').val('');
    })

    function DisplayWeightLost(){
        database.ref('weightStatus').on('child_added', function(snapshot){
	        var weightStatus = snapshot.val();
            console.log(weightStatus);
	        var row = $('<tr>');
	        row.append($('<td>').html(weightStatus.date));
	        row.append($('<td>').html(weightStatus.weight));
            $('#weight-table').append(row);
	    }, function(errorObject){
	        console.log('read failed: ' + errorObject);
	        })
    }
    DisplayWeightLost();
});