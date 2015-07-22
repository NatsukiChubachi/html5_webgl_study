/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// wgld.org
// http://wgld.org/

// トーラスの生成と描画
// 平行光源
// http://wgld.org/d/webgl/w021.html

onload = function()
{
    // canvasエレメントを取得
    var c = document.getElementById( 'canvas' );
    c.width = 500;
    c.height = 500;

    // webglコンテキストを取得
    var gl = c.getContext( 'webgl' ) || c.getContext( 'experimental-webgl' );

    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = create_shader( 'vs' );
    var f_shader = create_shader( 'fs' );

    // プログラムオブジェクトの生成とリンク
    var prg = create_program( v_shader, f_shader );

    // minMatrix.js を用いた行列関連処理
    // matIVオブジェクトを生成
    var m = new matIV();

    // 各種行列の生成と初期化
    var mMatrix = m.identity( m.create() );
    var vMatrix = m.identity( m.create() );
    var pMatrix = m.identity( m.create() );
    var tmpMatrix = m.identity( m.create() );
    var mvpMatrix = m.identity( m.create() );
    var invMatrix = m.identity( m.create() );

    // ビュー座標変換行列
    m.lookAt( [0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], vMatrix );
    m.perspective( 45, c.width / c.height, 0.1, 100, pMatrix );
    m.multiply( pMatrix, vMatrix, tmpMatrix );

    // 平行光源の向き
    var lightDirection = [ -0.5, 0.5, 0.5 ];
    
    // 視点ベクトル
    var eyeDirection = [ 0.0, 0.0, 20.0 ];
    
    // 環境光の色
    var ambientColor = [0.1, 0.1, 0.1, 1.0];
    
    // カウンタの宣言
    var count = 0;
    
    // 深度テストを有効にする
    gl.enable( gl.DEPTH_TEST );
    
    // 深度テストの評価方法指定
    gl.depthFunc( gl.LEQUAL );
    
    // カリングを有効にする
    gl.enable( gl.CULL_FACE );
    // gl.frontFace( gl.CW );
    

    // attributeLocationの取得
    var attLocation = new Array( 3 );
    attLocation[ 0 ] = gl.getAttribLocation( prg, 'position' );
    attLocation[ 1 ] = gl.getAttribLocation( prg, 'normal');
    attLocation[ 2 ] = gl.getAttribLocation( prg, 'color' );

    // attributeの要素数(この場合は xyz の3要素)
    var attStride = new Array( 3 );
    attStride[ 0 ] = 3;
    attStride[ 1 ] = 3;
    attStride[ 2 ] = 4;

    /*
    // モデル(頂点)データ
    var vertex_position = [
        0.0,  1.0, 0.0,
        1.0,  0.0, 0.0,
        -1.0, 0.0, 0.0,
        0.0, -1.0, 0.0
    ];

    var vertex_color = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
    ];
    
    // 頂点インデックスを格納する配列
    var index = [
        0, 1, 2,
        1, 2, 3
    ]
    */
    var torusData = torus( 32, 32, 1.0, 2.0 );
    var vertex_position = torusData[0];
    var vertex_normal = torusData[1];
    var vertex_color = torusData[2];
    var index = torusData[3];
   
    // VBOの生成
    var position_vbo = create_vbo( vertex_position );
    var normal_vbo = create_vbo( vertex_normal );
    var color_vbo = create_vbo( vertex_color );

    // VBOをバインドする
    set_attribute( [position_vbo, normal_vbo, color_vbo], attLocation, attStride );

    // IBOの生成
    var ibo = create_ibo( index );
    
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, ibo );
    
    // 各行列を掛け合わせ座標変換行列を完成させる
    m.multiply( pMatrix, vMatrix, mvpMatrix );
    m.multiply( mvpMatrix, mMatrix, mvpMatrix );

    // uniformLocationの取得
    var uniLocation = new Array();
    uniLocation[ 0 ] = gl.getUniformLocation( prg, 'mvpMatrix' );
    uniLocation[ 1 ] = gl.getUniformLocation( prg, 'invMatrix' );
    uniLocation[ 2 ] = gl.getUniformLocation( prg, 'lightDirection' );
    uniLocation[ 3 ] = gl.getUniformLocation( prg, 'eyeDirection' );
    uniLocation[ 4 ] = gl.getUniformLocation( prg, 'ambientColor' );

    var _render = function()
    {
        // canvasを初期化する色を設定する
        gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

        // canvasを初期化する際の深度を設定する
        gl.clearDepth( 1.0 );

        // canvasを初期化
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // カウンタをインクリメントする
        count++;
        var rad = (count % 360) * Math.PI / 180;
        var x = Math.cos( rad ) * 5.0;
        var z = Math.sin( rad ) * 5.0;
        
        /*
        // 一つ目のモデル描画（円の奇跡を描き移動）
        m.identity( mMatrix );
        m.translate( mMatrix, [x, y+1.0, 0.0], mMatrix );
        m.multiply( tmpMatrix, mMatrix, mvpMatrix );
        
        gl.uniformMatrix4fv( uniLocation, false, mvpMatrix );   // uniformLocationへ座標変換行列を登録
        gl.drawArrays( gl.TRIANGLES, 0, 3 );                    // モデルの描画
        */
       
        // 一つ目のモデル描画
        m.identity( mMatrix );
        m.translate( mMatrix, [x, 0.0, z], mMatrix );
        m.rotate( mMatrix, rad, [1, 0, 0], mMatrix );
        m.multiply( tmpMatrix, mMatrix, mvpMatrix );
        
        m.inverse( mMatrix, invMatrix );

        gl.uniformMatrix4fv( uniLocation[0], false, mvpMatrix );
        gl.uniformMatrix4fv( uniLocation[1], false, invMatrix );
        gl.uniform3fv( uniLocation[2], lightDirection );
        gl.uniform3fv( uniLocation[3], eyeDirection );
        gl.uniform4fv( uniLocation[4], ambientColor );
        gl.drawElements( gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0 );

        /*
        // 二つ目のモデル描画
        m.identity( mMatrix );
        m.translate( mMatrix, [-x, 0.0, -z], mMatrix );
        m.rotate( mMatrix, rad, [0, 1, 0], mMatrix );
        m.multiply( tmpMatrix, mMatrix, mvpMatrix );

        gl.uniformMatrix4fv( uniLocation, false, mvpMatrix );
        gl.drawElements( gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0 );
        */
       
        /*
        // 三つ目のモデル描画（拡大縮小）
        var s = Math.sin( rad ) + 1.0;
        m.identity( mMatrix );
        m.translate( mMatrix, [-1.0, -1.0, 0.0], mMatrix );
        m.scale( mMatrix, [s, s, 0.0], mMatrix );
        m.multiply( tmpMatrix, mMatrix, mvpMatrix );

        gl.uniformMatrix4fv( uniLocation, false, mvpMatrix );
        gl.drawArrays( gl.TRIANGLES, 0, 3 );
        */
       
        // コンテキストの再描画
        gl.flush();
        
        // 再帰呼び出し
        setTimeout( _render, 1000 / 30 );
    };
        
    // シェーダを生成する関数
    function create_shader( id )
    {
        // シェーダを格納する変数
        var shader;

        // HTMLからscriptタグへの参照を取得
        var scriptElement = document.getElementById(id);

        // scriptタグが存在しない場合は抜ける
        if( !scriptElement ){return;}

        // scriptタグのtype属性をチェック
        switch( scriptElement.type )
        {
            // 頂点シェーダの場合
            case 'x-shader/x-vertex':
                shader = gl.createShader( gl.VERTEX_SHADER );
                break;
                
            // フラグメントシェーダの場合
            case 'x-shader/x-fragment':
                shader = gl.createShader( gl.FRAGMENT_SHADER );
                break;
                
            default :
                return;
        }

        // 生成されたシェーダにソースを割り当てる
        gl.shaderSource( shader, scriptElement.text );

        // シェーダをコンパイルする
        gl.compileShader( shader );

        // シェーダが正しくコンパイルされたかチェック
        if( gl.getShaderParameter( shader, gl.COMPILE_STATUS ) )
        {
            // 成功していたらシェーダを返して終了
            return shader;
        }
        else
        {
            // 失敗していたらエラーログをアラートする
            alert( gl.getShaderInfoLog( shader ) );
        }
    }

    // プログラムオブジェクトを生成しシェーダをリンクする関数
    function create_program(vs, fs)
    {
        // プログラムオブジェクトの生成
        var program = gl.createProgram();

        // プログラムオブジェクトにシェーダを割り当てる
        gl.attachShader( program, vs );
        gl.attachShader( program, fs );

        // シェーダをリンク
        gl.linkProgram( program );

        // シェーダのリンクが正しく行なわれたかチェック
        if( gl.getProgramParameter( program, gl.LINK_STATUS ) )
        {
            // 成功していたらプログラムオブジェクトを有効にする
            gl.useProgram( program );

            // プログラムオブジェクトを返して終了
            return program;
        }
        else
        {
            // 失敗していたらエラーログをアラートする
            alert( gl.getProgramInfoLog( program ) );
        }
    }

    // VBOを生成する関数
    function create_vbo( data )
    {
        // バッファオブジェクトの生成
        var vbo = gl.createBuffer();

        // バッファをバインドする
        gl.bindBuffer( gl.ARRAY_BUFFER, vbo );

        // バッファにデータをセット
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( data ), gl.STATIC_DRAW );

        // バッファのバインドを無効化
        gl.bindBuffer( gl.ARRAY_BUFFER, null );

        // 生成した VBO を返して終了
        return vbo;
    }

    // VBOをバインドし登録する関数
    function set_attribute( vbo, attL, attS )
    {
        // 引数として受け取った配列を処理する
        for( var i in vbo )
        {
            // バッファをバインドする
            gl.bindBuffer( gl.ARRAY_BUFFER, vbo[ i ] );
            
            // attributeLocationを有効にする
            gl.enableVertexAttribArray( attL[ i ] );
            
            // attributeLocationを通知し登録する
            gl.vertexAttribPointer( attL[ i ], attS[ i ], gl.FLOAT, false, 0, 0 );
        }
    }
    
    // IBOを生成する関数
    function create_ibo( data )
    {
        // バッファオブジェクトの生成
        var ibo = gl.createBuffer();
        
        // バッファをバインドする
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, ibo );
        
        // バッファにデータをセット
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Int16Array( data ), gl.STATIC_DRAW );
        
        // バッファのバインドを向こうか
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
        
        // 生成したIBOを返して終了
        return ibo;
    }

    // トーラス
    // http://wgld.org/d/webgl/w020.html
    function torus( row, column, irad, orad )
    {
        var pos = new Array();
        var nor = new Array();
        var col = new Array();
        var idx = new Array();
        
        for( var i=0; i<=row; i++ )
        {
            var r = Math.PI * 2 / row * i;
            var rr = Math.cos( r );
            var ry = Math.sin( r );
            
            for( var ii=0; ii<=column; ii++)
            {
                var tr = Math.PI * 2 / column * ii;
                var tx = (rr * irad + orad) * Math.cos( tr );
                var ty = (ry * irad);
                var tz = (rr * irad + orad) * Math.sin( tr );
                var rx = rr * Math.cos( tr );
                var rz = rr * Math.sin( tr );
                pos.push( tx, ty, tz );
                nor.push( rx, ry, rz );
                
                var tc = hsva( 360 / column * ii, 1, 1, 1 );
                col.push( tc[0], tc[1], tc[2], tc[3] );
            }
        }
        
        for( var i=0; i<row; i++)
        {
            for( var ii=0; ii<column; ii++)
            {
                r = (column + 1) * i + ii;
                idx.push( r, r+column+1, r+1 );
                idx.push( r+column+1, r+column+2, r+1 );
            }
        }
        
        return [pos, nor, col, idx];
    }
    
    function hsva( h, s, v, a )
    {
        if( s>1 || v>1 || a>1){ return; }
        
        var th = h % 360;
        var i = Math.floor( th / 60 );
        var f = th / 60 - i;
        var m = v * ( 1 - s );
        var n = v * ( 1 - s * f );
        var k = v * ( 1 - s * (1 - f) );
        var color = new Array();
        
        if( !s>0 && !s<0 )
        {
            color.push( v, v, v, a );
        }
        else
        {
            var r = new Array( v, n, m, k, v );
            var g = new Array( k, v, v, n, m, m );
            var b = new Array( m, m, k, v, v, n );
            color.push( r[i], g[i], b[i], a );
        }
        
        return color;
    }
    
    _render();
};