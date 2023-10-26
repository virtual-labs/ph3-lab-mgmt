module.exports = (buildPath, templatePath) => ({
	globDirectory: buildPath,
	globPatterns: [
		'**/*.{json,png,jpg,css,html,svg,js}'
	],
	swDest: `${buildPath}/sw.js`,
	swSrc: templatePath,
}); 