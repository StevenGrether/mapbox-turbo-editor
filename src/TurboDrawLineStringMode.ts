import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { getVertexCollection } from './utils';

const DrawLineString = MapboxDraw.modes.draw_line_string;
const TurboDrawLineString = { ...DrawLineString };

TurboDrawLineString.onSetup = function (opts) {
    const snapThreshold = opts.snapThreshold || 50;

    const state = DrawLineString.onSetup?.call(this, opts);
    const vertexCollection = getVertexCollection(this);

    return { vertexCollection, snapThreshold, ...state };
};

export default TurboDrawLineString;
