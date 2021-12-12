/*
    NAME: Karm Binning
    DATE: Aug.13, 2014
*/



/*
    EXERCISE 01
    PURPOSE: 
*/

$(document).ready(function () {
    /*
    HtmlPage1.html page
        EXERCISE 03
        PURPOSE: Datetime format (January 10, 2014); filter date search 
            (only has to put part of array string)
    */
    var btn1 = document.getElementById("btn1");
    var txt1 = document.getElementById("txt1");
    var lbl1 = document.getElementById("lbl1");
    var aryMonth = ["January", 'February', "March",
            "April", "May", "June", "July", "August",
            "September", "October", "November",
            "December"];
    var aryQry = ['January 11, 2014', 'February 20, 2013'];

    var d = new Date();
    $(btn1).click(function() {
        lbl1.innerHTML = aryMonth[d.getMonth() - 1] + " " +
            d.getDate() + ", " + d.getFullYear();

        var str = '';
        for (var i = 0; i < aryQry.length; i++) {
            if (aryQry[i].indexOf(txt1.value) > -1)
                str += aryQry[i] + '\n';
        }
        alert(str);
    })
});

