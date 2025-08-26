// Optimized script.js - All functionality preserved with performance improvements

// Cache frequently used DOM queries
const DOMCache = {
  navbar: null,
  navbarCollapse: null,
  hamburgerToggler: null,
  sliderTrack: null,

  get(selector) {
    if (!this[selector]) {
      this[selector] = document.querySelector(selector);
    }
    return this[selector];
  },

  refresh() {
    Object.keys(this).forEach((key) => {
      if (key !== "get" && key !== "refresh") {
        this[key] = null;
      }
    });
  },
};

class HeroSlider {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = 6;
    this.sliderTrack = document.getElementById("sliderTrack");
    this.indicators = document.querySelectorAll(".indicator");
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.autoSlideInterval = null;

    // Only initialize if elements exist
    if (this.sliderTrack && this.indicators.length) {
      this.init();
    }
  }

  init() {
    // Use arrow functions to maintain context and avoid binding
    this.prevBtn?.addEventListener("click", () => this.prevSlide());
    this.nextBtn?.addEventListener("click", () => this.nextSlide());

    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => this.goToSlide(index));
    });

    this.startAutoSlide();

    const sliderContainer = document.querySelector(".slider-container");
    if (sliderContainer) {
      // Use passive listeners for better performance
      sliderContainer.addEventListener(
        "mouseenter",
        () => this.pauseAutoSlide(),
        { passive: true }
      );
      sliderContainer.addEventListener(
        "mouseleave",
        () => this.startAutoSlide(),
        { passive: true }
      );
      this.addTouchEvents(sliderContainer);
    }
  }

  goToSlide(slideIndex) {
    this.currentSlide = slideIndex;
    const translateX = -slideIndex * 16.666;

    // Use transform3d for better performance
    this.sliderTrack.style.transform = `translate3d(${translateX}%, 0, 0)`;

    // More efficient indicator updates
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === slideIndex);
    });
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.goToSlide(this.currentSlide);
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(this.currentSlide);
  }

  startAutoSlide() {
    if (this.autoSlideInterval) return; // Prevent multiple intervals

    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  pauseAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  addTouchEvents(container) {
    let startX = 0;

    // Use passive listeners for touch events
    container.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
      },
      { passive: true }
    );

    container.addEventListener(
      "touchend",
      (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.nextSlide();
          } else {
            this.prevSlide();
          }
        }
      },
      { passive: true }
    );
  }
}

class TouchTracker {
  constructor() {
    this.reset();
  }

  reset() {
    this.startY = 0;
    this.startX = 0;
    this.startTime = 0;
    this.isScrolling = false;
    this.touchMoved = false;
  }

  handleStart(e) {
    const touch = e.touches[0];
    this.startY = touch.clientY;
    this.startX = touch.clientX;
    this.startTime = Date.now();
    this.isScrolling = false;
    this.touchMoved = false;
  }

  handleMove(e) {
    if (!this.startY) return;

    const touch = e.touches[0];
    const deltaY = Math.abs(touch.clientY - this.startY);
    const deltaX = Math.abs(touch.clientX - this.startX);

    if (deltaY > 10 || deltaX > 10) {
      this.touchMoved = true;

      if (deltaY > deltaX && deltaY > 15) {
        this.isScrolling = true;
      }
    }
  }

  handleEnd() {
    const touchDuration = Date.now() - this.startTime;
    const isTap = touchDuration < 300 && !this.touchMoved && !this.isScrolling;

    const result = {
      isTap,
      isScrolling: this.isScrolling,
      touchMoved: this.touchMoved,
      duration: touchDuration,
    };

    this.reset();
    return result;
  }
}

class NavigationManager {
  constructor() {
    this.touchTracker = new TouchTracker();
    this.outsideTouchTracker = new TouchTracker();
    this.itemTouchTracker = new TouchTracker();
    this.navLinkTouchTracker = new TouchTracker();

    // Bind methods to maintain context
    this.handleDropdownTouchStart = this.handleDropdownTouchStart.bind(this);
    this.handleDropdownTouchMove = this.handleDropdownTouchMove.bind(this);
    this.handleDropdownTouchEnd = this.handleDropdownTouchEnd.bind(this);
    this.handleDropdownClick = this.handleDropdownClick.bind(this);
  }

