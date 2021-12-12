/*
NAME: Karamdip Binning
DATE CREATED: October 19th, 2013
PURPOSE: To add Item to Local Storage by using WebSQL.
PURPOSE: Notification; notify user of item's that are currently due.
*/

var sqlQuery = "";
var IsCompleted;
var strHtml = '';
var status = '';
var statusNot = null;
var statusDisplay = null;

//this method displays error
function errorHandler(transaction, error) {
    alert("SQL ERROR: " + error.message.toString());
}

//opens the database, if not existing then creates new
var dbAddItem = openDatabase
    ('dbItem', '1.0', 'Item Database', 100 * 1024);

//create Item database table
function createItemTable() {
    dbAddItem.transaction(function (transaction) {

        var strCreateTable = "CREATE TABLE IF NOT EXISTS item " +
            "(ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " +
            "transaction_type VARCHAR NOT NULL, " +
            "item_type VARCHAR NOT NULL, " +
            "item_name VARCHAR NOT NULL, " +
            "transaction_date DATE NOT NULL, " +
            "due_date DATE NOT NULL, " +
            "borrowerLender VARCHAR NOT NULL, " +
            "is_completed INTEGER, " + 
            "awareNot INTEGER);";
        
        sqlQuery = strCreateTable;
        transaction.executeSql(sqlQuery, [], null, errorHandler);
    }, errorHandler);
}

function setDefaultValues() {

    var localName = window.localStorage.getItem('localName');
    frmAddItem.txtName.value = '';
    if (localName != null) {
        frmAddItem.txtName.value = localName;
    }

    frmAddItem.ddlTransactionType.value = '';
    frmAddItem.ddlItemType.value = '';
    frmAddItem.datepicker.value = '';
    frmAddItem.datepicker1.value = '';
    frmAddItem.txtPersonPlace.value = '';
    frmAddItem.chkIsCompleted.value = '';

    var date = new Date();
    frmAddItem.datepicker.value = date.getMonth() + 1 + "/" +
        date.getDate() + "/" + date.getFullYear();
    frmAddItem.datepicker1.value = date.getMonth() + 1 + "/" +
        date.getDate() + "/" + date.getFullYear();
}

//show display when successful adding of item to DB
function showAddItem() {
    alert("You have just added a new item.");
    setDefaultValues();
}

var currentId;

function getCurrentId(clickedId) {
    currentId = clickedId;
}

function clearNotifications(clickedId) {
    currentId = clickedId;
    var strUpdateQry = "UPDATE item "
            + "SET awareNot = " + 1 + " "
            + "WHERE ID = " + currentId + ";";

    dbAddItem.transaction(function (transaction) {
        transaction.executeSql(
                strUpdateQry, [],
                checkNotifications(),
                errorHandler);
    });
}

//takes all new notifications and shows them in notification page
function displayNotifications(results) {
    var thisRow = null;
    var strHtml = '';

    if (results.rows.length != 0) {

        if (statusNot != null) {

            for (var i = 0; i < results.rows.length; i++) {
                thisRow = results.rows.item(i);

                var itemId = thisRow["ID"];
                var itemName = thisRow["item_name"];
                var dueDate = thisRow["due_date"];
                var personPlace = thisRow["borrowerLender"];

                strHtml += '<fieldset data-role="controlgroup" data-type="horizontal"'
                + 'style="float: left;">'
                + '<button id="' + itemId + '" data-theme="e" '
                + 'style="text-align: left; background-color: salmon; '
                + 'font-family: Arial;" onclick="clearNotifications(this.id);" '
                + 'data-rel="dialog" data-inline="false"'
                + ' data-transition="slide">' + '<h1 style="text-align: center;"><b>' + itemName
                + '</b></h1>'
                + '<b>PERSON/PLACE: ' + '</b>' + personPlace + '<br />'
                + '<b>DUE DATE: ' + '</b>' + dueDate + '<br />'
                + '</p></button></fieldset>';

                $("#lstNot").append(strHtml);
            }
        }
        else {
                $(".notification img").each(
                    function () {
                        $(this).attr("src", "images/notificationNew.jpg");
                    }
                );
        }

        $("#lblNot").css("color", "green");
        $("#lblNot").text("Click on a button to clear a notification.");

        statusNot = null;
    }
    else {
        $("#lblNot").css("color", "red");
        $("#lblNot").text("There are no notifications at this moment.");

        $(".notification img").each(
            function () {
                $(this).attr("src", "images/notificationNone.jpg");
            }
        );
    }

    $("#lstNot").empty();
    $("#lstNot").append(strHtml);
    $("#lstNot").listview('refresh');
}

