/**
 * Assignment 1, COSC212
 * Functions which initialise the homepage of web application displaying the locations and contents of Lilliput
 * libraries in Dunedin.
 *
 * Created by: Henry Morrison-Jones, 10/08/17
 */


/*jshint -W117*/

/**
 * Module pattern for Form functions
 */
var Form = (function () {
    "use strict";

    var pub;
    var mymap;

    // Public interface
    pub = {};

    /**
     * Sets up the leaflet map interface which is used for checking coordinates.
     */
    function setMap(){
        mymap = L.map('mapid').setView([-45.86661, 170.51699], 12);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        }).addTo(mymap);
    }

    /**
     * Creates dynamic form input for book entries
     */
    function createBookEntries(){
        var numBooks = $("#numBooks").val();
        var html = "";

        //Creates new book entries for the number of books selected
        for(var i = 1; i<=numBooks; i++){
            html+=("<p> <label for='title'" + i + ">Book " + i +" Title:" + "</label>" + "<input type='text' name='title'" + i+1 + " id='title'" + i+1 + " required> </p>");

            html+=("<p> <label for='author'" + i + ">Book " + i +" Author:" + "</label>" + "<input type='text' name='author'" + i + " id='author'" + i + " required> </p>");

            html+=("<p> <label for='year'" + i + ">Book " + i +" Year:" + "</label>" + "<input type='text' name='year'" + i + " id='year'" + i + " required> </p>");
        }
        $('#bookList').html(html);
    }

    /**
     * Checks that a given input field is not empty
     * @param textValue - the value of the input
     * @returns {boolean} - whether the input has content or not
     */
    function checkNotEmpty(textValue) {
        return textValue.trim().length > 0;
    }

    /**
     * Checks an inputs value against a basic regular expression for real numbers
     * @param text - the value of the input
     * @returns {boolean} - whether the coordinate is valid or not
     */
    function checkCoordinate(text) {
        var pattern = /^-?[0-9]+\.?([0-9]+)?$/;
        return pattern.test(text);
    }

    /**
     * Checks whether an input is made of digits or not
     * @param text - the value of the input
     * @returns {boolean} - whether the input contains only digits or not
     */
    function checkDigits(text){
        var pattern = /^[0-9]+$/;
        return pattern.test(text);
    }

    /**
     * Used for checking latitude and longitude inputs against a set of standards
     * @param lat - given latitude value
     * @param lng - given longitude value
     * @param messages - array of error messages
     */
    function checkLocation(lat, lng, messages) {
        if (!(checkNotEmpty(lat) && checkNotEmpty(lng))) {
            //if either latitude or longitude are empty push error message
            messages.push("Latitude and Longitude must both have values");
        } else if (!(checkCoordinate(lat) && checkCoordinate(lng))) {
            //if either latitude or longitude aren't real numbers push error message
            messages.push("Latitude and Longitude must be real numbers");
        } else if (mymap.distance([-45.874556, 170.503793], [lat, lng]) > 50000) {
            //if given coordinates are outside of a 50km Dunedin radius, push error message
            messages.push("Coordinates are outside the valid 50km boundary");
        }
    }

    /**
     *Check ID input against a set of standards
     * @param id
     * @param messages
     */
    function checkId(id, messages){
        if(!(checkNotEmpty(id))){
            //If id is empty push error message
            messages.push("ID must have a value");
        }else if(!(checkDigits(id))){
            //If Id contains non-digits push error message
            messages.push("ID must contain only digits");
        }
    }

    /**
     * Check library capacity against a set of standards
     * @param capacity - given value of capacity
     * @param messages - array of error messages
     */
    function checkCapacity(capacity, messages){
        if(!(checkNotEmpty(capacity))){
            //if capacity is empty push error message
            messages.push("Capacity must have a value");
        }else if(!(checkDigits(capacity))){
            //if capacity contains non-digits push error message
            messages.push("Capacity must be a non negative integer");
        }
    }

    /**
     * Checks if number of books is within the library capacity
     * @param numBooks - value given for number of books in library
     * @param capacity - library's capacity
     * @param messages - array of error messages
     */
    function checkNumBooks(numBooks, capacity, messages){
        if(parseInt(numBooks)>parseInt(capacity)){
            //If value of numBooks greater than capacity push error message
            messages.push("Number of Books must be less than the capacity of a library");
        }
    }

    /**
     * Checks whether address field is empty
     * @param address - given address value
     * @param messages - array of error messages
     */
    function checkAddress(address, messages){
        if(!checkNotEmpty(address)){
            messages.push("Please enter an address");
        }
    }

    /**
     * Calls input checking methods for form inputs
     * @returns {boolean} - form submit
     */
    function validateLibrary(){
        var id = $("#id").val();
        var lat = $("#lat").val();
        var long = $("#long").val();
        var capacity = $("#cap").val();
        var numBooks = $("#numBooks").val();
        var address = $("#libraryAddress").val();
        var messages = [];
        var html = "";

        //call input checking functions
        checkId(id, messages);
        checkAddress(address, messages);
        checkLocation(lat, long, messages);
        checkCapacity(capacity, messages);
        checkNumBooks(numBooks, capacity, messages);


        if (messages.length === 0) {
            //if no error messages ask for confirmation
            var con = confirm("Do you want to submit the following changes/information?\n"+
                "\nID: "+ id + "\nLatitude: " + lat + "\nLongitude: " + long + "\nCapacity: " + capacity +
                "\nNumber of Books: " + numBooks);
            //return the value of confirmation
            return(con);
        } else {
            //else display all form errors
            messages.forEach(function(msg){
                html += ("<li>" + msg + "</li>");
            });
            $('#formErrors').html(html);
        }

        // Stop the form from submitting
        return false;
    }

    /**
     * Setup function
     */
    pub.setup = function () {
        setMap();
        $("#numBooks").change(createBookEntries);
        $("#libraryForm").submit(validateLibrary);

    };

    // Return public interface
    return pub;

}());

//When DOM is loaded call setup function for Form
$(document).ready(Form.setup);
/*jshint +W117*/