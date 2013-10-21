var app = app || {};

(function () {
	$(function () {
		'use strict';

		app.NewView = Backbone.View.extend({
			el: 'body',
			events : {
			},
			initialize: function () {
				this.render();
			},
			render: function () {
				this.$el.find('#container').empty();
				app.codemagicView = new app.CodemagicView();
				return this;
			}
		});
	});
})();
