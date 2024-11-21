import MapboxDraw from '@mapbox/mapbox-gl-draw';

const DrawPolygon = MapboxDraw.modes.draw_polygon;
const TurboDrawPolygon = { ...DrawPolygon };

export default TurboDrawPolygon;
