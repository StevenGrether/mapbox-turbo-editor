import { Feature, FeatureCollection, GeoJsonProperties, Point } from 'geojson';
import { coordAll, distance, featureCollection, nearestPoint, point } from '@turf/turf';

export function getDrawFeatures(parent: any): Feature[] {
    return parent._ctx.api.getAll().features;
}

export function getVertices(features: Feature[]) {
    let vertices: Feature<Point, GeoJsonProperties>[] = [];
    features.forEach((feature) => {
        let coords = coordAll(feature);
        coords = coords?.filter((coord) => coord?.length);
        if (!coords?.length) return;
        const points = coords.map((coord) => point(coord));
        vertices = vertices.concat(points);
    });
    return vertices;
}

export function getVertexCollection(parent: any) {
    const features = getDrawFeatures(parent);
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

export function createPreviewPoint(parent: any) {
    const turfPoint = point(
        [0, 0],
        {
            active: 'false',
            meta: 'feature',
            'meta:type': 'Point',
        },
        {
            id: 'preview-point',
        }
    );
    return parent.newFeature(turfPoint);
}
