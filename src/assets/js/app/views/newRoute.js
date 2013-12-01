$(function () {
	'use strict';

	app.mvc.views.NewView = Backbone.View.extend({
		el: '#container',
		events : {
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			app.mvc.views.codemagicView = new app.mvc.views.CodemagicView();
			return this;
		}
	});
});