  initializeDesktopDropdowns() {
    const dropdowns = document.querySelectorAll(".dropdown");

    dropdowns.forEach((dropdown) => {
      const dropdownMenu = dropdown.querySelector(".dropdown-menu");

      if (!dropdownMenu) return;

      // Use passive listeners where possible
      dropdown.addEventListener(
        "mouseenter",
        () => {
          this.closeAllDropdowns(dropdown);
          dropdownMenu.classList.add("show");
          dropdownMenu.style.display = "block";
        },
        { passive: true }
      );

      dropdown.addEventListener(
        "mouseleave",
        () => {
          dropdownMenu.classList.remove("show");
          dropdownMenu.style.display = "none";
        },
        { passive: true }
      );
    });
  }

  initializeMobileNavigation() {
    this.setupMobileDropdownHandlers();
    this.setupNavLinkHandlers();
    this.setupHamburgerMenu();
    this.setupOutsideClickHandler();
  }

  setupMobileDropdownHandlers() {
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    dropdownToggles.forEach((toggle) => {
      // Touch events
      toggle.addEventListener("touchstart", this.handleDropdownTouchStart, {
        passive: true,
      });
      toggle.addEventListener("touchmove", this.handleDropdownTouchMove, {
        passive: true,
      });
      toggle.addEventListener("touchend", this.handleDropdownTouchEnd);

      // Click events (for mouse/keyboard)
      toggle.addEventListener("click", this.handleDropdownClick);
    });
  }

  setupNavLinkHandlers() {
    // Use event delegation for better performance
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    navbar.addEventListener("click", (e) => {
      const navLink = e.target.closest(".nav-link:not(.dropdown-toggle)");
      const dropdownItem = e.target.closest(".dropdown-item");

      if (navLink) {
        this.handleNavigation(navLink, e);
      } else if (dropdownItem) {
        this.handleNavigation(dropdownItem, e);
      }
    });

    // Touch events with delegation
    navbar.addEventListener(
      "touchstart",
      (e) => {
        const navLink = e.target.closest(".nav-link:not(.dropdown-toggle)");
        const dropdownItem = e.target.closest(".dropdown-item");

        if (navLink) {
          this.navLinkTouchTracker.handleStart(e);
        } else if (dropdownItem) {
          this.itemTouchTracker.handleStart(e);
        }
      },
      { passive: true }
    );

    navbar.addEventListener(
      "touchmove",
      (e) => {
        const navLink = e.target.closest(".nav-link:not(.dropdown-toggle)");
        const dropdownItem = e.target.closest(".dropdown-item");

        if (navLink) {
          this.navLinkTouchTracker.handleMove(e);
        } else if (dropdownItem) {
          this.itemTouchTracker.handleMove(e);
        }
      },
      { passive: true }
    );

    navbar.addEventListener("touchend", (e) => {
      const navLink = e.target.closest(".nav-link:not(.dropdown-toggle)");
      const dropdownItem = e.target.closest(".dropdown-item");

      if (navLink) {
        const result = this.navLinkTouchTracker.handleEnd();
        if (result.isTap) {
          e.preventDefault();
          this.handleNavigation(navLink, e);
        }
      } else if (dropdownItem) {
        const result = this.itemTouchTracker.handleEnd();
        if (result.isTap) {
          e.preventDefault();
          this.handleNavigation(dropdownItem, e);
        }
      }
    });
  }

  setupOutsideClickHandler() {
    document.addEventListener(
      "touchstart",
      (e) => {
        if (!e.target.closest(".navbar")) {
          this.outsideTouchTracker.handleStart(e);
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (!e.target.closest(".navbar")) {
          this.outsideTouchTracker.handleMove(e);
        }
      },
      { passive: true }
    );

    document.addEventListener("touchend", (e) => {
      if (!e.target.closest(".navbar")) {
        const result = this.outsideTouchTracker.handleEnd();
        if (result.isTap) {
          this.closeMobileMenu();
        }
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".navbar")) {
        this.closeMobileMenu();
      }
    });
  }

  setupHamburgerMenu() {
    const hamburgerToggler = DOMCache.get(".navbar-toggler");
    const navbarCollapse = DOMCache.get(".navbar-collapse");

    if (hamburgerToggler && navbarCollapse) {
      hamburgerToggler.addEventListener("click", () => {
        setTimeout(() => {
          if (navbarCollapse.classList.contains("show")) {
            this.scrollToActiveItem();
          }
        }, 50);
      });

      navbarCollapse.addEventListener("shown.bs.collapse", () => {
        this.scrollToActiveItem();
      });
    }
  }

