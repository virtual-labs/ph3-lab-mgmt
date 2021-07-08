function colorScheme(score) {
	let color = 'green';
	if(score < 50)
	{
		color = 'red';
	}

	else if(score < 90)
	{
		color = 'orange';
	}

	return color;
};

function genText(elem, metric, value) {
	const textElem = document.createElement("div");
	const text = document.createTextNode(metric + ': ' + String(value));
	textElem.appendChild(text);
	elem.appendChild(textElem);
};

function gscPopulate(link, data)
{
	const segment = document.getElementById('gscRes');
	segment.innerHTML = '';
	genText(segment, 'Mobile Friendliness Status', data['Status']);

	if(data['Issues'].length)
	{
		data['Issues'].forEach((issue, idx) => {
			genText(segment, 'Issue ' + String(idx), issue);
		});
	}
};
