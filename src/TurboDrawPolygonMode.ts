import { findNearestVertex } from "./utils";

const DrawPolygonSnapping = Object.assign({}, MapboxDraw.modes.draw_polygon);

DrawPolygonSnapping.onMouseMove = function (state, e) {
    const map = this.map;
    const snapTolerance = 15; // in pixels

    let mouseLngLat = e.lngLat;

    // Get all features except the one being drawn
    const features = this.getAll().features.filter((feature) => feature.id !== state.polygon.id);

    // Find the nearest vertex
    const nearestVertex = findNearestVertex(mouseLngLat, features, map, snapTolerance);

    if (nearestVertex) {
        // Snap the mouseLngLat to the nearest vertex
        mouseLngLat = nearestVertex;
    }

    // Update the feature being drawn
    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, mouseLngLat.lng, mouseLngLat.lat);
};

DrawPolygonSnapping.onClick = function (state, e) {
    const map = this.map;
    const snapTolerance = 15; // in pixels

    let mouseLngLat = e.lngLat;

    // Get all features except the one being drawn
    const features = this.getAll().features.filter((feature) => feature.id !== state.polygon.id);

    // Find the nearest vertex
    const nearestVertex = findNearestVertex(mouseLngLat, features, map, snapTolerance);

    if (nearestVertex) {
        // Snap the mouseLngLat to the nearest vertex
        mouseLngLat = nearestVertex;
    }

    // Add this point to the polygon
    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, mouseLngLat.lng, mouseLngLat.lat);

    state.currentVertexPosition++;

    // Check if the user double-clicked to finish drawing
    if (this.events.current.type === 'dblclick' || state.polygon.coordinates[0].length > 3) {
        return this.changeMode('simple_select', { featureIds: [state.polygon.id] });
    }
};