  handleDropdownTouchStart(e) {
    this.touchTracker.handleStart(e);
  }

  handleDropdownTouchMove(e) {
    this.touchTracker.handleMove(e);
  }

  handleDropdownTouchEnd(e) {
    const touchResult = this.touchTracker.handleEnd();

    if (touchResult.isTap) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.handleDropdownAction(e.currentTarget);
    }
  }

  handleDropdownClick(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.handleDropdownAction(e.currentTarget);
  }

  handleDropdownAction(toggle) {
    const parentDropdown = toggle.closest(".nav-item.dropdown");
    const targetMenu = parentDropdown?.querySelector(".dropdown-menu");

    if (!targetMenu) return;

    const isCurrentlyOpen = targetMenu.classList.contains("show");

    // Close all dropdowns first
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      menu.classList.remove("show");
    });

    if (!isCurrentlyOpen) {
      targetMenu.classList.add("show");
      this.scrollDropdownIntoView(toggle, targetMenu);
    }
  }

  handleNavigation(element, event) {
    const href = element.getAttribute("href");

    if (href && href !== "#" && href.trim() !== "") {
      event.preventDefault();
      event.stopPropagation();

      this.closeMobileMenu();

      setTimeout(() => {
        window.location.href = href;
      }, 150);
    }
  }

  scrollDropdownIntoView(toggle, targetMenu) {
    const navbarCollapse = DOMCache.get(".navbar-collapse");

    if (!navbarCollapse) return;

    try {
      setTimeout(() => {
        const navRect = navbarCollapse.getBoundingClientRect();
        const targetRect = targetMenu.getBoundingClientRect();
        const relativeTop =
          targetRect.top - navRect.top + navbarCollapse.scrollTop;
        const scrollTarget = Math.max(0, relativeTop - 80);

        navbarCollapse.scrollTo({
          top: scrollTarget,
          behavior: "smooth",
        });
      }, 50);
    } catch (error) {
      console.error("Scroll error:", error);
    }
  }

  scrollToActiveItem() {
    const navbarCollapse = DOMCache.get(".navbar-collapse");
    const activeItem = document.querySelector(".navbar-nav .nav-item .active");

    if (!navbarCollapse || !activeItem) return;

    try {
      setTimeout(() => {
        const navRect = navbarCollapse.getBoundingClientRect();
        const targetRect = activeItem.getBoundingClientRect();
        const relativeTop =
          targetRect.top - navRect.top + navbarCollapse.scrollTop;
        const scrollTarget = Math.max(0, relativeTop - 80);

        navbarCollapse.scrollTo({
          top: scrollTarget,
          behavior: "smooth",
        });
      }, 50);
    } catch (error) {
      console.error("Scroll error:", error);
    }
  }

  closeAllDropdowns(except = null) {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      if (dropdown !== except) {
        dropdown.classList.remove("clicked-open");
        const menu = dropdown.querySelector(".dropdown-menu");
        if (menu) {
          menu.classList.remove("show");
          menu.style.display = "none";
        }
      }
    });
  }

  closeMobileMenu() {
    const navbarCollapse = DOMCache.get(".navbar-collapse");

    if (navbarCollapse && navbarCollapse.classList.contains("show")) {
      navbarCollapse.classList.remove("show");
    }

    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      menu.classList.remove("show");
    });
  }

  setActiveLinks() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const currentHash = window.location.hash;
    const navLinks = document.querySelectorAll(".nav-link");
    const dropdownItems = document.querySelectorAll(".dropdown-item");

    // Clear all active states first
    [...navLinks, ...dropdownItems].forEach((link) =>
      link.classList.remove("active")
    );

    // Set active nav links
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isDropdownToggle = link.classList.contains("dropdown-toggle");

      if (href && !isDropdownToggle) {
        const linkPage = href.split("/").pop().split("#")[0];
        if (linkPage === currentPage) {
          link.classList.add("active");
        }
      }
    });

    // Set active dropdown items
    dropdownItems.forEach((item) => {
      const href = item.getAttribute("href");
      if (!href) return;

      const fullHref = href.split("/").pop();
      const linkPage = fullHref.split("#")[0];
      const linkHash = fullHref.includes("#")
        ? "#" + fullHref.split("#")[1]
        : "";

      let isMatch = false;

      if (linkHash && currentHash) {
        isMatch = linkPage === currentPage && linkHash === currentHash;
      } else if (!linkHash && !currentHash) {
        isMatch =
          linkPage === currentPage && linkPage !== "" && linkPage !== "#";
      } else if (
        linkPage === currentPage &&
        linkPage === "index.html" &&
        !linkHash &&
        !currentHash
      ) {
        isMatch = true;
      }

      if (isMatch) {
        item.classList.add("active");
        const parentDropdown = item.closest(".dropdown");
        const dropdownToggle = parentDropdown?.querySelector(
          ".nav-link.dropdown-toggle"
        );

        if (dropdownToggle) {
          dropdownToggle.classList.add("active");
        }

        // Show dropdown in mobile view
        if (window.innerWidth <= 991) {
          const dropdownMenu = parentDropdown?.querySelector(".dropdown-menu");
          if (dropdownMenu) {
            dropdownMenu.classList.add("show");
          }
        }
      }
    });
  }
}

