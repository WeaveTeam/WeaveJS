targets = {
	index_html: {flatten: true, cwd: 'src/', src: 'index.html', dest: 'dist/'},
	weave_html: {flatten: true, cwd: 'src/', src: 'weave.html', dest: 'dist/'},
	css: {flatten: true, cwd: 'src/', src: 'css/*.css', dest: 'dist/'},
	img: {flatten: true, cwd: 'src/', src: 'img/*.*', dest: 'dist/img'},
	fonts: {flatten: true, cwd: 'src/', src: 'css/fonts/*.ttf', dest: 'dist/fonts'},
	olcss: {flatten: true, cwd: 'node_modules/openlayers/css', src: 'ol.css', dest: 'dist/'},
	fontawesomecss: {flatten: true, cwd: 'node_modules/font-awesome/css', src: 'font-awesome.css', dest: 'dist/css/'},
	fontawesomefont: {flatten: true, cwd: 'node_modules/font-awesome/fonts', src: '*', dest: 'dist/fonts/'},
	semantic: {cwd: 'src/semantic', src: '**', dest: 'dist/semantic/'},
	weavesessions: {flatten: true, cwd: 'weave_sessions', src: "*", dest: "dist/"},
	projdb: {flatten: true, cwd: 'src/', src: 'ProjDatabase.zip', dest: "dist/"},
	core: {cwd: "WeaveASJS/bin/js-release/", src: "*.*", dest: "dist/core"},
	weave_dts: {cwd: "WeaveASJS/typings/", src: "weavejs-core.d.ts", dest: "typings/weave/"}
};

fse = require("fs-extra");
glob = require("glob");
path = require("path");
minimist = require('minimist');

argv = minimist(process.argv.slice(2));
target_names = argv._;

if (!target_names.length)
{
	target_names = Object.keys(targets);
}

function copy_target(target)
{
	glob(target.src, {cwd: target.cwd},
	(err, matches) => {
		matches.forEach((match)=>
		{
			let dest;
			dest = path.join(target.dest, target.flatten ? path.basename(match) : match);
			if (argv.v) console.log(path.join(target.cwd, match), dest);
			fse.copySync(path.join(target.cwd, match), dest);
		})
	});
}

for (let target_name of target_names)
{
	if (!targets.hasOwnProperty(target_name))
	{
		console.error(`No such copy target '${target_name}'`, targets);
		process.exit(-1);
	}
	else
	{
		copy_target(targets[target_name]);
	}	
}