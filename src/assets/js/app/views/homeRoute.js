$(function () {
	'use strict';

	app.mvc.views.HomeView = Backbone.View.extend({
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
