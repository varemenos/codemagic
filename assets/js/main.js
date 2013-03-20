$(function () {
	define(function (require) {
		/* *******************************************************
			Session
		******************************************************* */

		var appSession = {
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
				title : "codeMagic",
				description : "",
				author : "",
				editor : {
					theme : "",
					tabSize : parseInt(localStorage.getItem("appSession_settings_editor_tabSize"), 10) || 4,
					showPrintMargin : localStorage.getItem("appSession_settings_editor_showPrintMargin") || false,
					useWrapMode : localStorage.getItem("appSession_settings_editor_useWrapMode") || true,
					useWorker : true,
					fontSize : parseInt(localStorage.getItem("appSession_settings_editor_fontSize"), 10) || parseInt($("select[name=fontSize]").val(), 10),
					showInvisibles : localStorage.getItem("appSession_settings_editor_showInvisibles") || false,
					behavioursEnabled : localStorage.getItem("appSession_settings_editor_behavioursEnabled") || true
				}
			},
			user : {
				username : "",
				email : ""
			}
		};

		console.log(appSession);

		/* *******************************************************
			Functions
		******************************************************* */

		function isTrue(x){
			return x === "true";
		}

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
			$("#console .editor-wrap").css("margin-left", maxMargin);
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

					// move the cursor to the first line
					editors.html.selection.moveCursorFileStart();
				}

				// if the selected stylesheet type is CSS
				if ($("#stylesheetSettings").val() === "css") {
					// then beautify the CSS value using the css beautifing library with the specified options
					editors.css.setValue(css_beautify(editors.css.getValue(), {
						'indent_size': 1,
						'indent_char': '\t'
					}));

					// move the cursor to the first line
					editors.css.selection.moveCursorFileStart();
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

				// move the cursor to the first line
				editors.js.selection.moveCursorFileStart();
			});
		}

		function setTheme(theme) {
			// if the currently used theme is not the selected theme
			if(appSession.settings.editor.theme !== theme){
				// then set the selected theme as the new theme for the editor.
				editors.html.setTheme("ace/theme/" + theme);
				editors.css.setTheme("ace/theme/" + theme);
				editors.js.setTheme("ace/theme/" + theme);

				// save the selected theme
				appSession.settings.editor.theme = theme;

				localStorage.setItem("appSession_settings_editor_theme", theme);
			}
		}

		function themedLayout(isDark){
			var fontcolor;
			var bgcolor;

			// try find the background and font color of the ace_gutters that are enabled
			$(".ace_gutter").each(function () {
				// if the currently selected element's background color is not undefined and its 2nd parent is not hidden
				if ($(this).css("background-color") != "undefined" && $(this).parents().eq(2).css("display") !== "none") {
					// then grab the color from the selected element
					bgcolor = $(this).css("background-color");
				}
			});

			// if the currently selected theme is a Dark themes
			if(isDark){
				// else set the font color to bright grey
				fontcolor = "#ccc";
			}else{
				// then set the font color to dark grey
				fontcolor = "#222";
			}

			// and set their values to the below element's background and font colors so that they fit the design of the enabled editors
			$("#left").css({
				"background-color" : bgcolor,
				"border-bottom-color" : bgcolor
			});
			$("#left section h1").css("color", fontcolor);
			$("#left section h1 .editorFullscreen").css("color", fontcolor);
			$("#console-editor").css({
				"background-color": $(".ace_scroller").css("background-color"),
				"color" : fontcolor
			});

			// force a layout update
			updateLayout();
		}

		function enablePanel(panel) {
			// show the selected panel
			$("#" + panel).show();
			// and add the class "enabled" to its toggler
			$(".navigation li[data-selector=" + panel + "]").addClass("enabled");

			// save the state and the mode of the editors
			if(panel === "html"){
				appSession.panels.html.state = true;

				if($("#markupSettings").val() === "markdown"){
					appSession.panels.html.mode = "markdown";
				}
			}else if(panel === "css"){
				appSession.panels.css.state = true;

				if($("#stylesheetSettings").val() === "less"){
					appSession.panels.css.mode = "less";
				}
			}else if(panel === "js"){
				appSession.panels.js.state = true;
			}else if(panel === "console"){
				appSession.panels.console.state = true;
			}
		}

		function disablePanel(panel) {
			// hide the selected panel
			$("#" + panel).hide();
			// and remove the class "enabled" from its toggler
			$(".navigation li[data-selector=" + panel + "]").removeClass("enabled");

			// save the state and the mode of the editors
			if(panel === "html"){
				appSession.panels.html.state = false;
			}else if(panel === "css"){
				appSession.panels.css.state = false;
			}else if(panel === "js"){
				appSession.panels.js.state = false;
			}else if(panel === "console"){
				appSession.panels.console.state = false;
			}
		}

		function enableDefaultPanels() {
			// enable the default editors
			enablePanel("html");
			enablePanel("css");
			enablePanel("js");

			// save their state
			appSession.panels.html.state = true;
			appSession.panels.css.state = true;
			appSession.panels.js.state = true;
			appSession.panels.console.state = false;
		}

		function toggleFullscreen() {
			// if the page is currently in fullscreen mode
			if (appSession.settings.fullscreen === true) {
				// then remove the "enabled" of the element with the "fullscreen" id
				$("#fullscreen").removeClass("enabled");
				// reveal the element with the "left" id
				$("#left").show();
				// and resize the element with the "right" id to half the width of the screen
				$("#right").css("width", "50%");

				// save the state of the fullscreen mode
				appSession.settings.fullscreen = false;
			} else {
				// else add the "enabled" of the element with the "fullscreen" id
				$("#fullscreen").addClass("enabled");
				// hide the element with the "left" id
				$("#left").hide();
				// and resize the element with the "right" id to the whole width of the screen
				$("#right").css("width", "100%");

				// save the state of the fullscreen mode
				appSession.settings.fullscreen = true;
			}
		}

		function toggleEditorFullscreen(selected){
			// get the selected editor
			var target = document.getElementById(selected+"-editor");

			// if the fullscreen feature is supported
			if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
				// then if the target has the W3C implementation
				if (target.requestFullscreen) {
					// then do a fullscreen
					target.requestFullscreen();
				} else
				// else  if the target has the MOZ implementation
				if (target.mozRequestFullScreen) {
					// then do a MOZ fullscreen
					target.mozRequestFullScreen();
				} else
				// else  if the target has the WEBKIT implementation
				if (target.webkitRequestFullscreen) {
					// then do a WEBKIT fullscreen
					// and also use ALLOW_KEYBOARD_INPUT parameter to prevent the browser from blocking keyboard input
					target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				}
			}
			else {
				// else if the target has the W3C implementation
				if (document.cancelFullScreen) {
					// then do a cancel fullscreen
					document.cancelFullScreen();
				}
				// else  if the target has the MOZ implementation
				else if (document.mozCancelFullScreen) {
					// then do a MOZ cancel fullscreen
					document.mozCancelFullScreen();
				}
				// else  if the target has the WEBKIT implementation
				else if (document.webkitCancelFullScreen) {
					// then do a WEBKIT fullscreen
					document.webkitCancelFullScreen();
				}
			}

			// force a layout update
			updateLayout();
		}

		/* *******************************************************
			Uri parsing
		******************************************************* */

		var loc = {
			search : {
				string : window.location.search,
				params : window.location.search.substring(1).split("&")
			},
			hash : {
				string: location.hash.substring(1),
				params : {}
			},
			regex : /([^&=]+)=([^&]*)/g,
			m : false
		};

		while (!! (loc.m = loc.regex.exec(loc.hash.string))) {
			loc.hash.params[decodeURIComponent(loc.m[1])] = decodeURIComponent(loc.m[2]);
		}

		while (!! (loc.m = loc.regex.exec(loc.search.string))) {
			loc.search.params[decodeURIComponent(loc.m[1])] = decodeURIComponent(loc.m[2]);
		}

		// if the query string is empty
		if (loc.search.string === "") {
			// then its the frontpage, so enable the default panels
			enableDefaultPanels();
		} else {
			// else for every parameter of the query
			for (var i = 0; i < params.length; i++) {
				var param = params[i].split("=");
				// if the selected parameter is "view"
				if (param[0] == "view") {
					// #TODO: use views to calculate amount of panels enabled, and toggle Height classes(ie: twoHorizontal, threeVertical, etc)
					var temp = param[1].split('');
					// spilt the currently selected query's parameter string into an array of characters and foreach character
					for (j = 0; j < temp.length; j++) {
						// if its h (of HTML)
						if (temp[j] == "h") {
							// then enable the HTML panel
							enablePanel("html");
						} else
						// if its m (of Markdown)
						if (temp[j] == "m") {
							// then change the selected markup's name and dropdown option to Markdown
							$("#markupSettings").val("markdown");
							$("#selectedMarkup").html("Markdown");
							// enable the HTML panel
							enablePanel("html");

							// save the editor mode as markdown
							appSession.panels.html.mode = "markdown";
						} else
						// if its c (of CSS)
						if (temp[j] == "c") {
							// then enable the CSS panel
							enablePanel("css");
						} else
						// if its l (of LESS)
						if (temp[j] == "l") {
							// then change the selected stylesheet's name and dropdown option to LESS
							$("#stylesheetSettings").val("less");
							$("#selectedStylesheet").html("Less");
							// enable the CSS panel
							enablePanel("css");

							// save the editor mode as less
							appSession.panels.css.mode = "less";
						} else
						// if its j (of JavaScript)
						if (temp[j] == "j") {
							enablePanel("js");
						} else
						// if its k (of Console)
						if (temp[j] == "k") {
							enablePanel("console");
						} else
						// if its all (HTML, CSS, JavaScript and Console)
						if (param[1] == "all") {
							// then enable the default panels
							enableDefaultPanels();
							// and the console
							enablePanel("console");
						}
					}
				} else
				// if the selected parameter is "data"
				if (param[0] == "data") {
					// TODO:
					// get enabled editors
					// AJAX load of data
					// localStorage backup of data
				} else
				// if the selected parameter is "fullscreen"
				if (param[0] == "fullscreen") {
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
			html : ace.edit("html-editor"),
			css : ace.edit("css-editor"),
			js : ace.edit("js-editor")
		};

		// editor syntax highlighting modes
		editors.html.getSession().setMode("ace/mode/" + appSession.panels.html.mode);
		editors.css.getSession().setMode("ace/mode/" + appSession.panels.css.mode);
		editors.js.getSession().setMode("ace/mode/javascript");

		// If showPrintMargin is set to true, the print margin is shown in the editor.
		// WHY: hide vertical print line
		editors.html.setShowPrintMargin(isTrue(appSession.settings.editor.showPrintMargin));
		editors.css.setShowPrintMargin(isTrue(appSession.settings.editor.showPrintMargin));
		editors.js.setShowPrintMargin(isTrue(appSession.settings.editor.showPrintMargin));

		// Pass true to enable the use of soft tabs. Soft tabs means you're using spaces instead of the tab character ('\t').
		editors.html.getSession().setUseSoftTabs(false);
		editors.css.getSession().setUseSoftTabs(false);
		editors.js.getSession().setUseSoftTabs(false);

		// Set a new font size (in pixels) for the editor text.
		editors.html.setFontSize(appSession.settings.editor.fontSize);
		editors.css.setFontSize(appSession.settings.editor.fontSize);
		editors.js.setFontSize(appSession.settings.editor.fontSize);

		// If showInvisibiles is set to true, invisible characters—like spaces or new lines—are show in the editor.
		editors.html.setShowInvisibles(isTrue(appSession.settings.editor.showInvisibles));
		editors.css.setShowInvisibles(isTrue(appSession.settings.editor.showInvisibles));
		editors.js.setShowInvisibles(isTrue(appSession.settings.editor.showInvisibles));

		// Specifies whether to use behaviors or not. "Behaviors" in this case is the auto-pairing of special characters,
		// like quotation marks, parenthesis, or brackets.
		editors.html.setBehavioursEnabled(isTrue(appSession.settings.editor.behavioursEnabled));
		editors.css.setBehavioursEnabled(isTrue(appSession.settings.editor.behavioursEnabled));
		editors.js.setBehavioursEnabled(isTrue(appSession.settings.editor.behavioursEnabled));

		// Set the number of spaces that define a soft tab; for example, passing in 4 transforms the soft tabs to be equivalent to four spaces.
		// This function also emits the changeTabSize event.
		editors.html.getSession().setTabSize(appSession.settings.editor.tabsize);
		editors.css.getSession().setTabSize(appSession.settings.editor.tabsize);
		editors.js.getSession().setTabSize(appSession.settings.editor.tabsize);

		// Sets whether or not line wrapping is enabled. If useWrapMode is different than the current value, the 'changeWrapMode' event is emitted.
		editors.html.getSession().setUseWrapMode(isTrue(appSession.settings.editor.useWrapMode));
		editors.css.getSession().setUseWrapMode(isTrue(appSession.settings.editor.useWrapMode));
		editors.js.getSession().setUseWrapMode(isTrue(appSession.settings.editor.useWrapMode));

		// Identifies if you want to use a worker for the EditSession.
		editors.html.getSession().setUseWorker(appSession.settings.editor.useWorker);
		editors.css.getSession().setUseWorker(appSession.settings.editor.useWorker);
		editors.js.getSession().setUseWorker(appSession.settings.editor.useWorker);

		// On startup, disable the line highlighting feature (which will be enabled later via an event)
		editors.html.setHighlightActiveLine(false);
		editors.css.setHighlightActiveLine(false);
		editors.js.setHighlightActiveLine(false);

		// set the Default theme
		setTheme(localStorage.getItem("appSession_settings_editor_theme") || $("#options #theme").val());

		/* *******************************************************
			Startup
		******************************************************* */

		/* *******************************************************
			Events
		******************************************************* */

		// when the themeLoaded event happens on the editors
		editors.html.renderer.addEventListener("themeLoaded" , function(e) {
			setTimeout(function(){
				// theme/repaint the rest of the layout
				themedLayout(e.theme.isDark);
			}, 250);
		});
		editors.css.renderer.addEventListener("themeLoaded" , function(e) {
			setTimeout(function(){
				// theme/repaint the rest of the layout
				themedLayout(e.theme.isDark);
			}, 250);
		});
		editors.js.renderer.addEventListener("themeLoaded" , function(e) {
			setTimeout(function(){
				// theme/repaint the rest of the layout
				themedLayout(e.theme.isDark);
			}, 250);
		});

		// when the focus event happens on the editors, enable the line highlighting feature
		editors.html.on("focus", function(){
			editors.html.setHighlightActiveLine(true);
		});
		editors.css.on("focus", function(){
			editors.css.setHighlightActiveLine(true);
		});
		editors.js.on("focus", function(){
			editors.js.setHighlightActiveLine(true);
		});

		// when the blur event happens on the editors, disable the line highlighting feature
		editors.html.on("blur", function(){
			editors.html.setHighlightActiveLine(false);
		});
		editors.css.on("blur", function(){
			editors.css.setHighlightActiveLine(false);
		});
		editors.js.on("blur", function(){
			editors.js.setHighlightActiveLine(false);
		});

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
			if(typeof resizeTarget.height !== "undefined" && typeof appSession.panels[resizeTarget.id] !== "undefined"){
				// then get the selected id's height
				resizeTarget.height = $("#" + resizeTarget.id).height();

				// save the height in the selected panel's height variable
				appSession.panels[resizeTarget.id].height = resizeTarget.height;
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
			appSession.panels.html.mode = $("#markupSettings").val();
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
			appSession.panels.css.mode = $("#markupSettings").val();
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

			localStorage.setItem("appSession_settings_editor_theme", $(this).val());
		});

		// when the change event happens on the fontSize element of the options popup
		$("#options [name=fontSize]").change(function () {
			// save the selected value
			appSession.settings.editor.fontSize = parseInt($(this).val(), 10);

			// set the selected value to the editors
			editors.html.setFontSize(appSession.settings.editor.fontSize);
			editors.css.setFontSize(appSession.settings.editor.fontSize);
			editors.js.setFontSize(appSession.settings.editor.fontSize);

			localStorage.setItem("appSession_settings_editor_fontSize", appSession.settings.editor.fontSize);
		});

		// when the change event happens on the tabSize element of the options popup
		$("#options [name=tabSize]").change(function () {
			// save the selected value
			appSession.settings.editor.tabSize = parseInt($(this).val(), 10);

			// set the selected value to the editors
			editors.html.getSession().setTabSize(appSession.settings.editor.tabSize);
			editors.css.getSession().setTabSize(appSession.settings.editor.tabSize);
			editors.js.getSession().setTabSize(appSession.settings.editor.tabSize);

			localStorage.setItem("appSession_settings_editor_tabSize", appSession.settings.editor.tabSize);
		});

		// when the change event happens on the showPrintMargin element of the options popup
		$("#options [name=showPrintMargin]").change(function () {
			// save the selected value
			appSession.settings.editor.showPrintMargin = $(this).prop("checked");

			// set the selected value to the editors
			editors.html.setShowPrintMargin(appSession.settings.editor.showPrintMargin);
			editors.css.setShowPrintMargin(appSession.settings.editor.showPrintMargin);
			editors.js.setShowPrintMargin(appSession.settings.editor.showPrintMargin);

			localStorage.setItem("appSession_settings_editor_showPrintMargin", appSession.settings.editor.showPrintMargin);
		});

		// when the change event happens on the useWrapMode element of the options popup
		$("#options [name=useWrapMode]").change(function () {
			// save the selected value
			appSession.settings.editor.useWrapMode = $(this).prop("checked");

			// set the selected value to the editors
			editors.html.getSession().setUseWrapMode(appSession.settings.editor.useWrapMode);
			editors.css.getSession().setUseWrapMode(appSession.settings.editor.useWrapMode);
			editors.js.getSession().setUseWrapMode(appSession.settings.editor.useWrapMode);

			localStorage.setItem("appSession_settings_editor_useWrapMode", appSession.settings.editor.useWrapMode);
		});

		// when the change event happens on the showInvisibles element of the options popup
		$("#options [name=showInvisibles]").change(function () {
			// save the selected value
			appSession.settings.editor.showInvisibles = $(this).prop("checked");

			// set the selected value to the editors
			editors.html.setShowInvisibles(appSession.settings.editor.showInvisibles);
			editors.css.setShowInvisibles(appSession.settings.editor.showInvisibles);
			editors.js.setShowInvisibles(appSession.settings.editor.showInvisibles);

			localStorage.setItem("appSession_settings_editor_showInvisibles", appSession.settings.editor.showInvisibles);
		});

		// when the change event happens on the behavioursEnabled element of the options popup
		$("#options [name=behavioursEnabled]").change(function () {
			// save the selected value
			appSession.settings.editor.behavioursEnabled = $(this).prop("checked");

			// set the selected value to the editors
			editors.html.setBehavioursEnabled(appSession.settings.editor.behavioursEnabled);
			editors.css.setBehavioursEnabled(appSession.settings.editor.behavioursEnabled);
			editors.js.setBehavioursEnabled(appSession.settings.editor.behavioursEnabled);

			localStorage.setItem("appSession_settings_editor_behavioursEnabled", appSession.settings.editor.behavioursEnabled);
		});

		// when the change event happens on the pageTitle element of the options popup
		$("#options input[name=pageTitle]").change(function () {
			// change the current page's title to the selected value
			$("head title").html($(this).val() + " - codeMagic");

			// set the title to the selected value
			appSession.settings.title = $(this).val();
		});

		// when the click event happens on the #fullscreen element
		$("#fullscreen").click(function () {
			// toggle the fullscreen mode
			toggleFullscreen();
		});

		// when the click event happens on the #save element
		$("#save").click(function() {
			// Send state object to server
			if(localStorage.get("auth") === "true"){
				// save file
			}else{
				// inform user of Sign-in requirement
			}
		});

		// when the click event happens on the #auth element
		$("#auth").click(function() {
			var authenticate = {
				endpoint : "https://accounts.google.com/o/oauth2/auth",
				response_type : "token",
				client_id : "1785061010-1osqu1jsk03f033ehv2268jjtiung7h8.apps.googleusercontent.com",
				redirect_uri : "http://codemagic.gr",
				scope : "https://www.googleapis.com/auth/plus.login",
				state : "?auth",
				approval_prompt : "auto"
			};

			window.location.href =
				authenticate.endpoint + "?scope=" +
				authenticate.scope + "&state=" +
				authenticate.state + "&redirect_uri=" +
				authenticate.redirect_uri + "&response_type=" +
				authenticate.response_type + "&client_id=" +
				authenticate.client_id;

			// continue from:
			// Handling the response https://developers.google.com/accounts/docs/OAuth2UserAgent
		});

		// when the click event happens on the #share element
		$("#share").click(function () {
			// change the value of the .twitter anchor to match the current page
			$("#social").find("a.twitter").attr("href", "http://twitter.com/home?status=" + appSession.settings.title + " " + window.location.href + " from @code_Magic");
			// change the value of the .facebook anchor to match the current page
			$("#social").find("a.facebook").attr("href", "http://www.facebook.com/sharer.php?u=" + window.location.href);
			// change the value of the .google-plus anchor to match the current page
			$("#social").find("a.google-plus").attr("href", "https://plus.google.com/share?url=" + window.location.href + "&title=" + appSession.settings.title);
			// change the value of the .linkedin anchor to match the current page
			$("#social").find("a.linkedin").attr("href", "http://www.linkedin.com/shareArticle?mini=true&url=" + window.location.href + "&title=" + appSession.settings.title + "&summary=" + appSession.settings.description + "&source=http://codeMagic.gr");
			// change the value of the .pinterest anchor to match the current page
			$("#social").find("a.pinterest").attr("href", "http://pinterest.com/pin/create/bookmarklet/?url=" + window.location.href + "&is_video=false&description=" + appSession.settings.title);
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
				appSession.settings.title = $("#options input[name=pageTitle]").val();
				appSession.settings.description = $("#options textarea[name=pageDescription]").val();

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

				// WHY: breaking down logger into 2 pieces to prevent proxies from chocking by passing the 500 character limit
				logger = '<script>var console={};window.onerror=function(msg,url,line){parent.document.getElementById("console-editor").insertAdjacentHTML("beforeend","<code class=\'js-error\'>> "+msg+" </code><br>")};';
				logger += 'console.log=function(){var str="",count=0;for(var i=0;i<arguments.length;i++){if(typeof arguments[i]=="object"){str="Object {<br>";for(var item in arguments[i])if(arguments[i].hasOwnProperty(item)){count++;str+="\t"+item+" : "+arguments[i][item]+",<br>"}str=str.substring(0,str.length-5)+"<br>}";if(count===0){str="Object {}";count=0}}else str=arguments[i];parent.document.getElementById("console-editor").insertAdjacentHTML("beforeend","<code>> "+str+"</code><br>")}};</script>';

				var head = '<!doctype html><html><head>' + logger + '<meta charset="utf-8"><title>' + appSession.settings.title + '</title><meta name="description" content="' + appSession.settings.description + '"><meta name="author" content="' + appSession.settings.author + '">' + externalStyle + '<style>' + style + '</style></head>';
				var body = '<body>' + content + externalScript + '<script>' + script + '</script></body></html>';

				var result = head + body;

				// get the container of the iframe
				var iframeContainer = document.getElementById("right");
				// empty the container of the iframe
				iframeContainer.innerHtml = "";

				// create an iframe element
				var iframe = document.createElement("iframe");
				// and put it inside the iframe container
				iframeContainer.appendChild(iframe);

				// create, open, write result and close the iframe document
				iDoc = iframe.contentDocument;
				iDoc.open();
				iDoc.write(result);
				iDoc.close();

				// height fix
				$("iframe").css("height", "99%");


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
				var zippedContent = '<!doctype html><html><head><meta charset="utf-8"><title>' + appSession.settings.title + '</title><meta name="description" content="'+appSession.settings.description+'"><meta name="author" content="' + appSession.settings.author + '">' + externalStyle + styleString + '</head><body>' + content + externalScript + scriptString + '</body></html>';

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

				appSession.panels.html.content = content;
				appSession.panels.css.content = style;
				appSession.panels.js.content = script;
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

			} else {
				$(this).addClass("enabled");
				$("#" + $(this).data("selector")).show();


				if($("#" + $(this).data("selector")).hasClass("popup")){
					$("#overlay").show();
				}
			}

			if ($(this).find("a").data("hint") == "Settings") {
				$("#options #theme").val(appSession.settings.editor.theme);
				$("#options [name=tabSize]").val(appSession.settings.editor.tabSize);
				$("#options [name=showPrintMargin]").prop("checked", isTrue(appSession.settings.editor.showPrintMargin));
				$("#options [name=useWrapMode]").prop("checked", isTrue(appSession.settings.editor.useWrapMode));
				$("#options [name=fontSize]").val(appSession.settings.editor.fontSize);
				$("#options [name=showInvisibles]").prop("checked", isTrue(appSession.settings.editor.showInvisibles));
				$("#options [name=behavioursEnabled]").prop("checked", isTrue(appSession.settings.editor.behavioursEnabled));

				require(["libs/select2"], function () {
					$("[name=fontSize]").select2({
						"width": "100%"
					});

					$("[name=tabSize]").select2({
						"width": "100%"
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

	// google Analytics
	var _gaq=[['_setAccount','UA-38829096-1'],['_trackPageview']];
	(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
	g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
	s.parentNode.insertBefore(g,s);}(document,'script'));
});
