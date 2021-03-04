const sendPostMessage = (mutationList, ob) => {    
    if (mutationList) {

        console.log(mutationList.length);
	    let height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.body.clientHeight);
	    window.parent.postMessage({
		frameHeight: height
	    }, '*');    	
    }
}

window.onresize = () => sendPostMessage();

const config = { attributes: true, childList: true, subtree: false };

const observer = new MutationObserver(sendPostMessage);
observer.observe(document.body, config);



/* This is only needed when there is a nested iframe, and 
will work only if this script is manualy inserted in the embedded iframe page. 
*/
window.onmessage = (e) => {
    if (e.data.hasOwnProperty("frameHeight")) {
	var iframeDiv = document.querySelector("iframe");
	if (iframeDiv) {
	    iframeDiv.style["padding-top"] = `${e.data.frameHeight}px`;
	}
    }
};
