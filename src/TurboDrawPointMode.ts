import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { getSnappedPoint, getVertexCollection } from './utils';
import { point } from '@turf/turf';
import { FeatureCollection, Point } from 'geojson';
import { LngLat } from 'mapbox-gl';

const DrawPoint = MapboxDraw.modes.draw_point;
const TurboDrawPoint = { ...DrawPoint };

TurboDrawPoint.onSetup = function (opts) {
    const snapThreshold = opts.snapThreshold || 50;
    const snapLngLat = null;

    const state = DrawPoint.onSetup?.call(this, opts);
    const vertexCollection = getVertexCollection(this, state);

    const previewPoint = this.newFeature(
        point(
            [0, 0],
            {
                active: 'false',
                meta: 'feature',
                'meta:type': 'Point',
            },
            {
                id: 'preview-point',
            }
        )
    );

    return { vertexCollection, snapThreshold, snapLngLat, previewPoint, ...state };
};

TurboDrawPoint.onClick = function (state) {
    if (!state.snapLngLat) throw new Error('LngLat is not set');
    DrawPoint.onClick?.call(this, state, {
        lngLat: state.snapLngLat,
    });
};

TurboDrawPoint.onMouseMove = function (state, e) {
    const vertexCollection: FeatureCollection<Point> = state.vertexCollection;
    if (!vertexCollection.features.length) {
        if (this.getFeature('preview-point')) this.deleteFeature('preview-point');
        state.snapLngLat = e.lngLat;
        return;
    }
    const { lng, lat } = e.lngLat;
    const mousePoint = point([lng, lat]);
    const nearestVertex = getSnappedPoint(mousePoint, vertexCollection, state.snapThreshold);
    if (!nearestVertex) {
        if (this.getFeature('preview-point')) this.deleteFeature('preview-point');
        state.snapLngLat = e.lngLat;
        return;
    }
    const nearestCoordinates = nearestVertex.geometry.coordinates;
    state.snapLngLat = new LngLat(nearestCoordinates[0], nearestCoordinates[1]);

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