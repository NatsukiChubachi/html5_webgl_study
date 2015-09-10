// sample_024
//
// WebGLでポイントスプライト


// =========================================================
// シェーダー部分
// =========================================================


var _gshader = [];

// ノーマルテクスチャ描画シェーダー
_gshader[ "NormalTexture" ] = {
  vertex: ""
    + "attribute vec3  position;"
    + "attribute vec4  color;"
    + "attribute vec2  textureCoord;"
    + "uniform   mat4  mvpMatrix;"
    + "varying   vec4  vColor;"
    + "varying   vec2  vTextureCoord;"
    + ""
    + "void main(void){"
    + "    vColor        = color;"
    + "    vTextureCoord = textureCoord;"
    + "    gl_Position   = mvpMatrix * vec4(position, 1.0);"
    + "}",
  
  fragment: ""
    + "precision mediump float;"
    + ""
    + "uniform sampler2D texture;"
    + "varying vec4      vColor;"
    + "varying vec2      vTextureCoord;"
    + ""
    + "void main(void){"
    + "    vec4 smpColor = texture2D(texture, vTextureCoord);"
    + "    gl_FragColor = vColor * smpColor;"
    + "}",
  
  program: null
};

// ポイントスプライトシェーダー
_gshader[ "PointSprite" ] = {
  vertex: ""
    + "attribute vec3  position;"
    + "attribute vec4  color;"
    + "uniform   mat4  mvpMatrix;"
    + "uniform   float pointSize;"
    + "varying   vec4  vColor;"
    + ""
    + "void main(void){"
    + "    vColor       = color;"
    + "    gl_Position  = mvpMatrix * vec4(position, 1.0);"
    + "    gl_PointSize = pointSize;"
    + "}",
  
  fragment: ""
    + "precision mediump float;"
    + ""
    + "uniform sampler2D texture;"
    + "uniform int       useTexture;"
    + "varying vec4      vColor;"
    + ""
    + "void main(void){"
    + "    vec4 smpColor = vec4(1.0);"
    + "    if(bool(useTexture)){"
    + "        smpColor = texture2D(texture, gl_PointCoord);"
    + "    }"
    + "    if(smpColor.a == 0.0){"
    + "        discard;"
    + "    }else{"
    + "        gl_FragColor = vColor * smpColor;"
    + "    }"
    + "}",
  
  program: null
};


// =========================================================
// メイン処理部分
// =========================================================

// canvas とクォータニオンをグローバルに扱う
var c;
var q = new qtnIV();
var qt = q.identity(q.create());


// マウスムーブイベントに登録する処理
function mouseMove(e)
{
	var cw = c.width;
	var ch = c.height;
	var wh = 1 / Math.sqrt(cw * cw + ch * ch);
	var x = e.clientX - c.offsetLeft - cw * 0.5;
	var y = e.clientY - c.offsetTop - ch * 0.5;
	var sq = Math.sqrt(x * x + y * y);
	var r = sq * 2.0 * Math.PI * wh;
	if(sq != 1){
		sq = 1 / sq;
		x *= sq;
		y *= sq;
	}
	q.rotate(r, [y, x, 0.0], qt);
}



onload = function()
{
	// canvasエレメントを取得
	c = document.getElementById('canvas');
	c.width = 1000;
	c.height = 600;
	
	// エレメントへの参照を取得
	var eLines     = document.getElementById('lines');
	var eLineStrip = document.getElementById('line_strip');
	var eLineLoop  = document.getElementById('line_loop');
	var ePointSize = document.getElementById('point_size');
	

	// イベント処理
	c.addEventListener('mousemove', mouseMove, true);

	
	// webglコンテキストを取得
	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	
	// シェーダーのコンパイル処理
	_gshader[ "NormalTexture" ].program = create_program(
		createVertexShader( _gshader[ "NormalTexture" ].vertex ),
		createFragmentShader( _gshader[ "NormalTexture" ].fragment )
		);
	_gshader[ "PointSprite" ].program = create_program(
		createVertexShader( _gshader[ "PointSprite" ].vertex ),
		createFragmentShader( _gshader[ "PointSprite" ].fragment )
		);
	var prgNormalTexture = _gshader[ "NormalTexture" ].program;
	var prgPointSprite = _gshader[ "PointSprite" ].program;
	
	var obj = new testObject( prgNormalTexture );
	var obj2XX = new testObjectXX( prgPointSprite );
	var obj2 = new testObjectXX00( prgNormalTexture );
	var obj3 = new testObjectXX00( prgNormalTexture );
	
	
	
	
	
	
	
	// 各種行列の生成と初期化
	var m = new matIV();
	var mMatrix   = m.identity( m.create() );
	var vMatrix   = m.identity( m.create() );
	var pMatrix   = m.identity( m.create() );
	var tmpMatrix = m.identity( m.create() );
	var mvpMatrix = m.identity( m.create() );
	var qMatrix   = m.identity( m.create() );
	
	
	
	// 各種フラグを有効化する
	gl.enable( gl.DEPTH_TEST );
	gl.depthFunc( gl.LEQUAL );
	gl.enable( gl.BLEND );
	
	
	
	// ブレンドファクター
	gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE );
	
	
	
	// カウンタ
	var count = 0;
	
	// テクスチャ関連
