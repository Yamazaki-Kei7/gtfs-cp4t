<script lang="ts">
	import { DateInput } from 'date-picker-svelte';
	import Slider from '@smui/slider';
	import Map from '$lib/components/MapPane.svelte';
	import { routesColor } from '$lib/routeNameColor';

	let date = new Date();
	let minutes: number = 0;
	let dayType: string = '';

	// dateの値が実装されたら、datermineDayType関数を呼び出して、日付タイプを取得する
	$: if (date) updateDayType();

	async function updateDayType() {
		dayType = await determineDayType(date);
	}

	const determineDayType = async (date: Date): Promise<string> => {
		const day = date.getDay();
		const isHoliday = await holidayCheck(date);
		if (isHoliday || day === 0) {
			return '日祝';
		} else if (day === 6) {
			return '土曜';
		} else {
			return '平日';
		}
	};

	const formatTime = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
	};

	const holidayCheck = async (date: Date) => {
		// 祝日かどうか外部APIを使って判定する
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月は0から始まるため、1を加える
		const day = date.getDate().toString().padStart(2, '0');
		const apiUrl = `http://api.national-holidays.jp/${year}/${month}/${day}`;
		// fetchでAPIを叩いて、祝日かどうかを判定する
		const res = await fetch(apiUrl);
		const data = await res.json();
		// dataがエラーの場合はfalseを返す
		if (data.error === 'not_found') {
			return false;
		} else {
			return true;
		}
	};
</script>

<div class="flex flex-col h-screen">
	<div class="topbar m-1 text-gray-50 rounded-lg p-2" style="background-color: #1670A2;">
		<h1 class="text-4xl">GTFS-CP for Takasaki</h1>
	</div>
	<div class="settings ml-3">
		<div class="flex items-center">
			<DateInput bind:value={date} format="yyyy-MM-dd" class="mt-2 border-blue-900" />
			<pre class="status mt-2 ml-3">（{dayType}）</pre>
			<pre class="status mt-2 ml-3">時刻: {formatTime(minutes)}</pre>
		</div>
		<Slider
			bind:value={minutes}
			min={0}
			max={1440}
			step={1}
			tickMarks
			input$aria-label="Discrete slider"
		/>
	</div>
	<div class="flex flex-grow overflow-hidden">
		<div class="w-2/12 m-2 p-2 border-2 rounded-md overflow-y-auto">
			<h2 class="text-lg text-center decoration-8">路線名</h2>
			<ul>
				{#each routesColor as { route, color }}
					<li
						class="m-1 p-1 rounded-md text-gray-800"
						style="border: 3px solid; border-color: {color}; border-opacity: 0.7;"
					>
						{route}
					</li>
				{/each}
			</ul>
		</div>
		<div class="w-10/12 m-2 border-2 overflow-hidden">
			<Map {dayType} {minutes} />
		</div>
	</div>
</div>
