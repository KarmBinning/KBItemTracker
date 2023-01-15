/*
NAME: Karamdip Binning
DATE CREATED: October 19th, 2013
PURPOSE: To add Item to Local Storage by using WebSQL
*/

//although this is added to html page, maybe use it for this js
//Purpose: Use calendar control for add item page
function calendarDates() {

    //use calendar control for AddItem
    $("#datepicker").datepicker();
    $("#datepicker1").datepicker();
    $("#datepicker2").datepicker();
    $("#datepicker3").datepicker();

    //make calendar controls text null so placeholders are seen
    document.getElementById("datepicker").value = "";
    document.getElementById("datepicker1").value = "";
}

function displayAbout() {
    try {
        var appname;
        var appversion;
        var appauthor;

        $.get("config.xml", function (data) {
            alert("APP NAME: " +
                $(data).find('widget').attr('name') +
                " " + $(data).find('widget').attr('version'));
            alert("APP AUTHOR: " +
                $(data).find('widget').attr('author'));
        });
    } catch (e) {
        alert(e);
    }
}

$(document).ready(function () {

    //this method allows use of calendars
    calendarDates();

    $("#btnAboutUs").click(function () {
        //gets config.xml information and sets in labels on html
        displayAbout();
    });

    //user clicks on [!] image and it will redirect them to the notification page
    $(".not").each(
        function () {
            $(this).click(function () {
                $.mobile.changePage('#notification', { transition: 'slide' });
            })
        }
    );
});     // end ready