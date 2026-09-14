
/* =========================================================
   CUSTOM CURSOR
========================================================= */

const cursor = document.getElementById("cursor");

if (cursor) {
  window.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  document
    .querySelectorAll("a, button, .hero-photo, .frame, .project-card")
    .forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("grow");
      });

      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("grow");
      });
    });
}


/* =========================================================
   SCROLL PROGRESS
========================================================= */

const progress = document.getElementById("progress");

function updateProgress() {
  if (!progress) return;

  const documentHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const scrolled =
    documentHeight > 0
      ? (document.documentElement.scrollTop / documentHeight) * 100
      : 0;

  progress.style.width = `${scrolled}%`;
}

window.addEventListener("scroll", updateProgress);
updateProgress();


/* =========================================================
   REVEAL ON SCROLL
========================================================= */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");

        // Once visible, we don't need to observe it anymore.
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  }
);

function observeReveals(scope = document) {
  if (!scope) return;

  scope
    .querySelectorAll(".reveal, .reveal-clip, .frame")
    .forEach((element) => {
      revealObserver.observe(element);
    });
}


/* =========================================================
   HERO HEADLINE
========================================================= */

function playHeroIntro() {
  const hero = document.getElementById("hero-h1");

  if (!hero) return;

  requestAnimationFrame(() => {
    hero.classList.add("reveal-ready");
  });
}


/* =========================================================
   COUNTERS
========================================================= */

function playCounters(scope = document) {
  if (!scope) return;

  scope.querySelectorAll(".count-up").forEach((element) => {
    if (element.dataset.started === "true") return;

    const target = Number(element.dataset.count);

    if (Number.isNaN(target)) return;

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          element.dataset.started = "true";

          const duration = 1400;
          const startTime = performance.now();

          function animateCounter(currentTime) {
            const progressValue = Math.min(
              (currentTime - startTime) / duration,
              1
            );

            const eased = 1 - Math.pow(1 - progressValue, 3);

            element.textContent = Math.floor(eased * target);

            if (progressValue < 1) {
              requestAnimationFrame(animateCounter);
            } else {
              element.textContent = target;
            }
          }

          requestAnimationFrame(animateCounter);
          observer.disconnect();
        });
      },
      {
        threshold: 0.5,
      }
    );

    counterObserver.observe(element);
  });
}


/* =========================================================
   HERO PHOTO TILT
========================================================= */

const tiltElement = document.getElementById("tilt-photo");

if (tiltElement) {
  tiltElement.addEventListener("mousemove", (e) => {
    const rect = tiltElement.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    tiltElement.style.transform = `
      perspective(800px)
      rotateY(${x * 10}deg)
      rotateX(${-y * 10}deg)
      scale(1.02)
    `;
  });

  tiltElement.addEventListener("mouseleave", () => {
    tiltElement.style.transform =
      "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  });
}


/* =========================================================
   THREE.JS BACKGROUND
========================================================= */

let scene;
let camera;
let renderer;
let points;

function initThree() {
  const canvas = document.getElementById("bg-canvas");

  if (!canvas || typeof THREE === "undefined") {
    return;
  }

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const particleCount = 1400;

  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 5 + Math.random() * 4;

    const theta = Math.random() * Math.PI * 2;

    const phi = Math.acos(Math.random() * 2 - 1);

    positions[i * 3] =
      radius * Math.sin(phi) * Math.cos(theta);

    positions[i * 3 + 1] =
      radius * Math.sin(phi) * Math.sin(theta);

    positions[i * 3 + 2] =
      radius * Math.cos(phi);
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    size: 0.035,
    color: 0xd4a857,
    transparent: true,
    opacity: 0.75,
  });

  points = new THREE.Points(geometry, material);

  scene.add(points);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );
  });

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);

    if (!points) return;

    points.rotation.y += 0.0009;
    points.rotation.x += 0.0002;

    const maxScroll =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const scrollFraction =
      maxScroll > 0
        ? document.documentElement.scrollTop / maxScroll
        : 0;

    camera.position.x +=
      (mouseX * 1.5 - camera.position.x) * 0.03;

    camera.position.y +=
      (-mouseY * 1.5 - camera.position.y) * 0.03;

    camera.rotation.z = scrollFraction * 0.4;

    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
}


