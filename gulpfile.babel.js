import gulp from 'gulp';
import nunjucksRender from 'gulp-nunjucks-render';
import plumber from 'gulp-plumber';
import data from 'gulp-data';
import cached from 'gulp-cached';
import fs from 'fs';
import del from 'del';
import ws from 'gulp-webserver';
import path from 'path';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import sourcemaps from 'gulp-sourcemaps';
import minificss from 'gulp-minify-css';
import autoprefixer from 'autoprefixer';
import postCss from 'gulp-postcss';
import rename from 'gulp-rename';
import dependents from 'gulp-dependents';
import minify from "gulp-minify";
import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';

/* Path === */
const paths = {
	html: {
		src: './src/html',
		dest: './dist',
	},
	css: {
		src: './src/scss',
		dest: './dist/css'
	},
	js: {
		src: './src/js',
		dest: './dist/js'
	},
	img: {
		src: './src/images',
		dest: './dist/images',
	},
	font: {
		src: './src/fonts',
		dest: './dist/fonts',
	},
};


/* Util === */
// 에러 발생 시 로그
const onErrorHandler = (error) => console.log(error);


/* Task === */
// html task
const html = () => {
	// 들여쓰기 조정 함수
	const manageEnvironment = (environment) => {
		environment.addFilter('tabIndent', (str, numOfIndents, firstLine) => {
			str = str.replace(/^(?=.)/gm, new Array(numOfIndents + 1).join('\t'));
			if(!firstLine) {
				str = str.replace(/^\s+/, '');
			}
			return str;
		});
	};

	// _gnb.json 준비
	const popupJson = JSON.parse(fs.readFileSync(paths.html.src + '/_templates/_json/_popup.json'));
	const popupData = () => {
		return {...popupJson};
	}

	// njk 빌드
	return gulp.src([
		paths.html.src + '/**/*',															// 빌드할 대상
		'!' + paths.html.src + '/**/_*',											// 빌드 제외
		'!' + paths.html.src + '/**/_*/**/*'									// 빌드 제외
	])
	.pipe( plumber({errorHandler: onErrorHandler}) )				// 에러 발생 시 gulp 종료 방지
	.pipe( data(popupData) )																// popup data 가져오기
	.pipe( nunjucksRender({																	// njk 적용
		envOptions: {																					// njk 옵션 설정
			autoescape: false,																	// 태그를 앤티티 코드로 자동변환 하지 않기
		},
		manageEnv: manageEnvironment,													// 사용자 정의 필터 (들여쓰기(Tab Indent) 함수 적용)
		path: [paths.html.src],																// (필수) html 경로
	}) )
	.pipe( cached('html') )																	// 변경된 파일 캐시 저장
	.pipe( gulp.dest(paths.html.dest) )											// 빌드될 지점
}

// css task
const css = () => {
	//scss 옵션 정의
	const sass = gulpSass(dartSass);												// ECMAScript 모듈(최신 Node.js 14 이상에서 지원됨)에서 사용하기 위함
	const options = {
		scss : {
			outputStyle: 'expanded',														// 컴파일 : nested(default), expanded, compact, compressed
			indentType: 'tab',																	// 들여쓰기 : space(default), tab
			indentWidth: 1,																			// 들여쓰기 칸 (Default : 2)
			sourceComments: true,																// 주석 제거 여부 (Default : false)
			compiler: dartSass,																	// 컴파일 도구
		},
		postcss: [ autoprefixer({
			overrideBrowserslist: 'last 2 versions',						// 최신 브라우저 기준 하위 2개의 버전
		}) ]
	};

	return gulp.src(
		paths.css.src + '/**/*.scss',													// 빌드할 대상
		{ since: gulp.lastRun(css) }													// 변경된 파일에 대해서만 컴파일 진행
	)
	.pipe( plumber({errorHandler:onErrorHandler}) )					// 에러 발생 시 gulp 종료 방지
	.pipe( dependents() )																		// 현재 스트림에 있는 파일에 종속되는 모든 파일을 추가
	.pipe( sourcemaps.init() )															// 소스맵 작성
	.pipe( sass(options.scss).on('error', sass.logError) )	// scss 옵션 적용, watch 멈춤 방지
	.pipe( postCss(options.postcss) )												// 후처리
	.pipe( sourcemaps.write() )															// 소스맵 적용
	.pipe( gulp.dest(paths.css.dest) )											// 빌드될 지점 (*.css)
	.pipe( minificss() )																		// css 압축
	.pipe( rename({ suffix: '.min' }) )											// 압축파일명 변경
	.pipe( sourcemaps.write() )															// 소스맵 적용
	.pipe( gulp.dest(paths.css.dest) );											// 빌드될 지점 (*.min.css)
}

