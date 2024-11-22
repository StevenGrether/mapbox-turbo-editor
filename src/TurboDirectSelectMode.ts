import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { createPreviewPoint, getSnappedPoint, getVertexCollection } from './utils';
import { FeatureCollection, Point } from 'geojson';
import { point } from '@turf/turf';
import { LngLat } from 'mapbox-gl';

const DirectSelect = MapboxDraw.modes.direct_select;
const TurboDirectSelect = { ...DirectSelect };

TurboDirectSelect.onSetup = function (opts) {
    const snapThreshold = opts.snapThreshold || 50;
    const snapLngLat = null;

    const state = DirectSelect.onSetup?.call(this, opts);
    const vertexCollection = getVertexCollection(this);

    const previewPoint = createPreviewPoint(this);

    return { vertexCollection, snapThreshold, snapLngLat, previewPoint, ...state };
};

TurboDirectSelect.onDrag = function (state, e) {
    DirectSelect.onDrag?.call(this, state, e);
    if (state.selectedCoordPaths.length > 1) return;

    const { lng, lat } = e.lngLat;
    const mousePoint = point([lng, lat]);
    const snappedVertex = getSnappedPoint(mousePoint, state.vertexCollection, state.snapThreshold);
    const [snapLng, snapLat] = snappedVertex.geometry.coordinates;
    state.snapLngLat = new LngLat(snapLng, snapLat);

    state.feature.updateCoordinate(state.selectedCoordPaths[0], snapLng, snapLat);
    state.previewPoint.setCoordinates([snapLng, snapLat]);
    if (!this.getFeature('preview-point')) {
        this.addFeature(state.previewPoint);
    }
};

TurboDirectSelect.onMouseUp = function (state, e) {
    if (state.selectedCoordPaths.length !== 1) return;
    state.feature.updateCoordinate(state.selectedCoordPaths[0], state.snapLngLat.lng, state.snapLngLat.lat);
    DirectSelect.onMouseUp?.call(this, state, e);
};

TurboDirectSelect.onStop = function (state) {
    if (this.getFeature('preview-point')) this.deleteFeature('preview-point');
    DirectSelect.onStop?.call(this, state);
};

export default TurboDirectSelect;
