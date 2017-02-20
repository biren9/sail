//Biren Gil 2016
//
//Known Bugs:
//	-snap div when scrollbar is visible https://bugs.jqueryui.com/ticket/8477

EFFECT_DROP = 'drop';
EFFECT_ACCEPT = 'slide';
ERROR_CODE = new Array(13);
	ERROR_CODE[1] = 'Event is empty';
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

	$.getJSON("info.php", {get: "job"}, function(data) {

		$.each(data, function(key, value) {
			jobsData[value.IDJOB] = value.TITLE;
		});
		Menu(); /// START MENU
	});

	function init(event) {
	    $.getJSON('info.php', {get: 'init', event: event}, function(data) {

	    	if(data.boat.length === 0 && data.person.length === 0) displayError(1);

	    	//cleanup
	    	$("#boat").html("");
	    	$(".nav-content").html("");


	    	//begin boatlist
	    	$.each(data.boat, function(outKey, outValue) {
	    		var maxCapacity = 0;

					$("#boat").append('	<div class="card shadow-1 boat droppableSnap" id="boat-'+outKey+'" >'+
																'<div class="title">'+
									                '<div class="primary-title">'+outValue[0].NAME+'</div>'+
									                '<div class="subtitle"><span class="person-count">0</span> of <span class="person-capacity"></span> berths filled</div>'+
									            	'</div>'+
																'<div class="personlist" data-idboat="'+outKey+'" id="boat-crew-'+outKey+'" ></div>'+
															'</div>');//.append

		    		$.each(outValue, function(inKey, inValue) {
		    			maxCapacity += parseInt(inValue["CAPACITY"]);
		    			$('#boat-crew-'+outKey).append('<div class="'+inValue.TITLE.toLowerCase()+' inset-shadow-1 group">'+
																              	'<div class="subheader">'+inValue.TITLE+' <span class="count pull-right"></span></div>'+
																                '<div class="items">'+
																                  '<ul class="droppable list-'+inValue.IDJOB+'" data-place="'+inValue["CAPACITY"]+'" data-idjob="'+inValue.IDJOB+'" >'+
																                  '</ul>'+
																                '</div>'+
																            	'</div>');
		    		});//.each

						$('#boat-'+outKey+' .person-capacity').html(maxCapacity); // Max Capacity for every boat
	    	});//.each
	    	//end boatlist

	    	//begin personlist
	    	$(".nav-content").append('<i class="fa fa-bars fa-2x home subtitle" aria-hidden="true"></i>'); //Menu Icon
	    	$(".home").click(Menu);
	    	$.each(data.person, function(key, value) {
	    		if(!$('#job-'+value.IDJOB).exists()) {
		    		$(".nav-content").append('<div class="divider"></div>'+
																			'<div class="items" id="job-'+value.IDJOB+'">'+
																				'<div class="subheader">'+value.TITLE+' </div>'+
																				'<ul class="droppable list-'+value.IDJOB+'" ></ul>'+
																			'</div>');
	    		}

	    		var input = '<li data-idjob="'+value.IDJOB +'" data-idperson="'+value.IDPERSON+'" class="member draggable job-'+value.IDJOB +'" >'+value.FIRSTNAME+' '+value.LASTNAME+'</li>';
	    		if(value.IDBOAT == null) $('.nav-content .list-'+value.IDJOB).append(input);
	    		else $('#boat-'+value.IDBOAT+' .list-'+value.IDJOB).append(input);

	    	});
	    	//end personlist

	    	function save(action, value1, value2) {
	    		var value2 = value2 || null;

	    		if(action === "personToBoat") {
	    			//$("#loading").show();
	    			$.getJSON("info.php", {set: 1, boat: value2, person: value1, event: event}, function(data) {
	    				//$("#loading").hide();
	    				if(data !== 0) displayError(data);
	    			});//.getJSON
	    		}
	    	}//function save

	    	function dragDrop() {

	    		$.each($(".boat"), function(key, value) {
	    			var personCount = $(value).find(".member").length;
	    			$(value).find(".person-count").html(personCount);

	    			$.each($(value).find(".droppable"), function(key, value) {
							$(this).closest(".group").find(".count").html($(this).find("li").size()+"/"+$(this).attr("data-place"));
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
		        		$(".boat .list-"+$(this).attr("data-idjob")).droppable();  //without this line, a fatal error occurred
		        		$(".boat .list-"+$(this).attr("data-idjob")).droppable("destroy"); //clean up
		        		//$(".Drop-"+$(this).attr("data-idjob")).css("background", "#fff");
		        	}
			    });

					function DragDropAccept(event) {
						var target = $(this).find(".list-"+event.attr('data-idjob'));
						if(target.attr("data-place") !== undefined && parseInt(target.attr("data-place")) - target.find(".member").length <= 0) {
							return false;
						}

						var res = true;
						$.each( $(this).find(".member"), function(key, value) {
							if($(event).attr("data-idperson") === $(value).attr("data-idperson")) res = false; // prevent to save the same action again
						});
						return res;
			    }//function DragDropAccept

					function DragDropDrop(event, ui) { //$(this) target div
						var idJob = $(ui.draggable).attr("data-idjob");
						var targetUL = $(this).find(".list-"+idJob);

						$(ui.draggable).clone().appendTo(targetUL).css({top: "0px", left: "0px"}).effect(EFFECT_ACCEPT);
						$(ui.draggable).effect(EFFECT_DROP, function() {
							$(this).remove();//delete helper to prevent errors
							dragDrop(); // re-init-drag&drop
						});
						save("personToBoat", $(ui.draggable).attr("data-idperson"), ($(this).find(".list-"+idJob).closest(".personlist").attr("data-idboat") == undefined)?null:$(this).find(".list-"+idJob).closest(".personlist").attr("data-idboat")); // add person to boat
					} // function DragDropDrop

					function updateSize(speed) {
						speed = speed || 0;
						$.each($(".boat").find(".droppable"), function(key, value) {
							var count = $(this).find(".member").size();
							if( $(this).attr("data-place") - count > 0) {
								$(this).animate({minHeight: (1+count)*36}, speed, "easeOutElastic"); // 36<-- exact height + padding from one Element!
							}
							else if($(this).attr("data-place") - count == 0) {
								$(this).css({minHeight: (count)*36});
							}
		    		});
					}// updateSize()
		    }//dragDrop()
		    dragDrop(); // re-init-drag&drop
	    });//.getJSON
	}//function init

	function displayError(i) {
		if(ERROR_CODE[i] === undefined) return;
		$("<div title='ERROR: "+i+"'>ERROR: <br />"+ERROR_CODE[i]+" </div>").dialog({
		    modal: true,
		    buttons: {
		        Ok: function () {
		            $(this).dialog("close");
		            Menu();
		        }
		    }
		});
	}// function displayError

	function confirmForm(title, content, obj, event) {
		var formBox = $('<div style="padding: 10px; max-width: 500px; word-wrap: break-word;">' + content + '</div>').dialog({
			draggable: false,
			modal: true,
			resizable: false,
			width: 'auto',
			title: title || 'Confirm',
			minHeight: 75,
			buttons: {
	    		Yes: function () {
	    			$.getJSON("info.php", obj, function(data) {
	    				formBox.dialog('destroy');
	    				if(data !== 0) displayError(data);
							else Menu();
	    			});
				},
				Cancel: function () {
					formBox.dialog('destroy');
					Menu();
				}
			},
			close: Menu
		});
	}//function confirmForm

	function form(e, s, event) {  //e=description || event= EventID
		var content = "";
		var panel = "";

		if(s === "manage") {
			if(e === "user" || e === "boat") {
				var obj = {get: (e === "user")?"user":"boat", event: event};

				$.getJSON("info.php", obj, function(data) {

					if(e === "user") {
						panel = "<a class='addUser col-md-1 col-xs-1' href='' ><i class='fa fa-plus fa-2x' aria-hidden='true'></i></a>";
						panel += "<a class='addUserCsv col-md-1 col-xs-1' href='' ><i class='fa fa-cloud-upload fa-2x' aria-hidden='true'></i></a>";
						content += "<table class='table table-striped'>";
						content += "<tr><th>Firstname</th><th>Lastname</th><th>Job</th><th>Delete</th></tr>";
						$.each(data, function(key, value) {
							content += "<tr>"+
											"<td class='editTable'>"+
												"<div id='FIRSTNAME-"+value.IDPERSON+"-"+event+"' class='edit edit-person'>"+value.FIRSTNAME+"</div>"+
											"</td>"+
											"<td class='editTable'>"+
												"<div id='LASTNAME-"+value.IDPERSON+"-"+event+"' class='edit edit-person'>"+value.LASTNAME+"</div>"+
											"</td>"+
											"</td>"+
											"<td class='editTable'>"+
												"<div id='JOB-"+value.IDJOB+"-"+event+"' class='edit edit-person-select'>"+value.TITLE+"</div>"+
											"</td>"+
											"<td class='editTable'>"+
												"<a class='delete delete-user' href='"+value.IDPERSON+"'><i class='fa fa-2x fa-trash' aria-hidden='true'></i></a>"+
											"</td>"+
										"</tr>";
						});
						content += "</table>";
					}
					else if(e === "boat") {
						panel = "<a class='addBoat col-md-1 col-xs-1' href='' ><i class='fa fa-plus fa-2x' aria-hidden='true'></i></a>";
						content += "<table class='table table-striped'>";
						$.each(data, function(outkey, outvalue) {
							$.each(outvalue, function(inkey, invalue) {
								if(inkey === 0) content += "<tr>"+
																"<th id='NAME-"+invalue.IDBOAT+"-"+event+"' class='editTable edit-boat'>" + invalue.NAME + "</th>"+
																"<th>Capacity</th>"+
																"<th><a class='delete delete-boat' href='"+invalue.IDBOAT+"'><i class='fa fa-2x fa-trash' aria-hidden='true'></i></a></th>"+
															"</tr>";
								content += "<tr>"+
												"<td>"+invalue.TITLE + "</td>"+
												"<td>" + invalue.CAPACITY + "</td>"+
												"<td></td>"+
											"</tr>";
							});
						});
						content += "</table>";
					}
					openForm("Manage "+e, "", content, panel, event);
				});
			}
		}

		else if(s === "add") {

			if(e === "event") {
				content += 	'<div class="col-md-2"></div>'+
							'<div class="col-md-8">'+
								'<form class="addForm">'+
									'<input type="hidden" name="add" value="event"/>'+
									'<div class="input-group">'+
										'<span class="input-group-addon" id="sizing-addon2"></span>'+
										'<input required type="text" class="form-control" name="name" placeholder="Title" aria-describedby="sizing-addon2">'+
									'</div>'+
									'<div class="input-group">'+
										'<span class="input-group-addon" id="sizing-addon2"></span>'+
										'<input  requiredtype="text" class="form-control datepicker" name="date" placeholder="Date" aria-describedby="sizing-addon2">'+
									'</div>'+
									'<button class="btn btn-lg btn-primary btn-block" type="submit" name="addevent">Add</button>'+
								'</form>'+
							'</div>';
			}
			else if(e === "user") {
				content += 	'<div class="col-md-2"></div>'+
							'<div class="col-md-8">'+
								'<form class="addForm">'+
									'<input type="hidden" name="add" value="user"/>'+
									'<input type="hidden" name="event" value="'+event+'"/>'+
									'<div class="input-group">'+
										'<span class="input-group-addon" id="sizing-addon2"></span>'+
										'<input required type="text" class="form-control" name="firstname" placeholder="Firstname" aria-describedby="sizing-addon2">'+
									'</div>'+
									'<div class="input-group">'+
										'<span class="input-group-addon" id="sizing-addon2"></span>'+
										'<input required type="text" class="form-control" name="lastname" placeholder="Lastname" aria-describedby="sizing-addon2">'+
									'</div>'+
									'<div class="input-group">'+
										'<span class="input-group-addon" id="sizing-addon2"></span>'+
										'<select required class="form-control" name="job" placeholder="File" aria-describedby="sizing-addon2">';

										$.each(jobsData, function(key, value) {
											content += "<option value='"+key+"'>"+value+"</option>";
										});

				content +=				'</select>'+
									'</div>'+
									'<button class="btn btn-lg btn-primary btn-block" type="submit" name="adduser">Add</button>'+
								'</form>'+
							'</div>';
			}
			else if(e === "boat") {
				content += 	'<div class="col-md-2"></div>'+
							'<div class="col-md-8">'+
								'<form class="addForm">'+
									'<input type="hidden" name="add" value="boat"/>'+
									'<input type="hidden" name="event" value="'+event+'"/>'+
									'<div class="input-group">'+
										'<span class="input-group-addon" id="sizing-addon2"></span>'+
										'<input type="text" required class="form-control" name="name" placeholder="Name" aria-describedby="sizing-addon2">'+
									'</div>';

									$.each(jobsData, function(key, value) {
											content += '<div class="input-group">'+
															'<span class="input-group-addon" id="sizing-addon2">'+value+'</span>'+
															'<select class="form-control" name="job['+key+']" aria-describedby="sizing-addon2">';

															for(i=0; i <= 20; ++i) { content += "<option value='"+i+"'>"+i+"</option>"; }

											content +=		'</select>'+
														'</div>';
									});

				content +=			'<button class="btn btn-lg btn-primary btn-block" type="submit" name="addevent">Add</button>'+
								'</form>'+
							'</div>';
			}
			else if(e === "csv") {
				content += '<div class="col-md-2"></div>'+
								'<div class="col-md-8">'+
									'<form class="addCsvForm" >'+
										'<span class="btn btn-default btn-file">'+
	    									'Browse <input class="csvUpload" type="file">'+
										'</span>'+
									'</form>'+
								'</div>'+
							'</div>';
			}
			openForm("Add "+e, "", content, panel, event);
		}
		else return false;
	}//function form

	function openForm(title, header, content, panel, event) {
		var formBox = $("<div id='formDialog' title='"+title+"'><h4>"+header+"</h4><br /></div>");
		formBox.dialog({
			width: 800,
				height: 500,
				resizable: false,
				position: { at: "center top", of: window },
				closeOnEscape: false,
				buttons: [
						    {
						      text: "close",
						      click: function() {
						        $(this).dialog("close");
						      }
						    }
						  ],
				close: function(){
			    	$(".modal").css("display", "none");
			    	$(this).dialog("destroy");
			    	Menu();
			   }
		}).append(content);

		$(".ui-dialog-buttonpane").append(panel);
		$(".ui-dialog-titlebar-close").hide();

		// Jquery for person
		$('.edit-person').editable('info.php?update=user', {
	         id : 'id',
	         name : 'value',
	         indicator : '<img src="img/load.gif" width="20px" alt="Loading" />'
	  });

	  $(".addUser").click(function(e) {
			e.preventDefault();
			form("user", "add", event);
			formBox.dialog("destroy");
		});

		$(".delete-user").click(function(e) {
			e.preventDefault();
			var id = $(this).attr("href");
			formBox.dialog("destroy");
			$.getJSON("info.php", {delete: "user", id: id}, function(data) {
				if(data) form("user", "manage" , event);
				else displayError(data);
			});
		});
		// Jquery for boat

		$('.edit-boat').editable('info.php?update=boat', {
	         id : 'id',
	         name : 'value',
	         indicator : '<img src="img/load.gif" width="20px" alt="Loading" />'
	  });

	  $(".addBoat").click(function(e) {
			e.preventDefault();
			form("boat", "add", event);
			formBox.dialog("destroy");
		});

		$(".delete-boat").click(function(e) {
			e.preventDefault();
			var id = $(this).attr("href");
			formBox.dialog("destroy");

			$.getJSON("info.php", {delete: "boat", id: id}, function(data) {
				if(data) form("boat", "manage", event);
				else displayError(data);
			});
		});

		$('.datepicker').datepicker({format: "dd.mm.yyyy"});

		$(".addForm").submit(function(e) {
			e.preventDefault();
			formBox.dialog("destroy");
			var w = $(this).serializeArray()[0].value;
			$.getJSON('info.php', $(this).serializeArray(), function(data) {
				if(data) {
					if(w === "event") Menu();
					else form(w, "manage", event);
				}
				else displayError(data);
			});
		});

		$(".addUserCsv").click(function(e) {
			e.preventDefault();
			formBox.dialog("destroy");
			form("csv", "add", event);
		});

		$(".csvUpload").change(function(e) {
			var val = $(this).val();
			if(val === "") return false;
			var file = e.target.files[0];

			Papa.parse(file, {
				complete: function(results) {
					//Define CSV structure
					if(results.data[0][0] !== "Lastname" || results.data[0][1] !== "Firstname" || results.data[0][2] !== "Job") {
						displayError(100);
					}
					else {

						$(".csvUpload").parent().css("display", "none");
						$(".addCsvForm").append("<table class='table table-striped csvTable'>"+
																			"<tr>"+
																				"<th>Firstname</th>"+
																				"<th>Lastname</th>"+
																				"<th>Job</th>"+
																				"<th>Delete</th>"+
																			"</tr>"+
																		"</table>");
						$.each(results.data, function(key, value) { if(key === 0 ) return true;
							$(".csvTable").append("<tr class='csvData' ><td class='csvLastname' >"+value[0]+"</td><td class='csvFirstname' >"+value[1]+"</td><td class='csvJob' >"+value[2]+"</td><td><a class='deleteCsv'><i class='fa fa-trash fa-2x' aria-hidden='true'></i></a><td></tr>");
						});
						$(".addCsvForm").append('<button class="btn btn-lg btn-primary btn-block" type="submit" name="addCsvUserSubmit">Save</button>');

						$(".deleteCsv").click(function(e) {
							e.preventDefault();
							$(this).closest("tr").remove();
						});

						$(".addCsvForm").submit(function(e) {
							e.preventDefault();
							var obj = {};
							$.each($(this).find(".csvData"), function(key, value) {
								obj[key] = {Lastname: $(this).find(".csvLastname").html(), Firstname: $(this).find(".csvFirstname").html(), Job: $(this).find(".csvJob").html()};
							});

							obj["add"] = "user";
							obj["event"] = event;
							$.getJSON("csv.php", obj, function(data) {
								if(data) {
									formBox.dialog("destroy");
									form("user", "manage", event);
								}
								else displayError(data);
							});
						});
					}//else
				}//function complete
			});//Papa parse
		});
	}//function openForm

	function Menu(e) {
	//$("#boat").html("");
	//$(".nav-content").html("");

	$(".modal").css("display", "block");
		$.getJSON("info.php", {get: "event"}, function(data) {
			var eventList = "<ul class='selectMenu nav nav-pills nav-stacked'>";
			var boxMenu = $("<div title='Menü'>Event<br /></div>");
			$.each(data, function(key, value) {
				var hasContent = (value.OBJECT > 0)?"":"disabled";
				eventList += "<li role='presentation'>"+
												"<a class='selectEvent col-md-8 col-xs-8 "+hasContent+"' href='"+value.IDEVENT+"'>"+value.NAME+" "+value.DATE+"</a>"+
											 	"<a class='manageUser col-md-1 col-xs-1' href='"+value.IDEVENT+"' ><i class='fa fa-users fa-2x' aria-hidden='true'></i></a>"+
											 	"<a class='manageBoat col-md-1 col-xs-1' href='"+value.IDEVENT+"' ><i class='fa fa-ship fa-2x' aria-hidden='true'></i></a>"+
											 	"<a class='report col-md-1 col-xs-1 "+hasContent+"' href='"+value.IDEVENT+"' ><i class='fa fa-file-text-o fa-2x' aria-hidden='true'></i></a>"+
											 	"<a class='deleteEvent col-md-1 col-xs-1' href='"+value.IDEVENT+"' ><i class='fa fa-trash fa-2x' aria-hidden='true'></i></a>"+
											"</li>";
			});//.each
			eventList += "</ul><a class='addEvent col-md-1 col-xs-1' href='' ><i class='fa fa-plus fa-2x' aria-hidden='true'></i></a>";

			boxMenu.dialog({
				width: 800,
				height: 500,
				resizable: false,
				position: { at: "center top", of: window },
				closeOnEscape: false,
				close: function() {
			     $(".modal").css("display", "none");
			   }
			}).append(eventList);
			//if( typeof e === "undefined")
			$(".ui-dialog-titlebar-close").hide();

			$(".selectEvent").click( function(e) {
				e.preventDefault();
				init(parseInt($(this).attr("href")));
				boxMenu.dialog("close");
			});
			$(".manageUser").click( function(e) {
				e.preventDefault();
				var event = $(this).attr("href");
				boxMenu.dialog("close");
				$(".modal").css("display", "block");
				form("user", "manage", event);
			});
			$(".manageBoat").click( function(e) {
				e.preventDefault();
				var event = $(this).attr("href");
				boxMenu.dialog("close");
				$(".modal").css("display", "block");
				form("boat", "manage", event);
			});
			$(".deleteEvent").click( function(e) {
				e.preventDefault();
				var event = $(this).attr("href");
				boxMenu.dialog("close");
				$(".modal").css("display", "block");
				confirmForm("Delete event", "Are you sure you want to delete?", {delete: "event", id: event}, event);
			});
			$(".addEvent").click( function(e) {
				e.preventDefault();
				boxMenu.dialog("close");
				var event = $(this).attr("href");
				$(".modal").css("display", "block");
				form("event", "add", event);
			});
			$(".report").click(function(e) {
				e.preventDefault();
				var url = 'report.php?event='+$(this).attr("href");
				window.open(url, '_blank');
			});

			$(".disabled").closest("a").off('click').attr("href", "#");
		});
	} // function Menu
});
