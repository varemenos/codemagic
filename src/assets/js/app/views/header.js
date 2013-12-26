$(function () {
	'use strict';

	app.mvc.views.HeaderView = Backbone.View.extend({
		el: '#container',
		events: {
			// 'click .navigating-btn': 'navigate'
		},
		navigate: function (e) {
			// TODO: validate id
			// var id = $(e.currentTarget).prop('id');
			// app.mvc.router.navigate(id, {trigger: true});
		},
		initialize: function (params) {
			this.render(params);
		},
		render: function (params) {
			this.$el.empty().unbind();
			this.template = _.template($('#header-template').html());

			this.$el.append(this.template({page: params.page}));
		}
	});
});
