/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
		banner: '/*!\n' +
		' * pbjs JavaScript Framework v<%= pkg.version %>\n' +
		' * http://saartje87.github.com/pbjs\n' +
		' *\n' +
		' * Includes Qwery\n' +
		' * https://github.com/ded/qwery\n' +
		' *\n' +
		' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
        ' * Licensed <%= pkg.license %>\n' +
		' *\n' +
		' * Build date <%= grunt.template.today("yyyy-mm-dd HH:MM") %>\n' +
		' */'
    },
	concat: {
		dist: {
			src: ['<banner>', 'src/intro.js',

        // Core
        'src/core/utils.js', 'src/core/class.js',
        
        // Patterns
        'src/patterns/observer.js',
        'src/patterns/queue.js',

        // $ DOM
        'src/$/core.js', 'src/$/utils.js', 'src/$/hooks.js',
        'src/$/style.js', 'src/$/morph.js', 'src/$/manipulation.js',
        'src/$/layout.js',
        'src/$/stuff.js',
        'src/$/traversal.js',
        'src/$/event.js',
        'src/$/buildfragment.js',
        'src/$/selector.js',
        'src/$/enumerable.js',

        'src/$/legacy.js',
        
        // Request
        'src/request/request.js', 'src/request/utils.js',

        // JSON

        // String

        // Outro
				'src/outro.js',

        // Qwery (submodule)
        'vendor/qwery/qwery.js',
        'src/$/selector.js'
      ],
			dest: 'dist/pbjs.js'
		}
	},
	min: {
      dist: {	
		src: [ "<banner>", "dist/pbjs.js" ],
		dest: "dist/pbjs.min.js"
    //    src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
     //   dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    lint: {
		grunt: "grunt.js"

// How does this work >< is does lint before concating the files..
//		dist: "dist/pbjs.js"
//		['src/*.js'],
//		dist: "dist/pbjs.js",
//		grunt: "grunt.js"
//		tests: "test/unit/**/*.js"
	},
    qunit: {
      files: ['test/**/*.html']
    },
    // concat: {
    //   dist: {
    //     src: ['<banner:meta.banner>', '<file_strip_banner:src/<%= pkg.name %>.js>'],
    //     dest: 'dist/<%= pkg.name %>.js'
    //   }
    // },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {}
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');

};