//sees if there are anything due today or past dates
function checkNotifications() {

    var currentDate = new Date();
    var month = currentDate.getUTCMonth() + 1;
    var day = currentDate.getUTCDate();
    var year = currentDate.getUTCFullYear();
    var newDate = month + "/" + day + "/" + year;
    currentDate = newDate;

    var strSelectQry = "SELECT * FROM item " +
        "WHERE is_completed = 0 AND due_date <= '" + currentDate + "' AND " +
        "awareNot = 0";
    dbAddItem.transaction(function (transaction) {
        transaction.executeSql(strSelectQry,
			[],
            function (transaction, results) { displayNotifications(results); },
            errorHandler);
    });
}

function displayAllItems(results) {

    var strHtml = '';
    var thisRow = null;

    if (results.rows.length == 0) {
        strHtml += '<h3>No Items</h3>';
        statusDisplay = null;
    }
    else {

        for (var i = 0; i < results.rows.length; i++) {
            thisRow = results.rows.item(i);
            statusDisplay = "y";

            var complete = '';
            if (thisRow['is_completed'] == 0) {
                complete = "No";
            }
            else {
                complete = "Yes";
            }

            strHtml += '<fieldset data-role="controlgroup" data-type="horizontal"'
            + 'style="float: left;">'
            + '<button id="' + thisRow['ID'] + '" data-theme="e" '
            + 'style="text-align: left; background-color: gold; '
            + 'font-family: Century Gothic;" onclick="getCurrentId(this.id);" '
            + 'data-rel="dialog" data-inline="false"'
            + ' data-transition="slide">' + '<h1 style="text-align: center;"><b>'
            + thisRow['item_name'] + '</b></h1>'
            + '<p><b>' + 'I AM ' + '</b>' + thisRow['transaction_type'] + '<br />'
            + '<b>PERSON/PLACE: ' + '</b>' + thisRow['borrowerLender'] + '<br />'
            + '<b>ITEM TYPE: ' + '</b>' + thisRow['item_type'] + '<br />'
            + '<b>TRANSACTION DATE: ' + '</b>' + thisRow['transaction_date'] + '<br />'
            + '<b>DUE DATE: ' + '</b>' + thisRow['due_date'] + '<br />'
            + '<b>IS COMPLETED?: ' + '</b>' + complete + '<br />'
            + '</p></button></fieldset>';

            $("#lstAll").append(strHtml);
        }
    }

    $("#lstAll").empty();
    $("#lstAll").append(strHtml);
    $("#lstAll").listview('refresh');
}

var itemName = '';

function selectItem(ID) {
    var strSelectQry = "SELECT * FROM item WHERE ID = " + ID + ";";
    var statusFunc = '';

    if (status == "delete") {
        statusFunc = deleteItem;
    }
    if (status == "update") {
        statusFunc = updateItem;
    }
    if (status == "setUpdate") {
        statusFunc = setupUpdatePage;
    }   

    dbAddItem.transaction(function (transaction) {
        transaction.executeSql(strSelectQry,
				[],
                function (transaction, itemName) { statusFunc(itemName) },
                errorHandler);
    });
    var thisRow = null;
}

function onDeleteItemPass() {
    alert("Item successfully deleted!");
    sessionStorage.setItem('id', null);
    document.location.href = "#viewItem";
    location.reload();

    status = '';
}

function deleteItem(itemName) {

    currentId = sessionStorage.getItem('id');

    var nameRow = itemName.rows.item(0);
    var strConfirm = "Delete " + nameRow['item_name'] + " (ID: " + currentId + ")?";
    var decision = confirm(strConfirm);

    if (decision == true) {
        if (currentId != null) {
            strDeleteQry = "DELETE FROM item WHERE ID = " + currentId + ";";
            dbAddItem.transaction(function (transaction) {
                transaction.executeSql(
                    strDeleteQry, [],
                    function () {
                        onDeleteItemPass();
                    }, errorHandler);
            });
        }
    }
}

