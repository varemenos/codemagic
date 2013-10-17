var app = app || {};

(function () {
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
			// force-trigger a resize of the editors
			editors.html.resize();
			editors.css.resize();
			editors.js.resize();

			if (typeof callback == 'function') {
				callback();
			}
		};

		app.utils.setTheme = function (editors, theme, callback) {
			// save the selected theme
			app.session.settings.theme = theme;

			// set the selected theme as the new theme for the editor.
			editors.html.setTheme('ace/theme/' + theme);
			editors.css.setTheme('ace/theme/' + theme);
			editors.js.setTheme('ace/theme/' + theme);

			app.utils.setSettings('editor.theme', theme);

			if (typeof callback == 'function') {
				callback();
			}
		};
	});
})();
