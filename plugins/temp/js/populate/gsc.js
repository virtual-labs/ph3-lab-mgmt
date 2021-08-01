function gscPopulate(link, data)
{
	const statusElem = document.getElementById('gscStatus');
	statusElem.innerHTML = '';
	genText(statusElem, "Mobile Friendliness Status: " + data['Status'], "Mobile Friendliness Status: " + data['Status'].replace(/_/g, " "));

	const issuesElem = document.getElementById('gscIssues');
	issuesElem.innerHTML = '';
	if(data['Issues'].length)
	{
		data['Issues'].forEach((issue, idx) => {
			const issueDiv = document.createElement("div");
			genText(issueDiv, issue, issue);
			issueDiv.classList.add('issue');
			issuesElem.appendChild(issueDiv);
		});
	}

	const cardToggles = document.getElementsByClassName('card-toggle');
	Object.keys(cardToggles).forEach((key, ind) => {
		cardToggles[ind].addEventListener('click', e => {
			e.currentTarget.parentNode.children[1].classList.toggle('is-hidden');
		});
	});
};
