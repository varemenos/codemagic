$(function () {
	'use strict';

	app.mvc.views.InformationView = Backbone.View.extend({
		el: '#container',
		events : {
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			this.template = _.template($('#information-template').html());

			this.$el.append(this.template());
			return this;
		}
	});
});
