var app = app || {};

$(function () {
	'use strict';

	app.AboutView = Backbone.View.extend({
		el: '#container',
		events : {
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			this.$el.empty();
			this.headerTemplate = _.template($('#header-template').html());

			this.$el.append(this.headerTemplate());
			return this;
		}
	});
});
