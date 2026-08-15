// ===============================
// GameBook GK Hub - script.js
// ===============================

// Welcome Message
window.addEventListener("load", () => {
    console.log("GameBook GK Hub Loaded Successfully!");
});

// ===============================
// Explore Button
// ===============================

const exploreBtn = document.querySelector(".hero button");

if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
        document.getElementById("games").scrollIntoView({
            behavior: "smooth"
        });
    });
}

// ===============================
// Smooth Navigation
// ===============================

document.querySelectorAll("nav a").forEach(link => {

    link.addEventListener("click", function(e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if(target){

            target.scrollIntoView({
                behavior:"smooth"
            });

        }

    });

});

// ===============================
// Card Animation
// ===============================

const cards = document.querySelectorAll(".card");

cards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-10px) scale(1.05)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0px)";

    });

});

// ===============================
// Card Click
// ===============================
// ===============================
// Random Background Glow
// ===============================

const colors=[
"#00ffff",
"#00ff99",
"#ff00ff",
"#00bfff",
"#7fff00"
];

setInterval(()=>{

document.body.style.boxShadow="0 0 80px "+colors[Math.floor(Math.random()*colors.length)];

},3000);

// ===============================
// Typing Hero Title
// ===============================

const title=document.querySelector(".hero h1");

const text="Welcome To GameBook GK Hub";

let i=0;

title.innerHTML="";

function typing(){

if(i<text.length){

title.innerHTML+=text.charAt(i);

i++;

setTimeout(typing,80);

}

}

typing();

// ===============================
// Scroll Reveal Animation
// ===============================

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";

entry.target.style.transform="translateY(0px)";

}

});

});

cards.forEach(card=>{

card.style.opacity="0";

card.style.transform="translateY(40px)";

observer.observe(card);

});

// ===============================
// Footer Year Auto
// ===============================

const footer=document.querySelector("footer");

footer.innerHTML="© "+new Date().getFullYear()+" GameBook GK Hub";

// ===============================
// Console
// ===============================

console.log("GameBook GK Hub Ready.");
