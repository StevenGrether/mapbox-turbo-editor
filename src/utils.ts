import { Feature, FeatureCollection, GeoJsonProperties, Point } from 'geojson';
import { coordAll, distance, featureCollection, nearestPoint, point } from '@turf/turf';

export function getDrawFeatures(parent: any): Feature[] {
    return parent._ctx.api.getAll().features;
}

export function getVertices(features: Feature[]) {
    let vertices: Feature<Point, GeoJsonProperties>[] = [];
    features.forEach((feature) => {
        const coords = coordAll(feature);
        const points = coords.map((coord) => point(coord));
        vertices = vertices.concat(points);
    });
    return vertices;
}

export function getVertexCollection(parent: any, state: any) {
    let features = getDrawFeatures(parent);
    features = features.filter((feature) => feature.id !== state.point.id);
    const vertices = getVertices(features);
    return featureCollection(vertices);
}

export function getSnappedPoint(point: Feature<Point>, vertexCollection: FeatureCollection<Point>, threshold: number) {
    if (!vertexCollection.features.length) return null;
    const nearestVertex = nearestPoint(point, vertexCollection);
    if (!nearestVertex) return null;
    const snapDistance = distance(point, nearestVertex, { units: 'meters' });
    if (snapDistance >= threshold) return null;
    return nearestVertex;
}
