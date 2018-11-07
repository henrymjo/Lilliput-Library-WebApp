/**
 * Assignment 1, COSC212
 * Functions which create a table of summary statistics and fetch the contents of each library, ready to display.
 *
 * Created by: Henry Morrison-Jones, 20/08/2017
 */


/**
 * Module pattern for Statistics and library content functions
 */
var Content = (function() {

    //Public Interface
    var pub = {};


    /**
     * Makes ajax request to libraries.xml
     * On success, appends html to document for displaying summary stats and library contents.
     * On error, creates alert.
     */
    function createTables(){
        var xmlSource = "libraries.xml";

        //ajax request
        $.ajax({
            type: "GET",
            url: xmlSource,
            cache: false,
            success: function(data) {

                //for each library element
                $(data).find("library").each(function(){ //what if no "library" element
                    //create library content tables
                    addBooks(this);
                });

            },
            error: function(){
                alert("Could not retrieve file 'libraries.xml'");
            }
        });
    }

    function addBooks (library){
        var lib = $(library);
        var books = [];
        var address = lib.find("address")[0].textContent; //what if no "address" element
        var i = 0;
        var id = lib.find("id")[0].textContent;
        var html = "<tr><th scope='col'>Title</th><th scope='col'>Author</th><th scope='col'>Year</th><tr>";
        var target = $("#books");


        lib.find("book").each(function() {
            books[i] = {};
            books[i].title = $(this).find("title")[0].textContent;
            books[i].author = $(this).find("author")[0].textContent;
            books[i].year = $(this).find("year")[0].textContent;
            i++;
        });

        if(books.length>0) {
            for (i = 0; i < books.length; i++) {
                html += "<tr>";
                html += ("<td>" + books[i].title + "</td>");
                html += ("<td>" + books[i].author + "</td>");
                html += ("<td>" + books[i].year + "</td>");
                html += "</tr>";
            }
        }else{
            html +="<td>No Books Recorded</td>";
        }

        target.append("<h3 id=" +id + ">" + address + "</h3>" + "<table id="+id+"Table >" + html + "</table>");

        $('#'+id+"Table").hide();
        $('#'+id).css('cursor', 'pointer');

        $('#'+id).on("click", function(){
            $("#"+id+"Table").toggle();
       });
    }

    /**
     * Call createTables on setup
     */
    pub.setup = function(){
        createTables();
    };

    //Return public interface
    return pub;

}());


/**
 * Call setup on DOM ready
 */
$(document).ready(Content.setup);
