function gscPopulate(link, data)
{
	const statusElem = document.getElementById('gscStatus');
	statusElem.innerHTML = "Mobile Friendliness Status: " + data['Status'];

	const issuesElem = document.getElementById('gscIssues');
	issuesElem.innerHTML = data['Status'];

	if(data['Issues'].length)
	{
		data['Issues'].forEach((issue, idx) => {
			genText(issuesElem, 'Issue ' + String(idx), issue);
		});
	}

	const cardToggles = document.getElementsByClassName('card-toggle');
	Object.keys(cardToggles).forEach((key, ind) => {
		cardToggles[ind].addEventListener('click', e => {
			e.currentTarget.parentNode.children[1].classList.toggle('is-hidden');
		});
	});
};
