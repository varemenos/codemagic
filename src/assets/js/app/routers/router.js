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
			app.currentPage = 'login';
			app.headerView = new app.HeaderView({page: 'login'});
			app.loginView = new app.LoginView();
		},
		information: function (){
			app.currentPage = 'information';
			app.headerView = new app.HeaderView({page: 'information'});
			app.informationView = new app.InformationView();
		},
		about: function (){
			app.currentPage = 'about';
			app.headerView = new app.HeaderView({page: 'about'});
			app.aboutView = new app.AboutView();
		},
		new: function (){
			app.currentPage = 'new';
			app.headerView = new app.HeaderView({page: 'codemagic'});
			app.newView = new app.NewView();
		}
	});
});
