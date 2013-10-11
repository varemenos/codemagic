<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Title</title>
		<meta name="description" content="">
		<meta author="Adonis K." content="http://varemenos.com">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<link rel="stylesheet" href="assets/css/style-<%- version %><%- type %>.css">
	</head>
	<body>
		<script src="assets/js/script-<%- version %><%- type %>.js"></script>
		<% if ( env === "dist" ){ %>
		<script>
			(function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
			e=o.createElement(i);r=o.getElementsByTagName(i)[0];
			e.src='//www.google-analytics.com/analytics.js';
			r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
			ga('create','UA-IDIDID-ID');ga('send','pageview');
		</script>
		<% } %>
	</body>
</html>
