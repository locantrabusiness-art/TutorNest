/* =========================================================
SALARY.JS
PASTE LOCATION:
js/salary.js
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
doc,
getDoc,
addDoc,
serverTimestamp

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";





/* ================= ELEMENTS ================= */


const salaryTableBody=

document.getElementById(

"salaryTableBody"

);



const totalEarning=

document.getElementById(

"totalEarning"

);



const pendingAmount=

document.getElementById(

"pendingAmount"

);



const paidAmount=

document.getElementById(

"paidAmount"

);



const totalPayments=

document.getElementById(

"totalPayments"

);



const paymentSearch=

document.getElementById(

"paymentSearch"

);



const paymentFilter=

document.getElementById(

"paymentFilter"

);



const salaryModal=

document.getElementById(

"salaryModal"

);



const closeSalaryModal=

document.getElementById(

"closeSalaryModal"

);



const refreshSalary=

document.getElementById(

"refreshSalary"

);



let tutorId="";


let payments=[];




/* ================= AUTH ================= */


onAuthStateChanged(auth,async(user)=>{


if(!user){


location.href="tutor-login.html";


return;


}



tutorId=user.uid;



loadSalary();



});





/* ================= LOAD SALARY ================= */


async function loadSalary(){


const snap=

await getDocs(

query(

collection(db,"payments"),

where(

"teacherId",

"==",

tutorId

)

)

);



payments=[];



snap.forEach(docSnap=>{


payments.push({

id:docSnap.id,

...docSnap.data()

});


});



renderSalary(payments);


updateSalaryCards();



}






/* ================= RENDER ================= */


function renderSalary(data){


salaryTableBody.innerHTML="";



if(data.length===0){


salaryTableBody.innerHTML=`

<tr>

<td colspan="5">

No Payments Found

</td>

</tr>

`;

return;

}



data.forEach(payment=>{


salaryTableBody.innerHTML+=`

<tr>


<td>

${payment.month||"-"}

</td>



<td>

₹${payment.amount||0}

</td>



<td>


<span class="status ${payment.status==="Paid"?"paid":"pending"}">

${payment.status||"Pending"}

</span>


</td>



<td>

${payment.date||"-"}

</td>



<td>


<button

class="viewBtn"

onclick="viewPayment('${payment.id}')">

View

</button>


</td>


</tr>

`;

});


}
/* =========================================================
SALARY.JS PART 2
PASTE AT END OF js/salary.js
========================================================= */


/* ================= UPDATE CARDS ================= */


function updateSalaryCards(){


let total=0;

let paid=0;

let pending=0;



payments.forEach(payment=>{


const amount=

Number(payment.amount||0);



total+=amount;



if(payment.status==="Paid"){


paid+=amount;


}

else{


pending+=amount;


}



});



totalEarning.innerHTML=

"₹"+total.toLocaleString();



paidAmount.innerHTML=

"₹"+paid.toLocaleString();



pendingAmount.innerHTML=

"₹"+pending.toLocaleString();



totalPayments.innerHTML=

payments.length;



}





/* ================= VIEW PAYMENT ================= */


window.viewPayment=

async function(id){



const snap=

await getDoc(

doc(

db,

"payments",

id

)

);



if(!snap.exists())return;



const payment=snap.data();



salaryModal.style.display="flex";



document.getElementById(

"salaryDetails"

).innerHTML=`

<div class="salaryDetails">


<h3>

Payment Details

</h3>


<p>

Month:

${payment.month||"-"}

</p>



<p>

Amount:

₹${payment.amount||0}

</p>



<p>

Status:

${payment.status||"Pending"}

</p>



<p>

Payment Date:

${payment.date||"-"}

</p>



<p>

Transaction ID:

${payment.transactionId||"-"}

</p>


</div>

`;



};





/* ================= CLOSE MODAL ================= */


closeSalaryModal.onclick=()=>{


salaryModal.style.display="none";


};





/* ================= SEARCH ================= */


paymentSearch.addEventListener(

"keyup",

()=>{


filterPayments();


}

);





paymentFilter.addEventListener(

"change",

()=>{


filterPayments();


}

);





