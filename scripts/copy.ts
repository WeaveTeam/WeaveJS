module.exports = function()
{
	type TargetEntry = {flatten?:boolean, cwd:string, src:string, dest:string};

	let targets:{[name:string]:TargetEntry} = {
		index_html: {flatten: true, cwd: 'app/src/', src: 'index.html', dest: 'app/dist/'},
		weave_html: {flatten: true, cwd: 'app/src/', src: 'weave.html', dest: 'app/dist/'},
		css: {flatten: true, cwd: 'app/src/', src: 'css/*.css', dest: 'app/dist/css/'},
		img: {flatten: true, cwd: 'app/src/', src: 'img/*.*', dest: 'app/dist/img'},
		fonts: {flatten: true, cwd: 'app/src/', src: 'css/fonts/*.ttf', dest: 'app/dist/fonts'},
		olcss: {flatten: true, cwd: 'node_modules/openlayers/css', src: 'ol.css', dest: 'app/dist/css/'},
		fontawesomecss: {flatten: true, cwd: 'node_modules/font-awesome/css', src: 'font-awesome.css', dest: 'app/dist/css/'},
		fontawesomefont: {flatten: true, cwd: 'node_modules/font-awesome/fonts', src: '*', dest: 'app/dist/fonts/'},
		semantic: {cwd: 'app/src/semantic', src: 'semantic.min.css', dest: 'app/dist/css/'},
		semanticfonts: {cwd: 'app/src/semantic/themes', src: '*', dest: 'app/dist/css/themes/'},
		weavesessions: {flatten: true, cwd: 'weave_sessions', src: "*.weave", dest: "app/dist/"},
		projdb: {flatten: true, cwd: 'app/src/', src: 'ProjDatabase.zip', dest: "app/dist/"}
	};

	let fse = require("fs-extra");
	let glob = require("glob");
	let path = require("path");
	let minimist = require('minimist');

	let argv = minimist(process.argv.slice(2));
	let target_names = argv._;

	if (!target_names.length)
	{
		target_names = Object.keys(targets);
	}

	function copy_target(target:TargetEntry)
	{
		glob(
			target.src,
			{cwd: target.cwd},
			(err:Error, matches:string[]) => {
				matches.forEach((match)=>
				{
					let dest = path.join(target.dest, target.flatten ? path.basename(match) : match);
					if (argv.v)
						console.log(path.join(target.cwd, match), dest);
					fse.copySync(path.join(target.cwd, match), dest);
				})
			}
		);
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
}