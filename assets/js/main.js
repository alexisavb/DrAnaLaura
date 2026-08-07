(function () {
	"use strict";
	var drawer = document.getElementById("nav-drawer");
	var check = document.getElementById("nav-check");
	var nav = document.getElementById("primary-nav");
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
	var animated = document.querySelectorAll(".hero, .section");
	if (animated.length && "IntersectionObserver" in window) {
		var pauser = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
			});
		});
		animated.forEach(function (el) { pauser.observe(el); });
	}
	document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
		var track = gallery.querySelector(".gallery-track");
		var viewport = gallery.querySelector(".gallery-viewport");
		var prev = gallery.querySelector(".gallery-prev");
		var next = gallery.querySelector(".gallery-next");
		if (!track || !track.children.length || !prev || !next) return;
		gallery.setAttribute("data-gallery-ready", "");
		var moving = false;
		function step() {
			var first = track.children[0];
			var second = track.children[1];
			if (!second) return first.getBoundingClientRect().width;
			return second.getBoundingClientRect().left - first.getBoundingClientRect().left;
		}
		function resetScroll() {
			if (viewport && viewport.scrollLeft) viewport.scrollLeft = 0;
		}
		function settle(fn) {
			track.style.transition = "none";
			fn();
			track.style.transform = "";
			resetScroll();
			void track.offsetWidth;
			track.style.transition = "";
			moving = false;
		}
		function slide(dir) {
			if (moving || track.children.length < 2) return;
			moving = true;
			track.querySelectorAll("video").forEach(function (v) { v.pause(); });
			var distance = step();
			if (dir > 0) {
				track.style.transition = "transform 0.45s ease";
				track.style.transform = "translateX(" + -distance + "px)";
				window.setTimeout(function () {
					settle(function () { track.appendChild(track.children[0]); });
				}, 450);
			} else {
				track.style.transition = "none";
				track.insertBefore(track.children[track.children.length - 1], track.children[0]);
				track.style.transform = "translateX(" + -distance + "px)";
				resetScroll();
				void track.offsetWidth;
				track.style.transition = "transform 0.45s ease";
				track.style.transform = "";
				window.setTimeout(function () { moving = false; }, 450);
			}
		}
		next.addEventListener("click", function () { slide(1); resetAutoplay(); });
		prev.addEventListener("click", function () { slide(-1); resetAutoplay(); });
		gallery.addEventListener("keydown", function (event) {
			if (event.key === "ArrowRight") { slide(1); resetAutoplay(); }
			else if (event.key === "ArrowLeft") { slide(-1); resetAutoplay(); }
		});
		var AUTOPLAY_MS = 7000;
		var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		var autoplayTimer = null;
		function startAutoplay() {
			if (autoplayTimer || reduceMotion) return;
			autoplayTimer = window.setInterval(function () { slide(1); }, AUTOPLAY_MS);
		}
		function stopAutoplay() {
			window.clearInterval(autoplayTimer);
			autoplayTimer = null;
		}
		function resetAutoplay() {
			if (!autoplayTimer) return;
			stopAutoplay();
			startAutoplay();
		}
		if (!reduceMotion) {
			gallery.addEventListener("mouseenter", stopAutoplay);
			gallery.addEventListener("mouseleave", startAutoplay);
			gallery.addEventListener("focusin", stopAutoplay);
			gallery.addEventListener("focusout", startAutoplay);
			if ("IntersectionObserver" in window) {
				new IntersectionObserver(function (entries) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) startAutoplay();
						else stopAutoplay();
					});
				}).observe(gallery);
			} else {
				startAutoplay();
			}
		}
	});
})();
