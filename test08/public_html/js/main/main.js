/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// wgld.org
// http://wgld.org/

// テクスチャマッピング
// http://wgld.org/d/webgl/w026.html
// マルチテクスチャ
// http://wgld.org/d/webgl/w027.html
// テクスチャパラメータ
// http://wgld.org/d/webgl/w028.html
// アルファブレンディング
// http://wgld.org/d/webgl/w029.html
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
    // var lightDirection = [ -0.5, 0.5, 0.5 ];
    
    // 点光源の位置
    var lightPosition = [0.0, 0.0, 0.0];
    
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
    // gl.enable( gl.CULL_FACE );
    // gl.frontFace( gl.CW );
    
    // ブレンディングを有効にするコード
    gl.enable( gl.BLEND );
    
    // 有効にするテクスチャユニットを指定
    gl.activeTexture( gl.TEXTURE0 );
    gl.activeTexture( gl.TEXTURE1 );
    
    // テクスチャ用変数の宣言
    var texture0 = null;
    var texture1 = null;
    
    // テクスチャを生成
    create_texture( 'texture0.png', 0 );
    create_texture( 'texture1.png', 1 );

    // attributeLocationの取得
    var attLocation = new Array( 3 );
    attLocation[ 0 ] = gl.getAttribLocation( prg, 'position' );
    attLocation[ 1 ] = gl.getAttribLocation( prg, 'color' );
    attLocation[ 2 ] = gl.getAttribLocation( prg, 'textureCoord');

    // attributeの要素数(この場合は xyz の3要素)
    var attStride = new Array( 3 );
    attStride[ 0 ] = 3;
    attStride[ 1 ] = 4;
    attStride[ 2 ] = 2;

    // モデル(頂点)データ
    var vertex_position = [
        -1.0,  1.0, 0.0,
        1.0,  1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];

    var vertex_color = [
        1.0, 0.0, 0.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
    ];
    
    var vertex_texCoord = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];
    
    // 頂点インデックスを格納する配列
    var index = [
        0, 1, 2,
        3, 2, 1
    ];
    
   
    /*
    var torusData = torus( 32, 32, 1.0, 2.0 );
    var vertex_position = torusData[0];
    var vertex_normal = torusData[1];
    var vertex_color = torusData[2];
    var index = torusData[3];
    */
    /*
    var sphereData = sphere( 64, 64, 2.0, [0.25, 0.25, 0.75, 1.0] );
    var vertex_position = sphereData.p;
    var vertex_normal = sphereData.n;
    var vertex_color = sphereData.c;
    var index = sphereData.i;
    */
   
    // VBOの生成
    var position_vbo = create_vbo( vertex_position );
    var color_vbo = create_vbo( vertex_color );
    var texCoord_vbo = create_vbo( vertex_texCoord );
    var vboList = [position_vbo, color_vbo, texCoord_vbo];
    
    // IBOの生成
    var ibo = create_ibo( index );

    // VBOをバインドする
    set_attribute( vboList, attLocation, attStride );

    
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, ibo );
    
    // 各行列を掛け合わせ座標変換行列を完成させる
    m.multiply( pMatrix, vMatrix, mvpMatrix );
    m.multiply( mvpMatrix, mMatrix, mvpMatrix );

    // uniformLocationの取得
    var uniLocation = new Array();
    uniLocation[ 0 ] = gl.getUniformLocation( prg, 'mvpMatrix' );
    uniLocation[ 1 ] = gl.getUniformLocation( prg, 'texture0' );
    uniLocation[ 2 ] = gl.getUniformLocation( prg, 'texture1' );
    uniLocation[ 3 ] = gl.getUniformLocation( prg, 'vertexAlpha' );
    uniLocation[ 4 ] = gl.getUniformLocation( prg, 'useTexture' );

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
        var x = Math.cos( rad ) * 1.0;
        var y = Math.sin( rad ) * 1.0;
        
        // テクスチャをバインドする
        gl.activeTexture( gl.TEXTURE0 );
        gl.bindTexture( gl.TEXTURE_2D, texture0 );
        gl.uniform1i( uniLocation[1], 0 );
        
        gl.activeTexture( gl.TEXTURE1 );
        gl.bindTexture( gl.TEXTURE_2D, texture1 );
        gl.uniform1i( uniLocation[2], 1 );
        
        /*
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        */
        /*
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
        */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		
        // ブレンドパラメータ
        gl.disable( gl.BLEND );
        // gl.blendFunc( gl.ONE, gl.ZERO );
        
        // 一つ目のモデル描画
        m.identity( mMatrix );
        m.translate( mMatrix, [x, y, 0.0], mMatrix );
        m.rotate( mMatrix, rad, [0, 0, 0], mMatrix );
        m.multiply( tmpMatrix, mMatrix, mvpMatrix );
        
        m.inverse( mMatrix, invMatrix );

        gl.uniformMatrix4fv( uniLocation[0], false, mvpMatrix );
        gl.uniform1f( uniLocation[3], 1.0 );
        gl.uniform1i( uniLocation[4], true );
        gl.drawElements( gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0 );

        // 二つ目のモデル描画
        gl.enable( gl.BLEND );
        gl.bindTexture( gl.TEXTURE_2D, null );
        // gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );            // 透過処理
        gl.blendFunc( gl.SRC_ALPHA, gl.ONE );                               // 加算合成
        
        gl.blendEquation( gl.FUNC_ADD, gl.FUNC_ADD );
        gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE );
        
        m.identity( mMatrix );
        m.translate( mMatrix, [0.0, 0.0, 0.0], mMatrix );
        m.rotate( mMatrix, rad, [0, 0, 1], mMatrix );
        m.multiply( tmpMatrix, mMatrix, mvpMatrix );
        
        m.inverse( mMatrix, invMatrix );

        gl.uniformMatrix4fv( uniLocation[0], false, mvpMatrix );
        gl.uniform1f( uniLocation[3], 0.75 );
        gl.uniform1i( uniLocation[4], false );
        gl.drawElements( gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0 );
        
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
    
    // 球体を生成する関数
    function sphere(row, column, rad, color)
    {
        var pos = new Array();
        var nor = new Array();
        var col = new Array();
        var idx = new Array();
        
        for(var i=0; i<=row; i++)
        {
            var r = Math.PI / row * i;
            var ry = Math.cos( r );
            var rr = Math.sin( r );
            
            for(var ii=0; ii<=column; ii++)
            {
                var tr = Math.PI * 2 / column * ii;
                var tx = rr * rad * Math.cos( tr );
                var ty = ry * rad;
                var tz = rr * rad * Math.sin( tr );
                var rx = rr * Math.cos( tr );
                var rz = rr * Math.sin( tr );
                
                if(color)
                {
                    var tc = color;
                }
                else
                {
                    tc = hsva(360 / row * i, 1, 1, 1);
                }
                
                pos.push( tx, ty, tz );
                nor.push( rx, ry, rz );
                col.push( tc[0], tc[1], tc[2], tc[3] );
            }
        }
        
        r = 0;
        for(i=0; i<row; i++)
        {
            for(ii=0; ii<column; ii++)
            {
                r = (column + 1) * i + ii;
                idx.push( r, r+1, r+column+2);
                idx.push( r, r+column+2, r+column+1);
            }
        }
        
        return {p:pos, n:nor, c:col, i:idx};
    }
    
    // テクスチャを生成する関数
    function create_texture( source, number )
    {
        // イメージオブジェクトの生成
        var img = new Image();
        
        // データのオンロードをトリガーにする
        img.onload = function() {
            // テクスチャオブジェクトの生成
            var tex = gl.createTexture();
            
            // テクスチャをバインドする
            gl.bindTexture( gl.TEXTURE_2D, tex );
            
            // テクスチャへイメージを適用
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img );
            
            // ミップマップを生成
            gl.generateMipmap( gl.TEXTURE_2D );
            
            // テクスチャのバインドを無効化
            gl.bindTexture( gl.TEXTURE_2D, null );
            
            // 生成したテクスチャをグローバル変数に代入
            switch( number )
            {
                case 0:
                    texture0 = tex;
                    break;
                case 1:
                    texture1 = tex;
                    break;
                default:
                    break;
            }
            //texture = tex;
        };
        
        // イメージオブジェクトのソースを指定
        img.src = source;
    }
    
    _render();
};