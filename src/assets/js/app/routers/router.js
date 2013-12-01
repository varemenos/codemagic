$(function () {
	'use strict';

	app.mvc.routes.AppRouter = Backbone.Router.extend({
		routes: {
			'': 'new',
			'new': 'new',
			'new/': 'new',
			'home': 'home',
			'home/': 'home',
			'about': 'about',
			'about/': 'about',
			'login': 'login',
			'login/': 'login',
			'information': 'information',
			'information/': 'information',
		},
		home: function (){
			app.mvc.currentPage = 'home';
			app.mvc.views.headerView = new app.mvc.views.HeaderView({page: 'home'});
			app.mvc.views.loginView = new app.mvc.views.HomeView();
		},
		login: function (){
			app.mvc.currentPage = 'login';
			app.mvc.views.headerView = new app.mvc.views.HeaderView({page: 'login'});
			app.mvc.views.loginView = new app.mvc.views.LoginView();
		},
		information: function (){
			app.mvc.currentPage = 'information';
			app.mvc.views.headerView = new app.mvc.views.HeaderView({page: 'information'});
			app.mvc.views.informationView = new app.mvc.views.InformationView();
		},
		about: function (){
			app.mvc.currentPage = 'about';
			app.mvc.views.headerView = new app.mvc.views.HeaderView({page: 'about'});
			app.mvc.views.aboutView = new app.mvc.views.AboutView();
		},
		new: function (){
			app.mvc.currentPage = 'new';
			app.mvc.views.headerView = new app.mvc.views.HeaderView({page: 'codemagic'});
			app.mvc.views.newView = new app.mvc.views.NewView();
		}
	});
});