// js task
const js = () => {
	return gulp.src([
		paths.js.src + '/**/*',																// 빌드할 대상
		'!' + paths.js.src + '/lib/**/*'											// 빌드 제외
	])
	.pipe( sourcemaps.init({ loadMaps: true }) )						// 소스맵 초기화
	.pipe(minify({																					// js 압축
		ext: { min: '.min.js' },															// 접미사 설정
		ignoreFiles: ['-min.js']															// 해당 패턴은 무시
	}))
	.pipe( sourcemaps.write() )															// 소스맵 적용
	.pipe( gulp.dest(paths.js.dest) );											// 빌드될 지점
}
const js_lib = () => {
	return gulp.src( paths.js.src + '/lib/**/*' )
	.pipe( dependents() )																		// 현재 스트림에 있는 파일에 종속되는 모든 파일을 추가
	.pipe( gulp.dest(paths.js.dest + '/lib') )
}

// image task
const image = () => {
	return gulp.src( paths.img.src + '/**/*' )							// 빌드할 대상
	.pipe( newer(paths.img.dest) )													// 변경된 파일만 통과
	.pipe( imagemin( {verbose: true}) ) 										// 이미지 최적화
	.pipe( gulp.dest(paths.img.dest) );											// 빌드될 지점
}

// font task
const font = () => {
	return gulp.src( paths.font.src + '/**/*' )							// 빌드할 대상
	.pipe( gulp.dest(paths.font.dest) );											// 빌드될 지점
}

// clean task
const clean = () => del(['./dist']);											// dist 삭제

// webserver task
const webserver = () => {
	return gulp.src(paths.html.dest)												// webserver 실행 경로
	.pipe(
		ws({																									// webserver 옵션 설정
			// port: 8000,																			// default 8000
			livereload: true,																		// 브라우저 새로고침
			open: true,																					// 브라우저 띄우기
		})
	);
}

// watch task
const watch = () => {
	const html_watcher = gulp.watch(paths.html.src + '/**/*', html);
	file_management(html_watcher, paths.html.src, paths.html.dest);

	const scss_watcher = gulp.watch(paths.css.src + '/**/*', css);
	file_management(scss_watcher, paths.css.src, paths.css.dest);

	const js_watcher = gulp.watch(paths.js.src + '/**/*', js);
  file_management(js_watcher, paths.js.src, paths.js.dest);

	const js_lib_watcher = gulp.watch(paths.js.src + '/lib/**/*', js_lib);
  file_management(js_lib_watcher, paths.js.src, paths.js.dest);

	const image_watcher = gulp.watch(paths.img.src + "/**/*", image);
  file_management(image_watcher, paths.img.src, paths.img.dest);

	const font_watcher = gulp.watch(paths.font.src + "/**/*", font);
  file_management(font_watcher, paths.font.src, paths.font.dest);
}
// watch - 파일 감시 및 삭제를 위한 함수
const file_management = (watcher_target, src_path, dist_path) => {
	watcher_target.on('unlink', (filepath) => {
		const filePathFromSrc = path.relative(path.resolve(src_path), filepath);
		const extension_type = filePathFromSrc.split('.')[filePathFromSrc.split('.').length-1];

		// njk(html) 삭제
		if( extension_type === 'njk' ) {
			const destFilePath_html = path.resolve(dist_path, filePathFromSrc).replace('.njk','.html');
			del.sync(destFilePath_html);
		}

		// scss 삭제 (min 파일까지 삭제)
		else if( extension_type === 'scss' ) {
			const destFilePath_css = path.resolve(dist_path, filePathFromSrc).replace('.scss','.css');
			del.sync(destFilePath_css);
			const destFilePath_minCss = path.resolve(dist_path, filePathFromSrc).replace('.scss','.min.css');
			del.sync(destFilePath_minCss);
		}

		// js 삭제 (min 파일까지 삭제)
		else if( extension_type === 'js' ) {
			const destFilePath_js = path.resolve(dist_path, filePathFromSrc);
			del.sync(destFilePath_js);
			const destFilePath_minJs = path.resolve(dist_path, filePathFromSrc).replace('.js','.min.js');
			del.sync(destFilePath_minJs);
		}

		// 위 파일 외 삭제
		else{
			const destFilePath = path.resolve(dist_path, filePathFromSrc);
			console.log(destFilePath);
			del.sync(destFilePath);
		}
	});
}

/* Export === */
const prepare = gulp.series([ clean, font, image ]);
const assets = gulp.series([ html, css, js, js_lib ]);
const live = gulp.series([ webserver, watch ]);

export const build = gulp.series([ prepare, assets ]);
export const dev = gulp.series([ build, live ]);
