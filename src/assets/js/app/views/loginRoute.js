var app = app || {};

$(function () {
	'use strict';

	app.LoginView = Backbone.View.extend({
		el: '#container',
		events : {
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			this.template = _.template($('#login-template').html());

			this.$el.append(this.template());
			return this;
		}
	});
});
