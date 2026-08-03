/* =========================================================
HOMEWORK.JS
PASTE LOCATION:
js/homework.js
========================================================= */


import { auth, db } from "../firebase.js";


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
getDoc,
updateDoc,
deleteDoc,
serverTimestamp

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";





/* ================= ELEMENTS ================= */


const homeworkTableBody=

document.getElementById(

"homeworkTableBody"

);



const totalHomework=

document.getElementById(

"totalHomework"

);



const pendingHomework=

document.getElementById(

"pendingHomework"

);



const completedHomework=

document.getElementById(

"completedHomework"

);



const studentHomework=

document.getElementById(

"studentHomework"

);





const homeworkSearch=

document.getElementById(

"homeworkSearch"

);



const subjectFilter=

document.getElementById(

"subjectFilter"

);





const homeworkModal=

document.getElementById(

"homeworkModal"

);



const addHomeworkBtn=

document.getElementById(

"addHomeworkBtn"

);



const closeHomeworkModal=

document.getElementById(

"closeHomeworkModal"

);



const saveHomework=

document.getElementById(

"saveHomework"

);



const viewHomeworkModal=

document.getElementById(

"viewHomeworkModal"

);



const closeViewHomework=

document.getElementById(

"closeViewHomework"

);





let tutorId="";


let homeworkList=[];





/* ================= AUTH ================= */


onAuthStateChanged(auth,async(user)=>{


if(!user){


location.href="tutor-login.html";


return;


}



tutorId=user.uid;



loadHomework();



});





/* ================= LOAD HOMEWORK ================= */


async function loadHomework(){


const snap=await getDocs(

query(

collection(db,"homework"),

where(

"teacherId",

"==",

tutorId

)

)

);



homeworkList=[];



snap.forEach(docSnap=>{


homeworkList.push({

id:docSnap.id,

...docSnap.data()

});


});



renderHomework(homeworkList);


updateCards();


}






/* ================= RENDER ================= */


function renderHomework(data){


homeworkTableBody.innerHTML="";



if(data.length===0){


homeworkTableBody.innerHTML=`

<tr>

<td colspan="7">

No Homework Found

</td>

</tr>

`;

return;

}



data.forEach(hw=>{


homeworkTableBody.innerHTML+=`

<tr>


<td>

${hw.title||"-"}

</td>



<td>

${hw.subject||"-"}

</td>



<td>

${hw.class||"-"}

</td>



<td>

${hw.createdAt?.toDate?.().toLocaleDateString() || "-"}

</td>



<td>

${hw.dueDate||"-"}

</td>



<td>


<span class="status ${hw.status==="Completed"?"completed":"pending"}">

${hw.status||"Pending"}

</span>


</td>



<td>


<button

class="viewBtn"

onclick="viewHomework('${hw.id}')">

View

</button>



<button

class="editBtn"

onclick="editHomework('${hw.id}')">

Edit

</button>



<button

class="deleteBtn"

onclick="deleteHomework('${hw.id}')">

Delete

</button>


</td>


</tr>

`;

});


}
/* =========================================================
HOMEWORK.JS
PASTE LOCATION:
js/homework.js
========================================================= */


import { auth, db } from "../firebase.js";


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
getDoc,
updateDoc,
deleteDoc,
serverTimestamp

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";





/* ================= ELEMENTS ================= */


const homeworkTableBody=

document.getElementById(

"homeworkTableBody"

);



const totalHomework=

document.getElementById(

"totalHomework"

);



const pendingHomework=

document.getElementById(

"pendingHomework"

);



const completedHomework=

document.getElementById(

"completedHomework"

);



const studentHomework=

document.getElementById(

"studentHomework"

);





const homeworkSearch=

document.getElementById(

"homeworkSearch"

);



const subjectFilter=

document.getElementById(

"subjectFilter"

);





const homeworkModal=

document.getElementById(

"homeworkModal"

);



const addHomeworkBtn=

document.getElementById(

"addHomeworkBtn"

);



const closeHomeworkModal=

document.getElementById(

"closeHomeworkModal"

);



const saveHomework=

document.getElementById(

"saveHomework"

);



const viewHomeworkModal=

document.getElementById(

"viewHomeworkModal"

);



const closeViewHomework=

document.getElementById(

"closeViewHomework"

);





let tutorId="";


let homeworkList=[];





/* ================= AUTH ================= */


