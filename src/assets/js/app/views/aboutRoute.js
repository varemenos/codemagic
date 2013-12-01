$(function () {
	'use strict';

	app.mvc.views.AboutView = Backbone.View.extend({
		el: '#container',
		events : {
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			this.template = _.template($('#about-template').html());

			this.$el.append(this.template());
			return this;
		}
	});
});
