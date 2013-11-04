var app = app || {};

$(function () {
	'use strict';

	app.DocumentList = Backbone.Collection.extend({
		model: Document
	});
});
