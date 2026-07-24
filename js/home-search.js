const input=document.getElementById("homeSearch");

document.getElementById("searchBtn")
.onclick=()=>{

const value=input.value.trim();

if(!value){

location.href="teachers.html";

return;

}

location.href=
`teachers.html?search=${encodeURIComponent(value)}`;

};