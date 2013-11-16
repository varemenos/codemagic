var app = app || {};

$(function () {
	'use strict';

	app.HomeView = Backbone.View.extend({
		el: '#container',
		events : {
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			this.template = _.template($('#home-template').html());

			this.$el.append(this.template());
			return this;
		}
	});
});