onAuthStateChanged(auth,async(user)=>{


if(!user){


location.href="tutor-login.html";


return;


}



tutorId=user.uid;



loadHomework();



});





/* ================= LOAD HOMEWORK ================= */


async function loadHomework(){


const snap=await getDocs(

query(

collection(db,"homework"),

where(

"teacherId",

"==",

tutorId

)

)

);



homeworkList=[];



snap.forEach(docSnap=>{


homeworkList.push({

id:docSnap.id,

...docSnap.data()

});


});



renderHomework(homeworkList);


updateCards();


}






/* ================= RENDER ================= */


function renderHomework(data){


homeworkTableBody.innerHTML="";



if(data.length===0){


homeworkTableBody.innerHTML=`

<tr>

<td colspan="7">

No Homework Found

</td>

</tr>

`;

return;

}



data.forEach(hw=>{


homeworkTableBody.innerHTML+=`

<tr>


<td>

${hw.title||"-"}

</td>



<td>

${hw.subject||"-"}

</td>



<td>

${hw.class||"-"}

</td>



<td>

${hw.createdAt?.toDate?.().toLocaleDateString() || "-"}

</td>



<td>

${hw.dueDate||"-"}

</td>



<td>


<span class="status ${hw.status==="Completed"?"completed":"pending"}">

${hw.status||"Pending"}

</span>


</td>



<td>


<button

class="viewBtn"

onclick="viewHomework('${hw.id}')">

View

</button>



<button

class="editBtn"

onclick="editHomework('${hw.id}')">

Edit

</button>



<button

class="deleteBtn"

onclick="deleteHomework('${hw.id}')">

Delete

</button>


</td>


</tr>

`;

});


}
/* =========================================================
HOMEWORK.JS PART 3
SEARCH + FILTER + STATUS + EXPORT
PASTE AT END OF js/homework.js
========================================================= */


/* ================= SEARCH ================= */


homeworkSearch.addEventListener(

"keyup",

()=>{


filterHomework();


}

);





/* ================= SUBJECT FILTER ================= */


subjectFilter.addEventListener(

"change",

()=>{


filterHomework();


}

);





function filterHomework(){


const keyword=

homeworkSearch.value.toLowerCase();



const subject=

subjectFilter.value;



const filtered=

homeworkList.filter(hw=>{


const matchName=

(hw.title||"")

.toLowerCase()

.includes(keyword);



const matchSubject=

!subject ||

hw.subject===subject;



return matchName && matchSubject;



});



renderHomework(filtered);



}






/* ================= UPDATE CARDS ================= */


function updateCards(){


totalHomework.innerHTML=

homeworkList.length;



let pending=0;

let completed=0;



let students=new Set();



homeworkList.forEach(hw=>{


if(hw.status==="Completed"){


completed++;


}

else{


pending++;


}



if(hw.studentId){


students.add(hw.studentId);


}



});



pendingHomework.innerHTML=

pending;



completedHomework.innerHTML=

completed;



studentHomework.innerHTML=

students.size;



}






/* ================= MARK COMPLETE ================= */


window.completeHomework=

async function(id){



await updateDoc(

doc(

db,

"homework",

id

),

{

status:"Completed"

}

);



alert("Homework Completed");



loadHomework();



};






/* ================= DUPLICATE CHECK ================= */


function homeworkExists(title){


return homeworkList.some(hw=>{


return hw.title===title;


});


}





/* ================= EXPORT CSV ================= */


window.exportHomeworkCSV=

function(){



let csv=

"Title,Subject,Class,Due Date,Status\n";



homeworkList.forEach(hw=>{


csv+=

`${hw.title},${hw.subject},${hw.class},${hw.dueDate},${hw.status}\n`;



});



const blob=

new Blob(

[csv],

{

type:"text/csv"

}

);



const url=

URL.createObjectURL(blob);



const a=

document.createElement("a");



a.href=url;



a.download=

"homework-list.csv";



a.click();



};





/* ================= REFRESH ================= */


window.refreshHomework=

function(){


loadHomework();


};





/* ================= AUTO REFRESH ================= */


setInterval(()=>{


loadHomework();


},60000);



/* =========================================================
END HOMEWORK.JS PART 3
========================================================= */
/* =========================================================
HOMEWORK.JS PART 4
ASSIGN STUDENT + HISTORY + FILE SUPPORT
PASTE AT END OF js/homework.js
========================================================= */


