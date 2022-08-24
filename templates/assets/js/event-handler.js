"use-strict";

document.getElementById('bug-report').addEventListener('vl-bug-report', (e)=>{
    if(e.detail.status === 200 || e.detail.status === 201){
        const learningUnit = document.head.querySelector('meta[name="learning-unit"]').content;
        const task = document.head.querySelector('meta[name="task-name"]').content;
        dataLayer.push({
            event: "vl-bug-report",
            "bug-type": e.detail.issues,
            "learning-unit": learningUnit ? learningUnit : "", 
            "task-name": task ? task : ""
        })
        // alert("Bug Reported successfully");
        // Create a toast notification use bootstrap
        const toast = document.createElement('div');
        toast.classList.add('alert', 'show', 'alert-success', 'alert-dismissible', 'fade');
        toast.setAttribute('role', 'alert');
        //set  style="position: absolute; top: 0; right: 0;
        toast.setAttribute('style', 'position: absolute; top: 0; z-index: 9999; width: 100%'); 
        toast.innerHTML = `Bug reported successfully
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>`;
        document.body.appendChild(toast);
        setTimeout(()=>{
            toast.classList.remove('show');
        } , 3000);
    }else{
        // Create a try again toast notification use bootstrap
        const toast = document.createElement('div');
        toast.classList.add('alert', 'show', 'alert-danger', 'alert-dismissible', 'fade');
        toast.setAttribute('role', 'alert');
        //set  style="position: absolute; top: 0; right: 0;
        toast.setAttribute('style', 'position: absolute; top: 0; z-index: 9999; width: 100%'); 
        toast.innerHTML = `Please Try Again
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>`;
        document.body.appendChild(toast);
        setTimeout(()=>{
            toast.classList.remove('show');
        } , 3000);
    }
})