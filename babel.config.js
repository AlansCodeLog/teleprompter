module.exports = {
	"presets": [
		"@babel/typescript",
		[
		"@babel/preset-env",
			{
				"useBuiltIns": "entry",
				"targets": {
					esmodules: true,
					node: true,
				}
			}
		],
	],
	"plugins": [
		"@babel/proposal-class-properties",
		"@babel/proposal-object-rest-spread"
	],
}