/* =========================================================
   CLOCK
========================================================= */

function tickClock() {
  const clock = document.getElementById("clock");

  if (!clock) return;

  const now = new Date();

  clock.textContent =
    "Iran — " +
    now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
}

tickClock();

setInterval(tickClock, 1000);


/* =========================================================
   ROUTER
========================================================= */

const routes = ["home", "work", "frames", "contact"];

function getCurrentRoute() {
  const hash = window.location.hash;

  if (!hash || hash === "#/" || hash === "#") {
    return "home";
  }

  const route = hash.replace(/^#\//, "");

  return routes.includes(route) ? route : "home";
}


function renderRoute(name, push = true) {
  if (!routes.includes(name)) {
    name = "home";
  }

  const wipe = document.getElementById("wipe");

  const changeRoute = () => {
    // Hide all routes
    document.querySelectorAll(".route").forEach((section) => {
      section.classList.toggle(
        "active",
        section.dataset.routeView === name
      );
    });

    // Update navigation
    document
      .querySelectorAll("nav a[data-route]")
      .forEach((link) => {
        link.classList.toggle(
          "active",
          link.dataset.route === name
        );
      });

    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    // Get active section
    const activeSection = document.querySelector(
      ".route.active"
    );

    // Re-run animations
    if (activeSection) {
      observeReveals(activeSection);
      playCounters(activeSection);
    }

    // Hero animation
    if (name === "home") {
      playHeroIntro();
    }
  };


  // If GSAP isn't available, still make routing work
  if (
    !wipe ||
    typeof gsap === "undefined"
  ) {
    changeRoute();

    if (push) {
      history.pushState(
        {},
        "",
        name === "home"
          ? "#/"
          : `#/${name}`
      );
    }

    return;
  }


  gsap.set(wipe, {
    transformOrigin: "bottom",
    scaleY: 0,
  });

  const timeline = gsap.timeline();

  timeline
    .to(wipe, {
      scaleY: 1,
      duration: 0.45,
      ease: "power3.inOut",
    })
    .add(() => {
      changeRoute();
    })
    .set(wipe, {
      transformOrigin: "top",
    })
    .to(wipe, {
      scaleY: 0,
      duration: 0.5,
      ease: "power3.inOut",
    });


  if (push) {
    history.pushState(
      {},
      "",
      name === "home"
        ? "#/"
        : `#/${name}`
    );
  }
}


/* =========================================================
   NAVIGATION EVENTS
========================================================= */

document
  .querySelectorAll("[data-link]")
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      const route = link.dataset.route;

      if (route) {
        event.preventDefault();
        renderRoute(route);
        return;
      }

      if (link.getAttribute("href") === "#/") {
        event.preventDefault();
        renderRoute("home");
      }
    });
  });


/* =========================================================
   BROWSER BACK / FORWARD
========================================================= */

window.addEventListener("popstate", () => {
  renderRoute(getCurrentRoute(), false);
});

window.addEventListener("hashchange", () => {
  const route = getCurrentRoute();

  const activeRoute = document.querySelector(
    ".route.active"
  );

  const activeName =
    activeRoute?.dataset.routeView;

  if (activeName !== route) {
    renderRoute(route, false);
  }
});


/* =========================================================
   IMAGE ERROR HANDLER
   Helps identify broken image paths
========================================================= */

document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", () => {
    console.error(
      "Image could not be loaded:",
      img.src
    );

    img.parentElement?.classList.add(
      "image-error"
    );
  });
});


/* =========================================================
   INITIALIZATION
========================================================= */

window.addEventListener("DOMContentLoaded", () => {
  initThree();

  const initialRoute = getCurrentRoute();

  if (initialRoute === "home") {
    const home = document.querySelector(
      '[data-route-view="home"]'
    );

    if (home) {
      observeReveals(home);
      playCounters(home);
    }

    playHeroIntro();
  } else {
    renderRoute(initialRoute, false);
  }

  updateProgress();
});

