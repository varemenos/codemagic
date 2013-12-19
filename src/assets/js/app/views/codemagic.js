$(function () {
	'use strict';

	app.mvc.views.CodemagicView = Backbone.View.extend({
		el: '#container',
		events : {
			'click #update': 'updateResults',
			'click #prettify': 'prettify',
			'click #download': 'download',
			'click #settings': 'popupOpen',
			'click #share': 'popupOpen',
			'click .popup-close': 'popupClose',
			'click .editor-options-close': 'editorsOptionsClose',
			'click #overlay': 'popupClose',
			'click #fullscreen': 'toggleFullscreen',
			'click #hide-editors': 'toggleHideEditors',
			'click #hide-result': 'toggleHideResult',
			'click .editor-fullscreen-toggle': 'editorFullscreen',
			'mousedown .resizer': 'resizeInitialize',
			'mouseup': 'resizeFinalize',
			'mousemove': 'resizeRefresh',
			'click .editor-options-toggle': 'toggleTargetedEditorOptions',
			'change .codeChoice': 'toggleSelectedEditorOptions',
			'click .editor-toggle': 'toggleEditorState',
			'change .settings-option-input input[type=text]': 'updateSettings',
			'change .settings-option-checkbox input[type=checkbox]': 'updateSettings',
			'change .settings-option-textarea textarea': 'updateSettings',
			'change .settings-option-select select': 'updateSettings',
		},
		updateSettings: function (e) {
			var target = $(e.currentTarget);
			var targetName = target.prop('name');
			var result;

			var editorOptions = [
				'tabSize',
				'showPrintMargin',
				'wrap',
				'useWorker',
				'fontSize',
				'showInvisibles',
				'behavioursEnabled',
				'enableSnippets',
				'enableLiveAutoComplete',
				'enableBasicAutocompletion',
				'useSoftTabs',
				'highlightActiveLine',
				'enableEmmet',
				'showGutter',
				'showFoldWidgets',
			];

			if (targetName === 'theme') {
				result = target.val();
				app.utils.setTheme(result);
			} else if (targetName === 'title' || targetName === 'author' || targetName === 'description') {
				app.utils.setSettings(targetName, target.val());
			} else if ($.inArray(targetName, editorOptions) !== -1) {
				if ($(target).prop('type') === 'checkbox'){
					result = $(target).is(':checked');
					app.utils.setOption(targetName, result);
				} else if ($(target).prop('type') === 'text'){
					result = target.val();
					app.utils.setOption(targetName, result);
				} else if ($(target).is('select')){
					result = ($(target).find('option').filter(':selected')).val();
					if (targetName === 'fontSize') {
						result = parseInt(result, 10);
					}
					app.utils.setOption(targetName, result);
				} else {
					console.log('other target');
				}
			}
			app.utils.updateLayout();
		},
		popupOpen: function (e) {
			app.utils.updateShareUrls(function () {
				var target = '#' + $(e.currentTarget).prop('id') + '-modal';
				$("#overlay").fadeIn(150);
				$(target).slideDown(250);
			});
		},
		popupClose: function (e) {
			var target;
			if ($(e.currentTarget).is('button')) {
				target = '#' + $(e.currentTarget).parent().prop('id').replace('-modal', '') + '-modal';
			} else {
				target = '#' + $(e.currentTarget).prop('id').replace('-modal', '');
			}

			if (target === '#overlay') {
				target = '.popup';
			}

			$("#overlay").fadeOut(250);
			$(target).slideUp(150);
		},
		editorsOptionsClose: function (e) {
			var target = $(e.currentTarget).closest('.editor-options');
			this.toggleEditorOptions(target);
		},
		download: function () {
			var zip = new JSZip();

			var style = app.utils.generateStyle();
			var script = app.utils.generateScript();

			// generate index.html file's string and prettify ugly HTML
			var zippedContent = html_beautify(app.utils.generateZippedResult(), app.prettify.html);

			// convert strings to files and add them in zip
			zip.file('index.html', zippedContent);

			// if style or script strings are empty, don't create files inside the zip
			if(style !== ''){
				zip.file('style.css', style);
			}
			if(script !== ''){
				zip.file('script.js', script);
			}

			// add zip base64 href attribute in the download button
			$('#download').attr('href', 'data:application/zip;base64,' + zip.generate());

			if(app.session.title !== ''){
				$('#download').attr('download', app.utils.safeFilename(app.session.title) + '.zip');
			}
		},
		prettify: function () {
			if ($('#markupChoice').val() === 'HTML') {
				app.editors.htmlSession.setValue(html_beautify(app.editors.htmlSession.getValue(), app.prettify.html));
				app.editors.htmlSession.selection.moveCursorFileStart();
			}

			if ($('#styleChoice').val() === 'CSS') {
				app.editors.cssSession.setValue(css_beautify(app.editors.cssSession.getValue(), app.prettify.css));
				app.editors.cssSession.selection.moveCursorFileStart();
			}

			if ($('#scriptChoice').val() === 'JavaScript') {
				app.editors.jsSession.setValue(js_beautify(app.editors.jsSession.getValue(), app.prettify.js));
				app.editors.jsSession.selection.moveCursorFileStart();
			}
		},
		toggleEditorState: function (selector) {
			var target;
			if (selector instanceof Array) {
				for (var i = 0; i < selector.length; i++) {
					$(selector[i]).toggleClass('enabled');
					$('#' + selector[i] + '-editor').closest('.editor-module').toggleClass('enabled');
					$('#' + selector[i] + '-editor-toggle').toggleClass('enabled');
				}
				target = false;
			}else if (typeof selector === 'object') {
				target = $(selector.currentTarget).prop('id').replace('-editor-toggle', '');
			} else {
				target = selector;
			}

			if (target !== false) {
				$('#' + target + '-editor-toggle').toggleClass('enabled');
				$('#' + target + '-editor').closest('.editor-module').toggleClass('enabled');
				app.utils.toggleEditorState(target);
			}
		},
		toggleSelectedEditorOptions: function (e) {
			var value = $(e.currentTarget).val();
			var editorTarget = $(e.currentTarget).parent();
			var target = editorTarget.closest('.editor-options').prop("id").replace("-editor-options", "");
			$('#' + target + '-option-title').html(value);
			this.toggleTargetedEditorOptions(e);
			app.utils.setEditorMode(editorTarget.closest('.editor-options').prop('id').replace('-editor-options', ''), value.toLowerCase());
		},
		toggleTargetedEditorOptions: function (e) {
			if ($(e.currentTarget).prop('tagName') === 'SELECT') {
				this.toggleEditorOptions($(e.currentTarget).closest('.editor-options'));
			} else if (e.container !== undefined) {
				var temp = $(e.container).prop('id').replace('-editor', '');
				this.toggleEditorOptions($('#' + temp + '-editor-options'));
			} else {
				this.toggleEditorOptions($(e.currentTarget).next());
			}
		},
		toggleEditorOptions: function (target) {
			$(target).toggleClass('enabled');
		},
		resizeInitialize: function (e) {
			app.session.resize = e.pageY;
			app.session.resizeTarget = app.session.resizeTarget || {};
			app.session.resizeTarget.id = $(e.currentTarget).prev().find('.editor').prop('id');
			app.session.resizeTarget.height = $('#' + app.session.resizeTarget.id).parent().height();
		},
		resizeRefresh: function (e) {
			if (app.session.resize) {
				$('#editors').addClass('enlarged');
				$('#' + app.session.resizeTarget.id).parent().height(app.session.resizeTarget.height + e.pageY - app.session.resize);
				app.utils.updateLayout(app.editors);
			}
		},
		resizeFinalize: function () {
			if (app.session.resize) {
				if (typeof app.session.resizeTarget !== 'undefined') {
					if (typeof app.session.resizeTarget.height !== 'undefined') {
						app.session.resizeTarget.height = $('#' + app.session.resizeTarget.id).height();
					}
				}
				app.utils.updateLayout(app.editors);
				$('#editors').removeClass('enlarged');
			}
			app.session.resize = false;
		},
		toggleFullscreen: function () {
			var target = document.querySelector('#result iframe');
			app.utils.toggleFullscreenMode(target);
		},
		toggleHideEditors: function () {
			var target = document.querySelector('#result iframe');
			app.utils.toggleHideEditorsMode(target);
		},
		toggleHideResult: function () {
			var target = document.querySelector('#result iframe');
			app.utils.toggleHideResultMode(target);
		},
		editorFullscreen: function (e) {
			var target;
			if (e.container !== undefined) {
				target = $(e.container).prop('id');
			}else{
				target = $(e.currentTarget).prop('id');
				target = target.replace('-editor-fullscreen-toggle', '') + '-editor';
			}
			target = document.getElementById(target);
			app.utils.toggleFullscreenMode(target);
		},
		updateResults: function () {
			var result = app.utils.generateResult();

			var iframe = document.querySelector('#result iframe');
			$(iframe).empty();

			app.utils.consoleClear();
			app.utils.write2iframe(iframe, result);
		},
		initialize: function () {
			app.unsavedWorkLock = false;

			// TODO: remove this event after the user saves
			$(window).on('beforeunload', function (e) {
				if(app.unsavedWorkLock){
					// why this mess? read here: https://developer.mozilla.org/en-US/docs/Web/Reference/Events/beforeunload
					var msg = 'There are some unsaved changes. If you accept you will lose all your unsaved work!';
					(e || window.event).returnValue = msg;
					return msg;
				}
			});

			// TODO: do something on unload
			// $(window).on('unload', function (e) {
			// });

			this.template = _.template($('#codemagic-template').html());

			this.$el.append(this.template());

			ace.config.set('basePath', 'assets/js/ace');
			app.ace = app.ace || {};
			app.ace.emmet = ace.require('ace/ext/emmet');
			app.ace.language_tools = ace.require('ace/ext/language_tools');

			app.session = {
				html : {
					state : true,
					mode : 'html',
					content : ''
				},
				css : {
					state : true,
					mode : 'css',
					content : ''
				},
				js : {
					state : true,
					mode : 'javascript',
					content : ''
				},
				console : {
					state : false,
					content : ''
				},
				title : '',
				description : '',
				author : '',
				theme : app.utils.getSettings('theme') || 'tomorrow',
				tabSize : parseInt(app.utils.getSettings('tabSize'), 10) || 4,
				showPrintMargin : app.utils.getSettings('showPrintMargin') || false,
				wrap : app.utils.getSettings('wrap') || true,
				useWorker : true,
				fontSize : parseInt(app.utils.getSettings('fontSize'), 10) || 12,
				showInvisibles : app.utils.getSettings('showInvisibles') || false,
				behavioursEnabled : app.utils.getSettings('behavioursEnabled') || true,
				enableSnippets: app.utils.getSettings('enableSnippets') || true,
				enableLiveAutoComplete: app.utils.getSettings('enableLiveAutoComplete') || true,
				enableBasicAutocompletion: app.utils.getSettings('enableBasicAutocompletion') || true,
				useSoftTabs: app.utils.getSettings('useSoftTabs') || false,
				highlightActiveLine: app.utils.getSettings('highlightActiveLine') || false,
				enableEmmet: app.utils.getSettings('enableEmmet') || true,
				showGutter: app.utils.getSettings('showGutter') || true,
				showFoldWidgets: app.utils.getSettings('showFoldWidgets') || true,
			};

			// Manually select the selected property for the select tags because of this bug of selectize
			// TODO: find issue url and add here
			// TODO: find a way to fix this mess, either by having the selectize bug fixed, by choosing a different tool for the job or by nip-tucking it somehow
			$('.settings-option [name=theme] option').prop('selected', false);
			$('.settings-option [name=theme] option[value=' + app.session.theme + ']').prop('selected', true);

			$('.settings-option [name=fontSize] option').prop('selected', false);
			$('.settings-option [name=fontSize] option[value=' + app.session.fontSize + ']').prop('selected', true);

			$('.settings-option [name=tabSize] option').prop('selected', false);
			$('.settings-option [name=tabSize] option[value=' + app.session.tabSize + ']').prop('selected', true);

			app.editors = {};
			_.each(['html', 'css', 'js'], function(selector) {
				app.editors[selector] = ace.edit(selector + '-editor');
				app.editors[selector + 'Session'] = app.editors[selector].getSession();
				app.editors[selector + 'Session'].setMode('ace/mode/' + app.session[selector].mode);
			});

			_.each([app.editors.html, app.editors.css, app.editors.js], function(editor) {
				editor.once('change', function() {
					app.unsavedWorkLock = true;
				});

				editor.commands.removeCommand('showSettingsMenu');
				editor.commands.addCommand({
					name: 'fullscreen',
					bindKey: {
						win: 'Ctrl-Shift-F',
						mac: 'Command-Shift-F'
					},
					exec: function (e) {
						app.mvc.views.codemagicView.editorFullscreen(e);
					},
					readOnly: true
				});
				editor.commands.addCommand({
					name: 'updateResults',
					bindKey: {
						win: 'Ctrl-Enter',
						mac: 'Command-Enter'
					},
					exec: function (e) {
						app.mvc.views.codemagicView.updateResults();
					},
					readOnly: true
				});
				editor.commands.addCommand({
					name: 'toggleEditorOptions',
					bindKey: {
						win: 'Ctrl-Alt-O',
						mac: 'Command-Alt-O'
					},
					exec: function (e) {
						app.mvc.views.codemagicView.toggleTargetedEditorOptions(e);
					},
					readOnly: true
				});
				editor.setOptions({
					tabSize: app.session.tabSize,
					showPrintMargin: app.session.showPrintMargin,
					wrap: app.session.wrap,
					useWorker: app.session.useWorker,
					fontSize: app.session.fontSize,
					showInvisibles: app.session.showInvisibles,
					behavioursEnabled: app.session.behavioursEnabled,
					enableSnippets: app.session.enableSnippets,
					enableLiveAutoComplete: app.session.enableLiveAutoComplete,
					enableBasicAutocompletion: app.session.enableBasicAutocompletion,
					useSoftTabs: app.session.useSoftTabs,
					highlightActiveLine: app.session.highlightActiveLine,
					enableEmmet: app.session.enableEmmet,
					showGutter: app.session.showGutter,
					showFoldWidgets: app.session.showFoldWidgets,
				});
			});

			app.editors.htmlSession.setMode('ace/mode/' + app.session.html.mode);
			app.editors.cssSession.setMode('ace/mode/' + app.session.css.mode);
			app.editors.jsSession.setMode('ace/mode/' + app.session.js.mode);

			app.utils.setTheme(app.session.theme);

			this.toggleEditorState(['html', 'css', 'js']);

			$(".codeChoice").selectize({
				create: false
			});
			$("#settings-modal select").selectize({
				create: false
			});

			// TODO: parameterize these depending on the editor's settings
			// https://github.com/einars/js-beautify#options
			app.prettify = app.prettify || {};

			_.each(['html', 'css', 'js'], function (i) {
				app.prettify[i] = {
					'brace_style': 'collapse',
					'indent_size': 1,
					'indent_char': '\t',
					'preserve-newlines': true
				};
			});

			$.extend(app.prettify.html, {
				'max-preserve-newlines': 1,
				'wrap-line-length': 0,
				'unformatted': [],
				'indent-inner-html': true
			});

			$.extend(app.prettify.css, {
				'max-preserve-newlines': 1,
				'wrap-line-length': 0,
				'unformatted': []
			});

			$.extend(app.prettify.js, {
				'jslint_happy': true,
				'keep_array_indentation': false,
				'keep_function_indentation': false,
				'eval_code': false,
				'unescape_strings': false,
				'break_chained_methods': false
			});

			this.render();
			this.updateResults();
		},
		render: function () {
			return this;
		}
	});
});
