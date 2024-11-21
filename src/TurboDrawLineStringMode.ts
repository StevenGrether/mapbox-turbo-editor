// SnapLineMode.ts

import MapboxDraw, { DrawCustomMode } from '@mapbox/mapbox-gl-draw';
import { MapMouseEvent } from 'mapbox-gl';
import { snap, createVertexSnapList } from './utils';

const DrawLineString = MapboxDraw.modes.draw_line_string as DrawCustomMode;

const SnapLineMode: DrawCustomMode = { ...DrawLineString };

SnapLineMode.onSetup = function (this: any, options: any) {
    const line = this.newFeature({
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: [],
        },
    });

    this.addFeature(line);
    this.clearSelectedFeatures();
    MapboxDraw.lib.doubleClickZoom.disable(this);

    // Get all existing features to use for snapping
    const features = this._ctx.api.getAll().features;

    const state: any = {
        line,
        currentVertexPosition: 0,
        snapList: createVertexSnapList(features),
        snapping: false,
        snapPoint: null,
    };

    // Update snapList when features are added or deleted
    this.map.on('draw.create', () => {
        const features = this._ctx.api.getAll().features;
        state.snapList = createVertexSnapList(features);
    });
    this.map.on('draw.delete', () => {
        const features = this._ctx.api.getAll().features;
        state.snapList = createVertexSnapList(features);
    });

    return state;
};

SnapLineMode.onClick = function (this: any, state: any, e: MapMouseEvent) {
    const lng = state.snappedLng ?? e.lngLat.lng;
    const lat = state.snappedLat ?? e.lngLat.lat;

    if (state.currentVertexPosition > 0) {
        const lastVertex = state.line.getCoordinate(state.currentVertexPosition - 1);
        if (lastVertex[0] === lng && lastVertex[1] === lat) {
            this.changeMode('simple_select', { featureIds: [state.line.id] });
            return;
        }
    }

    state.line.updateCoordinate(state.currentVertexPosition, lng, lat);
    state.currentVertexPosition++;
};

SnapLineMode.onMouseMove = function (this: any, state: any, e: MapMouseEvent) {
    const { lng, lat, snapped } = snap(e, state.snapList, this.map);

    state.snappedLng = lng;
    state.snappedLat = lat;
    state.snapping = snapped;

    state.line.updateCoordinate(state.currentVertexPosition, lng, lat);

    if (snapped) {
        if (!state.snapPoint) {
            state.snapPoint = this.newFeature({
                type: 'Feature',
                properties: {
                    meta: 'snap-point',
                },
                geometry: {
                    type: 'Point',
                    coordinates: [lng, lat],
                },
            });
            this.addFeature(state.snapPoint);
        } else {
            state.snapPoint.setCoordinates([lng, lat]);
        }
    } else {
        if (state.snapPoint) {
            this.deleteFeature([state.snapPoint.id], { silent: true });
            state.snapPoint = null;
        }
    }
};

SnapLineMode.onStop = function (this: any, state: any) {
    MapboxDraw.lib.doubleClickZoom.enable(this);
    if (state.snapPoint) {
        this.deleteFeature([state.snapPoint.id], { silent: true });
    }

    // Remove event listeners
    this.map.off('draw.create');
    this.map.off('draw.delete');
};

SnapLineMode.toDisplayFeatures = function (this: any, state: any, geojson: any, display: (geojson: any) => void) {
    if (geojson.properties.id === state.snapPoint?.id) {
        geojson.properties.active = 'true';
        display(geojson);
        return;
    }

    if (geojson.properties.id === state.line.id) {
        geojson.properties.active = 'true';
        display(geojson);
        return;
    }

    // Display other features
    geojson.properties.active = 'false';
    display(geojson);
};

export default SnapLineMode;
