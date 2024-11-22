import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { createPreviewPoint, getSnappedPoint, getVertexCollection } from './utils';
import { point } from '@turf/turf';
import { FeatureCollection, Point } from 'geojson';
import { LngLat } from 'mapbox-gl';

const DrawPolygon = MapboxDraw.modes.draw_polygon;
const TurboDrawPolygon = { ...DrawPolygon };

TurboDrawPolygon.onSetup = function (opts) {
    const snapThreshold = opts.snapThreshold || 50;
    const snapLngLat = null;

    const state = DrawPolygon.onSetup?.call(this, opts);
    const vertexCollection = getVertexCollection(this);

    const previewPoint = createPreviewPoint(this);

    return { vertexCollection, snapThreshold, snapLngLat, previewPoint, ...state };
};

TurboDrawPolygon.onClick = function (state, e) {
    if (!state.snapLngLat) throw new Error('LngLat is not set');
    e.lngLat = state.snapLngLat;
    DrawPolygon.onClick?.call(this, state, e);
};

TurboDrawPolygon.onMouseMove = function (state, e) {
    const { lng, lat } = e.lngLat;
    const mousePoint = point([lng, lat]);
    const nearestVertex = getSnappedPoint(mousePoint, state.vertexCollection, state.snapThreshold);
    const [snapLng, snapLat] = nearestVertex.geometry.coordinates;
    state.snapLngLat = new LngLat(snapLng, snapLat);

    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, snapLng, snapLat);
    state.previewPoint.setCoordinates([snapLng, snapLat]);
    if (!this.getFeature('preview-point')) {
        this.addFeature(state.previewPoint);
    }
};

TurboDrawPolygon.onStop = function (state) {
    if (this.getFeature('preview-point')) this.deleteFeature('preview-point');
    DrawPolygon.onStop?.call(this, state);
};

export default TurboDrawPolygon;
