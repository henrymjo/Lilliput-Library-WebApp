/**
 * Assignment 1, COSC212
 * Functions which initialise the homepage of web application displaying the locations and contents of Lilliput
 * libraries in Dunedin.
 *
 * Created by: Henry Morrison-Jones, 10/08/17
 */

/*jshint -W117*/

/**
 * Module pattern for all map and summary stats function for homepage
 */
var Homepage = (function() {
    "use strict";
    //Public interface
    var pub = {};
    //Leaflet map
    var mymap;

    /**
     * Sets up the leaflet map interface.
     */
    function setTiles(){
        mymap = L.map('mapid').setView([-45.86661, 170.51699], 12);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        }).addTo(mymap);
        /*jshit -W117*/
    }

    /**
     * Creates and a geoJSON feature for a given library.
     * @param library - lilliput library
     * @returns geojson feature
     */
    function createFeature(library){
        var lib = $(library);

        return(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lib.find("lng")[0].textContent, lib.find("lat")[0].textContent]
            },
                "properties": {
                    "id": lib.find("id")[0].textContent,
                    "description": "Little Library",
                    "name": lib.find("address")[0].textContent,
                    "capacity": lib.find("capacity")[0].textContent,
                    "numbooks": lib.find("book").length
                }
            }
        );
    }

    /**
     * Converts an xml file to a FeatureCollection and displays a popup containing the raw geoJson
     * @param data
     * @returns {{type: string, features: Array}}
     */
    function xmlConversion(data){
        var i = 0;
        var features = [];

        //error handling for no library elements needs to be implemented
        $(data).find("library").each(function () {
            features[i] = createFeature(this);
            i++;
        });

        //creatures the geoJson feature collection
        var geojson = {
            "type": "FeatureCollection",
            "features": features
        };

        //Creates popup to display raw geoJSON
        var popup = L.popup({
            maxHeight:300,
            maxWidth:"Auto"
        });

        popup.setLatLng([-45.8990177,170.5325523]);
        popup.setContent("Raw geoJSON: <pre>" + JSON.stringify(geojson, null, 2) +"</pre>");
        popup.setContent("Raw geoJSON: <pre>" + JSON.stringify(geojson, null, 2) +"</pre>");
        popup.openOn(mymap);

        //returns feature collection
        return geojson;
    }

    /**
     * Adds information about the capacity and number of books of a library to the summary statistics table.
     * @param library - a given lilliput library.
     */
    function addStats(library){
        var html = "";
        var lib = $(library);
        var address = lib.find("address")[0].textContent;
        var capacity = lib.find("capacity")[0].textContent;
        var numbooks = lib.find("book").length;

        //use info to create html
        /*jshint -W007*/
        html += ("<tr>" + "<td>" + address + "</td>" + "<td>" + numbooks + "</td>" + "<td>" + capacity + "</td>" + + "</tr>");
        /*jshit +W007*/
        //add html to the table
        $("#stats").append(html);
    }

    /**
     * setMarkers uses xml converted to geoJson to display features on the map.
     * Also appends specific information for each library to the feature popup and creates a table of summary statistics.
     */
    function setMarkers() {
        //name of the xml file containing library data
        var xmlSource = "libraries.xml";

        //ajax request
        $.ajax({
            type: "GET",
            url: xmlSource,
            cache: false,
            //on success use the data to display key information about the map.
            success: function (data) {

                //variable declarations
                var bookCount = 0;
                var capacityCount = 0;
                var libraryContents = [];
                var i = 0;
                var table = $("#stats");
                var xml = $(data);

                if((xml.find("libraries").length ===0)||(xml.find("library").length === 0)){
                    window.alert("There are no libraries available");
                    table.append("<tr><td colspan='3' style='text-align:center'>- Could not retrieve library data</td></tr>");
                    return;

                }
                //Append header row for summary stats table
                table.append("<tr> <th scope='col'>Address: </th> <th scope='col'>Number of books present: </th> <th scope='row'>Capacity of library: </th></tr>");

                //for each library element
                xml.find("library").each(function () { //what if no "library" element

                    //append stats to table
                    addStats(this);

                    //adds 'stringified' html of a library's table of contents to an array for later use in popup
                    libraryContents[i] = addBooksHtml(this);

                    //update total book-count and capacity for summary statistics
                    bookCount += $(this).find("book").length;
                    capacityCount += parseInt($(this).find("capacity")[0].textContent);

                    //increment which library we are looking at for libraryContents array manipulation
                    i++;
                });


                // /Append totals row for summary stats table
                table.append("<tr> <th scope='row' id='total'>Total: </th> <td>" + bookCount + " </td> <td>" + capacityCount + "</td></tr>");

                //Reset libraryContents array index to 0 for next use
                i = 0;

                //Convert xml to geoJSON and store in var geojson
                var geojson = xmlConversion(data);

                //Construct map markers using converted xml
                L.geoJSON(geojson, {
                    onEachFeature: onEachFeatureImpl
                }).addTo(mymap);

                /**
                 * For each feature added to the map constructs popup contents with extra info about library, including
                 * library contents.
                 * Kept within ajax request so has access to books array.
                 * @param feature - the geojson feature itself
                 * @param layer - the map layer
                 */
                function onEachFeatureImpl(feature, layer) {
                    var popupContent = ("<b>Little Library: </b>" + feature.properties.name + "<br>");
                    popupContent += ("<b>Number of books: </b>" + feature.properties.numbooks + "<br>");
                    popupContent += ("<b>Capacity: </b>" + feature.properties.capacity + "<br>");
                    popupContent += ("<b>ID: </b>" + feature.properties.id + "<br>");
                    popupContent += ("<br><b>Current Contents: </b>" + "<br>");
                    popupContent += (libraryContents[i]);

                    if (feature.properties && feature.properties.popupContent) {
                        popupContent += feature.properties.popupContent;
                    }
                    layer.bindPopup(popupContent, {
                        maxWidth: "auto"
                    });

                    //increment i for so each library uses correct books html
                    i++;
                }

            },
            //if Ajax request fails notify the user
            error: function (data) {
                window.alert("Could not retrieve file '" + xmlSource + "'");
                $('#stats').append("<tr><td colspan='3' style='text-align:center'>- Could not retrieve library data</td></tr>");
            }
        });
    }

    /**
     * addBooksHtml returns a stringified html table of library contents
     * @param library - the xml data of the lilliput library in question
     * @returns {string} - html for table content containing the list of books for given library
     */
    function addBooksHtml (library) {
        var lib = $(library);
        var books = [];
        var address = lib.find("address")[0].textContent;
        var i = 0;
        var id = lib.find("id")[0].textContent;
        var html = "<table>";

        //appends header row to html
        html += "<tr><th scope='col'>Title</th><th scope='col'>Author</th><th scope='col'>Year</th><tr>";


        //add information for each book it can find to an array of books.
        lib.find("book").each(function () {
            //create an object at books 'i'
            books[i] = {};
            books[i].title = $(this).find("title")[0].textContent;
            books[i].author = $(this).find("author")[0].textContent;
            books[i].year = $(this).find("year")[0].textContent;
            i++;
        });

        //if there are books then append html content for each book object
        if (books.length > 0) {
            for (i = 0; i < books.length; i++) {
                html += "<tr>";
                html += ("<td>" + books[i].title + "</td>");
                html += ("<td>" + books[i].author + "</td>");
                html += ("<td>" + books[i].year + "</td>");
                html += "</tr>";
            }
        } else {
            html += "<td>No Books Recorded</td>";
        }

        //append closing table tag to html content
        html+="</table>";

        //return the stringified html table
        return html;
    }

    /**
     * Sets tiles and markers for map when called.
     */
    pub.setup = function(){
        setTiles();
        setMarkers();

    };

    //Return public interface
    return pub;

}());

//On DOM ready call setup for the home page
$(document).ready(Homepage.setup);

/*jshint +W117*/