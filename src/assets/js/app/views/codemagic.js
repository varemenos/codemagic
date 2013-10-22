var app = app || {};

(function () {
	$(function () {
		'use strict';

		app.CodemagicView = Backbone.View.extend({
			el: '#container',
			events : {
				'click #update': 'updateResults'
			},
			updateResults: function () {
				var content = app.editors.html.getValue();
				var style = app.editors.css.getValue();
				var script = app.editors.js.getValue();

				var head = '<!doctype html><html><head><meta charset="utf-8"><title>Title</title><meta name="description" content="Description"><meta name="author" content="Author"><style>' + style + '</style></head>';
				var body = '<body>' + content + '<script>' + script + '</script></body></html>';

				var result = head + body;

				var iframeContainer = document.getElementById('result');

				$('#result iframe').remove();

				// TODO: write the lines below in JQuery
				var iframe = document.createElement('iframe');

				iframeContainer.appendChild(iframe);

				var iDoc = iframe.contentDocument;
				iDoc.open();
				iDoc.write(result);
				iDoc.close();

				$('iframe').height(Math.max($('#editors').height(), $('iframe').height()));
			},
			initialize: function () {
				this.template = _.template($('#codemagic-template').html());
				this.render();

				// populate editors with example content
				app.editors.htmlSession.setValue('<h1>Hello World</h1>\n\n<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur, nobis, inventore, cupiditate, itaque quae quas commodi reprehenderit expedita aliquid nulla vero voluptatem esse modi quasi similique atque sequi tempore dolore ut nesciunt aliquam quidem dolorum ipsa totam eaque accusamus odit maiores fugiat incidunt iste. Itaque necessitatibus cupiditate consequatur vitae maxime.</p>');
				app.editors.cssSession.setValue('body{ margin: 0; padding: 1rem; }\n\nh1{\n	margin-top: 0;\n	color: #666;\n}\n\np{\n	color: #999;\n}');
				app.editors.jsSession.setValue('var x = document.querySelector("p");\nx.style.textAlign = "justify";');
				this.updateResults();
			},
			render: function () {
				this.$el.append(this.template());

				/* *******************************************************
					Editors
				******************************************************* */

				app.session = {
					settings : {
						fullscreen : false,
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
							content : ''
						},
						console : {
							state : false
						},
						theme : app.utils.getSettings('editor.theme') || 'tomorrow',
						tabSize : parseInt(app.utils.getSettings('editor.tabSize'), 10) || 4,
						showPrintMargin : app.utils.getSettings('editor.showPrintMargin') || false,
						useWrapMode : app.utils.getSettings('editor.useWrapMode') || true,
						useWorker : true,
						fontSize : parseInt(app.utils.getSettings('editor.fontSize'), 10) || 12,
						showInvisibles : app.utils.getSettings('editor.showInvisibles') || false,
						behavioursEnabled : app.utils.getSettings('editor.behavioursEnabled') || true
					},
					authenticate : {
						endpoint : 'https://accounts.google.com/o/oauth2/auth',
						response_type : 'token',
						client_id : '1785061010-1osqu1jsk03f033ehv2268jjtiung7h8.apps.googleusercontent.com',
						redirect_uri : 'http://codemagic.gr',
						scope : [
							'https://www.googleapis.com/auth/userinfo.profile',
							'https://www.googleapis.com/auth/drive'
						],
						state : '?auth',
						approval_prompt : 'auto'
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

				ace.require("ace/ext/emmet");
				ace.require("ace/ext/language_tools");

				_.each([app.editors.html, app.editors.css, app.editors.js], function(item) {
					item.setOptions({
						enableSnippets: true,
						enableLiveAutoComplete: true,
						enableBasicAutocompletion: true,
						showPrintMargin: app.session.settings.showPrintMargin,
						useSoftTabs: false,
						fontSize: app.session.settings.fontSize,
						showInvisibles: app.session.settings.showInvisibles,
						behavioursEnabled: app.session.settings.behavioursEnabled,
						tabSize: app.session.settings.tabSize,
						wrap: app.session.settings.useWrapMode,
						useWorker: app.session.settings.useWorker,
						highlightActiveLine: false,
						enableEmmet: true
					});
				});

				// editor syntax highlighting modes
				app.editors.htmlSession.setMode('ace/mode/' + app.session.settings.html.mode);
				app.editors.cssSession.setMode('ace/mode/' + app.session.settings.css.mode);
				app.editors.jsSession.setMode('ace/mode/javascript');

				// set the Default theme
				app.utils.setTheme(app.editors, app.session.settings.theme);

				return this;
			}
		});
	});
})();
