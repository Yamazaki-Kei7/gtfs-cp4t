<script setup lang="ts">
	import { onMount } from 'svelte';
	import maplibregl, { type StyleSpecification } from 'maplibre-gl';
	import type { Map } from 'maplibre-gl';
	import OpacityControl from 'maplibre-gl-opacity';
	import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';
	import 'maplibre-gl/dist/maplibre-gl.css';

	import { createColorMatchExpression } from '$lib/utils';

	// 地図
	let map: Map | undefined;

	// 日にちの種類
	export let dayType: string;
	export let minutes: number;

	$: if (dayType) {
		console.log(dayType);
		map?.setFilter('busRoute', ['==', ['get', 'service_id'], dayType]);
		map?.setFilter('movingBus', [
			'all',
			['==', ['get', 'a_time'], minutes],
			['==', ['get', 'service_id'], dayType]
		]);
	}

	// 時間の変更
	$: if (minutes) {
		console.log(minutes);
		map?.setFilter('movingBus', [
			'all',
			['==', ['get', 'a_time'], minutes],
			['==', ['get', 'service_id'], dayType]
		]);
	}

	onMount(() => {
		const locationHref = location.href;
		console.log(locationHref);
		map = new maplibregl.Map({
			container: 'map',
			style: {
				version: 8,
				sources: {
					gsiPaleMap: {
						type: 'raster',
						tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
						tileSize: 256,
						attribution:
							"<a href='https://maps.gsi.go.jp/development/ichiran.html'>地理院タイル</a>"
					},
					gisOrthoMap: {
						type: 'raster',
						tiles: ['https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg'],
						tileSize: 256,
						attribution:
							"<a href='https://maps.gsi.go.jp/development/ichiran.html'>地理院タイル</a>"
					},
					busRoute: {
						type: 'geojson',
						data: 'src/data/bus_route.geojson',
						attribution:
							'<a href="https://www.city.takasaki.gunma.jp/page/1756.html">バス情報データ</a>'
					},
					stops: {
						type: 'geojson',
						data: 'src/data/stops.geojson',
						attribution:
							'<a href="https://www.city.takasaki.gunma.jp/page/1756.html">バス情報データ</a>'
					},
					movingBus: {
						type: 'vector',
						tiles: [`${location.href}src/data/tiles/{z}/{x}/{y}.pbf`],
						minzoom: 10,
						maxzoom: 18
					}
				},
				layers: [
					// 地理院淡色地図の表示
					{
						id: 'gsiPaleMap',
						type: 'raster',
						source: 'gsiPaleMap',
						minzoom: 0,
						maxzoom: 18
					},
					// 地理院オルソ画像の表示
					{
						id: 'gisOrthoMap',
						type: 'raster',
						source: 'gisOrthoMap',
						minzoom: 0,
						maxzoom: 18,
						layout: {
							visibility: 'none'
						}
					},
					// バスの経路の色設定
					{
						id: 'busRoute',
						type: 'line',
						source: 'busRoute',
						paint: {
							'line-width': 2,
							'line-color': createColorMatchExpression(),
							'line-opacity': 0.7
						}
					},
					// バス停のアイコン
					{
						id: 'stops',
						type: 'circle',
						source: 'stops',
						paint: {
							'circle-radius': 3,
							'circle-stroke-color': '#FFFFFF',
							'circle-stroke-width': 0.5,
							'circle-color': '#005773',
							'circle-opacity': 0.5
						}
					},
					// バスの位置情報
					{
						id: 'movingBus',
						type: 'circle',
						source: 'movingBus',
						'source-layer': 'moving_bus',
						paint: {
							'circle-radius': 7,
							'circle-stroke-color': '#FFFFFF',
							'circle-stroke-width': 2,
							'circle-color': createColorMatchExpression(),
							'circle-opacity': 0.7
						}
					}
				]
			},
			center: [138.96, 36.37],
			zoom: 11
		});

		map.addControl(
			new maplibregl.NavigationControl({
				visualizePitch: true
			}),
			'top-right'
		);

		let lastFrameTime = 0;

		// アニメーション用の関数
		function animateCircleRadius(timestamp) {
			if (!lastFrameTime) lastFrameTime = timestamp;
			const elapsed = timestamp - lastFrameTime;
			const radius = 7 + 1 * Math.sin(elapsed / 300);

			map?.setPaintProperty('movingBus', 'circle-radius', radius);
			requestAnimationFrame(animateCircleRadius);
		}

		// 凡例の設定
		const mapBaseLayer = {
			gsiPaleMap: '地理院地図',
			gisOrthoMap: 'オルソ画像'
		};
		const mapOverLayer = {
			busRoute: 'バス路線'
		};
		let opacity = new OpacityControl({
			baseLayers: mapBaseLayer
			// overLayers: mapOverLayer
		});

		map.on('load', () => {
			requestAnimationFrame(animateCircleRadius);
			if (map) {
				map.addControl(opacity, 'top-left');
			}
			map?.setFilter('movingBus', ['==', ['get', 'service_id'], dayType]);
			map?.setFilter('movingBus', ['==', ['get', 'a_time'], minutes]);
		});
	});
</script>

<div id="map" />

<style>
	#map {
		height: 100%;
	}
</style>
