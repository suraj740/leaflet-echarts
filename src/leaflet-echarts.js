L.Echarts = L.Echarts || {};

L.Echarts = L.Layer.extend({
    options: {
        zIndex: 7,
        opacity: 1,
        offset: 100
    },
    initialize: function(container, bounds, chartObject, chartConfig, options, actionConfig, floor_info, xAreaOffset) {
        L.setOptions(this, options)
        this._bounds = new L.LatLngBounds(bounds);
        this._echart = chartObject;
        this.container = container;
        this._echartOptions = chartConfig;
        this._actionOptions = actionConfig;
        this.floor_info = floor_info;
        this.xAreaOffset = 0;
        if (xAreaOffset) {
            this.xAreaOffset = xAreaOffset;
        }
        // console.log('floor_info', floor_info, this.xAreaOffset);

    },

    onAdd: function (map) {
        if (!this._echartsContainer) {
            this._initChart();
            this._initEChart();

        }
        // console.log('Map object', this._map);
        // console.log('Map map', map);

        this._updateZIndex();
        this.getPane().appendChild(this._echartsContainer);
        // this.addInteractiveTarget(this._echartsContainer);

        // this.appendChild(this._actionContainer);
        // console.log('container', this.container, this._map);

        if (this._actionOptions) {
            $("#" + this.container).append(this._actionContainer);
            this.addInteractiveTarget(this._actionContainer);
            L.DomEvent.disableClickPropagation(this._actionContainer);
            L.DomEvent.disableScrollPropagation(this._actionContainer);
        }

        this._reset();
        // this._map.dragging.disable();

    },

    onRemove: function () {
        // console.log("Remove", this);
        this._echartInstance.clear();
        L.DomUtil.remove(this._echartsContainer);
        if (this._actionOptions) {
            this._action.clear();
            L.DomUtil.remove(this._actionContainer);
        }
    },

    onResize: function () {
        // console.log("size", this);
    },

    getEchartsContainer: function () {
        return this._echartsContainer;
    },

    getEvents: function () {
        // console.log("Events");
        var events = {
            zoom: this._reset,
            viewreset: this._reset
        };

        if (this._zoomAnimated) {
            events.zoomanim = this._animateZoom;
        }

        return events;
    },

    setZIndex: function (value) {
        this.options.zIndex = value;
        this._updateZIndex();
        return this;
    },

    setChartOption: function (value) {
        this._echartOptions = value;
        this._drawCharts();
    },

    _updateZIndex: function () {
        if (this._echartsContainer && this.options.zIndex !== undefined && this.options.zIndex !== null) {
            this._echartsContainer.style.zIndex = this.options.zIndex;
        }
    },

    _updateOpacity: function () {
        L.DomUtil.setOpacity(this._echartsContainer, this.options.opacity);
    },

    setBoundsForContainer: function (container, transform) {

        var topLeft = [0, this.xAreaOffset], 
        bottomRight = [this.floor_info.scale_y, this.floor_info.scale_x];

        if (this.floor_info.dim_x) {
            bottomRight[1] = this.floor_info.dim_x
        }

        if (this.floor_info.dim_y) {
            bottomRight[0] = this.floor_info.dim_y
        }
        // console.log('bottomRight', topLeft, bottomRight);


        var insetBottom = this._map.latLngToLayerPoint(new L.latLng(topLeft));
        var insetTop = this._map.latLngToLayerPoint(new L.latLng(bottomRight));
        // var origin = this._map.latLngToLayerPoint(new L.latLng([bottomRight[0], topLeft[0]]));
        var offset = this._map.latLngToLayerPoint(new L.latLng([bottomRight[0], this.xAreaOffset]));
        // console.log('offset', offset);
        // console.log('insetBottom', insetBottom);
        // console.log('insetTop', insetTop);
        // origin.x -= offset.x;
        // origin.y -= offset.y;

        // console.log('topLeft', topLeft);
        // console.log('bottomRight', bottomRight);
        // console.log('origin', origin);

        // var insetSize = {
        //     'x': Math.abs(insetBottom.x - insetTop.x),
        //     'y': Math.abs(insetBottom.y - insetTop.y)
        // }
        var insetSize = {
            'x': Math.abs(insetBottom.x - insetTop.x),
            'y': Math.abs(insetBottom.y - insetTop.y)
        }
        // console.log('insetSize', insetSize);

        container.style.height = (insetSize.y) + 'px';
        container.style.width = (insetSize.x) + 'px';

        if (transform) {
            var scale = this._map.getZoomScale(this._map.getZoom());

            L.DomUtil.setTransform(container, offset, scale);

        }
    },

    _initChart: function () {
        // console.log("initialize");

        // this._bounds = this._map.getBounds(bounds);
        this._zoomAnimated = true;

        // this._bounds = toLatLngBounds(bounds);
        // .getPanes().overlayPane.appendChild(div);
        // this._map = map;
        // var size = this._map.getSize();

        // // console.log('Map object ', this._map);

        this._echartsContainer = L.DomUtil.create('div');
        this._actionContainer = L.DomUtil.create('div');

        this.setBoundsForContainer(this._echartsContainer);

        // bounds = new L.Bounds(
        //     this._map.latLngToLayerPoint(this._bounds.getNorthEast()),
        //     this._map.latLngToLayerPoint(this._bounds.getSouthWest())),
        // size = bounds.getSize();



        // console.log('current size', size);

        // var insetBottom = this._map.latLngToLayerPoint(new L.latLng([0, 0]));
        // var insetTop = this._map.latLngToLayerPoint(new L.latLng([35.44, 43.3]));

        // var origin = this._map.latLngToLayerPoint(new L.latLng([35.44, 0]));
        // console.log('origin', origin);

        // var insetSize = {
        //     'x': Math.abs(insetBottom.x - insetTop.x),
        //     'y': Math.abs(insetBottom.y - insetTop.y)
        // }


        // this._width = insetSize.x;
        // this._height = insetSize.y;

        // this._echartsContainer.style.height = this._height + 'px';
        // this._echartsContainer.style.width = this._width + 'px';

        if (this._actionOptions) {
            this._actionContainer.style.height = this.options.offset + 'px';
            this._actionContainer.style.background = '#dadada99';
            this._actionContainer.style.width = '70%';
            this._actionContainer.style.position = 'absolute';
            this._actionContainer.style.bottom = '20px';
            this._actionContainer.style.left = '0';
            this._actionContainer.style.right = '0';
            this._actionContainer.style.margin = 'auto';
            this._actionContainer.style.zIndex = '9999';
        }

        // console.log('_actionContainer', this._actionContainer);
        // L.DomUtil.addClass(div, 'leaflet-image-layer');
        // if (this._zoomAnimated) { L.DomUtil.addClass(div); }
        // console.log("initializing Chart div size ", this._echartsContainer);
        // this._echartsContainer = div;
    },

    _reset: function () {
        // console.log(this._bounds);
        // var div = this._echartsContainer,
        //     bounds = new L.Bounds(
        //         this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
        //         this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
        //     size = bounds.getSize();

        if (this._actionOptions) {
            var divAction = this._actionContainer;
            divAction.style.transform = 'none';
            this._action.resize();
        }

        this.setBoundsForContainer(this._echartsContainer, true);

        // L.DomUtil.setPosition(div, bounds.min);


        // var insetBottom = this._map.latLngToLayerPoint(new L.latLng(0, 0));
        // var insetTop = this._map.latLngToLayerPoint(new L.latLng(35.44, 43.3));


        // var insetSize = {
        //     'x': Math.abs(insetBottom.x - insetTop.x),
        //     'y': Math.abs(insetBottom.y - insetTop.y)
        // }

        // div.style.width  = (insetSize.x) + 'px';
        // div.style.height = (insetSize.y) + 'px';

        // var origin = this._map.latLngToLayerPoint(new L.latLng(35.44, 0));

        // console.log('origin', origin);

        // var scale = this._map.getZoomScale(this._map.getZoom());

        // L.DomUtil.setTransform(div, origin, scale);

        this._echartInstance.resize();
    },

    _animateZoom: function (e) {
        // console.log('animate', e);
        var scale = this._map.getZoomScale(e.zoom),
            offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

        L.DomUtil.setTransform(this._echartsContainer, offset, scale);
        if (this._actionOptions) {
            L.DomUtil.setTransform(this._actionContainer, offset, scale);
        }

    },

    _initEChart: function () {
        // console.log("initializing Chart", this._echartsContainer);
        this._echartInstance = this._echart.init(this._echartsContainer);
        if (this._actionOptions) {
            this._action = this._echart.init(this._actionContainer);
            this._echart.connect([this._echartInstance, this._action]);
        }
        // console.log("Chart", this._action);
        this._drawCharts();
    },

    _drawCharts: function () {
        // console.log('_echartsContainer ', this._echartsContainer);
        // console.log('Drawing Charts action', this._actionOptions);
        this._echartInstance.setOption(this._echartOptions);
        this._echartInstance.resize();

        if (this._actionOptions) {
            this._action.setOption(this._actionOptions);
            this._action.resize();
        }
        // console.log('_action', this._action);

    }

});