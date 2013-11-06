var app = app || {};

$(function () {
	'use strict';

	app.AppRouter = Backbone.Router.extend({
		routes: {
			'': 'new',
			'new': 'new',
			'new/': 'new',
			'about': 'about',
			'about/': 'about',
			'login': 'login',
			'login/': 'login',
			'information': 'information',
			'information/': 'information',
		},
		login: function (){
			app.loginView = new app.LoginView();
		},
		information: function (){
			app.informationView = new app.InformationView();
		},
		about: function (){
			app.aboutView = new app.AboutView();
		},
		new: function (){
			app.newView = new app.NewView();
		}
	});
});
