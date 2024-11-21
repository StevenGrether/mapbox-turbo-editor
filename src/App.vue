<template>
  <div ref="mapContainer" class="h-full w-full"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import TurboDrawLineStringMode from './TurboDrawLineStringMode';
import TurboDirectSelectMode from './TurboDirectSelectMode';
import TurboDrawPolygon from './TurboDrawPolygonMode';
import TurboDrawPoint from './TurboDrawPointMode';
import TurboDrawStyles from './DrawStyles';

mapboxgl.accessToken = 'pk.eyJ1IjoidW5leHBlY3RlZGVycm9yIiwiYSI6ImNsODE4OXlyMzBkbGwzb253amJwaWh0OXUifQ.2Jeic3e1-h5EWG6qm9XAJw';

export default defineComponent({
  setup() {
    const mapContainer = ref<HTMLDivElement | null>(null);
    let map: mapboxgl.Map;

    onMounted(() => {
      if (!mapContainer.value) return;

      map = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        projection: 'globe',
        zoom: 16,
        center: [14, 48],
      });

      map.on('load', () => {
        const draw = new MapboxDraw({
          modes: {
            ...MapboxDraw.modes,
            draw_point: TurboDrawPoint,
            draw_polygon: TurboDrawPolygon,
            draw_line_string: TurboDrawLineStringMode,
            direct_select: TurboDirectSelectMode,
          },
          styles: TurboDrawStyles,
          userProperties: true,
          displayControlsDefault: false,
          controls: {
            line_string: true,
            point: true,
            polygon: true,
            trash: true,
          },
        });

        map.addControl(draw);

        draw.changeMode('simple_select');

        // map.on('draw.create', (e) => {
        //   console.log('Feature created:', e.features[0]);
        // });

        // map.on('draw.update', (e) => {
        //   console.log('Feature updated:', e.features[0]);
        // });

        // map.on('draw.delete', (e) => {
        //   console.log('Feature deleted:', e.features[0]);
        // });
      });
    });

    return {
      mapContainer,
    };
  },
});
</script>

<style scoped>
.h-full {
  height: 100%;
}
.w-full {
  width: 100%;
}
</style>
