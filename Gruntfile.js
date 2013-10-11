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
			dev: 'dev/<%= vars.version %>',
			dist: 'dist/<%= vars.version %>'
		},
		copy: {
			dev: {
				files: [{
					expand: true,
					cwd: '<%= dirs.src %>/',
					src: ['**'],
					dest: '<%= dirs.dev %>/'
				}]
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= dirs.src %>/',
					src: ['**'],
					dest: '<%= dirs.dist %>/'
				}]
			}
		},
		concat: {
			options: {
				seperator: ';',
			},
			dev: {
				src: [
					'<%= dirs.dev %>/<%= dirs.js %>/script.js'
				],
				dest: '<%= dirs.dev %>/<%= dirs.js %>/script-<%= vars.version %>.js'
			},
			dist: {
				src: [
					'<%= dirs.dist %>/<%= dirs.js %>/script.js'
				],
				dest: '<%= dirs.dist %>/<%= dirs.js %>/script-<%= vars.version %>.js'
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
					cwd: '<%= dirs.dev %>/<%= dirs.css %>/',
					src: '*.scss',
					dest: '<%= dirs.dev %>/<%= dirs.css %>/',
					ext: '-<%= vars.version %>.css'
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
					cwd: '<%= dirs.dist %>/<%= dirs.css %>/',
					src: '*.scss',
					dest: '<%= dirs.dist %>/<%= dirs.css %>/',
					ext: '-<%= vars.version %>.min.css'
				}]
			}
		},
		clean: {
			dev: ['<%= dirs.dev %>/'],
			dist: ['<%= dirs.dist %>/'],
			devCleanup: [
				'<%= dirs.dev %>/<%= dirs.css %>/lib',
				'<%= dirs.dev %>/<%= dirs.css %>/style.scss',
				'<%= dirs.dev %>/<%= dirs.js %>/backbone.js',
				'<%= dirs.dev %>/<%= dirs.js %>/jquery.js',
				'<%= dirs.dev %>/<%= dirs.js %>/underscore.js',
				'<%= dirs.dev %>/<%= dirs.js %>/main.js',
				'<%= dirs.dev %>/index.html.tpl'
			],
			distCleanup: [
				'<%= dirs.dist %>/<%= dirs.css %>/lib',
				'<%= dirs.dist %>/<%= dirs.css %>/style.scss',
				'<%= dirs.dist %>/<%= dirs.js %>/backbone.js',
				'<%= dirs.dist %>/<%= dirs.js %>/jquery.js',
				'<%= dirs.dist %>/<%= dirs.js %>/underscore.js',
				'<%= dirs.dist %>/<%= dirs.js %>/main.js',
				'<%= dirs.dist %>/<%= dirs.js %>/script-<%= vars.version %>.js',
				'<%= dirs.dist %>/index.html.tpl'
			]
		},
		uglify: {
			options: {},
			dist: {
				files: {
					'<%= dirs.dist %>/<%= dirs.js %>/script-<%= vars.version %>.min.js': ['<%= dirs.dist %>/<%= dirs.js %>/script-<%= vars.version %>.js']
				}
			}
		},
		template: {
			dev: {
				options: {
					data: {
						version: '<%= vars.version %>',
						type: '',
						env: 'dev'
					}
				},
				files: {
					'<%= dirs.dev %>/index.html': ['<%= dirs.src %>/index.html.tpl']
				}
			},
			dist: {
				options: {
					data: {
						version: '<%= vars.version %>',
						type: '.min',
						env: 'dist'
					}
				},
				files: {
					'<%= dirs.dist %>/index.html': ['<%= dirs.src %>/index.html.tpl']
				}
			}
		},
		watch: {
			options: {
				livereload: true
			},
			dev: {
				files: ['<%= dirs.src =>/<%= css %>/*.scss'],
				tasks : ['sass:dev']
			},
			dist: {
				files: ['<%= dirs.src =>/<%= css %>/*.scss'],
				tasks : ['sass:dist']
			}
		}
	});

	// load tasks
	grunt.loadNpmTasks('grunt-template');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// default task
	grunt.registerTask('dev',['clean:dev', 'copy:dev', 'concat:dev', 'sass:dev', 'template:dev', 'clean:devCleanup']);
	grunt.registerTask('dist', ['clean:dist', 'copy:dist', 'concat:dist', 'sass:dist', 'uglify:dist', 'template:dist', 'clean:distCleanup']);
	grunt.registerTask('default', ['dev']);
};
