/* =====================================================
  Gyan Npal
   MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   1. PAGE LOADING ANIMATION
===================================================== */

window.addEventListener("load", () => {

    document.body.classList.add("page-loaded");

});


/* =====================================================
   2. SMOOTH SCROLL
===================================================== */

function scrollToSection(id) {

    const section = document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =====================================================
   3. SCROLL REVEAL ANIMATION
===================================================== */

const revealElements =
    document.querySelectorAll(".reveal");


const revealObserver =
    new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("active");

                    /*
                     * Once animated, stop observing.
                     * This prevents unnecessary work.
                     */

                    revealObserver.unobserve(
                        entry.target
                    );

                }

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        }
    );


revealElements.forEach((element) => {

    revealObserver.observe(element);

});


/* =====================================================
   4. CARD STAGGER ANIMATION
===================================================== */

const cardGrids =
    document.querySelectorAll(".cards-grid");


cardGrids.forEach((grid) => {

    const cards =
        grid.querySelectorAll(".content-card");


    cards.forEach((card, index) => {

        card.style.transitionDelay =
            `${index * 0.05}s`;

    });

});


/* =====================================================
   5. ACTIVE NAVIGATION
===================================================== */

const sections =
    document.querySelectorAll("section[id]");

const navLinks =
    document.querySelectorAll("nav a");


function updateActiveNavigation() {

    let currentSection = "";


    sections.forEach((section) => {

        const sectionTop =
            section.offsetTop - 180;

        const sectionBottom =
            sectionTop + section.offsetHeight;


        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionBottom
        ) {

            currentSection =
                section.getAttribute("id");

        }

    });


    navLinks.forEach((link) => {

        link.classList.remove(
            "active-nav"
        );


        const href =
            link.getAttribute("href");


        if (
            href === `#${currentSection}`
        ) {

            link.classList.add(
                "active-nav"
            );

        }

    });

}


window.addEventListener(
    "scroll",
    updateActiveNavigation
);


updateActiveNavigation();


/* =====================================================
   6. NAVIGATION CLICK
===================================================== */

navLinks.forEach((link) => {

    link.addEventListener(
        "click",
        function(event) {

            const targetId =
                this.getAttribute("href");


            if (
                !targetId ||
                !targetId.startsWith("#")
            ) {

                return;

            }


            const target =
                document.querySelector(
                    targetId
                );


            if (!target) return;


            event.preventDefault();


            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


            /*
             * Update URL without refreshing page.
             */

            history.pushState(
                null,
                "",
                targetId
            );

        }
    );

});


/* =====================================================
   7. RIPPLE EFFECT ON BUTTONS
===================================================== */

const buttons =
    document.querySelectorAll(
        ".primary-btn, .secondary-btn"
    );


buttons.forEach((button) => {

    button.addEventListener(
        "click",
        function(event) {

            const ripple =
                document.createElement("span");


            ripple.className =
                "button-ripple";


            const rect =
                this.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;


            const y =
                event.clientY -
                rect.top;


            ripple.style.left =
                `${x}px`;

            ripple.style.top =
                `${y}px`;


            this.appendChild(ripple);


            setTimeout(() => {

                ripple.remove();

            }, 600);

        }
    );

});


/* =====================================================
   8. CARD TILT EFFECT
===================================================== */

const cards =
    document.querySelectorAll(
        ".content-card"
    );


cards.forEach((card) => {

    card.addEventListener(
        "mousemove",
        (event) => {

            /*
             * Disable tilt on small screens.
             */

            if (window.innerWidth < 800) {
                return;
            }


            const rect =
                card.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;


            const y =
                event.clientY -
                rect.top;


            const centerX =
                rect.width / 2;


            const centerY =
                rect.height / 2;


            const rotateX =
                ((y - centerY) /
                    centerY) * -3;


            const rotateY =
                ((x - centerX) /
                    centerX) * 3;


            card.style.transform =
                `perspective(800px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)
                 translateY(-10px)
                 scale(1.015)`;

        }
    );


    card.addEventListener(
        "mouseleave",
        () => {

            card.style.transform = "";

        }
    );

});


/* =====================================================
   9. BACK TO TOP BUTTON
===================================================== */

const backToTop =
    document.createElement("button");


backToTop.innerHTML = "↑";


backToTop.className =
    "back-to-top";


backToTop.setAttribute(
    "aria-label",
    "Back to top"
);


document.body.appendChild(
    backToTop
);


window.addEventListener(
    "scroll",
    () => {

        if (window.scrollY > 500) {

            backToTop.classList.add(
                "show"
            );

        } else {

            backToTop.classList.remove(
                "show"
            );

        }

    }
);


backToTop.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =====================================================
   10. KEYBOARD SHORTCUT
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        /*
         * Press H to go Home
         */

        if (
            event.key.toLowerCase() === "h" &&
            !isTyping()
        ) {

            scrollToSection("home");

        }


        /*
         * Press G to go Games
         */

        if (
            event.key.toLowerCase() === "g" &&
            !isTyping()
        ) {

            scrollToSection("games");

        }


        /*
         * Press B to go Books
         */

        if (
            event.key.toLowerCase() === "b" &&
            !isTyping()
        ) {

            scrollToSection("books");

        }


        /*
         * Press K to go GK
         */

        if (
            event.key.toLowerCase() === "k" &&
            !isTyping()
        ) {

            scrollToSection("gk");

        }

    }
);


/* =====================================================
   11. CHECK IF USER IS TYPING
===================================================== */

function isTyping() {

    const element =
        document.activeElement;


    if (!element) {
        return false;
    }


    const tag =
        element.tagName.toLowerCase();


    return (
        tag === "input" ||
        tag === "textarea" ||
        element.isContentEditable
    );

}


/* =====================================================
   12. PREVENT BROKEN LINKS
===================================================== */

document
.querySelectorAll(
    'a[href="#"]'
)
.forEach((link) => {

    link.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

        }
    );

});


/* =====================================================
   13. PAGE VISIBILITY
===================================================== */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            document.title =
                "Come Back! 🎮 GameBook GK Hub";

        } else {

            document.title =
                "GameBook GK Hub";

        }

    }
);


/* =====================================================
   14. RANDOM BACKGROUND PARTICLES
===================================================== */

const background =
    document.querySelector(
        ".background"
    );


if (background) {

    for (let i = 0; i < 25; i++) {

        const particle =
            document.createElement("span");


        particle.style.left =
            `${Math.random() * 100}%`;


        particle.style.top =
            `${70 + Math.random() * 30}%`;


        particle.style.width =
            `${2 + Math.random() * 4}px`;


        particle.style.height =
            particle.style.width;


        particle.style.animationDuration =
            `${10 + Math.random() * 15}s`;


        particle.style.animationDelay =
            `${Math.random() * 10}s`;


        background.appendChild(
            particle
        );

    }

}


/* =====================================================
   15. CONSOLE MESSAGE
===================================================== */

console.log(
    "%c🎮 GameBook GK Hub",
    "font-size:22px;font-weight:bold;"
);

console.log(
    "Play • Read • Learn • Explore 🚀"
);
