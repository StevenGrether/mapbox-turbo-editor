import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { createPreviewPoint, getSnappedPoint, getVertexCollection } from './utils';
import { point } from '@turf/turf';
import { FeatureCollection, Point } from 'geojson';
import { LngLat } from 'mapbox-gl';

const DrawPoint = MapboxDraw.modes.draw_point;
const TurboDrawPoint = { ...DrawPoint };

TurboDrawPoint.onSetup = function (opts) {
    const snapThreshold = opts.snapThreshold || 50;
    const snapLngLat = null;

    const state = DrawPoint.onSetup?.call(this, opts);
    const vertexCollection = getVertexCollection(this);

    const previewPoint = createPreviewPoint(this);

    return { vertexCollection, snapThreshold, snapLngLat, previewPoint, ...state };
};

TurboDrawPoint.onClick = function (state, e) {
    if (!state.snapLngLat) throw new Error('LngLat is not set');
    e.lngLat = state.snapLngLat;
    DrawPoint.onClick?.call(this, state, e);
};

TurboDrawPoint.onMouseMove = function (state, e) {
    const { lng, lat } = e.lngLat;
    const mousePoint = point([lng, lat]);
    const nearestVertex = getSnappedPoint(mousePoint, state.vertexCollection, state.snapThreshold);
    const [snapLng, snapLat] = nearestVertex.geometry.coordinates;
    state.snapLngLat = new LngLat(snapLng, snapLat);

    state.previewPoint.setCoordinates([state.snapLngLat.lng, state.snapLngLat.lat]);
    if (!this.getFeature('preview-point')) {
        this.addFeature(state.previewPoint);
    }
};

TurboDrawPoint.onStop = function (state) {
    if (this.getFeature('preview-point')) this.deleteFeature('preview-point');
    DrawPoint.onStop?.call(this, state);
};

export default TurboDrawPoint;
