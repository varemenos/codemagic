var app = app || {};

$(function () {
	'use strict';

	app.HeaderView = Backbone.View.extend({
		el: '#container',
		events: {
			'click .navigating-btn': 'navigate',
		},
		navigate: function (e) {
			// TODO: validate id
			var id = $(e.currentTarget).prop('id');
			app.router.navigate(id, {trigger: true});
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			this.$el.empty();
			this.template = _.template($('#header-template').html());

			this.$el.append(this.template());
		}
	});
});
