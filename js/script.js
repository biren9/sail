//Biren Gil 2016
//
//Known Bugs:
//	-snap div when scrollbar is visible https://bugs.jqueryui.com/ticket/8477

EFFECT_DROP = 'drop';
EFFECT_ACCEPT = 'slide';

EFFECT_SUBMENU_SHOW = 'blind';
EFFECT_SUBMENU_HIDE = 'blind';

ERROR_CODE = new Array(13);
ERROR_CODE[1] = 'Could not display! <br />Event contains no user';
ERROR_CODE[10] = 'Could not save! <br />Boat is full';
ERROR_CODE[11] = 'Could not save! <br />Person belongs to other event';
ERROR_CODE[20] = 'Could not delete! <br />Could not delete person';
ERROR_CODE[21] = 'Could not delete! <br />Could not delete boat';
ERROR_CODE[22] = 'Could not delete! <br />Could not delete event';
ERROR_CODE[50] = 'Could not add! <br />Could not add boat';
ERROR_CODE[51] = 'Could not add! <br />Could not add boat';
ERROR_CODE[52] = 'Could not add! <br />Could not add person';
ERROR_CODE[53] = 'Could not add! <br />Request not complete';
ERROR_CODE[54] = 'Could not add! <br />Request not complete';
ERROR_CODE[100] = 'No valid csv! <br  />Format: Lastname;Firstname;Job';
ERROR_CODE[110] = 'Could not add! <br  />Could not add one or more entry';

jQuery.fn.exists = function() { // check if dom exists
    return this.length > 0;
};