function filterPayments(){



const keyword=

paymentSearch.value.toLowerCase();



const status=

paymentFilter.value;



const filtered=

payments.filter(payment=>{


const matchText=

(payment.month||"")

.toLowerCase()

.includes(keyword);



const matchStatus=

!status ||

payment.status===status;



return matchText && matchStatus;



});



renderSalary(filtered);



}





/* ================= REFRESH ================= */


refreshSalary.onclick=()=>{


loadSalary();


};





/* =========================================================
END SALARY.JS PART 2
========================================================= */
/* =========================================================
SALARY.JS PART 3
EXPORT + REPORT + PAYMENT HISTORY
PASTE AT END OF js/salary.js
========================================================= */


/* ================= EXPORT CSV ================= */


window.exportSalaryCSV=function(){


let csv=

"Month,Amount,Status,Date\n";



payments.forEach(payment=>{


csv+=

`${payment.month||""},${payment.amount||0},${payment.status||""},${payment.date||""}\n`;



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

"salary-report.csv";


a.click();



};





/* ================= PRINT REPORT ================= */


document

.getElementById("printSalary")

.onclick=()=>{


window.print();


};





/* ================= MONTHLY SUMMARY ================= */


window.monthlySalaryReport=function(){


const report={};



payments.forEach(payment=>{


const month=

payment.month||"Unknown";



if(!report[month]){


report[month]={

amount:0,

count:0

};


}



report[month].amount+=

Number(payment.amount||0);



report[month].count++;



});



console.table(report);



return report;


};





/* ================= LAST PAYMENT ================= */


window.lastPayment=function(){


if(payments.length===0){


return null;


}



const latest=

payments.sort(

(a,b)=>

new Date(b.date)-new Date(a.date)

)[0];



console.log(latest);



return latest;



};





/* ================= PAYMENT STATUS UPDATE ================= */


window.updatePaymentStatus=async function(id,status){



await updateDoc(

doc(

db,

"payments",

id

),

{

status

}

);



alert(

"Payment Status Updated"

);



loadSalary();



};





/* ================= AUTO REFRESH ================= */


setInterval(()=>{


loadSalary();


},60000);





/* =========================================================
END SALARY.JS PART 3
========================================================= */
/* =========================================================
SALARY.JS PART 4
ADVANCED PAYMENT FEATURES
PASTE AT END OF js/salary.js
========================================================= */


/* ================= PAYMENT FILTER BY MONTH ================= */


window.filterByMonth=function(month){


const filtered=

payments.filter(payment=>{


return payment.month===month;


});



renderSalary(filtered);



};





/* ================= TOTAL MONTHLY EARNING ================= */


window.getMonthlyEarning=function(month){


let total=0;



payments.forEach(payment=>{


if(payment.month===month){


total+=Number(payment.amount||0);


}


});



return total;



};





/* ================= PAYMENT COUNT ================= */


window.paymentStatistics=function(){


const stats={


Paid:0,

Pending:0,

Total:payments.length


};



payments.forEach(payment=>{


if(payment.status==="Paid"){


stats.Paid++;


}

else{


stats.Pending++;


}


});



console.table(stats);



return stats;



};





/* ================= DOWNLOAD PAYMENT RECEIPT ================= */


window.downloadReceipt=function(id){



const payment=

payments.find(

p=>p.id===id

);



if(!payment)return;



const receipt=

`

TutorNest Payment Receipt

-------------------------

Month:

${payment.month}


Amount:

₹${payment.amount}


Status:

${payment.status}


Date:

${payment.date}


Transaction ID:

${payment.transactionId||"-"}


`;



const blob=

new Blob(

[receipt],

{

type:"text/plain"

}

);



const url=

URL.createObjectURL(blob);



const a=

document.createElement("a");



a.href=url;



a.download=

"payment-receipt.txt";



a.click();



};





/* ================= CLEAR FILTER ================= */


window.clearPaymentFilter=function(){


paymentSearch.value="";


paymentFilter.value="";


renderSalary(payments);



};





/* ================= FINAL INIT ================= */


setTimeout(()=>{


loadSalary();


},1000);



/* =========================================================
SALARY.JS COMPLETE
========================================================= */