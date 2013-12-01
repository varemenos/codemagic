$(function () {
	'use strict';

	app.mvc.collections.Documents = Backbone.Collection.extend({
		url: 'documents',
		model: Document
	});
});
