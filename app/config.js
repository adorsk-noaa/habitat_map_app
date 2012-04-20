//var ASSETS_BASEURL = 'localhost/sasi_assets';
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
		  "location": ASSETS_BASEURL + "/js/facet_app/src"
		},

		{
		  "name": "Facets",
		  "location": ASSETS_BASEURL + "/js/facets/src"
		},

		{
		  "name": "MapView",
		  "location": ASSETS_BASEURL + "/js/mapview/src"
		},
		
		{
		  "name": "Dialogs",
		  "location": ASSETS_BASEURL + "/js/dialogs/src"
		},

		{
		  "name": "ExportDialog",
		  "location": ASSETS_BASEURL + "/js/export_dialog/src"
		}

	]

});
