require([
  "jquery",
  "use!backbone",
  "use!underscore",
  "_s",
  "use!openlayers",
  "FacetApp",
  "Facets",
  "MapView",
  "DownloadDialog",
],

function($, Backbone, _, _s, ol, FacetApp, Facets, MapView, DownloadDialog){

	/* Common functions */
	facets = {};
	formatAreaLabels = function(choices){
		var choice_labels = [];

		_.each(choices, function(choice){
			var exponential_count = choice['count'].toExponential(1);
			choice_labels.push(_s.sprintf("<span title='%s'>%s km<sup>2</sup></span>", exponential_count, exponential_count));
		});

		return choice_labels;
	};

	paramsToFilters = function(params){
		filters = [];
		_.each(params, function(filter_param, facet_id){
			if (! $.isEmptyObject(filter_param)){
				filters.push.apply(filters, filter_param);
			}
		});
		return filters;
	};

	/* Make the application frame. */
	var app_model = new FacetApp.models.FacetAppModel({
		id: "habitat-map-app"
	});
	var app = new FacetApp.views.FacetAppView({
		el: '#habitat-map-app',
		model: app_model
	});
	$('#habitat-map-app').css('position', 'absolute');
	$('#habitat-map-app').css('z-index', 1);


	/* Make facets */

	// Substrate facet.
	substrate_facet_model = new Facets.models.FacetModel({
		id: 'habitat_type.substrate.id',
		label: 'Substrates',
		type: 'multiselect',
		count_id_field: 'habitat_type.substrate.id',
		count_label_field: 'habitat_type.substrate.name',
		count_value_field: 'area',
		choices: []
	});
	substrate_facet_view = new Facets.views.ListFacetView({
		model: substrate_facet_model
	});
	substrate_facet_view.formatChoiceCountLabels = formatAreaLabels;
	facets['substrates'] = {
		model: substrate_facet_model,
		view: substrate_facet_view
	};

	// Energy facet.
	energy_facet_model = new Facets.models.FacetModel({
		id: 'habitat_type.energy',
		label: 'Habitat Energy',
		type: 'multiselect',
		count_id_field: 'habitat_type.energy',
		count_label_field: 'habitat_type.energy',
		count_value_field: 'area',
		choices: []
	});
	energy_facet_view = new Facets.views.ListFacetView({
		model: energy_facet_model
	});
	facets['energy'] = {
		model: energy_facet_model,
		view: energy_facet_view
	};
	energy_facet_view.formatChoiceCountLabels = formatAreaLabels;

	// Features facet.
	feature_facet_model = new Facets.models.FacetModel({
		id: 'habitat_type.features.id',
		label: 'Features',
		type: 'multiselect',
		count_id_field: 'habitat_type.features.id',
		count_label_field: 'habitat_type.features.name',
		count_value_field: 'area',
		choices: []
	});
	feature_facet_view = new Facets.views.ListFacetView({
		model: feature_facet_model
	});
	facets['feature'] = {
		model: feature_facet_model,
		view: feature_facet_view
	};
	feature_facet_view.formatChoiceCountLabels = formatAreaLabels;

	// Define fetch method for each choice facet model.
	_.each(facets, function(facet){
		facet['model'].sync = function(method, model, options) {
			if (method == 'read'){
				options = options || {};
				url_params= [];
				filters = paramsToFilters(model.get('parameters'));
				url_params.push('FILTERS=' + JSON.stringify(filters));
				url_params.push('ID_FIELD=' + model.get('count_id_field'));
				url_params.push('LABEL_FIELD=' + model.get('count_label_field'));
				url_params.push('VALUE_FIELD=' + model.get('count_value_field'));
				options.url = '/habitat/get_choice_facet/?' + url_params.join('&');
			}
			Backbone.sync(method, model, options);
		};
	});


	// Depth facet.
	var depth_f_m = new Facets.models.FacetModel({
		id: 'z',
		label: 'Depth',
		value_field: 'z',
		field_label: 'Depth',
		type: 'numeric',
		base_filters: [],
		filtered_histogram: [],
		base_histogram: []
	});
	depth_f_m.sync = function(method, model, options) {
		if (method == 'read'){
			options = options || {};
			url_params= [];
			filters = paramsToFilters(model.get('parameters'));
			url_params.push('FILTERS=' + JSON.stringify(filters));
			url_params.push('VALUE_FIELD=' + model.get('value_field'));
			options.url = '/habitat/get_numeric_facet/?' + url_params.join('&');
		}
		Backbone.sync(method, model, options);
	};

	var depth_f_view = new Facets.views.NumericFacetView({
		model: depth_f_m
	});
	facets['depth'] = {
		model: depth_f_m,
		view: depth_f_view
	};


	// Create facet collection from models.
	facet_models = [];
	_.each(facets, function(facet){
		facet_models.push(facet['model'])
	});
	f_fc = new Facets.models.FacetCollection(facet_models, {});

	// Create collection view.
	f_fv = new Facets.views.FacetCollectionView({
		el: app.getFacetsEl(),
		model: f_fc,
	});

	// Add facet views to the collection view.
	_.each(facets,function(facet){
		f_fv.addFacetView(facet['view']);
	});


	/* Make the MapView. */

	sasi_max_extent= new OpenLayers.Bounds(-78.4985,32.1519,-65.7055,44.7674);

	var default_layer_options = {
		maxExtent: sasi_max_extent,
		transitionEffect: 'resize'
	};

	var layers = {};

	baselayers_m = new MapView.models.LayerModel({
		id: "baselayers",
		name: "Base Layers",
		service_url: '/basemap/get_map',
		params: {}, 
		options: _.extend({}, default_layer_options,{
		})
	});
	baselayers_v = new MapView.views.WMSLayerView({model: baselayers_m});
	layers['baselayers'] = {model: baselayers_m, view: baselayers_v};
	
	habitats_m = new MapView.models.LayerModel({
		id: 'habitats',
		name: "SASI Habitats",
		service_url: '/habitat/get_map',
		params: {
			layers: 'habitat',
			transparent: true,
			params: ''
		},
		options: _.extend({}, default_layer_options, {
			resolutions: [0.025, 0.0125, 0.00625, 0.003125, 0.0015625]
		})
	});
	habitats_v = new MapView.views.WMSLayerView({model: habitats_m});
	layers['habitats'] = {model: habitats_m, view: habitats_v};

	layer_models = _.map(layers, function(layer){return layer['model']});
	layer_views = _.map(layers, function(layer){return layer['view']});

	mv_layers_c = new MapView.models.LayerCollection(layer_models);

	mv_m = new MapView.models.MapViewModel({
		layers: mv_layers_c,
		options: {
			allOverlays: true,
			maxExtent: sasi_max_extent,
			restrictedExtent: sasi_max_extent,
			resolutions: [0.025, 0.0125, 0.00625, 0.003125, 0.0015625]
		}
	});

	mv_v = new MapView.views.MapViewView({
		model: mv_m
	});
	_.each(layer_views, function(layer_view){
		mv_v.addLayerView(layer_view);
	});
	app.addDataView(mv_v);

	/* Make the Download Data Dialog */

	var ddig_m = new DownloadDialog.models.DownloadDialogModel({
		width: '400px',
		download_options: [
			{ 
				id: 'csv',
				label: 'Spreadsheet',
				url: function(model){
					var filters = JSON.stringify(paramsToFilters(this.get('restrictions')));
					url = encodeURI(_s.sprintf("/habitat/get_export/?TYPE=csv&FILTERS=%s", filters));
					return url;
				},
				filetype: 'csv'
			},
			{ 
				id: 'shp',
				label: 'Shapefile',
				url: function(model){
					var filters = JSON.stringify(paramsToFilters(this.get('restrictions')));
					url = encodeURI(_s.sprintf("/habitat/get_export/?TYPE=shp&FILTERS=%s", filters));
					return url;
				},
				filetype: 'shp'
			},
		]
	});

	var ddig_v = new DownloadDialog.views.DownloadDialogView({
		model: ddig_m
	});
	$(ddig_v.el).css('display', 'none');
	$(ddig_v.el).css('z-index', 500);
	$('body').append(ddig_v.el);


	// Make summary stats model and view.
	SummaryBarModel = Backbone.Model.extend({
		defaults: {
			filtered_total: 0,
			unfiltered_total: 0,
			value_field: 'area',
			restrictions: {}
		},
		sync: function(method, model, options) {
			if (method == 'read'){
				options = options || {};
				url_params= [];
				filters = paramsToFilters(model.get('restrictions'));
				url_params.push('FILTERS=' + JSON.stringify(filters));
				url_params.push('VALUE_FIELD=' + model.get('value_field'));
				options.url = '/habitat/get_totals/?' + url_params.join('&');
			}
			Backbone.sync(method, model, options);
		}
	});
	var summary_stats_m = new SummaryBarModel();

	SummaryBarView = Backbone.View.extend({
		initialize: function(){
			this.model.on('change:restrictions', this.onChangeRestrictions, this);
			this.model.on('change:filtered_total', this.render, this);
		},
		render: function(){
			var total = this.model.get('unfiltered_total');
			var current = this.model.get('filtered_total');
			$(this.el).html(_s.sprintf("Currently selected area: %s km<sup>2</sup> (%.1f%% of %s km<sup>2</sup> total)", 
					current.toExponential(1),
					current/total * 100.0,
					total.toExponential(1)
					));
		},
		onChangeRestrictions: function(){
			this.model.fetch();
		}
	});

	var summary_stats_v = new SummaryBarView({
		el: $('.summary-bar', app.el),
		model: summary_stats_m,
	});

	// Trigger changes on restriction changes.
	f_fc.on('change:restrictions', function(){

		// Get restrictions.
		restrictions = f_fc.getRestrictions();

		// Update map.
		filters = paramsToFilters(restrictions);
		map_params = habitats_m.get('params');
		map_params['params'] = JSON.stringify(filters);
		habitats_m.trigger('change change:params');

		// Update data export restrictions.
		ddig_m.set({restrictions: restrictions});

		// Update summary bar.
		summary_stats_m.set({restrictions: restrictions});

	}, this);

	// Add dialog launcher to app.
	var ddig_launcher = $('<button class="button">Download Data...</button>');
	$(ddig_launcher).on('click', function(){
		ddig_v.show();
	});
	$('.tool-bar', app.el).append(ddig_launcher);


	// Listen for resizing.
	$(window).on('resize', function(){
		$(app.el).css('height', $(window).height());
		$(app.el).css('width', $(document.body).width());
		app.resize();
	});

	$(document).ready(function(){
		$(window).resize();
		app.trigger('ready');

		// Fetch the facets.
		f_fc.each(function(model){model.fetch()});

	});

});
