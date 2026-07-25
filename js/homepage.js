import { db } from "../firebase.js";

import {
collection,
query,
where,
orderBy,
limit,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const container =
document.getElementById("featuredTutorsContainer");

async function loadFeatured(){

    container.innerHTML="Loading...";

    try{

        const q=query(

            collection(db,"tutors"),

            where("status","==","Approved"),

            where("featured","==",true),

            orderBy("homepageOrder"),

            limit(6)

        );

        const snap=await getDocs(q);

        container.innerHTML="";

        if(snap.empty){

            container.innerHTML=
            "<p>No featured tutors available.</p>";

            return;

        }

        snap.forEach(doc=>{

            const tutor=doc.data();

            const card=document.createElement("div");

            card.className="featured-card";

            card.innerHTML=`

            <img src="${tutor.photo||'assets/logo/logo.png'}">

            <h3>${tutor.name}</h3>

            <p>${tutor.qualification||""}</p>

            <p>${(tutor.subjects||[]).join(", ")}</p>

            <p>${tutor.area||""}</p>

            <button onclick="location.href='teacher.html?id=${doc.id}'">

            View Profile

            </button>

            `;

            container.appendChild(card);

        });

    }

    catch(err){

        console.error(err);

        container.innerHTML=
        "<p>Unable to load tutors.</p>";

    }

}

loadFeatured();