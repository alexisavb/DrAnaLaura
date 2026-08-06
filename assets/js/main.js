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
})();
