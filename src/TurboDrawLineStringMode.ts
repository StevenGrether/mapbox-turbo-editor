import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { createPreviewPoint, getSnappedPoint, getVertexCollection } from './utils';
import { point } from '@turf/turf';
import { FeatureCollection, Point } from 'geojson';
import { LngLat } from 'mapbox-gl';

const DrawLineString = MapboxDraw.modes.draw_line_string;
const TurboDrawLineString = { ...DrawLineString };

TurboDrawLineString.onSetup = function (opts) {
    const snapThreshold = opts.snapThreshold || 50;
    const snapLngLat = null;

    const state = DrawLineString.onSetup?.call(this, opts);
    const vertexCollection = getVertexCollection(this);

    const previewPoint = createPreviewPoint(this);

    return { vertexCollection, snapThreshold, snapLngLat, previewPoint, ...state };
};

TurboDrawLineString.onClick = function (state, e) {
    if (!state.snapLngLat) throw new Error('LngLat is not set');
    DrawLineString.onClick?.call(this, state, {
        ...e,
        lngLat: state.snapLngLat,
    });
};

TurboDrawLineString.onMouseMove = function (state, e) {
    const vertexCollection: FeatureCollection<Point> = state.vertexCollection;

    if (!vertexCollection.features.length) {
        if (this.getFeature('preview-point')) this.deleteFeature('preview-point');
        state.snapLngLat = e.lngLat;
        state.line.updateCoordinate(state.currentVertexPosition, state.snapLngLat.lng, state.snapLngLat.lat);
        return;
    }
    const mousePoint = point([e.lngLat.lng, e.lngLat.lat]);
    const nearestVertex = getSnappedPoint(mousePoint, vertexCollection, state.snapThreshold);

    if (!nearestVertex) {
        if (this.getFeature('preview-point')) this.deleteFeature('preview-point');
        state.snapLngLat = e.lngLat;
        state.line.updateCoordinate(state.currentVertexPosition, state.snapLngLat.lng, state.snapLngLat.lat);
        return;
    }
    const [lng, lat] = nearestVertex.geometry.coordinates;
    state.snapLngLat = new LngLat(lng, lat);

    state.line.updateCoordinate(state.currentVertexPosition, state.snapLngLat.lng, state.snapLngLat.lat);
    state.previewPoint.setCoordinates([lng, lat]);
    if (!this.getFeature('preview-point')) {
        this.addFeature(state.previewPoint);
    }
};

TurboDrawLineString.onStop = function (state) {
    if (this.getFeature('preview-point')) this.deleteFeature('preview-point');
    DrawLineString.onStop?.call(this, state);
};

export default TurboDrawLineString;
