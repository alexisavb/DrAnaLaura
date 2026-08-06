(function () {
	"use strict";

	var drawer = document.getElementById("nav-drawer");
	var check = document.getElementById("nav-check");
	var nav = document.getElementById("primary-nav");

	// Close the mobile nav drawer after choosing a link, on outside click, or Escape.
	if (drawer && check && nav) {
		nav.addEventListener("click", function (event) {
			if (event.target.closest("a")) check.checked = false;
		});

		document.addEventListener("click", function (event) {
			if (check.checked && !drawer.contains(event.target)) {
				check.checked = false;
			}
		});

		document.addEventListener("keydown", function (event) {
			if (event.key === "Escape" && check.checked) {
				check.checked = false;
				check.focus();
			}
		});
	}

	// Highlight the nav link matching the section currently in view.
	var sections = document.querySelectorAll("main [id]");
	var navLinks = nav ? nav.querySelectorAll("a[href^='#']") : [];

	if (sections.length && navLinks.length && "IntersectionObserver" in window) {
		var linkFor = {};
		navLinks.forEach(function (link) {
			linkFor[link.getAttribute("href").slice(1)] = link;
		});

		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					var link = linkFor[entry.target.id];
					if (!link) return;
					if (entry.isIntersecting) {
						navLinks.forEach(function (l) { l.classList.remove("active"); });
						link.classList.add("active");
					}
				});
			},
			{ rootMargin: "-45% 0px -50% 0px" }
		);

		sections.forEach(function (section) {
			if (linkFor[section.id]) observer.observe(section);
		});
	}

	// Pause each section's decorative animation (dandelion, drifting seeds)
	// while that section is scrolled out of view.
	var animated = document.querySelectorAll(".hero, .section");

	if (animated.length && "IntersectionObserver" in window) {
		var pauser = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
			});
		});

		animated.forEach(function (el) { pauser.observe(el); });
	}

	// Infinite gallery carousel.
	//
	// No clones and no index bookkeeping: to advance, the track slides one slot
	// and then its first item is moved to the end while the transition is off.
	// The result is that there is never a first or last slide to run into, so
	// the loop works in both directions no matter how many items there are.
	document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
		var track = gallery.querySelector(".gallery-track");
		var prev = gallery.querySelector(".gallery-prev");
		var next = gallery.querySelector(".gallery-next");

		if (!track || !track.children.length || !prev || !next) return;

		// Marca de mejora progresiva: hasta aquí el carrusel ya es operable, así
		// que el CSS puede mostrar las flechas. Sin JS el track queda como una
		// tira desplazable y las flechas no aparecen.
		gallery.setAttribute("data-gallery-ready", "");

		var moving = false;

		function step() {
			var first = track.children[0];
			// The gap counts too, so measure to the next item's edge.
			var second = track.children[1];
			if (!second) return first.getBoundingClientRect().width;
			return second.getBoundingClientRect().left - first.getBoundingClientRect().left;
		}

		function settle(fn) {
			track.style.transition = "none";
			fn();
			track.style.transform = "";
			// Force a reflow so the next transition starts from this state
			// instead of being collapsed into it.
			void track.offsetWidth;
			track.style.transition = "";
			moving = false;
		}

		function slide(dir) {
			if (moving || track.children.length < 2) return;
			moving = true;

			// A playing video would keep going off-screen otherwise.
			track.querySelectorAll("video").forEach(function (v) { v.pause(); });

			var distance = step();

			if (dir > 0) {
				track.style.transition = "transform 0.45s ease";
				track.style.transform = "translateX(" + -distance + "px)";
				window.setTimeout(function () {
					settle(function () { track.appendChild(track.children[0]); });
				}, 450);
			} else {
				// Going back: put the last item in front first, jump there
				// without animating, then slide into place.
				track.style.transition = "none";
				track.insertBefore(track.children[track.children.length - 1], track.children[0]);
				track.style.transform = "translateX(" + -distance + "px)";
				void track.offsetWidth;
				track.style.transition = "transform 0.45s ease";
				track.style.transform = "";
				window.setTimeout(function () { moving = false; }, 450);
			}
		}

		next.addEventListener("click", function () { slide(1); });
		prev.addEventListener("click", function () { slide(-1); });

		gallery.addEventListener("keydown", function (event) {
			if (event.key === "ArrowRight") { slide(1); }
			else if (event.key === "ArrowLeft") { slide(-1); }
		});
	});
})();
