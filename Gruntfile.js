module.exports = function(grunt) {
  // 以下代码初始化Grunt任务
  grunt.initConfig({
    // js语法检查
    jshint: {
        src: ['Gruntfile.js', 'content_scripts/*.js'],
        ignore_warning: {
            options: {
                '-W061': true
            }
        },
    },
    watch: {
        scripts: {
            files: ['**/*.js'],
            tasks: ['jshint'],
            options: {
                spawn: false,
            },
        },
    },
  });
 
  // 加载package.json中的想用插件
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
 
  // 注册一个任务，第二参数可以是数组或者字符串
  // 默认会执行default任务.
  grunt.registerTask('default', ['watch']);

};