/*
	var _gTexture = [];
	create_texture( 0, 'data/texture.png' );
	create_texture( 1, 'data/test_office.jpg' );
*/
	
	obj.loadTexture( 0, 'data/test_office.jpg' );
	//obj2XX.textureManager.loadTexture( 0, 'data/texture.png' );
	obj2.textureManager.loadTexture( 0, 'data/test_office.jpg' );
	obj3.textureManager.loadTexture( 0, 'data/test_office.jpg' );
	
	
	
	
	var t = 0.0;
	var history = 0;
	
	
	
	
	
	
	
	var rad = 0.0 * Math.PI / 180.0;
	
	// 恒常ループ
	(function()
	{
		// canvasを初期化
		gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
		gl.clearDepth( 1.0 );
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		
		// カウンタからラジアンを算出
		count++;
/*
		count = count % 1;
		
		if ( count === 0 )
		{
		    var temperature = Math.random() * 10.0;
		    
		    // テスト
		    // VBOインデックスを動的に増やしてみる
		    // 動的に天井方を増やせるかどうか？
		    // この場合はdrawArraysのほうがいいのかもしれない
		    for( var i=0; i<3; i+=1)
		    {
			    count = obj2.position.length;
			    obj2.position[ count+0 ] = (Math.random() * 10.0) - 5.0;
			    obj2.position[ count+1 ] = (Math.random() * 10.0) - 5.0;
			    obj2.position[ count+2 ] = 0.5;
			    
			    count = obj2.color.length;
			    obj2.color[ count+0 ] = temperature / 7.5;
			    obj2.color[ count+1 ] = 0.0;
			    obj2.color[ count+2 ] = 1.0 - obj2.color[ count+0 ];
			    obj2.color[ count+3 ] = 0.5;
			    
			    if ( obj2.color[ count+0 ] < 0.0 ) obj2.color[ count+0 ] = 0.0;
			    if ( obj2.color[ count+0 ] > 1.0 ) obj2.color[ count+0 ] = 1.0;
			    if ( obj2.color[ count+2 ] < 0.0 ) obj2.color[ count+2 ] = 0.0;
			    if ( obj2.color[ count+2 ] > 1.0 ) obj2.color[ count+2 ] = 1.0;
			    
			    count = obj2.index.length;
			    obj2.index[ count ] = obj2.index.length;
			    
				obj2.vPosition     = create_vbo( obj2.position );
				obj2.vColor        = create_vbo( obj2.color );
				obj2.VBOList       = [ obj2.vPosition, obj2.vColor ];
				obj2.iIndex        = create_ibo( obj2.index );
			}
			
			count = 0;
		}
*/
		count = -80;
		rad = (count % 360) * Math.PI / 180;
		
		// クォータニオンを行列に適用
		var qMatrix = m.identity( m.create() );
		q.toMatIV( qt, qMatrix );
		
		// ビュー×プロジェクション座標変換行列
		var camPosition = [ 0.0, 5.0, 10.0 ];
		m.lookAt( camPosition, [0, 0, 0], [ 0, 1, 0 ], vMatrix );
		m.multiply( vMatrix, qMatrix, vMatrix );
		m.perspective( 45, c.width / c.height, 0.1, 100, pMatrix );
		m.multiply( pMatrix, vMatrix, tmpMatrix );
		

		
		t++;
		if ( t > 300 )
		{
		 	t = -300;
		}
		
		if ( t === 0 )
		{
		 	history++;
		 	if ( history >= 3 ) history = 0; 
		}
		
		
		
		for ( var i=0; i<50; i++ )
		{
			for ( var j=0; j<50; j++ )
			{
				var idx = j + (i * 50);
				
				var iVal = Math.abs( (obj2.moveVal[ ((50*50)*history) + idx ] / 10000.0) * t / 300.0 );
				if ( Math.abs( t ) < 25 ) iVal = 0;
				
				var iRed = (iVal - 0.3) / 1.0;
				if ( iRed < 0.0 ) iRed = 0.0;
				
				var iBlue = (-iVal + 0.3) / 0.3;
				if ( iBlue < 0.0 ) iBlue = 0.0;
				
				obj2.position[ (idx*12)+0 ] = -5.0 + (i * 0.2);
				obj2.position[ (idx*12)+1 ] = 5.0 - (j * 0.2);
				obj2.position[ (idx*12)+2 ] = 0.0 + (iVal / 4.0);
				obj2.position[ (idx*12)+3 ] = -5.0 + ((i+1) * 0.2);
				obj2.position[ (idx*12)+4 ] = 5.0 - (j * 0.2);
				obj2.position[ (idx*12)+5 ] = 0.0 + (iVal / 4.0);
				obj2.position[ (idx*12)+6 ] = -5.0 + (i * 0.2);
				obj2.position[ (idx*12)+7 ] = 5.0 - ((j+1) * 0.2);
				obj2.position[ (idx*12)+8 ] = 0.0 + (iVal / 4.0);
				obj2.position[ (idx*12)+9 ] = -5.0 + ((i+1) * 0.2);
				obj2.position[ (idx*12)+10 ] = 5.0 - ((j+1) * 0.2);
				obj2.position[ (idx*12)+11 ] = 0.0 + (iVal / 4.0);
				
				obj2.color[ (idx*16)+0 ] = 0.0 + iVal;
				obj2.color[ (idx*16)+1 ] = 1.0 - iVal;
				obj2.color[ (idx*16)+2 ] = 1.0 - iVal;
				obj2.color[ (idx*16)+3 ] = 1.0;
				
				obj2.color[ (idx*16)+4 ] = 0.0 + iVal;
				obj2.color[ (idx*16)+5 ] = 1.0 - iVal;
				obj2.color[ (idx*16)+6 ] = 1.0 - iVal;
				obj2.color[ (idx*16)+7 ] = 1.0;
				
				obj2.color[ (idx*16)+8 ] = 0.0 + iVal;
				obj2.color[ (idx*16)+9 ] = 1.0 - iVal;
				obj2.color[ (idx*16)+10 ] = 1.0 - iVal;
				obj2.color[ (idx*16)+11 ] = 1.0;
				
				obj2.color[ (idx*16)+12 ] = 0.0 + iVal;
				obj2.color[ (idx*16)+13 ] = 1.0 - iVal;
				obj2.color[ (idx*16)+14 ] = 1.0 - iVal;
				obj2.color[ (idx*16)+15 ] = 1.0;
			}
		}
				
		obj2.vPosition     = create_vbo( obj2.position );
		obj2.vColor        = create_vbo( obj2.color );
		obj2.VBOList       = [ obj2.vPosition, obj2.vColor ];
		obj2.iIndex        = create_ibo( obj2.index );


		
		// テストオブジェクトの描画
		//obj.drawImplements();
		obj2.drawImplements();
		obj2XX.drawImplements();
		obj3.drawImplements();
		
		
		// コンテキストの再描画
		gl.flush();
		
		// ループのために再帰呼び出し
		setTimeout( arguments.callee, 1000 / 60 );
		
		
		// 予備コード
/*
		// 点を描画
		set_attribute(pVBOList, attLocation, attStride);
		m.identity(mMatrix);
		m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniform1f(uniLocation[1], pointSize);
		gl.uniform1i(uniLocation[2], 0);
		gl.uniform1i(uniLocation[3], true);
		gl.drawArrays(gl.POINTS, 0, pointSphere.p.length / 3);
*/
/*
		// 線タイプを判別
		var lineOption = 0;
		if(eLines.checked){lineOption = gl.LINES;}
		if(eLineStrip.checked){lineOption = gl.LINE_STRIP;}
		if(eLineLoop.checked){lineOption = gl.LINE_LOOP;}
*/
/*
		// 線を描画
		set_attribute(lVBOList, attLocation, attStride);
		m.identity(mMatrix);
		m.rotate(mMatrix, Math.PI / 2, [1, 0, 0], mMatrix);
		m.scale(mMatrix, [3.0, 3.0, 1.0], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniform1i(uniLocation[3], false);
		gl.drawArrays(lineOption, 0, position.length / 3);
*/

	})();

	
	// =========================================================
	// VBO、IBO、テクスチャ作成関連
	// テクスチャは実際にはここでは使用しない
	// =========================================================
	/**
	 * VBOを生成する関数
	 */
	function create_vbo( data )
	{
		// バッファオブジェクトの生成
		var vbo = gl.createBuffer();
		
		// バッファをバインドする
		gl.bindBuffer( gl.ARRAY_BUFFER, vbo );
		
		// バッファにデータをセット
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW );
		
		// バッファのバインドを無効化
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
		
		// 生成した VBO を返して終了
		return vbo;
	}
	
	/**
	 * VBOをバインドし登録する関数
	 */
	function set_attribute( vbo, attL, attS )
	{
		// 引数として受け取った配列を処理する
		for(var i in vbo)
		{
			// バッファをバインドする
			gl.bindBuffer( gl.ARRAY_BUFFER, vbo[i] );
			
			// attributeLocationを有効にする
			gl.enableVertexAttribArray( attL[i] );
			
			// attributeLocationを通知し登録する
			gl.vertexAttribPointer( attL[i], attS[i], gl.FLOAT, false, 0, 0 );
		}
	}
	
	/**
	 * IBOを生成する関数
	 */
	function create_ibo( data )
	{
		// バッファオブジェクトの生成
		var ibo = gl.createBuffer();
		
		// バッファをバインドする
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, ibo );
		
		// バッファにデータをセット
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Int16Array( data ), gl.STATIC_DRAW );
		
		// バッファのバインドを無効化
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
		
		// 生成したIBOを返して終了
		return ibo;
	}
	
	/**
	 * テクスチャを生成する関数
	 */
	function create_texture( num, source )
	{
		// イメージオブジェクトの生成
		var img = new Image();
		
		// データのオンロードをトリガーにする
		img.onload = function()
		{
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
			
			// 生成したテクスチャを変数に代入
			_gTexture[ num ] = tex;
		};
		
		// イメージオブジェクトのソースを指定
		img.src = source;
	}

	
	/**
	 * VertexShaderを作成する
	 */
	function createVertexShader( vs )
	{
		// 頂点シェーダの場合
		var shader = gl.createShader( gl.VERTEX_SHADER );
		gl.shaderSource( shader, vs );
		
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
	
	/**
	 * FragmentShaderを作成する
	 */
	function createFragmentShader( fs )
	{
		// 頂点シェーダの場合
		var shader = gl.createShader( gl.FRAGMENT_SHADER );
		gl.shaderSource( shader, fs );
		
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

	/**
	 * VertexShaderとFragmentShaderからプログラムオブジェクトを生成し、
	 * シェーダをリンクする関数
	 */
	// プログラムオブジェクトを生成しシェーダをリンクする関数
	function create_program( vs, fs )
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
	
	
	// =========================================================
	// 3Dモデル用オブジェクトクラスの試作型
	// =========================================================
	/**
	 * テストオブジェクトの作成クラス
	 */
	function testObject( drawProgram )
	{
		// シェーダー
		this.drawShader = drawProgram;
		
		// attributeLocationを配列に取得
		this.attLocation = new Array();
		this.attLocation[0] = gl.getAttribLocation( this.drawShader, 'position' );
		this.attLocation[1] = gl.getAttribLocation( this.drawShader, 'color' );
		this.attLocation[2] = gl.getAttribLocation( this.drawShader, 'textureCoord' );
		
		// attributeの要素数を配列に格納
		this.attStride = new Array();
		this.attStride[0] = 3;
		this.attStride[1] = 4;
		this.attStride[2] = 2;
		
		// 頂点の位置
		this.position = [
			-5.0,  5.0,  0.0,
			 5.0,  5.0,  0.0,
			-5.0, -5.0,  0.0,
			 5.0, -5.0,  0.0
		];
		
		// 頂点色
		this.color = [
			1.0, 1.0, 1.0, 1.0,
			1.0, 1.0, 1.0, 1.0,
			1.0, 1.0, 1.0, 1.0,
			1.0, 1.0, 1.0, 1.0
		];
		
		// テクスチャ座標
		this.textureCoord = [
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0
		];
		
		// 頂点インデックス
		this.index = [
			0, 1, 2,
			3, 2, 1
		];	
		
		// VBOとIBOの生成
		this.vPosition     = create_vbo( this.position );
		this.vColor        = create_vbo( this.color );
		this.vTextureCoord = create_vbo( this.textureCoord );
		this.VBOList       = [ this.vPosition, this.vColor, this.vTextureCoord ];
		this.iIndex        = create_ibo( this.index );
		
		// VBOとIBOの登録
		set_attribute( this.VBOList, this.attLocation, this.attStride );
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iIndex );
		
		// uniformLocationを配列に取得
		this.uniLocation = new Array();
		this.uniLocation[ 0 ]  = gl.getUniformLocation( this.drawShader, 'mvpMatrix' );
		this.uniLocation[ 1 ]  = gl.getUniformLocation( this.drawShader, 'texture' );
		
		// テクスチャ
		this.texture = [];
		
		
		/**
		 * 描画
		 */
		this.drawImplements = function()
		{
			// シェーダをリンク
			gl.useProgram( this.drawShader );
			
			// VBOとIBOの登録
			set_attribute( this.VBOList, this.attLocation, this.attStride );
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iIndex );
			
			// テクスチャをバインドする
			gl.activeTexture( gl.TEXTURE0 );
			gl.bindTexture( gl.TEXTURE_2D, this.texture[ 0 ] );
			
			// uniform変数にテクスチャを登録
			gl.uniform1i( this.uniLocation[ 1 ], 0 );
			
			// モデル座標変換行列の生成
			m.identity( mMatrix );
			m.rotate( mMatrix, rad, [1, 0, 0], mMatrix );
			m.multiply( tmpMatrix, mMatrix, mvpMatrix );
			
			// uniform変数の登録と描画
			gl.uniformMatrix4fv( this.uniLocation[ 0 ], false, mvpMatrix );
			
			gl.drawElements( gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0 );
		};
		
		/**
		 * テクスチャを生成する関数
		 */
		this.loadTexture = function ( num, source )
		{
		    // オブジェクトを取得
		    var obj = this;
		    
			// イメージオブジェクトの生成
			var img = new Image();
			
			// データのオンロードをトリガーにする
			img.onload = function()
			{
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
				
				// 生成したテクスチャを変数に代入
				obj.texture[ num ] = tex;
			};
			
			// イメージオブジェクトのソースを指定
			img.src = source;
		}
		
		return this;
	};




	/**
	 * テストオブジェクトの作成クラス
	 */
	function testObjectXX( drawProgram )
	{
		// シェーダー
		this.drawShader = drawProgram;
		
		// attributeLocationを配列に取得
		this.attLocation = new Array();
		this.attLocation[0] = gl.getAttribLocation( this.drawShader, 'position' );
		this.attLocation[1] = gl.getAttribLocation( this.drawShader, 'color' );
		
		
		// attributeの要素数を配列に格納
		this.attStride = new Array();
		this.attStride[0] = 3;
		this.attStride[1] = 4;
		
		// 頂点の位置
		this.position = [
			-1.0,  1.0,  1.0,
			 1.0,  1.0,  1.0,
			-1.0, -1.0,  1.0,
			 1.0, -1.0,  1.0,
			-2.0,  2.0,  1.0,
			 2.0,  2.0,  1.0,
			-2.0, -2.0,  1.0,
			 2.0, -2.0,  1.0
		];
		
		// 頂点色
		this.color = [
			1.0, 1.0, 1.0, 1.0,
			1.0, 0.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0,
			1.0, 1.0, 1.0, 1.0,
			1.0, 0.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0
		];
		
		// 頂点インデックス
		this.index = [
			0, 1, 2, 3,
			4, 5, 6, 7,
		];	
		
		// VBOとIBOの生成
		this.vPosition     = create_vbo( this.position );
		this.vColor        = create_vbo( this.color );
		this.VBOList       = [ this.vPosition, this.vColor ];
		this.iIndex        = create_ibo( this.index );
		
		// VBOとIBOの登録
		set_attribute( this.VBOList, this.attLocation, this.attStride );
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iIndex );
		
		// uniformLocationを配列に取得
		this.uniLocation = new Array();
		this.uniLocation[0]  = gl.getUniformLocation(this.drawShader, 'mvpMatrix');
		this.uniLocation[1]  = gl.getUniformLocation(this.drawShader, 'pointSize');
		this.uniLocation[2]  = gl.getUniformLocation(this.drawShader, 'texture');
		this.uniLocation[3]  = gl.getUniformLocation(this.drawShader, 'useTexture');
		
		// テクスチャ
		this.texture = [];
		
		
		/**
		 * 描画
		 */
		this.drawImplements = function()
		{
			// シェーダをリンク
			gl.useProgram( this.drawShader );
			
			// VBOとIBOの登録
			set_attribute( this.VBOList, this.attLocation, this.attStride );
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iIndex );
			
			// テクスチャをバインドする
			gl.activeTexture( gl.TEXTURE0 );
			gl.bindTexture( gl.TEXTURE_2D, this.texture[ 0 ] );
			
			// モデル座標変換行列の生成
			m.identity( mMatrix );
			m.rotate( mMatrix, rad, [1, 0, 0], mMatrix );
			m.multiply( tmpMatrix, mMatrix, mvpMatrix );

			// uniform変数の登録と描画
			gl.uniformMatrix4fv( this.uniLocation[ 0 ], false, mvpMatrix );
			
			gl.uniform1f( this.uniLocation[ 1 ], 25.0 );
			gl.uniform1i( this.uniLocation[ 2 ], 0 );
			gl.uniform1i( this.uniLocation[ 3 ], false );
			
			gl.drawElements( gl.POINTS, this.index.length, gl.UNSIGNED_SHORT, 0 );
		};
		
		/**
		 * テクスチャを生成する関数
		 */
		this.loadTexture = function ( num, source )
		{
		    // オブジェクトを取得
		    var obj = this;
		    
			// イメージオブジェクトの生成
			var img = new Image();
			
			// データのオンロードをトリガーにする
			img.onload = function()
			{
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
				
				// 生成したテクスチャを変数に代入
				obj.texture[ num ] = tex;
			};
			
			// イメージオブジェクトのソースを指定
			img.src = source;
		}
		
		return this;
	};





	/**
	 * テストデータ構造体
	 * テクスチャマネージャー
	 */
	function testTextureManager()
	{
		// テクスチャ
		this.texture = [];
		
		/**
		 * テクスチャを生成する関数
		 */
		this.loadTexture = function ( num, source )
		{
		    // オブジェクトを取得
		    var obj = this;
		    
			// イメージオブジェクトの生成
			var img = new Image();
			
			// データのオンロードをトリガーにする
			img.onload = function()
			{
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
				
				// 生成したテクスチャを変数に代入
				obj.texture[ num ] = tex;
			};
			
			// イメージオブジェクトのソースを指定
			img.src = source;
		}
		
		/**
		 * テクスチャを解放する関数
		 */
		this.releaseTexture = function( num )
		{
		};
		
		/**
		 * テクスチャを全て解放する関数
		 */
		this.releaseAllTexture = function ()
		{
		};
		
		/**
		 * テクスチャデータの取得
		 */
		this.getTexture = function( num )
		{
			return this.texture[ num ];
		};
		
		return this;
	}
	
	/**
	 * モデルデータ
	 */
	function testObjectXX00( drawProgram )
	{
		// テクスチャマネージャ
		this.textureManager = new testTextureManager();
		
		// シェーダー
		this.drawShader = drawProgram;
		
		// attributeLocationを配列に取得
		this.attLocation = new Array();
		this.attLocation[0] = gl.getAttribLocation( this.drawShader, 'position' );
		this.attLocation[1] = gl.getAttribLocation( this.drawShader, 'color' );
		this.attLocation[2] = gl.getAttribLocation( this.drawShader, 'textureCoord' );
		
		// attributeの要素数を配列に格納
		this.attStride = new Array();
		this.attStride[0] = 3;
		this.attStride[1] = 4;
		this.attStride[2] = 2;
		
		// 頂点の位置
		this.position = [
			-10.0,  10.0,  0.0,
			 10.0,  10.0,  0.0,
			-10.0, -10.0,  0.0,
			 10.0, -10.0,  0.0
		];
		
		// 頂点色
		this.color = [
			1.0, 1.0, 1.0, 1.0,
			1.0, 1.0, 1.0, 1.0,
			1.0, 1.0, 1.0, 1.0,
			1.0, 1.0, 1.0, 1.0
		];
		
		// テクスチャ座標
		this.textureCoord = [
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0
		];
		
		// 頂点インデックス
		this.index = [
			0, 1, 2,
			3, 2, 1
		];	
		
		this.moveVal = [];
		
		var iPreVal = 0.0;
		
		
		for ( var i=0; i<50; i++ )
		{
			for ( var j=0; j<50; j++ )
			{
				var idx = j + (i * 50);
				
				
				this.moveVal[ ((50*50)*0) + idx ] = -1.0;
				this.moveVal[ ((50*50)*1) + idx ] = 1000.0;
				this.moveVal[ ((50*50)*2) + idx ] = 4000.0;
				
				
				if ( this.moveVal[ ((50*50)*0) + idx ] <= 0.0 )
				{
					this.moveVal[ ((50*50)*0) + idx ] = (1.0 - ((Math.abs(i-25)+Math.abs(j-25))/100.0 * 2.0) ) * 10000.0;
				}
				
				if ( this.moveVal[ ((50*50)*0) + idx ] < 0.0 )
				{
					this.moveVal[ ((50*50)*0) + idx ] = -(1.0 - ((Math.abs(i-25)+Math.abs(j-25))/100.0 * 2.0) ) * 10000.0;
				}
				
				this.position[ (idx*12)+0 ] = -5.0 + (i * 0.2);
				this.position[ (idx*12)+1 ] = 5.0 - (j * 0.2);
				this.position[ (idx*12)+2 ] = 0.0;
				this.position[ (idx*12)+3 ] = -5.0 + ((i+1) * 0.2);
				this.position[ (idx*12)+4 ] = 5.0 - (j * 0.2);
				this.position[ (idx*12)+5 ] = 0.0;
				this.position[ (idx*12)+6 ] = -5.0 + (i * 0.2);
				this.position[ (idx*12)+7 ] = 5.0 - ((j+1) * 0.2);
				this.position[ (idx*12)+8 ] = 0.0;
				this.position[ (idx*12)+9 ] = -5.0 + ((i+1) * 0.2);
				this.position[ (idx*12)+10 ] = 5.0 - ((j+1) * 0.2);
				this.position[ (idx*12)+11 ] = 0.0;
				
				this.color[ (idx*16)+0 ] = 1.0;
				this.color[ (idx*16)+1 ] = 1.0 - iPreVal;
				this.color[ (idx*16)+2 ] = 1.0 - iPreVal;
				this.color[ (idx*16)+3 ] = 1.0;
				this.color[ (idx*16)+4 ] = 1.0;
				this.color[ (idx*16)+5 ] = 1.0 - iPreVal;
				this.color[ (idx*16)+6 ] = 1.0 - iPreVal;
				this.color[ (idx*16)+7 ] = 1.0;
				this.color[ (idx*16)+8 ] = 1.0;
				this.color[ (idx*16)+9 ] = 1.0 - iPreVal;
				this.color[ (idx*16)+10 ] = 1.0 - iPreVal;
				this.color[ (idx*16)+11 ] = 1.0;
				this.color[ (idx*16)+12 ] = 1.0;
				this.color[ (idx*16)+13 ] = 1.0 - iPreVal;
				this.color[ (idx*16)+14 ] = 1.0 - iPreVal;
				this.color[ (idx*16)+15 ] = 1.0;
				
				this.textureCoord[ (idx*8)+0 ] = (i / 50);
				this.textureCoord[ (idx*8)+1 ] = (j / 50);
				this.textureCoord[ (idx*8)+2 ] = ((i+1) / 50);
				this.textureCoord[ (idx*8)+3 ] = (j / 50);
				this.textureCoord[ (idx*8)+4 ] = (i / 50);
				this.textureCoord[ (idx*8)+5 ] = ((j+1) / 50);
				this.textureCoord[ (idx*8)+6 ] = ((i+1) / 50);
				this.textureCoord[ (idx*8)+7 ] = ((j+1) / 50);
				
				this.index[ (idx*6)+0 ] = (idx*4)+0;
				this.index[ (idx*6)+1 ] = (idx*4)+1;
				this.index[ (idx*6)+2 ] = (idx*4)+2;
				this.index[ (idx*6)+3 ] = (idx*4)+3;
				this.index[ (idx*6)+4 ] = (idx*4)+2;
				this.index[ (idx*6)+5 ] = (idx*4)+1;
			}
		}
		
		for ( var i=0; i<50; i++ )
		{
			var x = 25 + Math.floor( Math.random() * 40 ) - 20;
			var y = 25 + Math.floor( Math.random() * 40 ) - 20;
			var idx = x + (y*50);
			var v = 2.0 * 10000.0;
			
			this.moveVal[ ((50*50)*1) + (x+0) + ((y+0)*50) ] = v;
			
			this.moveVal[ ((50*50)*1) + (x+1) + ((y+0)*50) ] = v - 1000;
			this.moveVal[ ((50*50)*1) + (x+2) + ((y+0)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*1) + (x+3) + ((y+0)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*1) + (x+1) + ((y+1)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*1) + (x+2) + ((y+1)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*1) + (x+1) + ((y+2)*50) ] = v - 3000;
			
			this.moveVal[ ((50*50)*1) + (x-1) + ((y+0)*50) ] = v - 1000;
			this.moveVal[ ((50*50)*1) + (x-2) + ((y+0)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*1) + (x-3) + ((y+0)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*1) + (x-1) + ((y+1)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*1) + (x-2) + ((y+1)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*1) + (x-1) + ((y+2)*50) ] = v - 3000;

			this.moveVal[ ((50*50)*1) + (x+1) + ((y+0)*50) ] = v - 1000;
			this.moveVal[ ((50*50)*1) + (x+2) + ((y+0)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*1) + (x+3) + ((y+0)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*1) + (x+1) + ((y-1)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*1) + (x+2) + ((y-1)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*1) + (x+1) + ((y-2)*50) ] = v - 3000;
			
			this.moveVal[ ((50*50)*1) + (x-1) + ((y+0)*50) ] = v - 1000;
			this.moveVal[ ((50*50)*1) + (x-2) + ((y+0)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*1) + (x-3) + ((y+0)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*1) + (x-1) + ((y-1)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*1) + (x-2) + ((y-1)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*1) + (x-1) + ((y-2)*50) ] = v - 3000;
		}
		
		for ( var i=0; i<50; i++ )
		{
			var x = 25 + Math.floor( Math.random() * 30 ) - 15;
			var y = 25 + Math.floor( Math.random() * 30 ) - 15;
			var idx = x + (y*50);
			var v = 0.8 * 10000.0;
			
			this.moveVal[ ((50*50)*2) + (x+0) + ((y+0)*50) ] = v;
			
			this.moveVal[ ((50*50)*2) + (x+1) + ((y+0)*50) ] = v - 1000;
			this.moveVal[ ((50*50)*2) + (x+2) + ((y+0)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*2) + (x+3) + ((y+0)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*2) + (x+1) + ((y+1)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*2) + (x+2) + ((y+1)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*2) + (x+1) + ((y+2)*50) ] = v - 3000;
			
			this.moveVal[ ((50*50)*2) + (x-1) + ((y+0)*50) ] = v - 1000;
			this.moveVal[ ((50*50)*2) + (x-2) + ((y+0)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*2) + (x-3) + ((y+0)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*2) + (x-1) + ((y+1)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*2) + (x-2) + ((y+1)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*2) + (x-1) + ((y+2)*50) ] = v - 3000;

			this.moveVal[ ((50*50)*2) + (x+1) + ((y+0)*50) ] = v - 1000;
			this.moveVal[ ((50*50)*2) + (x+2) + ((y+0)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*2) + (x+3) + ((y+0)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*2) + (x+1) + ((y-1)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*2) + (x+2) + ((y-1)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*2) + (x+1) + ((y-2)*50) ] = v - 3000;
			
			this.moveVal[ ((50*50)*2) + (x-1) + ((y+0)*50) ] = v - 1000;
			this.moveVal[ ((50*50)*2) + (x-2) + ((y+0)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*2) + (x-3) + ((y+0)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*2) + (x-1) + ((y-1)*50) ] = v - 2000;
			this.moveVal[ ((50*50)*2) + (x-2) + ((y-1)*50) ] = v - 3000;
			this.moveVal[ ((50*50)*2) + (x-1) + ((y-2)*50) ] = v - 3000;
		}
		
		// VBOとIBOの生成
		this.vPosition     = create_vbo( this.position );
		this.vColor        = create_vbo( this.color );
		this.vTextureCoord = create_vbo( this.textureCoord );
		this.VBOList       = [ this.vPosition, this.vColor, this.vTextureCoord ];
		this.iIndex        = create_ibo( this.index );
		
		// VBOとIBOの登録
		set_attribute( this.VBOList, this.attLocation, this.attStride );
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iIndex );
		
		// uniformLocationを配列に取得
		this.uniLocation = new Array();
		this.uniLocation[ 0 ]  = gl.getUniformLocation( this.drawShader, 'mvpMatrix' );
		this.uniLocation[ 1 ]  = gl.getUniformLocation( this.drawShader, 'texture' );
		
		/**
		 * 描画
		 */
		this.drawImplements = function()
		{
			// シェーダをリンク
			gl.useProgram( this.drawShader );
			
			// VBOとIBOの登録
			set_attribute( this.VBOList, this.attLocation, this.attStride );
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iIndex );
			
			// テクスチャをバインドする
			gl.activeTexture( gl.TEXTURE0 );
			gl.bindTexture( gl.TEXTURE_2D, this.textureManager.getTexture( 0 ) );
			
			// uniform変数にテクスチャを登録
			gl.uniform1i( this.uniLocation[ 1 ], 0 );
			
			// モデル座標変換行列の生成
			m.identity( mMatrix );
			m.rotate( mMatrix, rad, [1, 0, 0], mMatrix );
			m.multiply( tmpMatrix, mMatrix, mvpMatrix );
			
			// uniform変数の登録と描画
			gl.uniformMatrix4fv( this.uniLocation[ 0 ], false, mvpMatrix );
			
			gl.drawElements( gl.TRIANGLES, this.index.length, gl.UNSIGNED_SHORT, 0 );
		};
		
		return this;
	};
	



};

