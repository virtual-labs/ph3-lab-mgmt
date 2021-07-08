'use strict';

document.addEventListener('DOMContentLoaded', async function() {

	function clear() {
		document.getElementById('mobile').innerHTML = '';
		document.getElementById('desktop').innerHTML = '';
		document.getElementById('gscRes').innerHTML = '';
	};

	async function changeActive(elem) {
		Object.keys(active).forEach((key, i) => {
			active[key].classList.remove('is-active');
		});

		elem.classList.add('is-active');
		active = { 0: elem };

		if(!(elem.id in reports))
		{
			document.getElementById('loader').style.display = 'block';
			clear();
		}

		else
		{
			document.getElementById('loader').style.display = 'none';
			populate(elem.id, reports[elem.id]);
		}
	};

	function populate(link, report) {
		lighthousePopulate(link, report['lighthouse']);
		gscPopulate(link, report['gsc']);
	};

	const tabs = document.getElementById('tabs').children[0].children;
	let active = document.getElementsByClassName('is-active');
	const pages = parse(tabs);
	const apiKeys = { lighthouse: 'AIzaSyAVkdhwABn964MsgQmYvLF7MQsASFNSEQ8', gsc: 'AIzaSyBJ5sSM3HpctL3mQyxibLr6ceYQHlPL7oc' }

	const subArrs = splitToChunks(pages, 5), reports = {};
	const promises = subArrs.map(async (pages, i) => {
		for(let i = 0; i < pages.length; i += 1)
		{
			const lighthouseRes = await lighthouseApi(pages[i], apiKeys['lighthouse']), gscRes = await gscApi(pages[i], apiKeys['gsc']);
			reports[pages[i]] = {
				lighthouse: {...lighthouseRes},
				gsc: {...gscRes}
			};

			const mobPerfScore = reports[pages[i]]['lighthouse']['mobile']['Scores']['performance'], tab = document.getElementById(pages[i]);
			tab.children[0].children[0].classList.add(colorScheme(mobPerfScore));

			if(tab.classList.contains('is-active'))
			{
				document.getElementById('loader').style.display = 'none';
				populate(pages[i], reports[pages[i]]);
			}
		}
	});

	Promise.all(promises);

	Object.keys(tabs).forEach((tab, ix) => {
		tabs[tab].addEventListener("click", (event) => changeActive(event.currentTarget));
	});
});
