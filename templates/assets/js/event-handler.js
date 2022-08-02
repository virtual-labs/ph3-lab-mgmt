"use-strict";

document.getElementById('bug-report').addEventListener('vl-bug-report', (e)=>{
    if(e.detail.status === 200 || e.detail.status === 201){
        dataLayer.push({
            event: "vl-bug-report",
            "bug-type": e.detail.issues  
        })
    }else{
        alert(e.detail.message)
    }
})