var app = app || {};

$(function () {
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
});
