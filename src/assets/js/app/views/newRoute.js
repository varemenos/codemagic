var app = app || {};

$(function () {
	'use strict';

	app.NewView = Backbone.View.extend({
		el: '#container',
		events : {
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			app.codemagicView = new app.CodemagicView();
			return this;
		}
	});
});
