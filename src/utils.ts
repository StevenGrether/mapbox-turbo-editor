// utils.ts

import { MapMouseEvent, Map } from 'mapbox-gl';

interface SnapResult {
    lng: number;
    lat: number;
    snapped: boolean;
}

export function createVertexSnapList(features: any[], excludeFeatureId?: string): Array<[number, number]> {
    const snapList: Array<[number, number]> = [];

    features.forEach((feature: any) => {
        if (feature.id === excludeFeatureId) return;

        const coordsWithPaths = getCoordinatesWithPaths(feature);
        coordsWithPaths.forEach(({ coord }) => {
            snapList.push(coord);
        });
    });

    return snapList;
}

export function getCoordinatesWithPaths(feature: any): Array<{ coord: [number, number]; path: string }> {
    const coords: Array<{ coord: [number, number]; path: string }> = [];

    const traverse = (coordinates: any, path: string) => {
        if (typeof coordinates[0] === 'number') {
            // It's a coordinate pair
            coords.push({ coord: coordinates as [number, number], path });
        } else {
            // It's an array of coordinates
            coordinates.forEach((coord: any, index: number) => {
                const newPath = path ? `${path}.${index}` : `${index}`;
                traverse(coord, newPath);
            });
        }
    };

    traverse(feature.geometry.coordinates, '');

    return coords;
}

export function snap(e: MapMouseEvent, snapList: Array<[number, number]>, map: Map, tolerance = 10): SnapResult {
    const cursorLngLat = e.lngLat;
    let minDistance = Infinity;
    let nearestLngLat: [number, number] | null = null;

    const cursorPoint = map.project(cursorLngLat);

    snapList.forEach((lngLat) => {
        const point = map.project(lngLat);
        const distance = Math.hypot(point.x - cursorPoint.x, point.y - cursorPoint.y);
        if (distance < minDistance && distance <= tolerance) {
            minDistance = distance;
            nearestLngLat = lngLat;
        }
    });

    if (nearestLngLat) {
        return {
            lng: nearestLngLat[0],
            lat: nearestLngLat[1],
            snapped: true,
        };
    } else {
        return {
            lng: cursorLngLat.lng,
            lat: cursorLngLat.lat,
            snapped: false,
        };
    }
}
