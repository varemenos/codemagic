$(function(){
	define([], function(require){
		/* *******************************************************
			Libraries
		******************************************************* */

		require("libs/less");
		require("libs/jsuri");

		/* *******************************************************
			Functions
		******************************************************* */

		function resizeEditors(){
			editors.html.resize();
			editors.css.resize();
			editors.js.resize();
		}

		function updateLayout(){
			resizeEditors();

			$(".popup").each(function(){
				$(this).css({
					"top" : (($(window).height() - $(".popup").height()) / 2) + "px",
					"left" : (($(window).width() - $(".popup").width()) / 2) + "px"
				});
			});

			$("#console-editor").css("margin-left", $(".ace_gutter-layer").width());
			$(".editor-resizer").css("margin-left", $(".ace_gutter-layer").width());
			$("#main").height($("#container").height() - $("header").height() - 4);
		}

		function setTheme(theme){
			editors.html.setTheme("ace/theme/"+theme);
			editors.css.setTheme("ace/theme/"+theme);
			editors.js.setTheme("ace/theme/"+theme);
		}

		function enablePanel(id){
			$("#"+id).show();
			$(".navigation li[data-selector="+id+"]").addClass("enabled");
		}

		function disablePanel(id){
			$("#"+id).hide();
			$(".navigation li[data-selector="+id+"]").removeClass("enabled");
		}

		function enableDefaultPanels(){
			enablePanel("html");
			enablePanel("css");
			enablePanel("js");
		}

		function toggleFullscreen(){
			if($("#fullscreen").hasClass("enabled")){
				$("#fullscreen").removeClass("enabled");
				$("#left").show();
				$("#right").css("width", "50%");
			}else{
				$("#fullscreen").addClass("enabled");
				$("#left").hide();
				$("#right").css("width", "100%");
			}
		}

		/* *******************************************************
			Uri parsing
		******************************************************* */

		var uri = new Uri(window.location).queryPairs;

		// #TODO: consider alternative way of implementing this:
			// uri = new Uri(window.location);
			// if(uri.getQueryParamValue("view") != undefined){
				// do view checks
			// }

		if(uri.length === 0){
			enableDefaultPanels();
		}else{
			for(var param = 0; param < uri.length; param++){
				if(uri[param][0] == "view"){
					// display selected views
						// h = html
						// j = javascript
						// c = css
						// k = konsole
						// all = h+j+c+k
						// l = less
						// m = markdown
						// examples : view=hc, view=lm, view=all, view=hcjk
					// #TODO: use views to calculate amount of panels enabled, and toggle Height classes(ie: twoHorizontal, threeVertical, etc)
					var temp = uri[param][1].split('');
					for(i = 0; i < temp.length; i++){
						if(temp[i] == "h"){
							enablePanel("html");
						}else if(temp[i] == "c"){
							enablePanel("css");
						}else if(temp[i] == "j"){
							enablePanel("js");
						}else if(temp[i] == "k"){
							enablePanel("console");
						}else if(temp[i] == "m"){
							enablePanel("html");
							$("#markupSettings").val("markdown");
						}else if(temp[i] == "l"){
							enablePanel("css");
							$("#stylesheetSettings").val("less");
						}else if(uri[param][1] == "all"){
							enableDefaultPanels();
							enablePanel("console");
						}
					}
				}else if(uri[param][0] == "data"){
					enableDefaultPanels();
					// AJAX load of data
					// localStorage backup of data
				}else if(uri[param][0] == "fullscreen"){
					enableDefaultPanels();
					toggleFullscreen();
				}else{
					enablePanel(uri[param][0]);
				}
			}
		}

		/* *******************************************************
			Editors
		******************************************************* */

		var editors = {};

		// initialize editors to targeted ids
		editors.css = ace.edit("css-editor");
		editors.js = ace.edit("js-editor");
		editors.html = ace.edit("html-editor");

		// editor syntax highlighting modes
		editors.html.getSession().setMode("ace/mode/"+$("#markupSettings").val());
		editors.css.getSession().setMode("ace/mode/css");
		editors.js.getSession().setMode("ace/mode/javascript");

		// editor tab size
		editors.html.getSession().setTabSize(4);
		editors.css.getSession().setTabSize(4);
		editors.js.getSession().setTabSize(4);

		// hide vertical print line
		editors.html.setShowPrintMargin(false);
		editors.css.setShowPrintMargin(false);
		editors.js.setShowPrintMargin(false);

		// editor word wrapping mode
		editors.html.getSession().setUseWrapMode(true);
		editors.css.getSession().setUseWrapMode(true);
		editors.js.getSession().setUseWrapMode(true);

		/* *******************************************************
			Other
		******************************************************* */

		// get default theme
		setTheme($("#options #theme").val());
		// set enabled panels' toggling anchors as 'enabled'
		$(".navigation li input:not(:checked)").parent().removeClass("enabled");
		// call updateLayout
		updateLayout();

		/* *******************************************************
			Events
		******************************************************* */

		// Resizing editors{
			var resize = false,
				resizeTarget = {
					height : 0,
					id : ""
				};

			$(".editor-resizer").mousedown(function(e){
				resize = e.pageY;
				resizeTarget.id = $(this).parent().prop("id");
				resizeTarget.height = $("#"+resizeTarget.id).find(".editor-wrap").height();
			});

			$(document).mouseup(function(e){
				resize = false;
				resizeTarget.height = $("#"+resizeTarget.id).height();
				updateLayout();
			});

			$(document).mousemove(function(e){
				if(resize){
					$("#"+resizeTarget.id).find(".editor-wrap").height(resizeTarget.height + event.pageY - resize);
				}
			});
		// }

		// on window resize, redraw layout
		$(window).resize(function(){
			setTimeout(function(){
				updateLayout();
			}, 500);
		});

		// toggle editor language type settings visibility
		$("section h1 a").click(function(){
			$(this).toggleClass("enabled").next().toggle();
		});

		// get markup type
		$("#markupSettings").change(function(){
			editors.html.getSession().setMode("ace/mode/"+$("#markupSettings").val());
			$("#selectedMarkup").html($(this).val().charAt(0).toUpperCase() + $(this).val().slice(1));
			$(this).parent().hide();
			$(this).parents().eq(1).find("a").removeClass("enabled");
		});

		// get stylesheet type
		$("#stylesheetSettings").change(function(){
			editors.css.getSession().setMode("ace/mode/"+$("#stylesheetSettings").val());
			$("#selectedStylesheet").html($(this).val().charAt(0).toUpperCase() + $(this).val().slice(1));
			$(this).parent().hide();
			$(this).parents().eq(1).find("a").removeClass("enabled");
		});

		// editor theme
		$("#options #theme").change(function(){
			var selectedTheme = $(this).val();
			setTheme(selectedTheme);

			setTimeout(function(){
				var fontcolor = "#222";
				var bgcolor = "#fff";
				$(".ace_gutter").each(function(){
					if($(this).css("background-color") != "undefined"){
						fontcolor = $(this).css("color");
						bgcolor = $(this).css("background-color");

						$("#console-editor").css("background-color", $(".ace_scroller").css("background-color"));
						$("#console-editor").css("color", $(this).css("color"));
					}
				});

				$("#left").css("background-color", bgcolor);
				$("section h1").css("color", fontcolor);
				$("#left").css("border-bottom-color", bgcolor);
			}, 500);
		});

		// change title
		$("#options input[name=pageTitle]").change(function(){
			$("head title").html($(this).val() + " - codeMagic");
		});

		// fullscreen mode
		$("#fullscreen").click(function(){
			toggleFullscreen();
		});

		// prettify code
		$("#prettify").click(function(){
			require(["libs/beautify", "libs/beautify-css", "libs/beautify-html"], function(){
				if($("#markupSettings").val() === "html"){
					editors.html.setValue(style_html(editors.html.getValue()));
				}

				editors.css.setValue(css_beautify(editors.css.getValue()));
				editors.js.setValue(js_beautify(editors.js.getValue()));
			});
		});

		// update iframe
		$("#update").click(function(){
			// empty the console text
			$("#console-editor").html("");

			var content = editors.html.getValue();
			var style;

			require(['libs/marked'], function(marked){
				if($("#markupSettings").val() === "markdown"){
						content = marked(editors.html.getValue());
				}

				if($("#stylesheetSettings").val() === "less"){
					var parser = new(less.Parser)();

					parser.parse(editors.css.getValue(), function (e, tree) {
						if (e){
							$("#console-editor").append("<code>> "+e.message+"</code><br>");
						}
						style = tree.toCSS();
					});
				}else{
					style = editors.css.getValue();
				}

				var script = editors.js.getValue();
				var pageTitle = $("#options input[name=pageTitle]").val();

				var cssLibraries = [];
				var jsLibraries = [];
				var externalStyle = "";
				var externalScript = "";

				$("#options #library :selected").each(function(){
					if($(this).parent()[0].id == "CSSlibrary"){
						cssLibraries.push($(this).val());
					} else if($(this).parent()[0].id == "JSlibrary"){
						jsLibraries.push($(this).val());
					}
				});

				for(i = 0; i < cssLibraries.length; i++){
					externalStyle += '<link rel="stylesheet" href="'+cssLibraries[i]+'">';
				}

				for(i = 0; i < jsLibraries.length; i++){
					externalScript += '<script src="'+jsLibraries[i]+'"></script>';
				}

				var logger = '<script>var console={};console.log=function(){var str="",count=0;for(var i=0;i<arguments.length;i++){if(typeof arguments[i]=="object"){str="Object {<br>";for(var item in arguments[i])if(arguments[i].hasOwnProperty(item)){count++;str+="&nbsp;&nbsp;&nbsp;&nbsp;"+item+" : "+arguments[i][item]+",<br>"}str=str.substring(0,str.length-5)+"<br>}";if(count===0){str="Object {}";count=0}}else str=arguments[i];parent.document.getElementById("console-editor").insertAdjacentHTML("beforeend","<code>> "+str+"</code><br>")}};</script>';
				var head = '<!doctype html><html><head><meta charset="utf-8"><title>'+pageTitle+'</title><meta name="description" content=""><meta name="author" content="">'+externalStyle+'<style>'+style+'</style></head>';
				var body ='<body>'+content+externalScript+logger+'<script>'+script+'</script></body></html>';

				var result = head + body;

				var iframe = document.getElementById("iframe");


				// create, open, write result and close the iframe document
				iDoc = iframe.contentDocument;
				iDoc.open();
				iDoc.write(result);
				iDoc.close();

				// height fix
				$("iframe").css("height", "100%");
			});
		});

		// navication actions
		$(".navigation .toggler").click(function(){
			if($(this).hasClass("enabled")){
				$(this).removeClass("enabled");
				$("#"+$(this).data("selector")).toggle();

				setTheme($("#options #theme").val());
			}else{
				$(this).addClass("enabled");
				$("#"+$(this).data("selector")).toggle();

				setTheme($("#options #theme").val());
			}

			if($(this).find("a").data("hint") == "Settings"){
				require(["libs/select2"], function(){
					$("#theme").select2({
						"width" : "100%"
					});

					$("#library").select2({
						placeholder: "Select external Libraries",
						"width" : "100%"
					});
				});
			}

			setTimeout(function(){
				updateLayout();
			}, 500);
		});

		$("#options button").click(function(){
			$(".navigation .toggler[data-selector=options]")
				.removeClass("enabled")
				.find("input[type=checkbox]").prop("checked", false);

			$("#options").fadeOut("150");

			setTheme($("#options #theme").val());
		});
	});
});
