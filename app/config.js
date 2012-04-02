//var ASSETS_BASEURL = 'http://sasi.localhost/sasi_assets';
var ASSETS_BASEURL = '/sasi_assets';

require.config({
	deps: ["main"],

	paths: {
		text: ASSETS_BASEURL + "/js/require.js/plugins/text",
		use: ASSETS_BASEURL + "/js/require.js/plugins/use",
		jquery: ASSETS_BASEURL + "/js/jquery",
		underscore: ASSETS_BASEURL + "/js/underscore",
		backbone: ASSETS_BASEURL + "/js/backbone",
		ui: ASSETS_BASEURL + "/js/jquery.ui/jquery-ui",
		_s: ASSETS_BASEURL + "/js/underscore.string",
		openlayers: ASSETS_BASEURL + "/js/openlayers/openlayers",
	},
	
	use: {
		backbone: {
		  deps: ["use!underscore", "jquery"],
		  attach: "Backbone"
		},

		underscore: {
		  attach: "_"
		},

		ui: {
		  deps: ["jquery"],
		  attach: "ui"
		},

		_s: {
		  deps: ["use!underscore"],
		  attach: "_s"
		},

		openlayers: {
		  attach: "ol"
		},

	},

	packages: [
		{
		  "name": "FacetApp",
		  "location": "http://sasi.localhost/sasi_assets/js/facet_app/src"
		},

		{
		  "name": "Facets",
		  "location": "http://sasi.localhost/sasi_assets/js/facets/src"
		},

		{
		  "name": "MapView",
		  "location": "http://sasi.localhost/sasi_assets/js/mapview/src"
		},
		
		{
		  "name": "Dialogs",
		  "location": "http://sasi.localhost/sasi_assets/js/dialogs/src"
		},

		{
		  "name": "DownloadDialog",
		  "location": "http://sasi.localhost/sasi_assets/js/download_dialog/src"
		}

	]

});
