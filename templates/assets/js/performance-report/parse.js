// retrieve links from the sitemap object
function extract(sitemapObject) {
	const urls = sitemapObject.getElementsByTagName('url'), links = [];

	Object.keys(urls).forEach(function(key, i) {
		links.push(urls[key].getElementsByTagName('loc')[0].textContent);
	});

	return links;
};

// parse a text string into an XML DOM object
function parseXMLSitemap(sitemapContent) {
	const parser = new DOMParser(), xmlDoc = parser.parseFromString(sitemapContent, 'text/xml');
	return xmlDoc;
};

// get sitemap content and parse it to Document Object Model
//function parse(sitemapFile) {
	//const xhttp = new XMLHttpRequest();
	//let pages = [];

	//xhttp.onreadystatechange = function() {
		//if ((this.readyState === 4) && (this.status === 200)) {
			//const sitemapContent = this.responseText, sitemapObject = parseXMLSitemap(sitemapContent);
			//pages = [...extract(sitemapObject)];
		//}
	//};

	//xhttp.open('GET', sitemapFile, false);
	//xhttp.send();
	//return pages;
//};

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
