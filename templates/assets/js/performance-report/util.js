function splitToChunks(array, parts) {
	let result = [];
	for (let i = parts; i > 0; i--) {
		result.push(array.splice(0, Math.ceil(array.length / i)));
	}
	return result;
};

function setUpQuery(link, api, parameters) {
	let query = `${api}?`;
	Object.keys(parameters).forEach(function(key, i) {
		if(Array.isArray(parameters[key]))
		{
			parameters[key].forEach(function(elem, idx) {
				query += `${key}=${elem}&`;
			});
		}

		else
		{
			query += `${key}=${parameters[key]}&`;
		}
	});

	query = query.slice(0, -1);
	return query;
};

function genCols(elem) {
	const cols = document.createElement("div");
	cols.classList.add('columns', 'is-centered');
	elem.appendChild(cols);
	return cols;
};

function genColumn(elem) {
	const column = document.createElement("div");
	column.classList.add('column', 'has-text-centered');
	elem.appendChild(column);
	return column;
};

function genText(elem, metric, content, flag) {
	const textElem = document.createElement("div");
	textElem.classList.add('is-size-5');
	const text = content[0].toUpperCase() + content.slice(1);
	textElem.innerHTML = text;

	if(flag)
	{
		const infoIcon = document.createElement("i");
		infoIcon.classList.add('fa', 'fa-info-circle');
		genToolTip(infoIcon, commonData.descriptions[metric]);
		textElem.innerHTML += " ";
		textElem.appendChild(infoIcon);
	}
	elem.appendChild(textElem);
};


function genToolTip(elem, text) {
	elem.classList.add('tool-tip');
	const desc = document.createElement("span");
	desc.classList.add('tooltip-text');
	desc.innerHTML = text;
	elem.appendChild(desc);
};

function colorScheme(score) {
	let color = 2;
	if(score < 50)
	{
		color = 0;
	}

	else if(score < 90)
	{
		color = 1;
	}

	return color;
};
