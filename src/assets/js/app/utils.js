var app = app || {};

$(function () {
	'use strict';

	app.utils = {};

	app.utils.isTrue = function (x, callback) {
		if(typeof x !== 'boolean'){
			return x === 'true';
		}else{
			return x;
		}

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.setSettings = function (target, val, callback) {
		target = 'codemagic.settings.' + target;

		localStorage.setItem(target, val);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.getSettings = function (target) {
		target = 'codemagic.settings.' + target;
		var value = localStorage.getItem(target);

		if(value === 'true'){
			return true;
		}
		if(value === 'false'){
			return false;
		}
		if(value === 'undefined'){
			return undefined;
		}
		if(value === 'null'){
			return null;
		}
		if(value === 'NaN'){
			return NaN;
		}
		if(!isNaN(value)){
			return parseInt(value, 10);
		}
		return value;
	};

	app.utils.resizeEditors = function (editors, callback) {
		editors.html.resize();
		editors.css.resize();
		editors.js.resize();

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.consoleLog = function (log, callback) {
		$('#console .editor-module').addClass('enabled');
		$('#console-editor').append('<code class="js-error">&gt; ' + log + '</code>');

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.getZippedProject = function (editors, callback) {

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.generateLogger = function (callback) {
		// WHY: breaking down logger into many pieces to prevent proxies from chocking by passing the 500 character limit
		var result = '<script>var console={};window.onerror=function(msg,url,line){parent.document.querySelector("#console .editor-module").classList.add("enabled");';
		result += 'parent.document.querySelector("#console-editor-toggle").classList.add("enabled");';
		result += 'parent.document.getElementById("console-editor").insertAdjacentHTML("beforeend","<code class=\'js-error\'>> "+msg+" </code>")};';
		result += 'console.log=function(){var str="",count=0;for(var i=0;';
		result += 'i<arguments.length;i++){if(typeof arguments[i]=="object"){str="Object {<br>";for(var item in arguments[i])if(arguments[i].hasOwnProperty(item)){count++;';
		result += 'str+="\t"+item+" : "+arguments[i][item]+",<br>"}str=str.substring(0,str.length-5)+"<br>}";';
		result += 'if(count===0){str="Object {}";count=0}}else str=arguments[i];';
		result += 'parent.document.getElementById("console-editor").insertAdjacentHTML("beforeend","<code>> "+str+"</code><br>")}};</script>';

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateContent = function (callback) {
		var result = '';
		if ($('#markupChoice').val() === 'Markdown') {
			result = marked(app.editors.html.getValue());
		} else if ($('#markupChoice').val() === 'HAML') {
			app.utils.consoleLog('HAML support is not ready yet');
		} else if ($('#markupChoice').val() === 'Jade') {
			app.utils.consoleLog('Jade support is not ready yet');
		} else {
			result = app.editors.html.getValue();
		}

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateStyle = function (callback) {
		var result = '';

		if ($('#styleChoice').val() === 'Less') {
			var parser = new(less.Parser)();

			parser.parse(app.editors.css.getValue(), function (e, tree) {
				if (e) {
					// TODO: error handling in console
					$('#console-editor').append('<code>> ' + e.message + '</code><br>');
					console.log(e);
				}
				result = tree.toCSS();
			});
		} else if ($('#styleChoice').val() === 'SASS' || $('#styleChoice').val() === 'SCSS') {
			app.utils.consoleLog('SASS/SCSS support is not ready yet');
		} else if ($('#styleChoice').val() === 'Stylus') {
			app.utils.consoleLog('Stylus support is not ready yet');
		} else {
			result = app.editors.css.getValue();
		}

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateScript = function (callback) {
		var result = '';

		if ($('#scriptChoice').val() === 'CoffeeScript') {
		} else {
			result = app.editors.js.getValue();
		}

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateHead = function (callback) {
		var style = app.utils.generateStyle();
		var logger = app.utils.generateLogger();
		var result = '<!doctype html><html><head>' + logger + '<meta charset="utf-8"><title>Title</title><meta name="description" content="Description"><meta name="author" content="Author"><style>' + style + '</style></head>';

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateBody = function (style, callback) {
		var content = app.utils.generateContent();
		var script= app.utils.generateScript();
		var head = app.utils.generateHead();
		var result = head + '<body>' + content + '<script>' + script + '</script></body></html>';

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.updateLayout = function (editors, callback) {
		app.utils.resizeEditors(editors);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.setTheme = function (editors, theme, callback) {
		editors.html.setTheme('ace/theme/' + theme);
		editors.css.setTheme('ace/theme/' + theme);
		editors.js.setTheme('ace/theme/' + theme);

		app.session.settings.theme = theme;
		app.utils.setSettings('editor.theme', theme);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.setEditorMode = function (target, mode, callback) {
		app.session.settings[target].mode = mode;

		app.utils.setSettings(target + '.mode', mode);

		if(mode === 'coffeescript'){
			mode = 'coffee';
		}

		app.editors[target + 'Session'].setMode('ace/mode/' + mode);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.toggleEditorState = function (target, callback) {
		var state = false;
		if($('#' + target + '-editor-toggle').hasClass('enabled')){
			state = true;
		}
		app.session.settings[target].state = state;

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.toggleFullscreenMode = function (target, callback) {
		if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
			if (target.requestFullscreen) {
				target.requestFullscreen();
			} else
			if (target.mozRequestFullScreen) {
				target.mozRequestFullScreen();
			} else
			if (target.webkitRequestFullscreen) {
				target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		}
		else {
			if (document.cancelFullScreen) {
				document.cancelFullScreen();
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			}
			else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
		}

		if (typeof callback == 'function') {
			callback();
		}
	};
});
