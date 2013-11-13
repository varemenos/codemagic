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

	app.utils.resizeEditors = function (editors, callback) {
		editors.html.resize();
		editors.css.resize();
		editors.js.resize();

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.em2px = function (callback) {
		var div = $('<div style="width: 1em;"></div>').appendTo('body');
		var em = div.width();
		div.remove();

		if (typeof callback == 'function') {
			callback();
		}

		return em;
	};

	app.utils.rem2px = function (callback) {
		var div = $('<div style="width: 1rem;"></div>').appendTo('body');
		var rem = div.width();
		div.remove();

		if (typeof callback == 'function') {
			callback();
		}

		return rem;
	};

	app.utils.setIframeHeight = function (iframe, callback) {
		$(iframe).height(Math.max($('#editors').height(), $(iframe).height()));

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.write2iframe = function (iframe, result, callback) {
		var iframeDocument = iframe.contentDocument;
		iframeDocument.open();
		iframeDocument.write(result);
		iframeDocument.close();

		app.utils.setIframeHeight(iframe);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.consoleClear = function (callback) {
		$('#console-editor').html('');

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

	app.utils.generateResult = function (callback) {
		var result = app.utils.generateHead() + app.utils.generateBody();

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateLogger = function (callback) {
		// TODO: better error handling and object debugging
		// WHY: breaking down logger into many pieces to prevent proxies from chocking by passing the 500 character limit
		var result = '<script>window.eval = {};var console={};window.onerror=function(msg,url,line){parent.document.querySelector("#console .editor-module").classList.add("enabled");';
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
			app.utils.consoleLog('HAML support is not ready to use yet.');
		} else if ($('#markupChoice').val() === 'Jade') {
			app.utils.consoleLog('Jade support is not ready to use yet.');
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
					// TODO: better error handling in console
					$('#console-editor').append('<code>> ' + e.message + '</code><br>');
				}
				result = tree.toCSS();
			});
		} else if ($('#styleChoice').val() === 'SASS' || $('#styleChoice').val() === 'SCSS') {
			app.utils.consoleLog('SASS/SCSS support is not ready to use yet.');
		} else if ($('#styleChoice').val() === 'Stylus') {
			app.utils.consoleLog('Stylus support is not ready to use yet.');
		} else {
			result = app.editors.css.getValue();
		}

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateExternalStyle = function (callback) {
		var items = $("select[name=csslibrary]").val();
		var result = '';

		for (var i = 0; i < items.length; i++) {
			result+= '<link href="'+ items[i] + '">';
		}

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateScript = function (callback) {
		var result = '';

		if ($('#scriptChoice').val() === 'CoffeeScript') {
			app.utils.consoleLog('CoffeeScript support is not ready to use yet.');
		} else {
			result = app.editors.js.getValue();
		}

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateExternalScript = function (callback) {
		var items = $("select[name=jslibrary]").val();
		var result = '';

		for (var i = 0; i < items.length; i++) {
			result+= '<script src="'+ items[i] + '"></script>';
		}

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateHead = function (callback) {
		var style = app.utils.generateStyle();
		var externalStyle = app.utils.generateExternalStyle();
		var logger = app.utils.generateLogger();
		var result = '<!doctype html><html><head>' + logger + '<meta charset="utf-8"><title>Title</title><meta name="description" content="Description"><meta name="author" content="Author">' + externalStyle +'<style>' + style + '</style></head>';

		if (typeof callback == 'function') {
			callback();
		}

		return result;
	};

	app.utils.generateBody = function (callback) {
		var content = app.utils.generateContent();
		var script= app.utils.generateScript();
		var externalScript = app.utils.generateExternalScript();
		var result = '<body>' + content + externalScript + '<script>' + script + '</script></body></html>';

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

	app.utils.setTheme = function (theme, callback) {
		_.each([app.editors.html, app.editors.css, app.editors.js], function(editor) {
			editor.setTheme('ace/theme/' + theme);
		});

		app.utils.setSettings('theme', theme);

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

	app.utils.setOption = function (option, value, callback) {
		console.log(option + ' : ' + value);

		var result = {};
		result[option] = value;

		_.each([app.editors.html, app.editors.css, app.editors.js], function(editor) {
			editor.setOptions(result);
		});

		app.utils.setSettings(option, value);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.setSettings = function (target, val, callback) {
		app.session.settings[target] = val;

		target = 'codemagic.settings.' + target;
		localStorage.setItem(target, val);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.getSettings = function (target) {
		var value = localStorage.getItem('codemagic.settings.' + target);
		var result = value;

		if(value === 'true'){
			result = true;
		} else  if(value === 'false'){
			result = false;
		} else  if(value === 'undefined'){
			result = undefined;
		} else  if(value === 'null'){
			result = null;
		} else  if(value === 'NaN'){
			result = NaN;
		} else  if(!isNaN(value)){
			result = parseInt(value, 10);
		}

		app.session.settings[target] = result;
		return result;
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

	app.utils.toggleHideEditorsMode = function (target, callback) {
		var editors = $('#editors');
		var result = $('#result');

		var state1 = !editors.hasClass('hideEditors');
		var state2 = result.hasClass('hideResult');

		if(state1){
			editors.addClass('hideEditors');

			if(state2){
				app.utils.toggleHideResultMode();
			}

			window.setTimeout(function () {
				editors.hide();
				result.addClass('hideEditors');
			}, 250);
		} else {
			result.removeClass('hideEditors');

			window.setTimeout(function () {
				editors.show();
				editors.removeClass('hideEditors');
			}, 250);
		}

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.toggleHideResultMode = function (target, callback) {
		var editors = $('#editors');
		var result = $('#result');

		var state = !result.hasClass('hideResult');
		var state2 = result.hasClass('hideEditors');

		if(state){
			result.addClass('hideResult');

			if(state2){
				app.utils.toggleHideEditorsMode();
			}

			window.setTimeout(function () {
				result.hide();
				editors.addClass('hideResult');
			}, 250);
		} else {
			editors.removeClass('hideResult');

			window.setTimeout(function () {
				result.show();
				result.removeClass('hideResult');
			}, 250);
		}

		if (typeof callback == 'function') {
			callback();
		}
	};
});
