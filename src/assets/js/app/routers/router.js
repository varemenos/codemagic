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
			'ghauth': 'ghauth',
			'ghauth/': 'ghauth',
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
		ghauth: function (){
			var state = localStorage.getItem('codemagic.auth.state');
			localStorage.removeItem('codemagic.auth.state');

			$.ajax({
				crossDomain:true,
				dataType: "json",
				headers: {
					'Accept': 'application/json'
				},
				url: ':8000/ghauth',
				data: {
					'client_id': 'dda706afb25722f3f8a1',
					'code': app.utils.getParams().code,
					'redirect_uri': 'http://codemagic.gr/#/ghauth/',
					'state': state
				},
				success: function (data, status, jqxhr) {
					console.log(data, status, jqxhr);
					// var access_token = localStorage.setItem('access_token');
				}
			});
		},
		new: function (){
			app.mvc.currentPage = 'new';
			app.mvc.views.headerView = new app.mvc.views.HeaderView({page: 'codemagic'});
			app.mvc.views.newView = new app.mvc.views.NewView();
		}
	});
});
