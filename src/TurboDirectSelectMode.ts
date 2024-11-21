// SnapDirectSelect.ts

import MapboxDraw, { DrawCustomMode } from '@mapbox/mapbox-gl-draw';
import { MapMouseEvent } from 'mapbox-gl';
import { snap, createVertexSnapList, getCoordinatesWithPaths } from './utils';

const DirectSelect = MapboxDraw.modes.direct_select as DrawCustomMode;

const SnapDirectSelect: DrawCustomMode = { ...DirectSelect };

SnapDirectSelect.onSetup = function (this: any, opts: any) {
    const featureId = opts.featureId;
    const feature = this.getFeature(featureId);

    if (!feature) {
        throw new Error('You must provide a featureId to enter direct_select mode');
    }

    if (feature.type === 'Point') {
        throw new TypeError("direct_select mode doesn't handle point features");
    }

    const features = this._ctx.api.getAll().features;

    const state: any = {
        featureId,
        feature,
        snapList: createVertexSnapList(features, featureId),
        snapping: false,
        snapPoint: null,
        dragMoving: false,
        canDragMove: false,
        selectedCoordPaths: opts.coordPath ? [opts.coordPath] : [],
    };

    this.setSelected(featureId);
    this.setSelectedCoordinates(this.pathsToCoordinates(featureId, state.selectedCoordPaths));
    MapboxDraw.lib.doubleClickZoom.disable(this);

    this.setActionableState({ trash: true });

    // Update snapList when features are added or deleted
    this.map.on('draw.create', () => {
        const features = this._ctx.api.getAll().features;
        state.snapList = createVertexSnapList(features, featureId);
    });
    this.map.on('draw.delete', () => {
        const features = this._ctx.api.getAll().features;
        state.snapList = createVertexSnapList(features, featureId);
    });

    return state;
};

SnapDirectSelect.onDrag = function (this: any, state: any, e: MapMouseEvent) {
    if (!state.dragMoving) {
        state.dragMoving = true;
    }

    const { lng, lat, snapped } = snap(e, state.snapList, this.map);

    const coordPath = state.selectedCoordPaths[0];
    state.feature.updateCoordinate(coordPath, lng, lat);

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

    // Implement pinning: Update other features that share the same coordinate
    const movingFeatureId = state.featureId;

    const features = this._ctx.api.getAll().features;
    features.forEach((f: any) => {
        if (f.id === movingFeatureId) return;

        const coordsWithPaths = getCoordinatesWithPaths(f);
        coordsWithPaths.forEach(({ coord, path }) => {
            if (coord[0] === lng && coord[1] === lat) {
                // Update the coordinate in the other feature
                const otherFeature = this.getFeature(f.id);
                if (otherFeature) {
                    otherFeature.updateCoordinate(path, lng, lat);
                    this.doRender(f.id);
                }
            }
        });
    });
};

SnapDirectSelect.onStop = function (this: any, state: any) {
    MapboxDraw.lib.doubleClickZoom.enable(this);
    if (state.snapPoint) {
        this.deleteFeature([state.snapPoint.id], { silent: true });
    }

    // Remove event listeners
    this.map.off('draw.create');
    this.map.off('draw.delete');

    DirectSelect.onStop.call(this, state);
};

SnapDirectSelect.toDisplayFeatures = function (this: any, state: any, geojson: any, display: (geojson: any) => void) {
    if (geojson.properties.id === state.snapPoint?.id) {
        geojson.properties.active = 'true';
        display(geojson);
        return;
    }

    DirectSelect.toDisplayFeatures.call(this, state, geojson, display);
};

export default SnapDirectSelect;
