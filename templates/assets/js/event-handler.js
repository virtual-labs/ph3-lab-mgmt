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
        alert("Bug Reported successfully");
    }else{
        alert(e.detail.message)
    }
})