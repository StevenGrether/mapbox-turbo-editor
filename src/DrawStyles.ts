import MapboxDraw from '@mapbox/mapbox-gl-draw';
const theme = MapboxDraw.lib.theme;

// Editors note: This is where the guy just filters out the guide lines so they dont show up
// const modifiedDefaultStyles = theme.map((defaultStyle) => {
//     if (defaultStyle.id === 'gl-draw-line-inactive') {
//         return {
//             ...defaultStyle,
//             filter: [...defaultStyle.filter, ['!=', 'user_isSnapGuide', 'true']],
//         };
//     }

//     return defaultStyle;
// });

const TurboDrawStyles = [
    ...theme,
    {
        id: 'preview',
        type: 'circle',
        filter: ['all', ['==', '$type', 'Point'], ['==', 'user_isTurboShitSolution', true]],
        layout: {},
        paint: {
            'circle-color': '#ff0000',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1,
            'circle-radius': 3,
        },
    },
];

export default TurboDrawStyles;