/* ================= ASSIGN STUDENT ================= */


window.assignHomework = async function(id){


const studentId=

prompt(

"Enter Student ID"

);



if(!studentId)return;



await updateDoc(

doc(

db,

"homework",

id

),

{

studentId,

assigned:true

}

);



alert(

"Homework Assigned"

);



loadHomework();



};





/* ================= LOAD STUDENT HOMEWORK ================= */


window.studentHomeworkList = async function(studentId){


const snap=

await getDocs(

query(

collection(db,"homework"),

where(

"studentId",

"==",

studentId

)

)

);



let data=[];



snap.forEach(doc=>{


data.push({

id:doc.id,

...doc.data()

});


});



return data;


};





/* ================= DELETE ALL COMPLETED ================= */


window.deleteCompletedHomework=

async function(){



const snap=

await getDocs(

query(

collection(db,"homework"),

where(

"teacherId",

"==",

tutorId

),

where(

"status",

"==",

"Completed"

)

)

);



if(!confirm("Delete Completed Homework?"))

return;



for(const item of snap.docs){


await deleteDoc(

doc(

db,

"homework",

item.id

)

);


}



alert(

"Completed Homework Removed"

);



loadHomework();



};





/* ================= UPCOMING HOMEWORK ================= */


window.upcomingHomework=

function(){



const today=

new Date();



const result=

homeworkList.filter(hw=>{


return (

hw.dueDate &&

new Date(hw.dueDate)>=today

);


});



console.table(result);



return result;


};





/* ================= DUE DATE ALERT ================= */


function checkDueDates(){



const today=

new Date()

.toISOString()

.split("T")[0];



const due=homeworkList.filter(hw=>{


return hw.dueDate===today;


});



if(due.length){


console.log(

"Homework Due Today:",

due

);


}



}





/* ================= AUTO CHECK ================= */


setInterval(()=>{


checkDueDates();


},30000);





/* =========================================================
END HOMEWORK.JS PART 4
========================================================= */
/* =========================================================
HOMEWORK.JS PART 5
NOTIFICATIONS + COMMENTS + STATUS MANAGEMENT
PASTE AT END OF js/homework.js
========================================================= */


/* ================= HOMEWORK COMMENTS ================= */


window.addHomeworkComment = async function(id){


const comment=

prompt(

"Enter Comment"

);



if(!comment)return;



await addDoc(

collection(db,"homeworkComments"),

{

homeworkId:id,

teacherId,

comment,

createdAt:serverTimestamp()

}

);



alert("Comment Added");


};





/* ================= LOAD COMMENTS ================= */


window.loadHomeworkComments = async function(id){


const snap=

await getDocs(

query(

collection(db,"homeworkComments"),

where(

"homeworkId",

"==",

id

)

)

);



let html="";



if(snap.empty){

return "No Comments";

}



snap.forEach(doc=>{


const c=doc.data();



html+=`

<div style="

padding:10px;

background:#f8f9fa;

margin-top:10px;

border-radius:8px;

">


${c.comment}


</div>

`;



});



return html;


};





/* ================= CHANGE STATUS ================= */


window.changeHomeworkStatus = async function(id,status){


await updateDoc(

doc(

db,

"homework",

id

),

{

status

}

);



alert(

"Status Updated"

);



loadHomework();



};





/* ================= TODAY HOMEWORK ================= */


window.todayHomework = function(){


const today=

new Date()

.toISOString()

.split("T")[0];



const list=

homeworkList.filter(hw=>{


return hw.createdAt &&

hw.dueDate===today;


});



console.table(list);


return list;


};





/* ================= HOMEWORK COUNT BY SUBJECT ================= */


window.subjectWiseHomework=function(){


const result={};



homeworkList.forEach(hw=>{


const sub=

hw.subject||"Other";



if(!result[sub]){

result[sub]=0;

}



result[sub]++;


});



console.table(result);


return result;


};





/* ================= CLEAR FILTER ================= */


window.clearHomeworkFilter=function(){


homeworkSearch.value="";


subjectFilter.value="";


renderHomework(homeworkList);



};





/* =========================================================
END HOMEWORK.JS PART 5
========================================================= */
/* =========================================================
HOMEWORK.JS PART 6
ADVANCED REPORTS + PERFORMANCE
PASTE AT END OF js/homework.js
========================================================= */


/* ================= HOMEWORK ANALYTICS ================= */