// Optimized initialization functions
function initializeNavbar() {
  const placeholder = document.getElementById("navbar-placeholder");
  if (!placeholder) return;

  // Set initial styles
  Object.assign(placeholder.style, {
    minHeight: "100px",
    backgroundColor: "#f8f9fa",
    height: "100px",
  });

  fetch("navbar.html")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((html) => {
      placeholder.innerHTML = html;

      // Refresh DOM cache after navbar is loaded
      DOMCache.refresh();

      // Add hamburger middle line
      const hamburgerButton = document.querySelector(".navbar-toggler");
      if (hamburgerButton) {
        const middleLine = document.createElement("span");
        middleLine.className = "hamburger-middle";
        hamburgerButton.appendChild(middleLine);
      }

      // Initialize navigation
      const navManager = new NavigationManager();

      if (window.innerWidth >= 992) {
        navManager.initializeDesktopDropdowns();
      } else {
        navManager.initializeMobileNavigation();
      }
      navManager.setActiveLinks();
    })
    .catch((error) => {
      console.error("Error loading navbar:", error);
      placeholder.innerHTML =
        '<div style="padding: 1rem; color: #333;">Navigation loading failed</div>';
    });
}

function initializeSlider() {
  // Check if slider exists before initializing
  const sliderTrack = document.getElementById("sliderTrack");
  if (sliderTrack) {
    new HeroSlider();
  }
}

function initializeGallery() {
  const filterButtons = document.querySelectorAll(".gallery-filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (!filterButtons.length || !galleryItems.length) {
    return; // Gallery elements not found, skip initialization
  }

  // Use event delegation for filter buttons
  const filterContainer =
    document.querySelector(".gallery-filters") || document.body;

  filterContainer.addEventListener("click", (e) => {
    const button = e.target.closest(".gallery-filter-btn");
    if (!button) return;

    const category = button.getAttribute("data-category");

    // Update active button
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // Filter items using optimized approach
    galleryItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");
      const shouldShow = category === "all" || itemCategory === category;

      if (shouldShow) {
        item.classList.remove("fade-out", "hidden");
        item.classList.add("fade-in");
      } else {
        item.classList.remove("fade-in");
        item.classList.add("fade-out");

        // Use more efficient event handling
        const hideItem = () => {
          if (item.classList.contains("fade-out")) {
            item.classList.add("hidden");
          }
          item.removeEventListener("transitionend", hideItem);
        };
        item.addEventListener("transitionend", hideItem, { once: true });
      }
    });
  });
}

// Check if DOM is already loaded (for dynamic script loading)
function initializeApp() {
  try {
    initializeNavbar();

    // Use requestAnimationFrame for non-critical initialization
    requestAnimationFrame(() => {
      initializeSlider();
      initializeGallery();
    });
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

// Smart initialization - handle both scenarios
if (document.readyState === "loading") {
  // DOM is still loading, wait for DOMContentLoaded
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  // DOM is already loaded, initialize immediately
  initializeApp();
}

// Cleanup on page unload to prevent memory leaks
window.addEventListener("beforeunload", () => {
  DOMCache.refresh();
});
