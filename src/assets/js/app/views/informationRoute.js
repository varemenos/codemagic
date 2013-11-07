var app = app || {};

$(function () {
	'use strict';

	app.InformationView = Backbone.View.extend({
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
