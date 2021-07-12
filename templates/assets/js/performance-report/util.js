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
	const text = document.createTextNode(content[0].toUpperCase() + content.slice(1));
	textElem.appendChild(text);
	if(flag)
	{
		genToolTip(textElem, commonData.descriptions[metric]);
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

function generateTableHead(table, title, keys) {
	const thead = table.createTHead();
	const titleRow = thead.insertRow();
	const titleth = document.createElement("th");
	titleth.colSpan = keys.length;
	const titleText = document.createTextNode(title);
	titleth.appendChild(titleText);
	titleRow.appendChild(titleth);

	const row = thead.insertRow();
	keys.forEach(function(key, ind) {
		const th = document.createElement("th");
		const text = document.createTextNode(key);
		th.appendChild(text);
		row.appendChild(th);
	});
};

function generateTable(data, maxCol) {
	const table = document.createElement("table");
	table.classList.add('table', 'is-bordered');

	let row = table.insertRow();
	Object.keys(data).forEach(function(metric, ind) {
		if(Object.keys(row.children).length === maxCol)
		{
			row = table.insertRow();
		}

		let cell = row.insertCell();
		let text = document.createTextNode(metric.charAt(0).toUpperCase() + metric.slice(1));
		cell.appendChild(text);

		cell = row.insertCell();
		text = document.createTextNode(data[metric]);
		cell.appendChild(text);
	});
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
