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
		},
		about: function (){
			app.aboutView = new app.AboutView();
		},
		new: function (){
			app.newView = new app.NewView();
		}
	});
});