function setupUpdatePage(itemName) {
    var nameRow = itemName.rows.item(0);
    
    var transaction_type = nameRow['transaction_type'];
    var item_type = nameRow['item_type'];
    var item_name = nameRow['item_name'];
    var borrowerLender = nameRow['borrowerLender'];
    var transaction_date = nameRow['transaction_date'];
    var due_date = nameRow['due_date'];
    var is_completed = nameRow['is_completed'];

    $("#txtBLU").val(borrowerLender);
    $("#txtItemNameU").val(item_name);
    $("#datepicker2").val(transaction_date);
    $("#datepicker3").val(due_date);
    $('#ddlTTUpdate').val(transaction_type);
    $('#ddlITUpdate').val(item_type);
    
    if (is_completed == 1) {
        $('#chkIsCompletedU').prop('checked', true);
    }
    if (is_completed == 0) {
        $('#chkIsCompletedU').prop('checked', false);
    }
    $('#chkIsCompletedU').change();
    $('#ddlTTUpdate').change();
    $('#ddlITUpdate').change();

    status = '';
}

function onUpdatePass() {
    alert("This Item Row has been updated!");

    // refresh an element on any page to refresh the new values
    $("#lstAll").listview('refresh');

    // refresh the list
    displayAll();
    $.mobile.changePage('#viewItem', { transition: 'slide' });
}

function updateItem(TransactionType, ItemType, Name, TransactionDate, DueDate,
    PersonPlace, IsCompleted) {
    currentId = sessionStorage.getItem('id');
    var strConfirm = "Update " + Name + " (ID: " + currentId + ")?";
    var decision = confirm(strConfirm);

    if (decision == true) {

        var strUpdateQry = "UPDATE item SET item_name = '" + Name + "', "
            + "transaction_type = '" + TransactionType + "', "
            + "borrowerLender = '" + PersonPlace + "', "
            + "item_type = '" + ItemType + "', "
            + "transaction_date = '" + TransactionDate + "', "
            + "due_date = '" + DueDate + "', "
            + "is_completed = " + IsCompleted + " "
            + "WHERE ID = " + currentId + ";";

        dbAddItem.transaction(function (transaction) {
            transaction.executeSql(
                strUpdateQry, [],
                onUpdatePass(),
                errorHandler);
        });
    }
    else {
    	document.location.href = "#viewItem";
        location.reload();
    }
}

function displayAll() {
    var strExtraQry = "";

    if ($("#ddlfTransaction").val() != "0") {
        strExtraQry = "WHERE transaction_type = '" + $("#ddlfTransaction").val() + "' ";
    }
    if ($("#ddlfItemType").val() != "0") {
        if (strExtraQry != "") {
            strExtraQry += "AND item_type = '" + $("#ddlfItemType").val() + "' ";
        }
        else {
            strExtraQry = "WHERE item_type = '" + $("#ddlfItemType").val() + "' ";
        }
    }
    if ($("#ddlfIsCompleted").val() != "0") {
        var isCompleted = null;
        if ($("#ddlfIsCompleted").val() == "No") {
            isCompleted = 0;
        }
        else {
            isCompleted = 1;
        }

        if (strExtraQry != "") {
            strExtraQry += "AND is_completed = " + isCompleted + " ";
        }
        else {
            strExtraQry = "WHERE is_completed = " + isCompleted + " ";
        }
    }
    if ($("#txtfItemName").val().trim().toLowerCase() != "") {
        if (strExtraQry != "") {
            strExtraQry += "AND item_name LIKE '%" + $("#txtfItemName").val().toLowerCase() + "%' ";
        }
        else {
            strExtraQry = "WHERE item_name LIKE '%" + $("#txtfItemName").val().toLowerCase() + "%' ";
        }
    }

    var strSelectQry = "SELECT * " + 
        "FROM item " + strExtraQry +
        "ORDER BY ID DESC";
    dbAddItem.transaction(function (transaction) {
        transaction.executeSql(strSelectQry,
            [], function (transaction, results) {
                displayAllItems(results)
            }, errorHandler);
    });
}

