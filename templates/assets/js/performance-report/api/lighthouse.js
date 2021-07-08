function detailedLink(url, strategy) {
	return 'https://googlechrome.github.io/lighthouse/viewer/?psiurl=' + url + '&strategy=' + strategy;
}

async function lighthouseApi(link, apiKey) {
	const strategy = ['mobile', 'desktop'], pageData = {};

	const proms = strategy.map(async (val, ind) => {
		const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed', parameters = {
			url: encodeURIComponent(link),
			key: apiKey,
			category: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
			strategy: val 
		}, url = setUpQuery(link, api, parameters);


		await axios.get(url)
			.then(response => {
				const json = response.data;

				//const cruxMetrics = {
				//"First Contentful Paint": json.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.category,
				//"First Input Delay": json.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category
				//};

				const lighthouse = json.lighthouseResult;
				const metrics = {
					'First Contentful Paint': lighthouse.audits['first-contentful-paint'].displayValue,
					'Speed Index': lighthouse.audits['speed-index'].displayValue,
					'Time To Interactive': lighthouse.audits['interactive'].displayValue,
					'Total Blocking Time': lighthouse.audits['total-blocking-time'].displayValue,
					'Largest Contentful Paint': lighthouse.audits['largest-contentful-paint'].displayValue,
					'Cumulative Layout Shift': lighthouse.audits['cumulative-layout-shift'].displayValue,
				};

				metrics['Scores'] = {};
				Object.keys(lighthouse.categories).forEach(function(category, index) {
					if(category !== 'pwa')
					{
						metrics['Scores'][category] = lighthouse.categories[category].score * 100;
					}
				});

				metrics['Detailed Report'] = detailedLink(link, val);
				pageData[val] = metrics;
			})
			.catch(error => {
				console.log(link, error);
			});
	});

	await Promise.all(proms);
	return {...pageData};
};
