module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		vars: {
			version: '<%= grunt.template.today("yyyy.mm.dd-HH.MM") %>'
		},
		dirs: {
			src: 'src',
			css: 'assets/css',
			js: 'assets/js',
			build: 'build'
		},
		copy: {
			build: {
				files: [{
					expand: true,
					cwd: '<%= dirs.src %>/',
					src: ['**'],
					dest: '<%= dirs.build %>/'
				}]
			}
		},
		concat: {
			options: {
				seperator: ';',
			},
			build: {
				src: [
					'<%= dirs.build %>/<%= dirs.js %>/libs/jquery.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/underscore.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/backbone.js',
					'<%= dirs.build %>/<%= dirs.js %>/libs/emmet.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/utils.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/routers/router.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/views/header.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/views/codemagic.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/views/new.js',
					'<%= dirs.build %>/<%= dirs.js %>/app/main.js'
				],
				dest: '<%= dirs.build %>/<%= dirs.js %>/script.js'
			}
		},
		sass: {
			options: {
					unixNewlines: true
			},
			dev: {
				options: {
					// sourcemap: true,
					style: 'expanded'
				},
				files: [{
					expand: true,
					cwd: '<%= dirs.build %>/<%= dirs.css %>/',
					src: '*.scss',
					dest: '<%= dirs.build %>/<%= dirs.css %>/',
					ext: '.css'
				}]
			},
			dist: {
				options: {
					// sourcemap: false,
					style: 'compressed',
					banner: "By Adonis K.\n%TODO%"
				},
				files: [{
					expand: true,
					cwd: '<%= dirs.build %>/<%= dirs.css %>/',
					src: '*.scss',
					dest: '<%= dirs.build %>/<%= dirs.css %>/',
					ext: '.css'
				}]
			}
		},
		clean: {
			build: ['<%= dirs.build %>/'],
			buildCleanup: [
				'<%= dirs.build %>/<%= dirs.css %>/lib',
				'<%= dirs.build %>/<%= dirs.css %>/style.scss',
				'<%= dirs.build %>/<%= dirs.js %>/app',
				'<%= dirs.build %>/<%= dirs.js %>/libs',
				'<%= dirs.build %>/index.html.tpl'
			]
		},
		uglify: {
			options: {},
			build: {
				files: {
					'<%= dirs.build %>/<%= dirs.js %>/script.min.js': ['<%= dirs.build %>/<%= dirs.js %>/script.js']
				}
			}
		},
		watch: {
			options: {
				livereload: true
			},
			files: {
				files: ['<%= dirs.src %>/**/**.*'],
				tasks : ['dev']
			}
		},
		connect: {
			server: {
				options: {
					port: 80,
					base: './build',
					hostname: '*',
					keepalive: true,
					livereload: true,
					open: 'http://localhost'
				}
			}
		}
	});

	// load tasks
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-devtools');

	// default task
	grunt.registerTask('dev',['clean:build', 'copy:build', 'concat:build', 'sass:dev', 'clean:buildCleanup']);
	grunt.registerTask('dist', ['clean:build', 'copy:build', 'concat:build', 'sass:dist', 'uglify:build', 'clean:buildCleanup']);
	grunt.registerTask('default', ['watch:files']);
};
