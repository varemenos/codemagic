var app = app || {};

$(function () {
	'use strict';

	app.CodemagicView = Backbone.View.extend({
		el: '#container',
		events : {
			'click #update': 'updateResults',
			'click #prettify': 'prettify',
			'click #fullscreen': 'toggleFullscreen',
			'click #wide': 'toggleWidescreen',
			'click .editor-fullscreen-toggle': 'editorFullscreen',
			'mousedown .resizer': 'resizeInitialize',
			'mouseup': 'resizeFinalize',
			'mousemove': 'resizeRefresh',
			'click .editor-options-toggle': 'toggleTargetedEditorOptions',
			'change .codeChoice': 'toggleSelectedEditorOptions',
			'click .editor-toggle': 'toggleEditorState'
		},
		prettify: function () {
			// TODO: parameterize these depending on the editor's settings
			// https://github.com/einars/js-beautify#options
			if ($('#markupChoice').val() === 'HTML') {
				app.editors.htmlSession.setValue(html_beautify(app.editors.htmlSession.getValue(), {
					'brace_style': 'collapse',
					'indent_size': 1,
					'indent_char': '\t',
					'preserve-newlines': true,
					'max-preserve-newlines': 1,
					'wrap-line-length': 0,
					'unformatted': [],
					'indent-inner-html': true
				}));

				app.editors.htmlSession.selection.moveCursorFileStart();
			}

			if ($('#styleChoice').val() === 'CSS') {
				app.editors.cssSession.setValue(css_beautify(app.editors.cssSession.getValue(), {
					'brace_style': 'collapse',
					'indent_size': 1,
					'indent_char': '\t',
					'preserve-newlines': true,
					'max-preserve-newlines': 1,
					'wrap-line-length': 0,
					'unformatted': []
				}));

				app.editors.cssSession.selection.moveCursorFileStart();
			}

			if ($('#scriptChoice').val() === 'JavaScript') {
				app.editors.jsSession.setValue(js_beautify(app.editors.jsSession.getValue(), {
					'indent_size': 1,
					'indent_char': '\t',
					'preserve_newlines': true,
					'jslint_happy': true,
					'brace_style': 'collapse',
					'keep_array_indentation': false,
					'keep_function_indentation': false,
					'eval_code': false,
					'unescape_strings': false,
					'break_chained_methods': false
				}));

				app.editors.jsSession.selection.moveCursorFileStart();
			}
		},
		toggleEditorState: function (selector) {
			var target;
			if(selector instanceof Array){
				for (var i = 0; i < selector.length; i++) {
					$(selector[i]).toggleClass('enabled');
					$('#' + selector[i] + '-editor').closest('.editor-module').toggleClass('enabled');
					$('#' + selector[i] + '-editor-toggle').toggleClass('enabled');
				}
				target = false;
			}else if(typeof selector === 'object'){
				target = $(selector.currentTarget).prop('id').replace('-editor-toggle', '');
			} else {
				target = selector;
			}

			if(target !== false){
				$('#' + target + '-editor-toggle').toggleClass('enabled');
				$('#' + target + '-editor').closest('.editor-module').toggleClass('enabled');
				app.utils.toggleEditorState(target);
			}
		},
		toggleSelectedEditorOptions: function (e) {
			var value = $(e.currentTarget).val();
			var editorTarget = $(e.currentTarget).parent();
			var target = editorTarget.parent().find('.editor-option-title');
			$(target).html(value);
			this.toggleTargetedEditorOptions(e);
			app.utils.setEditorMode(editorTarget.prop('id').replace('-editor-options', ''), value.toLowerCase());
		},
		toggleTargetedEditorOptions: function (e) {
			if($(e.currentTarget).prop('tagName') === 'SELECT'){
				this.toggleEditorOptions($(e.currentTarget).parent());
			} else if(e.container !== undefined){
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
			app.session.resizeTarget.id = $(e.currentTarget).prev().find('.editor');
			app.session.resizeTarget.id = app.session.resizeTarget.id.prop('id');
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
				if(typeof app.session.resizeTarget !== 'undefined'){
					if(typeof app.session.resizeTarget.height !== 'undefined'){
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
		toggleWidescreen: function () {
			var target = document.querySelector('#result iframe');
			app.utils.toggleWidescreenMode(target);
		},
		editorFullscreen: function (e) {
			var target;
			if(e.container !== undefined){
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
			this.template = _.template($('#codemagic-template').html());

			this.$el.append(this.template());

			ace.config.set('basePath', 'assets/js/ace');
			app.ace = app.ace || {};
			app.ace.emmet = ace.require('ace/ext/emmet');
			app.ace.language_tools = ace.require('ace/ext/language_tools');

			app.session = {
				settings : {
					title : 'codeMagic',
					description : '',
					author : '',
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
					theme : app.utils.getSettings('editor.theme') || 'tomorrow',
					tabSize : parseInt(app.utils.getSettings('editor.tabSize'), 10) || 4,
					showPrintMargin : app.utils.getSettings('editor.showPrintMargin') || false,
					useWrapMode : app.utils.getSettings('editor.useWrapMode') || true,
					useWorker : true,
					fontSize : parseInt(app.utils.getSettings('editor.fontSize'), 10) || 12,
					showInvisibles : app.utils.getSettings('editor.showInvisibles') || false,
					behavioursEnabled : app.utils.getSettings('editor.behavioursEnabled') || true
				}
			};

			app.utils.setSettings('editor.theme', app.session.settings.theme);
			app.utils.setSettings('editor.tabSize', app.session.settings.tabSize);
			app.utils.setSettings('editor.showPrintMargin', app.session.settings.showPrintMargin);
			app.utils.setSettings('editor.useWrapMode', app.session.settings.useWrapMode);
			app.utils.setSettings('editor.useWorker', app.session.settings.useWorker);
			app.utils.setSettings('editor.fontSize', app.session.settings.fontSize);
			app.utils.setSettings('editor.showInvisibles', app.session.settings.showInvisibles);
			app.utils.setSettings('editor.behavioursEnabled', app.session.settings.behavioursEnabled);

			app.editors = {};
			app.editors.html = ace.edit('html-editor');
			app.editors.css = ace.edit('css-editor');
			app.editors.js = ace.edit('js-editor');
			app.editors.htmlSession = app.editors.html.getSession();
			app.editors.cssSession = app.editors.css.getSession();
			app.editors.jsSession = app.editors.js.getSession();
			app.editors.htmlSession.setMode('ace/mode/' + app.session.settings.html.mode);
			app.editors.cssSession.setMode('ace/mode/' + app.session.settings.css.mode);
			app.editors.jsSession.setMode('ace/mode/' + app.session.settings.js.mode);

			_.each([app.editors.html, app.editors.css, app.editors.js], function(editor) {
				editor.commands.removeCommand('showSettingsMenu');
				editor.commands.addCommand({
					name: 'fullscreen',
					bindKey: {
						win: 'Ctrl-Shift-F',
						mac: 'Command-Shift-F'
					},
					exec: function (e) {
						app.codemagicView.editorFullscreen(e);
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
						app.codemagicView.updateResults();
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
						app.codemagicView.toggleTargetedEditorOptions(e);
					},
					readOnly: true
				});
				editor.setOptions({
					// TODO: give the user the option to toggle these via the settings
					enableSnippets: true,
					enableLiveAutoComplete: true,
					enableBasicAutocompletion: true,
					useSoftTabs: false,
					highlightActiveLine: false,
					enableEmmet: true,
					fontSize: app.session.settings.fontSize,
					showPrintMargin: app.session.settings.showPrintMargin,
					showInvisibles: app.session.settings.showInvisibles,
					behavioursEnabled: app.session.settings.behavioursEnabled,
					tabSize: app.session.settings.tabSize,
					wrap: app.session.settings.useWrapMode,
					useWorker: app.session.settings.useWorker
				});
			});

			app.editors.htmlSession.setMode('ace/mode/' + app.session.settings.html.mode);
			app.editors.cssSession.setMode('ace/mode/' + app.session.settings.css.mode);
			app.editors.jsSession.setMode('ace/mode/' + app.session.settings.js.mode);

			app.utils.setTheme(app.editors, app.session.settings.theme);

			this.toggleEditorState(['html', 'css', 'js']);

			this.render();
			this.updateResults();
		},
		render: function () {
			return this;
		}
	});
});
