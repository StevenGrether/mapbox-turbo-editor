<template>
    <div ref="mapContainer" class="h-full w-full"></div>
</template>

<script lang="ts">
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1IjoidW5leHBlY3RlZGVycm9yIiwiYSI6ImNsODE4OXlyMzBkbGwzb253amJwaWh0OXUifQ.2Jeic3e1-h5EWG6qm9XAJw';

export default {
    beforeMount() {
        const mapContainer = this.$refs.mapContainer;
        if (!mapContainer) return;

        const map = new mapboxgl.Map({
            container: mapContainer,
            style: 'mapbox://styles/mapbox/outdoors-v12',
            projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
            zoom: 1,
            center: [30, 15],
        });
    },
};
</script>
