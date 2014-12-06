$(function () {
	'use strict';

	app.mvc.views.CodemagicView = Backbone.View.extend({
		el: '#container',
		events: {
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
			'ifChanged .settings-option-checkbox input[type=checkbox]': 'updateSettings',
			'change .settings-option-textarea textarea': 'updateSettings',
			'change .settings-option-select select': 'updateSettings',
			'ifToggled .settings-option-autoprefixer > div': 'toggleAutoprefixer',
		},
		rememberSettings: function () {
			var settings = app.utils.getAllSettings();

			_.each(settings, function (value, setting) {
				app.utils.setSettings(setting, value);
			});
		},
		setDefaultSettings: function () {
			var defaults = [
				{
					name: 'title',
					value: ''
				}, {
					name: 'description',
					value: ''
				}, {
					name: 'author',
					value: ''
				}, {
					name: 'theme',
					value: 'monokai'
				}, {
					name: 'tabSize',
					value: 4
				}, {
					name: 'showPrintMargin',
					value: false
				}, {
					name: 'wrap',
					value: true
				}, {
					name: 'useWorker',
					value: true
				}, {
					name: 'fontSize',
					value: 12
				}, {
					name: 'showInvisibles',
					value: false
				}, {
					name: 'behavioursEnabled',
					value: true
				}, {
					name: 'enableSnippets',
					value: true
				}, {
					name: 'enableLiveAutocompletion',
					value: false
				}, {
					name: 'enableBasicAutocompletion',
					value: true
				}, {
					name: 'useSoftTabs',
					value: false
				}, {
					name: 'highlightActiveLine',
					value: false
				}, {
					name: 'enableEmmet',
					value: true
				}, {
					name: 'showGutter',
					value: true
				}, {
					name: 'showFoldWidgets',
					value: true
				}
			];

			_.each(defaults, function (setting) {
				if (app.utils.getSettings(setting.name) === null) {
					app.utils.setSettings(setting.name, setting.value);
				}
			});
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
				'enableLiveAutocompletion',
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
			} else if (targetName === 'keybinding') {
				result = target.val();

				if (result === 'default') {
					result = null;
				} else {
					result = 'ace/keyboard/' + result;
				}

				_.each([app.editors.html, app.editors.css, app.editors.js], function(editor) {
					editor.setKeyboardHandler(result);
				});
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
					throw new Error("unknown target at updateSettings()");
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
			_.each(['html', 'css', 'js'], function (i) {
				app.prettify[i] = {
					'indent_size': app.utils.tabsOrSpaces('size'),
					'indent_char': app.utils.tabsOrSpaces('char'),
				};
			});

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
		toggleAutoprefixer: function () {
			app.session.css.autoprefixer = !$('.settings-option-autoprefixer > div').hasClass('checked');
		},
		resizeInitialize: function (e) {
			app.lock.editorResize = true;

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
			if ($('#result').hasClass('hideResult')) {
				app.utils.toggleHideResultMode();
			}
			app.utils.toggleFullscreenMode(target, function () {
				app.utils.resizeEditors();
			});
		},
		toggleHideEditors: function () {
			app.utils.toggleHideEditorsMode(function () {
				app.utils.resizeEditors();
			});
		},
		toggleHideResult: function () {
			app.utils.toggleHideResultMode(function () {
				app.utils.resizeEditors();
			});
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

			var iframeContainer = $('#result');
			iframeContainer.html('<iframe name="codeMagic result" allowfullscreen="true" seamless></iframe>');

			var iframe = document.querySelector('#result iframe');

			app.utils.write2iframe(iframe, result);
		},
		initialize: function () {
			this.template = _.template($('#codemagic-template').html());

			this.$el.append(this.template());

			app.lock.unsavedWork = false;

			// TODO: remove this event after the user saves
			$(window).on('beforeunload', function (e) {
				if(app.lock.unsavedWork){
					// why this mess? read here: https://developer.mozilla.org/en-US/docs/Web/Reference/Events/beforeunload
					var msg = 'There are some unsaved changes. If you accept you will lose all your unsaved work!';
					(e || window.event).returnValue = msg;
					return msg;
				}
			});

			// TODO: do something on unload
			// $(window).on('unload', function (e) {
			// });

			ace.config.set('basePath', 'assets/js/ace');
			app.ace = app.ace || {};
			app.ace.emmet = ace.require('ace/ext/emmet');
			app.ace.language_tools = ace.require('ace/ext/language_tools');

			app.session = {
				html: {
					state: true,
					mode: 'html',
					content: ''
				},
				css: {
					state: true,
					mode: 'css',
					content: '',
					autoprefixer: true
				},
				js: {
					state: true,
					mode: 'javascript',
					content: ''
				},
				console: {
					state: false,
					content: ''
				}
			};

			this.rememberSettings();
			this.setDefaultSettings();

			// Manually select the selected property for the select tags because of this bug of selectize
			// TODO: find issue url and add here
			// TODO: find a way to fix this mess, either by having the selectize bug fixed, by choosing a different tool for the job or by nip-tucking it somehow
			$('#settings-modal .settings-option-select [name=theme] option').prop('selected', false);
			$('#settings-modal .settings-option-select [name=theme] option[value=' + app.session.theme + ']').prop('selected', true);

			$('#settings-modal .settings-option-select [name=fontSize] option').prop('selected', false);
			$('#settings-modal .settings-option-select [name=fontSize] option[value=' + app.session.fontSize + ']').prop('selected', true);

			$('#settings-modal .settings-option-select [name=tabSize] option').prop('selected', false);
			$('#settings-modal .settings-option-select [name=tabSize] option[value=' + app.session.tabSize + ']').prop('selected', true);

			_.each($('#settings-modal .settings-option-checkbox input'), function (checkbox) {
				var name = checkbox.name;

				// TODO: find a better way to parse the value inside the if() below
				if (app.utils.normalizeValue(app.session[name])) {
					$(checkbox).iCheck('check');
				} else {
					$(checkbox).iCheck('uncheck');
				}
			});

			app.editors = {};
			_.each(['html', 'css', 'js'], function(selector) {
				app.editors[selector] = ace.edit(selector + '-editor');
				app.editors[selector + 'Session'] = app.editors[selector].getSession();
				app.editors[selector + 'Session'].setMode('ace/mode/' + app.session[selector].mode);
			});

			_.each([app.editors.html, app.editors.css, app.editors.js], function(editor) {
				editor.once('change', function() {
					app.lock.unsavedWork = true;
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
					tabSize: app.utils.getSettings('tabSize'),
					showPrintMargin: app.utils.getSettings('showPrintMargin'),
					wrap: app.utils.getSettings('wrap'),
					useWorker: app.utils.getSettings('useWorker'),
					fontSize: app.utils.getSettings('fontSize'),
					showInvisibles: app.utils.getSettings('showInvisibles'),
					behavioursEnabled: app.utils.getSettings('behavioursEnabled'),
					enableSnippets: app.utils.getSettings('enableSnippets'),
					enableLiveAutocompletion: app.utils.getSettings('enableLiveAutocompletion'),
					enableBasicAutocompletion: app.utils.getSettings('enableBasicAutocompletion'),
					useSoftTabs: app.utils.getSettings('useSoftTabs'),
					highlightActiveLine: app.utils.getSettings('highlightActiveLine'),
					enableEmmet: app.utils.getSettings('enableEmmet'),
					showGutter: app.utils.getSettings('showGutter'),
					showFoldWidgets: app.utils.getSettings('showFoldWidgets'),
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
			$(".settings-option-select select").selectize({
				create: false
			});

			$('.settings-option-checkbox').iCheck({
				checkboxClass: 'icheckbox_square-blue',
				handle: 'checkbox',
			});

			// TODO: parameterize these depending on the editor's settings
			// https://github.com/einars/js-beautify#options
			app.prettify = app.prettify || {};

			_.each(['html', 'css', 'js'], function (i) {
				app.prettify[i] = {
					'brace_style': 'collapse',
					'indent_size': app.utils.tabsOrSpaces('size'),
					'indent_char': app.utils.tabsOrSpaces('char'),
					'preserve-newlines': true,
				};
			});

			$.extend(app.prettify.html, {
				'max-preserve-newlines': 1,
				'wrap-line-length': 0,
				'unformatted': [],
				'indent-inner-html': true,
			});

			$.extend(app.prettify.css, {
				'max-preserve-newlines': 1,
				'wrap-line-length': 0,
				'unformatted': [],
			});

			$.extend(app.prettify.js, {
				'keep_array_indentation': false,
				'keep_function_indentation': false,
				'eval_code': false,
				'unescape_strings': false,
				'break_chained_methods': false,
				'space_before_conditional': true,
			});

			this.render();
			this.updateResults();

			app.utils.updateLibraries();
		},
		render: function () {
			return this;
		}
	});
});