$(document).ready(function() {

    var jobsData = {};

    $.getJSON("info.php", {
        get: "job"
    }, function(data) {

        $.each(data, function(key, value) {
            jobsData[value.IDJOB] = value.TITLE;
        });
        Menu(); /// START MENU
    });

    function init(event) {
        $(".modalContent").addClass('modal');

        $.getJSON('info.php', {
            get: 'init',
            event: event
        }, function(data) {

            if (data.boat.length === 0 && data.person.length === 0) displayError(1);

            //cleanup
            $("#boat").empty();
            $(".nav-content").empty();

            //begin boatlist
            $.each(data.boat, function(outKey, outValue) {
                var maxCapacity = 0;

                $("#boat").append('	<div class="card shadow-1 boat droppableSnap" id="boat-' + outKey + '" >' +
								                    	'<div class="title">' +
								                    		'<div class="primary-title">' + outValue[0].NAME + '</div>' +
								                    		'<div class="subtitle">'+
																					'<span class="person-count">0</span>'+
																						' of '+
																					'<span class="person-capacity"></span>'+
																					' berths filled'+
																				'</div>' +
								                    	'</div>' +
								                    	'<div class="personlist" data-idboat="' + outKey + '" id="boat-crew-' + outKey + '" ></div>' +
								                    '</div>'); //.append

                $.each(outValue, function(inKey, inValue) {
                    maxCapacity += parseInt(inValue["CAPACITY"]);
                    $('#boat-crew-' + outKey).append('<div class="' + inValue.TITLE.toLowerCase() + ' inset-shadow-1 group">' +
															                       		'<div class="subheader">' + inValue.TITLE +
																													' <span class="count pull-right"></span>'+
																												'</div>' +
															                        	'<div class="items">' +
															                        		'<ul class="droppable list-' + inValue.IDJOB + '" data-place="' + inValue["CAPACITY"] + '" data-idjob="' + inValue.IDJOB + '" >' +
															                        		'</ul>' +
															                        	'</div>' +
															                        '</div>');
                }); //.each

                $('#boat-' + outKey + ' .person-capacity').html(maxCapacity); // Max Capacity for every boat
            }); //.each
            //end boatlist

            //begin personlist
            $(".nav-content").append('<i class="fa fa-bars fa-2x home subtitle feedback" aria-hidden="true"></i>'+
																			'<span class="eventinfo" >'+
																				'<span>'+data.eventinfo.NAME+'</span>'+
																				'<br />'+
																				'<i class="subtitle" style="font-size: 11px;" >'+data.eventinfo.DATE+'</i>'+
																			'</span>'); //Menu Icon
            $(".home").click(Menu);
            $.each(data.person, function(key, value) {
                if (!$('#job-' + value.IDJOB).exists()) {
                    $(".nav-content").append('<div class="divider"></div>' +
											                       	'<div class="items" id="job-' + value.IDJOB + '">' +
											                        	'<div class="subheader">' + value.TITLE + ' </div>' +
											                        	'<ul class="droppable list-' + value.IDJOB + '" ></ul>' +
											                        '</div>');
                }

                var input = '<li data-idjob="' + value.IDJOB + '" data-idperson="' + value.IDPERSON + '" class="feedback member draggable job-' + value.IDJOB + '" >' + value.FIRSTNAME + ' ' + value.LASTNAME + '</li>';

                if (value.IDBOAT == null) $('.nav-content .list-' + value.IDJOB).append(input);
                else $('#boat-' + value.IDBOAT + ' .list-' + value.IDJOB).append(input);

            });
            //end personlist

            function save(action, value1, value2) {
                var value2 = value2 || null;

                if (action === "personToBoat") {
                    $.getJSON("info.php", {
                        set: 1,
                        boat: value2,
                        person: value1,
                        event: event
                    }, function(data) {
                        if (!data) displayError(data);
                    }); //.getJSON
                }
            } //function save

            function dragDrop() {

                $.each($(".boat"), function(key, value) {
                    var personCount = $(value).find(".member").length;
                    $(value).find(".person-count").html(personCount);

                    $.each($(value).find(".droppable"), function(key, value) {
                        $(this).closest(".group").find(".count").html($(this).find("li").size() + "/" + $(this).attr("data-place"));
                    });
                });
                updateSize(800); // update placeholder with animation

                $(".draggable").draggable({
                    cursor: "move",
                    appendTo: "body",
                    helper: "clone",
                    containment: "document",
                    scroll: false,
                    snap: ".droppableSnap",
                    snapMode: "inner",
                    revert: function(event, ui) {
                        return !event;
                    },

                    start: function(event, ui) {

                        //Define the same size for a helper as parent
                        var pl = parseInt($(ui.helper.context).css("paddingLeft"));
                        var pr = parseInt($(ui.helper.context).css("paddingRight"));
                        var w = parseInt($(ui.helper.context).width());
                        ui.helper.css("width", w + pl + pr + "px");
                        ui.helper.addClass('item');
                        ui.helper.addClass('shadow-1-pulse'); //light animation

                        //DragDrop BOAT & Sidebar
                        $(".boat, .nav-side-menu").droppable({
                            accept: DragDropAccept,
                            drop: DragDropDrop,
                        });
                    },
                    stop: function() {
                        $(".boat .list-" + $(this).attr("data-idjob")).droppable(); //without this line, a fatal error occurred
                        $(".boat .list-" + $(this).attr("data-idjob")).droppable("destroy"); //clean up
                        //$(".Drop-"+$(this).attr("data-idjob")).css("background", "#fff");
                    }
                });

                function DragDropAccept(event) {
                    var target = $(this).find(".list-" + event.attr('data-idjob'));
                    if (target.attr("data-place") !== undefined && parseInt(target.attr("data-place")) - target.find(".member").length <= 0) {
                        return false;
                    }

                    var res = true;
                    $.each($(this).find(".member"), function(key, value) {
                        if ($(event).attr("data-idperson") === $(value).attr("data-idperson")) res = false; // prevent to save the same action again
                    });
                    return res;
                } //function DragDropAccept

                function DragDropDrop(event, ui) { //$(this) target div
                    var idJob = $(ui.draggable).attr("data-idjob");
                    var targetUL = $(this).find(".list-" + idJob);

                    $(ui.draggable).clone().appendTo(targetUL).css({
                        top: "0px",
                        left: "0px"
                    }).effect(EFFECT_ACCEPT);
                    $(ui.draggable).effect(EFFECT_DROP, function() {
                        $(this).remove(); //delete helper to prevent errors
                        dragDrop(); // re-init-drag&drop
                    });
                    save("personToBoat", $(ui.draggable).attr("data-idperson"), ($(this).find(".list-" + idJob).closest(".personlist").attr("data-idboat") == undefined) ? null : $(this).find(".list-" + idJob).closest(".personlist").attr("data-idboat")); // add person to boat
                } // function DragDropDrop

                function updateSize(speed) {
                    speed = speed || 0;
                    $.each($(".boat").find(".droppable"), function(key, value) {
                        var count = $(this).find(".member").size();
                        if ($(this).attr("data-place") - count > 0) {
                            $(this).animate({
                                minHeight: (1 + count) * 36
                            }, speed, "easeOutElastic"); // 36<-- exact height + padding from one Element!
                        } else if ($(this).attr("data-place") - count == 0) {
                            $(this).css({
                                minHeight: (count) * 36
                            });
                        }
                    });
                } // updateSize()
            } //dragDrop()
            dragDrop(); // re-init-drag&drop
            $(".modalContent").removeClass('modal');
        }); //.getJSON
    } //function init

    function displayError(i) {

        $("body").append("<div class='confirmBox shadow-4'></div>");

        $("#overlay").addClass('overlay');

        var btn = "<div class='btnSection'>" +
            "<a href='ok'>OK</a>" +
            "</div>";

        $(".confirmBox").html("<div class='confirmBoxText'>" + ERROR_CODE[i] + "</div>" +
            btn);

        $(".btnSection a").click(function(e) {
            e.preventDefault();
            $(".confirmBox").remove();
            $("#overlay").removeClass('overlay');
            Menu();
        });

    } // function displayError

    function confirmForm(title, content, obj, event) {
        $("body").append("<div class='confirmBox shadow-4'></div>");

        $("#overlay").addClass('overlay');

        var btn = "<div class='btnSection'>" +
            				"<a href='cancel' >CANCEL</a>" +
            				"<a href='erase' >ERASE</a>" +
            			"</div>";

        $(".confirmBox").html("<div class='confirmBoxText'>" + content + "</div>" +
            btn);

        $(".btnSection a").click(function(e) {
            e.preventDefault();
            if ($(this).attr("href") === "cancel") {
                $(".confirmBox").remove();
                $("#overlay").removeClass('overlay');
            } else if ($(this).attr("href") === "erase") {
                $.getJSON("info.php", obj, function(data) {
                    $(".confirmBox").remove();
                    $("#overlay").removeClass('overlay');
                    $(".vcontent").empty();
                    if (!data) displayError(data);
                    else Menu();
                });
            }
        });
    } //function confirmForm

    function form(e, s, event) { //e=description || event= EventID
        $(".modalContent").addClass('modal');
        var content = "";
        var panel = "";

        if (s === "manage") {
            if (e === "user" || e === "boat") {
                var obj = {
                    get: (e === "user") ? "user" : "boat",
                    event: event
                };

                $.getJSON("info.php", obj, function(data) {

                    if (e === "user") {
                        panel = "<a class='addUser col-md-1 col-xs-1' href='' >"+
																	"<i class='fa fa-plus fa-2x subtitle feedback' aria-hidden='true'></i>"+
																"</a>";
                        panel += "<a class='addUserCsv col-md-1 col-xs-1' href='' >"+
																	 "<i class='fa fa-cloud-upload fa-2x subtitle feedback' aria-hidden='true'></i>"+
																 "</a>";

                        if(data.length === 0){
                           content += "USER list is empty";
                        }
                        else {
                          content += "<table class='table table-striped'>";
                          content += "<tr>"+
  																			"<th>Firstname</th>"+
  																			"<th>Lastname</th>"+
  																			"<th>Job</th>"+
  																			"<th>Delete</th>"+
  																		"</tr>";

                          $.each(data, function(key, value) {
                              content += "<tr>" +
  				                                	"<td class='editTable'>" +
  				                                		"<div id='FIRSTNAME-" + value.IDPERSON + "-" + event + "' class='edit edit-person'>" + value.FIRSTNAME + "</div>" +
  				                                	"</td>" +
  				                                	"<td class='editTable'>" +
  				                                		"<div id='LASTNAME-" + value.IDPERSON + "-" + event + "' class='edit edit-person'>" + value.LASTNAME + "</div>" +
  				                                	"</td>" +
  				                                	"<td class='editTable'>" +
  				                                		"<div id='JOB-" + value.IDJOB + "-" + event + "' class='edit edit-person-select'>" + value.TITLE + "</div>" +
  				                                	"</td>" +
  				                                	"<td class='editTable'>" +
  				                                		"<a class='delete delete-user' href='" + value.IDPERSON + "'>"+
  																							"<i class='fa fa-2x fa-trash subtitle feedback' aria-hidden='true'></i>"+
  																						"</a>" +
  				                                	"</td>" +
  				                                "</tr>";
                          });
                          content += "</table>";
                        }//else
                    } else if (e === "boat") {
                        panel = "<a class='addBoat col-md-1 col-xs-1' href='' >"+
																	"<i class='fa fa-plus fa-2x subtitle feedback' aria-hidden='true'></i>"+
																"</a>";

                        if(data.length === 0){
                           content += "BOAT list is empty";
                        }
                        else {
                          content += "<table class='table table-striped'>";
                          $.each(data, function(outkey, outvalue) {
                              $.each(outvalue, function(inkey, invalue) {
                                  if (inkey === 0) content += "<tr>" +
  												                                    	"<th id='NAME-" + invalue.IDBOAT + "-" + event + "' class='editTable edit-boat'>" + invalue.NAME + "</th>" +
  												                                    	"<th>Capacity</th>" +
  												                                    	"<th>"+
  																																"<a class='delete delete-boat' href='" + invalue.IDBOAT + "'>"+
  																																	"<i class='fa fa-2x fa-trash subtitle feedback' aria-hidden='true'></i>"+
  																																"</a>"+
  																															"</th>" +
  												                                    "</tr>";
                                  content += "<tr>" +
  				                                   		"<td>" + invalue.TITLE + "</td>" +
  				                                    	"<td>" + invalue.CAPACITY + "</td>" +
  				                                    	"<td></td>" +
  				                                   "</tr>";
                              });
                          });
                          content += "</table>";
                        }
                    }
                    openForm("Manage " + e, "", content, panel, event);
                });
            }
        } else if (s === "add") {

            if (e === "event") {
                content += '<div class="col-md-2"></div>' +
				                   '<div class="col-md-8">' +
				                   		'<form class="addForm">' +
				                    		'<input type="hidden" name="add" value="event" />' +

                                '<div class="inputGroup">'+
                                  '<input type="text" required name="name" />'+
                                  '<span class="highlight"></span>'+
                                  '<span class="bar"></span>'+
                                  '<label>Event name</label>'+
                                '</div>'+

                                '<div class="inputGroup">'+
                                  '<input type="text" required requiredtype="text" name="date" class="datepicker"/>'+
                                  '<span class="highlight"></span>'+
                                  '<span class="bar"></span>'+
                                  '<label>Date</label>'+
                                '</div>'+

				                    		'<button class="button" type="submit" name="addevent">ADD</button>' +
				                    	'</form>' +
				                    '</div>';
            } else if (e === "user") {
                content += '<div class="col-md-2"></div>' +
				                   '<div class="col-md-8">' +
				                   		'<form class="addForm">' +
				                    		'<input type="hidden" name="add" value="user"/>' +
				                    		'<input type="hidden" name="event" value="' + event + '"/>' +

                                '<div class="inputGroup">'+
                                  '<input type="text" required name="firstname" />'+
                                  '<span class="highlight"></span>'+
                                  '<span class="bar"></span>'+
                                  '<label>Firstname</label>'+
                                '</div>'+

                                '<div class="inputGroup">'+
                                  '<input type="text" required name="lastname" />'+
                                  '<span class="highlight"></span>'+
                                  '<span class="bar"></span>'+
                                  '<label>Lastname</label>'+
                                '</div>'+

                                '<div class="inputGroup">' +
				                    			'<select required class="form-control" name="job" aria-describedby="sizing-addon2" style="z-index: 0;">';

									                $.each(jobsData, function(key, value) {
									                    content += "<option value='" + key + "'>" + value + "</option>";
									                });

				               content += '</select>' +
                                  '<span class="highlight"></span>'+
                                  '<span class="bar"></span>'+
                                  '<label>Job</label>'+
				                    		'</div>' +
				                    		'<button class="button" type="submit" name="adduser">Add</button>' +
				                    	'</form>' +
				                   	'</div>';
            } else if (e === "boat") {
                content += '<div class="col-md-2"></div>' +
				                   '<div class="col-md-8">' +
				                   		'<form class="addForm">' +
				                    	  '<input type="hidden" name="add" value="boat"/>' +
				                    	  '<input type="hidden" name="event" value="' + event + '"/>' +

                                 '<div class="inputGroup">'+
                                   '<input type="text" required name="name" />'+
                                   '<span class="highlight"></span>'+
                                   '<span class="bar"></span>'+
                                   '<label>Boat name</label>'+
                                 '</div>';

									                $.each(jobsData, function(key, value) {

                                      content += '<div class="inputGroup">'+
                                                    '<input type="number" required name="job[' + key + ']" />'+
                                                    '<span class="highlight"></span>'+
                                                    '<span class="bar"></span>'+
                                                    '<label>Number of ' + value + '</label>'+
                                                  '</div>';
									                });

		                content += '<button class="button" type="submit" name="addevent">Add</button>' +
					                   '</form>' +
					                  '</div>';
            } else if (e === "CSV") {
                content += '<div class="col-md-2"></div>' +
				                    	'<div class="col-md-8">' +
				                    		'<form class="addCsvForm" >' +
				                    			'<span class="btn btn-default btn-file">' +
				                    				'Browse <input class="csvUpload button" type="file">' +
				                    			'</span>' +
				                    		'</form>' +
				                    	'</div>' +
				                    '</div>';
            }
            openForm("Add " + e, "", content, panel, event);
        } else return false;
    } //function form

    function openForm(title, header, content, panel, event) {
        $(".modalContent").removeClass('modal');

        $(".vcontent").html("<div class='contentHeader contentMargin'></div>" +
								            "<div class='contentBody contentMargin'></div>" +
								            "<div class='contentFooter contentMargin'></div>");


        $(".contentHeader").append("<h1>" + title + "</h1>");
        $(".contentBody").append(content);
        $(".contentFooter").append(panel);

        // Jquery for person
        $('.edit-person').editable('info.php?update=user', {
            id: 'id',
            name: 'value',
            indicator: '<img src="img/load.gif" width="20px" alt="Loading" />'
        });

        $(".addUser").click(function(e) {
            e.preventDefault();
            form("user", "add", event);
            //formBox.dialog("destroy");
        });

        $(".delete-user").click(function(e) {
            e.preventDefault();
            var id = $(this).attr("href");
            $(".modalContent").addClass('modal');

            $.getJSON("info.php", {
                delete: "user",
                id: id
            }, function(data) {
                $(".modalContent").removeClass('modal');
                if (data) form("user", "manage", event);
                else displayError(data);
            });
        });
        // Jquery for boat

        $('.edit-boat').editable('info.php?update=boat', {
            id: 'id',
            name: 'value',
            indicator: '<img src="img/load.gif" width="20px" alt="Loading" />'
        });

        $(".addBoat").click(function(e) {
            e.preventDefault();
            form("boat", "add", event);
        });

        $(".delete-boat").click(function(e) {
            e.preventDefault();
            var id = $(this).attr("href");

            $.getJSON("info.php", {
                delete: "boat",
                id: id
            }, function(data) {
                if (data) form("boat", "manage", event);
                else displayError(data);
            });
        });

        $('.datepicker').datepicker({
            format: "dd.mm.yyyy"
        });

        $(".addForm").submit(function(e) {
            e.preventDefault();
            $(".modalContent").addClass('modal');

            var w = $(this).serializeArray()[0].value;

            $.getJSON('info.php', $(this).serializeArray(), function(data) {
                $(".modalContent").removeClass('modal');
                if (data) {
                    if (w === "event") Menu();
                    else form(w, "manage", event);
                } else displayError(data);
            });
        });

        $(".addUserCsv").click(function(e) {
            e.preventDefault();
            //formBox.dialog("destroy");
            form("CSV", "add", event);
        });

        $(".csvUpload").change(function(e) {
            var val = $(this).val();
            if (val === "") return false;
            var file = e.target.files[0];

            Papa.parse(file, {
                complete: function(results) {
                    //Define CSV structure
                    if (results.data[0][0] !== "Lastname" || results.data[0][1] !== "Firstname" || results.data[0][2] !== "Job") {
                        displayError(100);
                    } else {

                        $(".csvUpload").parent().css("display", "none");
                        $(".addCsvForm").append("<table class='table table-striped csvTable'>" +
											                            "<tr>" +
											                            	"<th>Firstname</th>" +
											                            	"<th>Lastname</th>" +
											                            	"<th>Job</th>" +
											                            	"<th>Delete</th>" +
											                            "</tr>" +
											                           "</table>");
                        $.each(results.data, function(key, value) {
                            if (key === 0) return true;
                            $(".csvTable").append("<tr class='csvData' >"+
																										"<td class='csvLastname' >" + value[0] + "</td>"+
																										"<td class='csvFirstname' >" + value[1] + "</td>"+
																										"<td class='csvJob' >" + value[2] + "</td>"+
																										"<td>"+
																											"<a class='deleteCsv'>"+
																												"<i class='fa fa-trash fa-2x' aria-hidden='true'></i>"+
																											"</a>"+
																										"<td>"+
																									"</tr>");
                        });
                        $(".addCsvForm").append('<button class="button" type="submit" name="addCsvUserSubmit">Save</button>');

                        $(".deleteCsv").click(function(e) {
                            e.preventDefault();
                            $(this).closest("tr").remove();
                        });

                        $(".addCsvForm").submit(function(e) {
                            e.preventDefault();
                            var obj = {};
                            $.each($(this).find(".csvData"), function(key, value) {
                                obj[key] = {
                                    Lastname: $(this).find(".csvLastname").html(),
                                    Firstname: $(this).find(".csvFirstname").html(),
                                    Job: $(this).find(".csvJob").html()
                                };
                            });

                            obj["add"] = "user";
                            obj["event"] = event;
                            $.getJSON("csv.php", obj, function(data) {
                                if (data) {
                                    //formBox.dialog("destroy");
                                    form("user", "manage", event);
                                } else displayError(data);
                            });
                        });
                    } //else
                } //function complete
            }); //Papa parse
        });
    } //function openForm

    function Menu(e) {
        //$("#boat").empty();

        //$(".modalContent").addClass('modal'); //Loading screen
        $(".nav-content").empty();
        $(".vcontent").empty(); //html("<div class='screensaver'></div>")

        $.getJSON("info.php", {
            get: "event"
        }, function(data) {

            var eventList = "<ul class='Top'>";

            var boxMenu = $("<div title='Menü'>Event<br /></div>");
            $.each(data, function(key, value) {

                //var hasContent = (value.OBJECT > 0)?"":"disabled";
                eventList += "<li role='presentation'>" +
					                    	"<a class='openSubMenu ulFeedback' href='" + value.IDEVENT + "' >" +
					                    		"<i class='fa fa-caret-right' aria-hidden='true'></i> " + value.NAME + " " + value.DATE +
					                    	"</a>" +
					                    "</li>" +
					                    "<ul class='SubMenu Sub-" + value.IDEVENT + "' >" +
					                    	"<li>"+
																	"<a class='feedback selectEvent' href='" + value.IDEVENT + "'>Show event</a>"+
																"</li>" +
						                    "<li>"+
																	"<a class='feedback manageUser' href='" + value.IDEVENT + "' >User list</a>"+
																"</li>" +
						                    "<li>"+
																	"<a class='feedback manageBoat' href='" + value.IDEVENT + "' >Boat list</a>"+
																"</li>" +
						                    "<li>"+
																	"<a class='feedback report' href='" + value.IDEVENT + "' >Report</a>"+
																"</li>" +
						                    "<li>"+
																	"<a class='feedback deleteEvent' href='" + value.IDEVENT + "' >Delete</a>"+
																"</li>" +
						                    "</ul>";
            }); //.each

            eventList += "</ul>";
            eventList += "<div class='divider'></div>" +
                				 "<a class='addEvent' href='' >"+
												 	 "<i class='fa fa-plus fa-2x addEventButton subtitle feedback' aria-hidden='true'></i>"+
												 "</a>";

            $(".nav-content").html(eventList);

            $(".openSubMenu").click(function(e) {
                e.preventDefault();
                var sub = $(".Sub-" + $(this).attr("href"));
                if (!sub.is(':visible')) {
                    sub.toggle(EFFECT_SUBMENU_SHOW);
                    $(this).children('i').removeClass('fa-caret-right').addClass('fa-caret-down');
                    //
                } else {
                    sub.toggle(EFFECT_SUBMENU_HIDE);
                    $(this).children('i').removeClass('fa-caret-down').addClass('fa-caret-right');
                    //
                }

            });


            $(".selectEvent").click(function(e) {
                e.preventDefault();
                init(parseInt($(this).attr("href")));
            });

            $(".manageUser").click(function(e) {
                e.preventDefault();
                var event = $(this).attr("href");
                form("user", "manage", event);
            });

            $(".manageBoat").click(function(e) {
                e.preventDefault();
                var event = $(this).attr("href");
                form("boat", "manage", event);
            });

            $(".deleteEvent").click(function(e) {
                e.preventDefault();
                var event = $(this).attr("href");
                confirmForm("Delete event", "Are you sure you want to delete?", {
                    delete: "event",
                    id: event
                }, event);
            });

            $(".addEvent").click(function(e) {
                e.preventDefault();
                var event = $(this).attr("href");
                form("event", "add", event);
            });

            $(".report").click(function(e) {
                e.preventDefault();
                var url = 'report.php?event=' + $(this).attr("href");
                window.open(url, '_blank');
            });

            //$(".disabled").closest("a").off('click').attr("href", "#");
        });
    } // function Menu
});