function displayOptions() {
    document.location.href = "#dialog";
}

//although this is added to html page, maybe use it for this js
//Purpose: Calculate the days between date of transaction and
// due date.
function calculateAddItemDates() {
    jQuery.validator.addMethod("greaterThan",
        function (value, element, params) {

            if (!/Invalid|NaN/.test(new Date(value))) {
                return new Date(value) > new Date($(params).val());
            }

            return (Number(value) > Number($(params).val())
                || isNaN(value) && isNaN($(params).val()));
        }, 'Due Date must be after {0}.');

    var d1 = $('#datepicker').datepicker('getDate');
    var d2 = $('#datepicker1').datepicker('getDate');
    var d3 = $('#datepicker2').datepicker('getDate');
    var d4 = $('#datepicker3').datepicker('getDate');

    var diff = 0;
    var diff1 = 0;

    var years;
    var months;
    var days;

    if (d1 && d2 && status != 'update') {
        diff = Math.floor
            ((d2.getTime() - d1.getTime()) / 86400000);
    }
    if (d3 && d4) {
        diff1 = Math.floor
            ((d4.getTime() - d3.getTime()) / 86400000);
    }

    var today = new Date();
    if (status != 'update') {

        var diffToday = Math.floor
            ((d2.getTime() - today.getTime()) / 86400000) + 1;
        var diffToday1 = Math.floor
            ((today.getTime() - d2.getTime()) / 86400000);
    }
    else {
        var diffToday2 = Math.floor
            ((d4.getTime() - today.getTime()) / 86400000) + 1;
        var diffToday3 = Math.floor
            ((today.getTime() - d4.getTime()) / 86400000);
    }

    if (d1 && d2 && status != "update") {
        if (diff >= 0) {

            if ($('#frmAddItem').valid()) {

                if (d2 > today) {
                    alert("Approximate Due Date is " + diff +
                    " days from the Transaction Date and " + 
                    diffToday + " days from today.");
                }
                else {
                    alert("Approximate Due Date was " + diff +
                    " days from the Transaction Date and " + 
                    diffToday1 + " days past due date.");
                }
            }
        }
    }
    if (d3 && d4) {
        if (diff1 >= 0) {

            if ($('#frmUpdate').valid()) {

                if (d4 > today) {
                    alert("Approximate Due Date is " + 
                    diffToday + " days from today.");
                }
                else {
                    alert("Approximate Due Date was " + 
                    diffToday3 + " days past due date.");
                }
            }
        }
    }
}

//creates new row in Item table
function createItem(TransactionType, ItemType, Name,
    TransactionDate, DueDate, PersonPlace, IsCompleted, awareNot, callback) {

    try {

    var strInsertItem = "INSERT INTO item " +
        "(transaction_type, item_type, item_name, " +
        "transaction_date, due_date, borrowerLender, is_completed, awareNot) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    sqlQuery = strInsertItem;

    dbAddItem.transaction(function (transaction) {
        transaction.executeSql(
			sqlQuery,
			[TransactionType, ItemType,
            Name, TransactionDate,
            DueDate, PersonPlace,
            IsCompleted,
            awareNot],
            showAddItem(),
			errorHandler);
    });
    } catch (e) {
        alert(e);
    }
}

createItemTable();

