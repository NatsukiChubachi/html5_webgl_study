

// Gruntfile.js
module.exports = function(grunt) {

  // タスクの設定
  grunt.initConfig({
    uglify: {
      options: {
        mangle: true,
        compress: true
      },
      osgjsviewer: { 
        src : [
          'js/osgjsviewer/geopos.js',
          'js/osgjsviewer/osgjsviewer.js',
          'js/osgjsviewer/osgjsviewer-ui.js',
          'js/osgjsviewer/osgjsviewer-wrapper.js',
          'js/osgjsviewer/shadersource.js'
        ],
        dest: 'js/build/osgjsviewer/osgjsviewer.min.js'
      },
      hummer: {
        src : 'js/osg/Hammer.js',
        dest: 'js/build/osg/Hammer.min.js'
      },
      osg: {
        src : 'js/osg/OSG.js',
        dest: 'js/build/osg/OSG.min.js'
      },
      qjs: {
        src : 'js/osg/Q.js',
        dest: 'js/build/osg/Q.min.js'
      },
      htjp: {
        src : 'js/html5jp/cpick.js',
        dest: 'js/build/html5jp/cpick.min.js'
      }
    },
    
    jsonmin: {
      options: {
        stripWhitespace: true || false,
        stripComments: true || false
      },
//      dev: {
//        files: [
//          {
//            expand: true, // 展開を有効に
//            cwd: "High/", // ソースファイルのディレクトリ（プレフィクス）
//            src: ["*.osgjs"], // ソースファイルのルール
//            dest: "High2/", // 出力先ディレクトリ
//            ext: ".osgjs" // 出力ファイルの拡張子
//          }
//        ]
//      },

      dev4: {
        files: [
          {
            expand: true,                                // 展開を有効に
            cwd: "High/Data13",                         // ソースファイルのディレクトリ（プレフィクス）
            src: ["**/*.osgjs", "!**/_*.osgjs"],         // ソースファイルのルール
            dest: "mindata/PDCKoriyama3DHM_GCP_outOSGB_High/Data",                       // 出力先ディレクトリ
            ext: ".osgjs"                                // 出力ファイルの拡張子
          }
        ]
      },
      dev5: {
        files: [
          {
            expand: true,                                // 展開を有効に
            cwd: "High/Data14",                         // ソースファイルのディレクトリ（プレフィクス）
            src: ["**/*.osgjs", "!**/_*.osgjs"],         // ソースファイルのルール
            dest: "mindata/PDCKoriyama3DHM_GCP_outOSGB_High/Data",                       // 出力先ディレクトリ
            ext: ".osgjs"                                // 出力ファイルの拡張子
          }
        ]
      },
      dev6: {
        files: [
          {
            expand: true,                                // 展開を有効に
            cwd: "High/Data15",                         // ソースファイルのディレクトリ（プレフィクス）
            src: ["**/*.osgjs", "!**/_*.osgjs"],         // ソースファイルのルール
            dest: "mindata/PDCKoriyama3DHM_GCP_outOSGB_High/Data",                       // 出力先ディレクトリ
            ext: ".osgjs"                                // 出力ファイルの拡張子
          }
        ]
      },
      
    }

  });

  // モジュールの読み込み
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsonmin');

  // タスクの登録
  grunt.registerTask('default', ['uglify']);

};



