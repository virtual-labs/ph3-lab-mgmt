'use strict';

document.addEventListener('DOMContentLoaded', async function() {

	function clear() {
		document.getElementById('mobile').innerHTML = '';
		document.getElementById('desktop').innerHTML = '';
		document.getElementById('gscRes').innerHTML = '';
	};

	function isElement(element) {
		return element instanceof Element || element instanceof HTMLDocument;
	};

	async function changeActive(elem) {
		const siblingTabs = elem.parentNode.children, subtabs = document.getElementById(elem.id + 'SubTabs');
		Object.keys(siblingTabs).forEach((key, i) => {
			siblingTabs[key].classList.remove('is-active');
		});

		elem.classList.add('is-active');
		if(isElement(active) && !active.contains(elem))
		{
			active.classList.add('no-show');
			active.style.display = 'none';
			active = {};
		}

		if(subtabs === null)
		{
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
		}

		else
		{
			subtabs.classList.remove('no-show');
			subtabs.style.display = 'block';
			active = subtabs;
		}
	};

	function populate(link, report) {
		lighthousePopulate(link, report['lighthouse']);
		gscPopulate(link, report['gsc']);
	};

	const tabs = document.getElementsByClassName('v-tabs'), colors = ['red', 'orange', 'green'];
	let active = {}, luColors = {};
	const [pages, LUs] = parse(tabs);
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

			const mobPerfScore = reports[pages[i]]['lighthouse']['mobile']['Scores']['performance'], tab = document.getElementById(pages[i]), currColor = colorScheme(mobPerfScore);
			LUs.forEach((lu, ix) => {
				const luElem = document.getElementById(lu + 'SubTabs');
				if(luElem.contains(tab))
				{
					if(lu in luColors) 
					{
						luColors[lu] = currColor;
						document.getElementById(lu).children[0].children[0].classList.add(colors[currColor]);
					}

					else if(luColors[lu] > currColor)
					{
						document.getElementById(lu).children[0].children[0].classList.remove(colors[luColors[lu]]);
						luColors[lu] = currColor;
						document.getElementById(lu).children[0].children[0].classList.add(colors[currColor]);
					}
					console.log('hi', lu)
				}
			});

			tab.children[0].children[0].classList.add(colors[currColor]);

			if(tab.classList.contains('is-active'))
			{
				document.getElementById('loader').style.display = 'none';
				populate(pages[i], reports[pages[i]]);
			}
		}
	});

	Promise.all(promises);

	Object.keys(tabs).forEach((listIdx, ix) => {
		const tabList = tabs[listIdx].children[0].children;
		Object.keys(tabList).forEach((tab, ix) => {
			tabList[tab].addEventListener("click", (event) => changeActive(event.currentTarget));
		});
	});
});
