var app = app || {};

(function () {
	$(function () {
		'use strict';

		app.title = "Hello Warl";

		app.router = new app.AppRouter();
		Backbone.history.start();
	});
})();
