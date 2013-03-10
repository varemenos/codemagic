$(function () {
// TODO
	// full line selection : toggle@settings
	// setShowInvisibles(toggle@settings)
	// setBehavioursEnabled(true)
	// setReadOnly(true/false)

	define(function (require) {
		require(["libs/jsuri"], function(){

			/* *******************************************************
				State
			******************************************************* */

			var state = {
				panels : {
					html : {
						state : true,
						mode : $("#markupSettings").val(),
						height: 200,
						content : ""
					},
					css : {
						state : true,
						mode : $("#stylesheetSettings").val(),
						height: 200,
						content : ""
					},
					js : {
						state : true,
						height: 200,
						content : ""
					},
					console : {
						state : false,
						height: 200
					}
				},
				settings : {
					fullscreen : false,
					theme : $("#options #theme").val(),
					title : "codeMagic",
					description : "",
					author : "",
					editor : {
						tabsize : 4,
						showPrintMargin : false,
						useWrapMode : true,
						useWorker : true,
						fontSize : parseInt($("select[name=fontSize]").val(), 10),
						showInvisibles : false,
						behavioursEnabled : true
					}
				},
				user : {
					username : "",
					email : ""
				}
			};

			/* *******************************************************
				Functions
			******************************************************* */

			function resizeEditors() {
				// force-trigger a resize of the editors
				editors.html.resize();
				editors.css.resize();
				editors.js.resize();
			}

			function updateLayout() {
				resizeEditors();

				// make all the popups display below the header
				$(".popup").each(function () {
					$(this).css("top", $("header").height() + "px");
				});

				// find the maximum margin value of each .ace_gutter-layer
				var maxMargin = 0;
				$(".ace_gutter-layer").each(function(){
					if($(this).width() > maxMargin){
						maxMargin = $(this).width();
					}
				});

				// align the console and editor resizing bars with the editors
				$("#console-editor").css("margin-left", maxMargin);
				$(".editor-resizer").css("margin-left", maxMargin);

				// set the height of main equal to the height of the container (which is 100%) minus the height of the header
				$("#main").height($("#container").height() - $("header").height());
			}

			function prettify() {
				require(["libs/beautify", "libs/beautify-css", "libs/beautify-html"], function () {
					// if the selected markup type is HTML
					if ($("#markupSettings").val() === "html") {
						// then beautify the HTML value using the html beautifing library with the specified options
						editors.html.setValue(style_html(editors.html.getValue(), {
							'brace_style': 'collapse',
							'indent_size': 1,
							'indent_char': '\t',
							'unformatted': []
						}));
					}

					// if the selected stylesheet type is CSS
					if ($("#stylesheetSettings").val() === "css") {
						// then beautify the CSS value using the css beautifing library with the specified options
						editors.css.setValue(css_beautify(editors.css.getValue(), {
							'indent_size': 1,
							'indent_char': '\t'
						}));
					}

						// beautify the JavaScript value using the js beautifing library with the specified options
					editors.js.setValue(js_beautify(editors.js.getValue(), {
						'indent_size': 1,
						'indent_char': '\t',
						"preserve_newlines": false,
						"jslint_happy": true,
						"brace_style": "collapse",
						"keep_array_indentation": false,
						"keep_function_indentation": false,
						"eval_code": false,
						"unescape_strings": false,
						"break_chained_methods": false
					}));
				});
			}

			function setTheme(theme) {
				// Sets a new theme for the editor. theme should exist, and be a directory path, like ace/theme/textmate.
				editors.html.setTheme("ace/theme/" + theme);
				editors.css.setTheme("ace/theme/" + theme);
				editors.js.setTheme("ace/theme/" + theme);

				// in 500 miliseconds
				setTimeout(function () {
					var fontcolor = "#222";
					var bgcolor;

					// try find the background and font color of the ace_gutters that are enabled
					$(".ace_gutter").each(function () {
						if ($(this).css("background-color") != "undefined" && $(this).parents().eq(2).css("display") !== "none") {
							fontcolor = $(this).css("color");
							bgcolor = $(this).css("background-color");
						}
					});

					// and set their values to the below element's background and font colors so that they fit the design of the enabled editors
					$("#console-editor").css("background-color", $(".ace_scroller").css("background-color"));
					$("#console-editor").css("color", $(".ace_gutter").css("color"));
					$("#left").css("background-color", bgcolor);
					$("#left section h1").css("color", fontcolor);
					$("#left section h1 .editorFullscreen").css("color", fontcolor);
					$("#left").css("border-bottom-color", bgcolor);

					// force a layout update
					updateLayout();
				}, 500);

				// save the selected theme
				state.settings.theme = theme;
			}

			function enablePanel(panel) {
				// show the selected panel
				$("#" + panel).show();
				// and add the class "enabled" to its toggler
				$(".navigation li[data-selector=" + panel + "]").addClass("enabled");

				// save the state and the mode of the editors
				if(panel === "html"){
					state.panels.html.state = true;

					if($("#markupSettings").val() === "markdown"){
						state.panels.html.mode = "markdown";
					}
				}else if(panel === "css"){
					state.panels.css.state = true;

					if($("#stylesheetSettings").val() === "less"){
						state.panels.css.mode = "less";
					}
				}else if(panel === "js"){
					state.panels.js.state = true;
				}else if(panel === "console"){
					state.panels.console.state = true;
				}
			}

			function disablePanel(panel) {
				// hide the selected panel
				$("#" + panel).hide();
				// and remove the class "enabled" from its toggler
				$(".navigation li[data-selector=" + panel + "]").removeClass("enabled");

				// save the state and the mode of the editors
				if(panel === "html"){
					state.panels.html.state = false;
				}else if(panel === "css"){
					state.panels.css.state = false;
				}else if(panel === "js"){
					state.panels.js.state = false;
				}else if(panel === "console"){
					state.panels.console.state = false;
				}
			}

			function enableDefaultPanels() {
				// enable the default editors
				enablePanel("html");
				enablePanel("css");
				enablePanel("js");

				// save their state
				state.panels.html.state = true;
				state.panels.css.state = true;
				state.panels.js.state = true;
				state.panels.console.state = false;
			}

			function toggleFullscreen() {
				// if the page is currently in fullscreen mode
				if (state.settings.fullscreen === true) {
					// then remove the "enabled" of the element with the "fullscreen" id
					$("#fullscreen").removeClass("enabled");
					// reveal the element with the "left" id
					$("#left").show();
					// and resize the element with the "right" id to half the width of the screen
					$("#right").css("width", "50%");

					// save the state of the fullscreen mode
					state.settings.fullscreen = false;
				} else {
					// else add the "enabled" of the element with the "fullscreen" id
					$("#fullscreen").addClass("enabled");
					// hide the element with the "left" id
					$("#left").hide();
					// and resize the element with the "right" id to the whole width of the screen
					$("#right").css("width", "100%");

					// save the state of the fullscreen mode
					state.settings.fullscreen = true;
				}
			}

			function toggleEditorFullscreen(selected){
				var target = document.getElementById(selected+"-editor");

				if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
					if (target.requestFullscreen) {
						target.requestFullscreen();
					} else if (target.mozRequestFullScreen) {
						target.mozRequestFullScreen();
					} else if (target.webkitRequestFullscreen) {
						target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
					}
				} else {
					if (document.cancelFullScreen) {
						document.cancelFullScreen();
					} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					} else if (document.webkitCancelFullScreen) {
						document.webkitCancelFullScreen();
					}
				}

				updateLayout();
			}

			/* *******************************************************
				Uri parsing
			******************************************************* */

			// get the current url's parameters as an query:parameters array
			var uri = new Uri(window.location).queryPairs;

			// #TODO: consider alternative way of implementing this:
			// uri = new Uri(window.location);
			// if(uri.getQueryParamValue("view") != undefined){
			// do view checks
			// }

			// if the length of the array is 0
			if (uri.length === 0) {
				// then its the frontpage, so enable the default panels
				enableDefaultPanels();
			} else {
				// else for every array row
				for (var param = 0; param < uri.length; param++) {
					// if the selected query is "view"
					if (uri[param][0] == "view") {
						// #TODO: use views to calculate amount of panels enabled, and toggle Height classes(ie: twoHorizontal, threeVertical, etc)
						var temp = uri[param][1].split('');
						// spilt the currently selected query's parameter string into an array of characters and foreach character
						for (i = 0; i < temp.length; i++) {
							// if its h (of HTML)
							if (temp[i] == "h") {
								// then enable the HTML panel
								enablePanel("html");
							} else
							// if its m (of Markdown)
							if (temp[i] == "m") {
								// then change the selected markup's name and dropdown option to Markdown
								$("#markupSettings").val("markdown");
								$("#selectedMarkup").html("Markdown");
								// enable the HTML panel
								enablePanel("html");

								// save the editor mode as markdown
								state.panels.html.mode = "markdown";
							} else
							// if its c (of CSS)
							if (temp[i] == "c") {
								// then enable the CSS panel
								enablePanel("css");
							} else
							// if its l (of LESS)
							if (temp[i] == "l") {
								// then change the selected stylesheet's name and dropdown option to LESS
								$("#stylesheetSettings").val("less");
								$("#selectedStylesheet").html("Less");
								// enable the CSS panel
								enablePanel("css");

								// save the editor mode as less
								state.panels.css.mode = "less";
							} else
							// if its j (of JavaScript)
							if (temp[i] == "j") {
								enablePanel("js");
							} else
							// if its k (of Console)
							if (temp[i] == "k") {
								enablePanel("console");
							} else
							// if its all (HTML, CSS, JavaScript and Console)
							if (uri[param][1] == "all") {
								// then enable the default panels
								enableDefaultPanels();
								// and the console
								enablePanel("console");
							}
						}
					} else
					// if the selected query is "data"
					if (uri[param][0] == "data") {
						// TODO:
						// get enabled editors
						// AJAX load of data
						// localStorage backup of data
					} else
					// if the selected query is "code"
					if (uri[param][0] == "code") {
						if(new Uri(window.location).getQueryParamValue('state') === localStorage.getItem("random_id")){
							// store the code returned
							state.app.code = uri[param][1];

							//	$.getJSON(
							//		"https://github.com/login/oauth/access_token?callback=?",
							//		{
							//			client_id : state.app.client_id,
							//			client_secret :  state.app.client_secret,
							//			code :  state.app.code
							//		}, function (res){
							//			console.log(res);
							//		}
							//	);
						}else{
							// TODO: remove alert and add this in the notification system
							alert("There was a problem concerning your authentication request.\nPlease contact the development team!");
						}
					} else
					// if the selected query is "fullscreen"
					if (uri[param][0] == "fullscreen") {
						// TODO, think of a way to enable the editors after disabling the fullscreen mode
						toggleFullscreen();
					}
				}
			}

			/* *******************************************************
				Editors
			******************************************************* */

			// initialize editors to targeted ids
			var editors = {
				css : ace.edit("css-editor"),
				js : ace.edit("js-editor"),
				html : ace.edit("html-editor")
			};

			// If showPrintMargin is set to true, the print margin is shown in the editor.
			// WHY: hide vertical print line
			editors.html.setShowPrintMargin(state.settings.editor.showPrintMargin);
			editors.css.setShowPrintMargin(state.settings.editor.showPrintMargin);
			editors.js.setShowPrintMargin(state.settings.editor.showPrintMargin);

			// Set a new font size (in pixels) for the editor text.
			editors.html.setFontSize(state.settings.editor.fontSize);
			editors.css.setFontSize(state.settings.editor.fontSize);
			editors.js.setFontSize(state.settings.editor.fontSize);

			// If showInvisibiles is set to true, invisible characters—like spaces or new lines—are show in the editor.
			editors.html.setShowInvisibles(state.settings.editor.showInvisibles);
			editors.css.setShowInvisibles(state.settings.editor.showInvisibles);
			editors.js.setShowInvisibles(state.settings.editor.showInvisibles);

			// Specifies whether to use behaviors or not. "Behaviors" in this case is the auto-pairing of special characters, like quotation marks, parenthesis, or brackets.
			editors.html.setBehavioursEnabled(state.settings.editor.behavioursEnabled);
			editors.css.setBehavioursEnabled(state.settings.editor.behavioursEnabled);
			editors.js.setBehavioursEnabled(state.settings.editor.behavioursEnabled);

			// editor syntax highlighting modes
			editors.html.getSession().setMode("ace/mode/" + state.panels.html.mode);
			editors.css.getSession().setMode("ace/mode/" + state.panels.css.mode);
			editors.js.getSession().setMode("ace/mode/javascript");

			// Set the number of spaces that define a soft tab; for example, passing in 4 transforms the soft tabs to be equivalent to four spaces. This function also emits the changeTabSize event.
			editors.html.getSession().setTabSize(state.settings.editor.tabsize);
			editors.css.getSession().setTabSize(state.settings.editor.tabsize);
			editors.js.getSession().setTabSize(state.settings.editor.tabsize);

			// Sets whether or not line wrapping is enabled. If useWrapMode is different than the current value, the 'changeWrapMode' event is emitted.
			editors.html.getSession().setUseWrapMode(state.settings.editor.useWrapMode);
			editors.css.getSession().setUseWrapMode(state.settings.editor.useWrapMode);
			editors.js.getSession().setUseWrapMode(state.settings.editor.useWrapMode);

			// Identifies if you want to use a worker for the EditSession.
			editors.html.getSession().setUseWorker(state.settings.editor.useWorker);
			editors.css.getSession().setUseWorker(state.settings.editor.useWorker);
			editors.js.getSession().setUseWorker(state.settings.editor.useWorker);

			/* *******************************************************
				Startup
			******************************************************* */

			setTheme(state.settings.theme);

			/* *******************************************************
				Events
			******************************************************* */

			// Resizing editors{
			// resizing helper variables
			var resize = false;
			var resizeTarget = {
				height: 0,
				id: ""
			};

			// when the mouseDown event happens on the resizer element
			$(".editor-resizer").mousedown(function (e) {
				// get the current mouse location for the Y axis
				resize = e.pageY;
				// get the id of the selected editor
				resizeTarget.id = $(this).parent().prop("id");
				// get the height of the selected editor's wrapper
				resizeTarget.height = $("#" + resizeTarget.id).find(".editor-wrap").height();
			});

			// when the mouseUp event happens
			$(document).mouseup(function (e) {
				// disable the resize boolean
				resize = false;

				// if its a valid resize session
				if(typeof resizeTarget.height !== "undefined" && typeof state.panels[resizeTarget.id] !== "undefined"){
					// then get the selected id's height
					resizeTarget.height = $("#" + resizeTarget.id).height();

					// save the height in the selected panel's height variable
					state.panels[resizeTarget.id].height = resizeTarget.height;
				}

				// force a layout update
				updateLayout();
			});

			// when the mouseMove event happens
			$(document).mousemove(function (e) {
				// if a resizing session is happening
				if (resize) {
					// then assign the selected height to the selected editor wrapper
					$("#" + resizeTarget.id).find(".editor-wrap").height(resizeTarget.height + e.pageY - resize);
				}
			});
			// }

			// when the resize event happens on the window element
			$(window).resize(function () {
				// in 500 miliseconds
				setTimeout(function () {
					// force a layout update
					updateLayout();
				}, 500);
			});

			// when the click event happens on the selected-mode setting's icon, toggle its visibility
			$("#left section h1 .selectedSettingsAnchor").click(function () {
				$(this).toggleClass("enabled").next().toggle();
			});

			// when the change event happens on the #markupSettings element
			$("#markupSettings").change(function () {
				// set the markup type to the selected value
				editors.html.getSession().setMode("ace/mode/" + $("#markupSettings").val());

				// set the title of the selected markup mode
				$("#selectedMarkup").html($(this).val().charAt(0).toUpperCase() + $(this).val().slice(1));
				// hide the dropdown menu
				$(this).parent().hide();
				// and remove the markdown setting's active icon by remove the "enabled" class
				$(this).parents().eq(1).find("a").removeClass("enabled");

				// save the markup mode
				state.panels.html.mode = $("#markupSettings").val();
			});

			// when the change event happens on the #stylesheetSettings element
			$("#stylesheetSettings").change(function () {
				// set the stylesheet type to the selected value
				editors.css.getSession().setMode("ace/mode/" + $("#stylesheetSettings").val());

				// set the title of the selected stylesheet mode
				$("#selectedStylesheet").html($(this).val().charAt(0).toUpperCase() + $(this).val().slice(1));
				// hide the dropdown menu
				$(this).parent().hide();
				// and remove the stylsheet setting's active icon by remove the "enabled" class
				$(this).parents().eq(1).find("a").removeClass("enabled");

				// save the stylesheet mode
				state.panels.css.mode = $("#markupSettings").val();
			});

			// when the click event happens on the #fullscreen element
			$(".editorFullscreen").click(function () {
				// toggle the fullscreen mode
				var selected = $(this).parents().eq(1).attr("id");
				toggleEditorFullscreen(selected);
			});

			// when the change event happens on the #options element
			$("#options #theme").change(function () {
				// change the theme to the current value
				setTheme($(this).val());
			});

			// when the change event happens on the fontSize element of the options popup
			$("#options [name=fontSize]").change(function () {
				// save the selected font size value
				state.settings.editor.fontSize = parseInt($(this).val(), 10);

				// set the selected font size value to the editors
				editors.html.setFontSize(state.settings.editor.fontSize);
				editors.css.setFontSize(state.settings.editor.fontSize);
				editors.js.setFontSize(state.settings.editor.fontSize);
			});

			// when the change event happens on the pageTitle element of the options popup
			$("#options input[name=pageTitle]").change(function () {
				// change the current page's title to the selected value
				$("head title").html($(this).val() + " - codeMagic");

				// set the title to the selected value
				state.settings.title = $(this).val();
			});

			// when the click event happens on the #fullscreen element
			$("#fullscreen").click(function () {
				// toggle the fullscreen mode
				toggleFullscreen();
			});

			// when the click event happens on the #save element
			$("#save").click(function() {
				// Send state object to server
			});

			// when the click event happens on the #auth element
			$("#auth").click(function() {
				// create the authentication request link
				// state.app.auth_link = "https://github.com/login/oauth/authorize?client_id=" + state.app.client_id + "&client_secret=" + state.app.client_secret + "&state=" + state.app.random_id + "&scope=" + state.app.scope;
				// localStorage.setItem("random_id", state.app.random_id);
				// window.location = state.app.auth_link;
			});

			// when the click event happens on the #share element
			$("#share").click(function () {
				// change the value of the .twitter anchor to match the current page
				$("#social").find("a.twitter").attr("href", "http://twitter.com/home?status=" + state.settings.title + " " + window.location.href + " from @code_Magic");
				// change the value of the .facebook anchor to match the current page
				$("#social").find("a.facebook").attr("href", "http://www.facebook.com/sharer.php?u=" + window.location.href);
				// change the value of the .google-plus anchor to match the current page
				$("#social").find("a.google-plus").attr("href", "https://plus.google.com/share?url=" + window.location.href + "&title=" + state.settings.title);
				// change the value of the .linkedin anchor to match the current page
				$("#social").find("a.linkedin").attr("href", "http://www.linkedin.com/shareArticle?mini=true&url=" + window.location.href + "&title=" + state.settings.title + "&summary=" + state.settings.description + "&source=http://codeMagic.gr");
				// change the value of the .pinterest anchor to match the current page
				$("#social").find("a.pinterest").attr("href", "http://pinterest.com/pin/create/bookmarklet/?url=" + window.location.href + "&is_video=false&description=" + state.settings.title);
			});

			// when the click event happens on the #prettify element
			$("#prettify").click(function () {
				// call the prettify function
				prettify();
			});

			// when the click event happens on the #update element
			$("#update").click(function () {
				// TODO: document the iframe update

				// empty the console text
				$("#console-editor").html("");

				var content = editors.html.getValue();
				var style;

				require(['libs/marked', 'libs/less', 'libs/beautify-html', 'libs/jszip'], function (marked) {
					if ($("#markupSettings").val() === "markdown") {
						content = marked(editors.html.getValue());
					}

					if ($("#stylesheetSettings").val() === "less") {
						var parser = new(less.Parser)();

						parser.parse(editors.css.getValue(), function (e, tree) {
							if (e) {
								$("#console-editor").append("<code>> " + e.message + "</code><br>");
							}
							style = tree.toCSS();
						});
					} else {
						style = editors.css.getValue();
					}

					var script = editors.js.getValue();
					state.settings.title = $("#options input[name=pageTitle]").val();
					state.settings.description = $("#options textarea[name=pageDescription]").val();

					var cssLibraries = [];
					var jsLibraries = [];
					var externalStyle = "";
					var externalScript = "";

					$("#options #library :selected").each(function () {
						if ($(this).parent()[0].id == "CSSlibrary") {
							cssLibraries.push($(this).val());
						} else if ($(this).parent()[0].id == "JSlibrary") {
							jsLibraries.push($(this).val());
						}
					});

					for (i = 0; i < cssLibraries.length; i++) {
						externalStyle += '<link rel="stylesheet" href="' + cssLibraries[i] + '">';
					}

					for (i = 0; i < jsLibraries.length; i++) {
						externalScript += '<script src="' + jsLibraries[i] + '"></script>';
					}

					var logger = '<script>var console={};console.log=function(){var str="",count=0;for(var i=0;i<arguments.length;i++){if(typeof arguments[i]=="object"){str="Object {<br>";for(var item in arguments[i])if(arguments[i].hasOwnProperty(item)){count++;str+="&nbsp;&nbsp;&nbsp;&nbsp;"+item+" : "+arguments[i][item]+",<br>"}str=str.substring(0,str.length-5)+"<br>}";if(count===0){str="Object {}";count=0}}else str=arguments[i];parent.document.getElementById("console-editor").insertAdjacentHTML("beforeend","<code>> "+str+"</code><br>")}};</script>';
					var head = '<!doctype html><html><head><meta charset="utf-8"><title>' + state.settings.title + '</title><meta name="description" content="' + state.settings.description + '"><meta name="author" content="' + state.settings.author + '">' + externalStyle + '<style>' + style + '</style></head>';
					var body = '<body>' + content + externalScript + logger + '<script>' + script + '</script></body></html>';

					var result = head + body;


					var iframe = document.getElementById("iframe");

					// create, open, write result and close the iframe document
					iDoc = iframe.contentDocument;
					iDoc.open();
					iDoc.write(result);
					iDoc.close();

					// height fix
					$("iframe").css("height", "100%");


					// Create zip file
					var zip = new JSZip();

					// if style or script strings are empty, don't add their string in the zippedContent string
					var styleString = "";
					var scriptString = "";

					if(style !== ""){
						styleString = '<link rel="stylesheet" href="style.css">';
					}
					if(script !== ""){
						scriptString = '<script src="script.js"></script>';
					}

					// generate index.html file's string
					var zippedContent = '<!doctype html><html><head><meta charset="utf-8"><title>' + state.settings.title + '</title><meta name="description" content="'+state.settings.description+'"><meta name="author" content="' + state.settings.author + '">' + externalStyle + styleString + '</head><body>' + content + externalScript + scriptString + '</body></html>';

					// prettify ugly HTML
					zippedContent = style_html(zippedContent, {
						'brace_style': 'collapse',
						'indent_size': 1,
						'indent_char': '\t',
						'unformatted': []
					});

					// convert strings to files and add them in zip
					zip.file("index.html", zippedContent);

					// if style or script strings are empty, don't create files inside the zip
					if(style !== ""){
						zip.file("style.css", style);
					}
					if(script !== ""){
						zip.file("script.js", script);
					}

					// add zip base64 href attribute in the download button
					$("#download").find("a").attr("href", "data:application/zip;base64," + zip.generate());

					state.panels.html.content = content;
					state.panels.css.content = style;
					state.panels.js.content = script;
				});
			});

			// when the click event happens on the #download element
			$("#download").click(function () {
				// notify of the experimental state of this feature
				alert("This feature is experimental and could be buggy!\n\nCurrently, each browser treats the file downloaded differently and with some browsers you might need to a \".zip\" extension to the downloaded file.\n\nAlso note that you need to run these files in a server (or else modify the external library links to point either in http:// or https://");
			});

			// when the click event happens on the #overlay element
			$("#overlay").click(function () {
				// the overlay hides itself
				$(this).hide();
				// hides all the popups
				$(".popup").hide();

				// removes the "enabled" class from the top nav's toggler
				$(".navigation .toggler[data-selector=options]").removeClass("enabled");
				$(".navigation .toggler[data-selector=social]").removeClass("enabled");
				$(".navigation .toggler[data-selector=Information]").removeClass("enabled");
			});

			// when the click event happens on the .toggler elements
			$(".navigation .toggler").click(function () {
				// TODO: document the toggler clicking

				if ($(this).hasClass("enabled")) {
					$(this).removeClass("enabled");
					$("#" + $(this).data("selector")).hide();

					setTheme($("#options #theme").val());
				} else {
					$(this).addClass("enabled");
					$("#" + $(this).data("selector")).show();


					if($("#" + $(this).data("selector")).hasClass("popup")){
						$("#overlay").show();
					}

					setTheme($("#options #theme").val());
				}

				if ($(this).find("a").data("hint") == "Settings") {
					require(["libs/select2"], function () {
						$("[name=fontSize]").select2({
							"width": "15%"
						});

						$("#theme").select2({
							"width": "100%"
						});

						$("#library").select2({
							placeholder: "Select external Libraries",
							"width": "100%"
						});
					});
				}

				setTimeout(function () {
					updateLayout();
				}, 500);
			});

			// when the click event happens on the .closeButton element
			$(".closeButton").click(function () {
				// find the closest parent with the class or popup and hide it
				$(this).closest(".popup").hide();
				// find the toggler that has the selected popup's id as the value for its data-selector and remove its "enabled" class
				$(".navigation .toggler[data-selector=" + $(this).closest(".popup").attr("id") + "]").removeClass("enabled");
				// hide the overlay
				$("#overlay").hide();
			});
		});
	});

	// google Analytics
	var _gaq=[['_setAccount','UA-38829096-1'],['_trackPageview']];
	(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
	g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
	s.parentNode.insertBefore(g,s);}(document,'script'));
});