window.homeworkAnalytics = async function(){


const snap = await getDocs(

query(

collection(db,"homework"),

where(

"teacherId",

"==",

tutorId

)

)

);



let total=0;

let completed=0;

let pending=0;



snap.forEach(doc=>{


total++;


if(doc.data().status==="Completed"){

completed++;

}

else{

pending++;

}


});



const report={


total,

completed,

pending,


completionRate:

total===0

?0

:

Math.round(

completed*100/total

)



};



console.table(report);


return report;



};





/* ================= STUDENT PERFORMANCE ================= */


window.studentHomeworkPerformance = async function(studentId){



const snap=await getDocs(

query(

collection(db,"homework"),

where(

"studentId",

"==",

studentId

)

)

);



let total=0;

let completed=0;



snap.forEach(doc=>{


total++;


if(doc.data().status==="Completed"){

completed++;

}


});



return {

total,

completed,

percentage:

total===0

?0

:

Math.round(

completed*100/total

)


};



};





/* ================= DELETE OLD HOMEWORK ================= */


window.deleteOldHomework = async function(){



const today=new Date();



const snap=await getDocs(

query(

collection(db,"homework"),

where(

"teacherId",

"==",

tutorId

)

)

);



let count=0;



for(const item of snap.docs){



const data=item.data();



if(data.dueDate){



const due=new Date(data.dueDate);



if(due<today){


await deleteDoc(

doc(

db,

"homework",

item.id

)

);


count++;


}


}


}



alert(

count+" old homework deleted"

);



loadHomework();



};





/* ================= COPY HOMEWORK ================= */


window.copyHomework = async function(id){



const snap=

await getDoc(

doc(

db,

"homework",

id

)

);



if(!snap.exists())return;



const old=snap.data();



await addDoc(

collection(db,"homework"),

{

...old,

title:old.title+" Copy",

status:"Pending",

createdAt:serverTimestamp()

}

);



alert("Homework Copied");


loadHomework();



};





/* ================= DUPLICATE TITLE CHECK ================= */


function duplicateHomework(title){


return homeworkList.some(hw=>{


return hw.title===title;


});


}





/* ================= END PART 6 ================= */
/* =========================================================
HOMEWORK.JS PART 7
FINAL FEATURES + SECURITY + CLEANUP
PASTE AT END OF js/homework.js
========================================================= */


/* ================= CHECK LOGIN ================= */


function checkHomeworkAccess(){


if(!tutorId){

console.log(
"Waiting for authentication..."
);

return false;

}


return true;


}





/* ================= GET HOMEWORK BY DATE ================= */


window.getHomeworkByDate=function(date){


const result=

homeworkList.filter(hw=>{


if(!hw.createdAt?.toDate){

return false;

}


const hwDate=

hw.createdAt

.toDate()

.toISOString()

.split("T")[0];



return hwDate===date;


});



return result;


};





/* ================= GET PENDING HOMEWORK ================= */


window.getPendingHomework=function(){


return homeworkList.filter(hw=>{


return (

hw.status!=="Completed"

);


});


};





/* ================= GET COMPLETED HOMEWORK ================= */


window.getCompletedHomework=function(){


return homeworkList.filter(hw=>{


return (

hw.status==="Completed"

);


});


};





/* ================= HOMEWORK REMINDER ================= */


window.sendHomeworkReminder=function(id){



const hw=

homeworkList.find(

item=>item.id===id

);



if(!hw)return;



const message=

encodeURIComponent(

`Homework Reminder:

${hw.title}

Subject: ${hw.subject}

Due Date: ${hw.dueDate}`

);



alert(

"Reminder Ready"

);



};





/* ================= RESET HOMEWORK FORM ================= */


window.resetHomeworkForm=function(){



document.getElementById(

"homeworkTitle"

).value="";



document.getElementById(

"homeworkClass"

).value="";



document.getElementById(

"homeworkDescription"

).value="";



document.getElementById(

"homeworkDueDate"

).value="";



};





/* ================= PAGE CLICK CLOSE ================= */


window.addEventListener(

"click",

(e)=>{


if(e.target===homeworkModal){


homeworkModal.style.display="none";


}


if(e.target===viewHomeworkModal){


viewHomeworkModal.style.display="none";


}


});





/* ================= FINAL REFRESH ================= */


window.reloadHomeworkData=function(){


loadHomework();


};





/* =========================================================
HOMEWORK.JS COMPLETE
========================================================= */