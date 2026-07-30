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

async function loadFeaturedTutors(){

    if(!container) return;

    container.innerHTML=`

    <div class="loading">

        <i class="fa-solid fa-spinner fa-spin"></i>

        <p>Loading Featured Tutors...</p>

    </div>

    `;

    try{

        const q=query(

            collection(db,"tutors"),

            where("status","==","Approved"),

            where("featured","==",true),

            orderBy("homepageOrder"),

            limit(6)

        );

        const snapshot=await getDocs(q);

        container.innerHTML="";

        if(snapshot.empty){

            container.innerHTML=`

            <div class="empty-state">

                <i class="fa-solid fa-user-slash"></i>

                <h3>No Featured Tutors</h3>

                <p>

                Featured tutors will appear here once added by the admin.

                </p>

            </div>

            `;

            return;

        }

        snapshot.forEach(doc=>{

            createTutorCard(doc.id,doc.data());

        });

    }

    catch(error){

        console.error(error);

        container.innerHTML=`

        <div class="empty-state">

            <i class="fa-solid fa-circle-exclamation"></i>

            <h3>Unable to load tutors</h3>

            <p>Please try again later.</p>

        </div>

        `;

    }

}
function createTutorCard(id,tutor){

    const card=document.createElement("div");

    card.className="featured-card";

    const image=

        tutor.photoURL ||

        "assets/images/default-user.png";

    const name=

        tutor.name ||

        "Tutor";

    const qualification=

        tutor.qualification ||

        "Qualification Not Added";

    const experience=

        tutor.experience ||

        "0";

    const area=

        tutor.area ||

        tutor.city ||

        "Location Not Available";

    const fees=

        tutor.fees ||

        tutor.monthlyFees ||

        "Contact";

    const subjects=Array.isArray(tutor.subjects)

        ? tutor.subjects.join(", ")

        : "Not Specified";

    card.innerHTML=`

    <div class="featured-image">

        <img
        src="${image}"
        alt="${name}"

        onerror="this.src='assets/images/default-user.png'">

    </div>

    <div class="featured-content">

        <h3>${name}</h3>

        <p class="qualification">

            ${qualification}

        </p>

        <p>

            <i class="fa-solid fa-book"></i>

            ${subjects}

        </p>

        <p>

            <i class="fa-solid fa-briefcase"></i>

            ${experience} Years Experience

        </p>

        <p>

            <i class="fa-solid fa-location-dot"></i>

            ${area}

        </p>

        <h4>

            ₹${fees}/Month

        </h4>

        <a

        href="teacher.html?id=${id}"

        class="primary-btn">

        View Profile

        </a>

    </div>

    `;

    container.appendChild(card);

}

loadFeaturedTutors();