//when page is loaded
$(document).ready(function () {

    checkNotifications();

    setDefaultValues();

    //when user clicks on Add Item Button
    $("#btnSubmitItem").click(function () {

        //validation rules
        $('#frmAddItem').validate({
            rules: {
                //txtSubject: required, range >=2 AND <= 25
                txtName: {
                    required: true,
                    rangelength: [2, 30]
                },
                ddlTransactionType: {
                    required: true
                },
                ddlItemType: {
                    required: true
                },
                txtPersonPlace: {
                    required: true,
                    rangelength: [2, 30]
                },
                datepicker: {
                    required: true
                },
                datepicker1: {
                    greaterThan: "#datepicker"
                }
            }, // end of rules

            messages: {
                txtName: {
                    required: "Please enter the Item's Name.",
                    rangelength: "Your Item's Name must be " +
                            "between 2 and 30 characters in length."
                },
                txtPersonPlace: {
                    required: "Please enter the Lender or " +
                            "Borrower's name.",
                    rangelength: "The Lender/Borrower's Name " +
                            "must be between 2 and 30 characters in " +
                            "length."
                },
                datepicker1: {
                    greaterThan: "Due Date must be AFTER " +
                                "Transaction Date."
                }
            } // end of messages					
        }); // end form validate

        //this method calculates the 2 dates in days
        calculateAddItemDates();

        //if passes all validation rules
        if ($('#frmAddItem').valid()) {

            var TransactionType = frmAddItem.ddlTransactionType.value;
            var ItemType = frmAddItem.ddlItemType.value;
            var Name = frmAddItem.txtName.value.toLowerCase();
            var TransactionDate = frmAddItem.datepicker.value;
            var DueDate = frmAddItem.datepicker1.value;
            var PersonPlace = frmAddItem.txtPersonPlace.value;
            IsCompleted;
            var awareNot = 0;

            if ($('#chkIsCompleted').is(":checked")) {
                IsCompleted = 1;
            }
            else {
                IsCompleted = 0;
            }

            createItem(TransactionType, ItemType, Name,
                TransactionDate, DueDate, PersonPlace,
                IsCompleted, awareNot);
        }

    }); // end btnSubmit click

    $("#btnDisplay").click(function () {
        try {
            displayAll();
        } catch (e) {
            alert(e);
        }
    });

    $("#lstAll").click(function () {
        try {
            if (statusDisplay != null) {
                sessionStorage.setItem('id', currentId);
                displayOptions();
            }
        } catch (e) {
            alert(e);
        }
    });

    $("#btnDelete").click(function () {
        try {
            selectItem(currentId);
            status = "delete";
        } catch (e) {
            alert(e);
        }
    });

    $("#btnNot").click(function () {
        statusNot = 'clicked';
        checkNotifications();
    });

    $("#liUpdate").click(function () {
        try {
            status = "setUpdate";
            selectItem(currentId)
        } catch (e) {
            alert(e);
        }
    });

    $("#btnUpdate").click(function () {
        try {
            $('#frmUpdate').validate({
                rules: {
                    //txtSubject: required, range >=2 AND <= 25
                    txtItemNameU: {
                        required: true,
                        rangelength: [2, 30]
                    },
                    ddlTTUpdate: {
                        required: true
                    },
                    ddlITUpdate: {
                        required: true
                    },
                    txtBLU: {
                        required: true,
                        rangelength: [2, 30]
                    },
                    datepicker2: {
                        required: true
                    },
                    datepicker3: {
                        greaterThan: "#datepicker2"
                    }
                }, // end of rules

                messages: {
                    txtItemNameU: {
                        required: "Please enter the Item's Name.",
                        rangelength: "Your Item's Name must be " +
                                "between 2 and 30 characters in length."
                    },
                    txtBLU: {
                        required: "Please enter the Lender or " +
                                "Borrower's name.",
                        rangelength: "The Lender/Borrower's Name " +
                                "must be between 2 and 30 characters in " +
                                "length."
                    },
                    datepicker3: {
                        greaterThan: "Due Date must be AFTER " +
                                    "Transaction Date."
                    }
                } // end of messages					
            }); // end form validate

            //if passes all validation rules
            status = 'update';
          //this method calculates the 2 dates in days
            calculateAddItemDates();

            if ($('#frmUpdate').valid()) {

                var TransactionType = $('#ddlTTUpdate').val();
                var ItemType = $('#ddlITUpdate').val();
                var Name = $("#txtItemNameU").val().toLowerCase();
                var TransactionDate = $("#datepicker2").val();
                var DueDate = $("#datepicker3").val();
                var PersonPlace = $("#txtBLU").val();

                if ($('#chkIsCompletedU').is(":checked")) {
                    IsCompleted = 1;
                }
                else {
                    IsCompleted = 0;
                }
                updateItem(TransactionType, ItemType, Name, TransactionDate, DueDate,
                    PersonPlace, IsCompleted);
            }
        } catch (e) {
            alert(e);
        }
    })
});