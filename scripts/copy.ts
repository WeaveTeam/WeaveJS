module.exports = function()
{
	type TargetEntry = {flatten?:boolean, cwd:string, src:string, dest:string};

	let targets:{[name:string]:TargetEntry} = {
		index_html: {flatten: true, cwd: 'WeaveApp/resources/', src: 'index.html', dest: 'WeaveApp/dist/'},
		weave_html: {flatten: true, cwd: 'WeaveApp/resources/', src: 'weave.html', dest: 'WeaveApp/dist/'},
		css: {flatten: true, cwd: 'WeaveApp/resources/', src: 'css/*.css', dest: 'WeaveApp/dist/css/'},
		img: {flatten: true, cwd: 'WeaveApp/resources/', src: 'img/*.*', dest: 'WeaveApp/dist/img'},
		fonts: {flatten: true, cwd: 'WeaveApp/resources/', src: 'css/fonts/*.ttf', dest: 'WeaveApp/dist/fonts'},
		olcss: {flatten: true, cwd: 'node_modules/openlayers/css', src: 'ol.css', dest: 'WeaveApp/dist/css/'},
		fontawesomecss: {flatten: true, cwd: 'node_modules/font-awesome/css', src: 'font-awesome.css', dest: 'WeaveApp/dist/css/'},
		fontawesomefont: {flatten: true, cwd: 'node_modules/font-awesome/fonts', src: '*', dest: 'WeaveApp/dist/fonts/'},
		semanticjs: {cwd: 'WeaveApp/resources/semantic', src: 'semantic.min.js', dest: 'WeaveApp/dist/'},
		semanticcss: {cwd: 'WeaveApp/resources/semantic', src: 'semantic.min.css', dest: 'WeaveApp/dist/css/'},
		semanticfonts: {cwd: 'WeaveApp/resources/semantic/themes', src: '*', dest: 'WeaveApp/dist/css/themes/'},
		weavesessions: {flatten: true, cwd: 'weave_sessions', src: "*.weave", dest: "WeaveApp/dist/"},
		projdb: {flatten: true, cwd: 'WeaveApp/resources/', src: 'ProjDatabase.zip', dest: "WeaveApp/dist/"}
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