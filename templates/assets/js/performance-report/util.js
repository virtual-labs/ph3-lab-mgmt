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

