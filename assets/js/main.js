$(function(){
	function resizeEditors(){
		editors.html.resize();
		editors.css.resize();
		editors.js.resize();
	}

	function updateLayout(){
		resizeEditors();
		$("#console-editor").css("margin-left", $(".ace_gutter-layer").width());
		$("#right").height($("#left").height());
	}

	function setTheme(theme){
		editors.html.setTheme("ace/theme/"+theme);
		editors.css.setTheme("ace/theme/"+theme);
		editors.js.setTheme("ace/theme/"+theme);
	}

	var prmarr = window.location.search.substr(1).split ("&");
	var params = [];
	var panels = ['html', 'css', 'js', 'console'];

	for (i = 0; i < prmarr.length; i++) {
		var tmparr = prmarr[i].split("=");
		params.push(tmparr[0]);
	}

	if(params[0] !== ""){
		for(i = 0; i < panels.length; i++){
			if($.inArray(panels[i], params) < 0){
				$("#"+panels[i]).hide();
				$(".navigation li[data-selector="+panels[i]+"]").removeClass("enabled");
			}else{
				$("#"+panels[i]).show();
				$(".navigation li[data-selector="+panels[i]+"]").addClass("enabled");
			}
		}
	}else{
		$("#html").show();
		$("#css").show();
		$("#js").show();
		$("#console").hide();
		$(".navigation li[data-selector=html]").addClass("enabled");
		$(".navigation li[data-selector=css]").addClass("enabled");
		$(".navigation li[data-selector=js]").addClass("enabled");
	}

	$("#theme").select2({
		"width" : "100%"
	});

	$("#library").select2({
		placeholder: "Select external Libraries",
		"width" : "100%"
	});

	var editors = {};
	editors.css = ace.edit("css-editor");
	editors.js = ace.edit("js-editor");
	editors.html = ace.edit("html-editor");

	editors.html.getSession().setMode("ace/mode/"+$("#markupSettings").val());
	editors.css.getSession().setMode("ace/mode/css");
	editors.js.getSession().setMode("ace/mode/javascript");
	
	editors.html.getSession().setTabSize(4);
	editors.css.getSession().setTabSize(4);
	editors.js.getSession().setTabSize(4);
	
	editors.html.setShowPrintMargin(false);
	editors.css.setShowPrintMargin(false);
	editors.js.setShowPrintMargin(false);

	editors.html.getSession().setUseWrapMode(true);
	editors.css.getSession().setUseWrapMode(true);
	editors.js.getSession().setUseWrapMode(true);

	setTheme($("#options #theme").val());
	$(".navigation li input:not(:checked)").parent().removeClass("enabled");
	updateLayout();

	// on window resize, redraw layout
	$(window).resize(function(){
		setTimeout(function(){
			updateLayout();
		}, 500);
	});

	// get markup type
	$("#markupSettings").change(function(){
		editors.html.getSession().setMode("ace/mode/"+$("#markupSettings").val());
	});

	// get stylesheet type
	$("#stylesheetSettings").change(function(){
		editors.css.getSession().setMode("ace/mode/"+$("#stylesheetSettings").val());
	});

	// editor theme
	$("#options #theme").change(function(){
		var selectedTheme = $(this).val();
		setTheme(selectedTheme);

		setTimeout(function(){
			var bgcolor = "#fff";
			$(".ace_gutter").each(function(){
				if($(this).css("background-color") != "undefined"){
					bgcolor = $(this).css("background-color");

					$("#console-editor").css("background-color", $(".ace_scroller").css("background-color"));
					$("#console-editor").css("color", $(this).css("color"));
				}
			});

			$("#left").css("background-color", bgcolor);
			$("#left").css("border-bottom-color", bgcolor);
		}, 500);
	});

	// change title
	$("#options input[name=pageTitle]").change(function(){
		$("head title").html($(this).val() + " - codeMagic");
	});

	// update iframe
	$("#update").click(function(){
		// empty the console text
		$("#console-editor").html("");

		var content;
		var style;

		if($("#markupSettings").val() === "markdown"){
			content = markdown.toHTML(editors.html.getValue());
		}else{
			content = editors.html.getValue();
		}

		if($("#stylesheetSettings").val() === "less"){
			var parser = new(less.Parser)();

			parser.parse(editors.css.getValue(), function (e, tree) {
				if (e){
					console.log(e);
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

		// Modern browsers
		if(iframe.contentDocument){
			doc = iframe.contentDocument;
		}else
		// IE6-IE7
		if(iframe.contentWindow){
			doc = iframe.contentWindow;
		}

		// open, write results and close the iframe
		doc.open();
		doc.write(result);
		doc.close();

		// height fix
		$("iframe").css("height", "100%");
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
