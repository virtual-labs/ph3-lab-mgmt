async function gscApi(link, apiKey) {
	const api = 'https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run', parameters = { key: apiKey }, url = setUpQuery(link, api, parameters), result = {};

	await axios.post(url, {
		"url": link,
		"requestScreenshot": false
	})
		.then(response => {
			const json = response.data;
			result['Status'] = json['mobileFriendliness'];
			result['Issues'] = [];

			if (json.mobileFriendlyIssues) {
				result['Issues'] = json['mobileFriendlyIssues'];
			}
		})
		.catch(error => {
			console.log(link, error);
		});

	return {...result};
};
