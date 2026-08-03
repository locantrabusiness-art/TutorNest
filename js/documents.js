/* =========================================================
DOCUMENTS.JS
PASTE LOCATION:
js/documents.js
========================================================= */


import { auth, db, storage } from "../firebase.js";


import {

onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";



import {

collection,
query,
where,
getDocs,
addDoc,
doc,
deleteDoc,
serverTimestamp

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";



import {

ref,
uploadBytes,
getDownloadURL,
deleteObject

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";





/* ================= ELEMENTS ================= */


const tableBody=

document.getElementById(

"documentTableBody"

);



const totalDocuments=

document.getElementById(

"totalDocuments"

);



const approvedDocuments=

document.getElementById(

"approvedDocuments"

);



const pendingDocuments=

document.getElementById(

"pendingDocuments"

);



const rejectedDocuments=

document.getElementById(

"rejectedDocuments"

);



const uploadModal=

document.getElementById(

"uploadModal"

);



const uploadDocumentBtn=

document.getElementById(

"uploadDocumentBtn"

);



const closeUploadModal=

document.getElementById(

"closeUploadModal"

);



const uploadDocument=

document.getElementById(

"uploadDocument"

);



const filter=

document.getElementById(

"documentFilter"

);



let tutorId="";

let documents=[];





/* ================= AUTH ================= */


onAuthStateChanged(auth,async(user)=>{


if(!user){


location.href="tutor-login.html";


return;


}



tutorId=user.uid;



loadDocuments();



});





/* ================= LOAD DOCUMENTS ================= */


async function loadDocuments(){



const snap=

await getDocs(

query(

collection(db,"documents"),

where(

"tutorId",

"==",

tutorId

)

)

);



documents=[];



snap.forEach(docSnap=>{


documents.push({

id:docSnap.id,

...docSnap.data()

});


});



renderDocuments(documents);


updateCards();



}






/* ================= RENDER ================= */


function renderDocuments(data){


tableBody.innerHTML="";



if(data.length===0){


tableBody.innerHTML=`

<tr>

<td colspan="5">

No Documents Uploaded

</td>

</tr>

`;

return;

}



data.forEach(file=>{


tableBody.innerHTML+=`

<tr>


<td>

${file.name}

</td>



<td>

${file.type}

</td>



<td>

${file.date||"-"}

</td>



<td>


<span class="status ${file.status?.toLowerCase()||"pending"}">

${file.status||"Pending"}

</span>


</td>



<td>


<button

class="viewBtn"

onclick="previewDocument('${file.url}')">

View

</button>



<button

class="deleteBtn"

onclick="deleteDocumentFile('${file.id}','${file.path}')">

Delete

</button>


</td>


</tr>

`;

});


}
/* =========================================================
DOCUMENTS.JS PART 2
UPLOAD + DELETE + PREVIEW
PASTE AT END OF js/documents.js
========================================================= */


/* ================= OPEN MODAL ================= */


uploadDocumentBtn.onclick=()=>{


uploadModal.style.display="flex";


};





closeUploadModal.onclick=()=>{


uploadModal.style.display="none";


};





/* ================= UPLOAD DOCUMENT ================= */


uploadDocument.onclick=async()=>{


const name=

document.getElementById(

"documentName"

).value;



const type=

document.getElementById(

"documentType"

).value;



const file=

document.getElementById(

"documentFile"

).files[0];



if(!name || !file){


alert("Select document");


return;


}




const filePath=

`tutors/${tutorId}/documents/${Date.now()}_${file.name}`;



const storageRef=

ref(

storage,

filePath

);



await uploadBytes(

storageRef,

file

);



const url=

await getDownloadURL(

storageRef

);



await addDoc(

collection(db,"documents"),

{


tutorId,


name,


type,


url,


path:filePath,


status:"Pending",


date:new Date()

.toISOString()

.split("T")[0],


createdAt:serverTimestamp()


}

);



alert(

"Document Uploaded"

);



uploadModal.style.display="none";



loadDocuments();



};





/* ================= DELETE DOCUMENT ================= */


window.deleteDocumentFile=

async function(id,path){



if(

!confirm(

"Delete Document?"

)

)return;



await deleteDoc(

doc(

db,

"documents",

id

)

);



if(path){


const fileRef=

ref(

storage,

path

);



try{


await deleteObject(

fileRef

);



}catch(error){


console.log(error);


}



}



alert(

"Deleted"

);



loadDocuments();



};





/* ================= PREVIEW ================= */


window.previewDocument=

function(url){



const modal=

document.getElementById(

"previewModal"

);



modal.style.display="flex";



document.getElementById(

"documentPreview"

).innerHTML=`

<iframe src="${url}"></iframe>

`;



};





/* ================= CLOSE PREVIEW ================= */


document

.getElementById(

"closePreviewModal"

)

.onclick=()=>{


document

.getElementById(

"previewModal"

)

.style.display="none";


};
/* =========================================================
DOCUMENTS.JS PART 3
FILTER + CARDS + REFRESH
PASTE AT END OF js/documents.js
========================================================= */


/* ================= UPDATE CARDS ================= */


function updateCards(){


let total=documents.length;

let approved=0;

let pending=0;

let rejected=0;



documents.forEach(file=>{


if(file.status==="Approved"){


approved++;


}

else if(file.status==="Rejected"){


rejected++;


}

else{


pending++;


}



});



totalDocuments.innerHTML=total;


approvedDocuments.innerHTML=approved;


pendingDocuments.innerHTML=pending;


rejectedDocuments.innerHTML=rejected;



}





/* ================= FILTER ================= */


filter.addEventListener(

"change",

()=>{


const value=

filter.value;



if(!value){


renderDocuments(documents);


return;


}



const result=

documents.filter(file=>{


return file.status===value;


});



renderDocuments(result);



});





/* ================= DOWNLOAD DOCUMENT ================= */


window.downloadDocument=

function(url,name){



const a=

document.createElement("a");



a.href=url;


a.download=name;


a.click();



};





/* ================= REFRESH ================= */


window.refreshDocuments=

function(){


loadDocuments();


};





/* ================= CLOSE MODALS ON OUTSIDE CLICK ================= */


window.addEventListener(

"click",

(e)=>{


if(e.target===uploadModal){


uploadModal.style.display="none";


}



if(e.target===document.getElementById("previewModal")){


document.getElementById(

"previewModal"

)

.style.display="none";


}



});





/* ================= AUTO REFRESH ================= */


setInterval(()=>{


loadDocuments();


},60000);





/* =========================================================
DOCUMENTS.JS COMPLETE
========================================================= */