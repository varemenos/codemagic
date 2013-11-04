var app = app || {};

$(function () {
	'use strict';

	app.Documents = Backbone.Collection.extend({
		url: 'documents',
		model: Document
	});
});
