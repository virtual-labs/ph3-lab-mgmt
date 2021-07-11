function parse(tabs) {
	let pages = [], LUs = [];
	origin = window.location.origin, pathArray = window.location.pathname.split('/');
	let base_url = origin;
	pathArray.forEach((part, ix) => {
		if(ix !== pathArray.length - 1)
		{
			base_url += "/" + part;
		}
	});

	//base_url = "https://virtual-labs.github.io/temp-exp-bubble-sort-iiith";
	Object.keys(tabs).forEach((listIdx, ix) => {
		const tabList = tabs[listIdx].children[0].children;
		Object.keys(tabList).forEach((tab, ix) => {
			const subtabs = document.getElementById(tabList[tab].id + 'SubTabs');
			if(subtabs === null)
			{
				tabList[tab].id = base_url + '/' + tabList[tab].id;
				pages.push(tabList[tab].id);
			}

			else
			{
				subtabs.style.display = 'none';
				LUs.push(tabList[tab].id);
			}
		});
	});

	return [pages, LUs];
};
