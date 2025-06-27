// Hero Slider Class
// Hero Slider Class
class HeroSlider {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = 6; // Changed from 4 to 6
    this.sliderTrack = document.getElementById("sliderTrack");
    this.indicators = document.querySelectorAll(".indicator");
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.autoSlideInterval = null;

    this.init();
  }

  init() {
    // Add event listeners
    this.prevBtn?.addEventListener("click", () => this.prevSlide());
    this.nextBtn?.addEventListener("click", () => this.nextSlide());

    // Indicator click events
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => this.goToSlide(index));
    });

    // Start auto-slide
    this.startAutoSlide();

    // Pause auto-slide on hover
    const sliderContainer = document.querySelector(".slider-container");
    if (sliderContainer) {
      sliderContainer.addEventListener("mouseenter", () =>
        this.pauseAutoSlide()
      );
      sliderContainer.addEventListener("mouseleave", () =>
        this.startAutoSlide()
      );
      this.addTouchEvents(sliderContainer);
    }
  }

  goToSlide(slideIndex) {
    this.currentSlide = slideIndex;
    const translateX = -slideIndex * 16.666; // Changed from 25% to 16.666% per slide (100% ÷ 6)
    this.sliderTrack.style.transform = `translateX(${translateX}%)`;

    // Update indicators
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
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 6000); // Change slide every 6 seconds
  }

  pauseAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  addTouchEvents(container) {
    let startX = 0;
    let endX = 0;

    container.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    container.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        // Minimum swipe distance
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    });
  }
}

// Touch tracking for mobile navigation
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
    this.startY = e.touches[0].clientY;
    this.startX = e.touches[0].clientX;
    this.startTime = Date.now();
    this.isScrolling = false;
    this.touchMoved = false;
  }

  handleMove(e) {
    if (!this.startY) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = Math.abs(currentY - this.startY);
    const deltaX = Math.abs(currentX - this.startX);

    // If user moved more than 10px in any direction, consider it movement
    if (deltaY > 10 || deltaX > 10) {
      this.touchMoved = true;

      // If vertical movement is greater than horizontal, it's likely scrolling
      if (deltaY > deltaX && deltaY > 15) {
        this.isScrolling = true;
      }
    }
  }

  handleEnd() {
    const touchDuration = Date.now() - this.startTime;

    // Consider it a tap only if:
    // 1. Touch duration is short (< 300ms)
    // 2. No significant movement occurred
    // 3. Not identified as scrolling
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

// Navigation Manager Class
class NavigationManager {
  constructor() {
    this.touchTracker = new TouchTracker();
    this.outsideTouchTracker = new TouchTracker();
    this.itemTouchTracker = new TouchTracker();
    this.navLinkTouchTracker = new TouchTracker();
  }

  initializeDesktopDropdowns() {
    const dropdowns = document.querySelectorAll(".dropdown");

    dropdowns.forEach((dropdown) => {
      const dropdownMenu = dropdown.querySelector(".dropdown-menu");
      const dropdownToggle = dropdown.querySelector(".dropdown-toggle");

      // Hover functionality
      dropdown.addEventListener("mouseenter", () => {
        this.closeAllDropdowns(dropdown);
        dropdownMenu.classList.add("show");
        dropdownMenu.style.display = "block";
      });

      dropdown.addEventListener("mouseleave", () => {
        if (!dropdown.classList.contains("clicked-open")) {
          dropdownMenu.classList.remove("show");
          dropdownMenu.style.display = "none";
        }
      });

      // Click functionality
      dropdownToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyOpen = dropdown.classList.contains("clicked-open");
        this.closeAllDropdowns();

        if (!isCurrentlyOpen) {
          dropdown.classList.add("clicked-open");
          dropdownMenu.classList.add("show");
          dropdownMenu.style.display = "block";
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".dropdown")) {
        this.closeAllDropdowns();
      }
    });
  }

  initializeMobileNavigation() {
    setTimeout(() => {
      this.setupDropdownToggles();
      this.setupDropdownItems();
      this.setupRegularNavLinks();
      this.setupOutsideTouchClose();
      this.setupHamburgerMenu();
    }, 500);
  }

  setupDropdownToggles() {
    const dropdownToggles = document.querySelectorAll(
      ".nav-link.dropdown-toggle"
    );

    dropdownToggles.forEach((toggle) => {
      // Remove existing listeners
      toggle.removeEventListener("click", this.handleDropdownClick);
      toggle.removeEventListener("touchstart", this.handleDropdownTouchStart);
      toggle.removeEventListener("touchmove", this.handleDropdownTouchMove);
      toggle.removeEventListener("touchend", this.handleDropdownTouchEnd);

      // Add new listeners
      toggle.addEventListener(
        "touchstart",
        (e) => this.handleDropdownTouchStart(e),
        { passive: true }
      );
      toggle.addEventListener(
        "touchmove",
        (e) => this.handleDropdownTouchMove(e),
        { passive: true }
      );
      toggle.addEventListener("touchend", (e) =>
        this.handleDropdownTouchEnd(e)
      );
      toggle.addEventListener("click", (e) => this.handleDropdownClick(e));
    });
  }

  setupDropdownItems() {
    const dropdownItems = document.querySelectorAll(".dropdown-item");

    dropdownItems.forEach((item) => {
      item.addEventListener(
        "touchstart",
        (e) => {
          this.itemTouchTracker.handleStart(e);
        },
        { passive: true }
      );

      item.addEventListener(
        "touchmove",
        (e) => {
          this.itemTouchTracker.handleMove(e);
        },
        { passive: true }
      );

      item.addEventListener("touchend", (e) => {
        const touchResult = this.itemTouchTracker.handleEnd();

        if (touchResult.isTap) {
          this.handleNavigation(e.currentTarget, e);
        }
      });

      item.addEventListener("click", (e) => {
        this.handleNavigation(e.currentTarget, e);
      });
    });
  }

  setupRegularNavLinks() {
    const regularNavLinks = document.querySelectorAll(
      ".nav-link:not(.dropdown-toggle)"
    );

    regularNavLinks.forEach((link) => {
      link.addEventListener(
        "touchstart",
        (e) => {
          this.navLinkTouchTracker.handleStart(e);
        },
        { passive: true }
      );

      link.addEventListener(
        "touchmove",
        (e) => {
          this.navLinkTouchTracker.handleMove(e);
        },
        { passive: true }
      );

      link.addEventListener("touchend", (e) => {
        const touchResult = this.navLinkTouchTracker.handleEnd();

        if (touchResult.isTap) {
          this.handleNavigation(e.currentTarget, e);
        }
      });

      link.addEventListener("click", (e) => {
        this.handleNavigation(e.currentTarget, e);
      });
    });
  }

  setupOutsideTouchClose() {
    // Handle touch events for closing menu on outside touch
    document.addEventListener(
      "touchstart",
      (e) => {
        if (window.innerWidth <= 991) {
          this.outsideTouchTracker.handleStart(e);
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (window.innerWidth <= 991) {
          this.outsideTouchTracker.handleMove(e);
        }
      },
      { passive: true }
    );

    document.addEventListener("touchend", (e) => {
      if (window.innerWidth <= 991) {
        const touchResult = this.outsideTouchTracker.handleEnd();

        if (touchResult.isTap && !e.target.closest(".navbar")) {
          this.closeMobileMenu();
        }
      }
    });

    // Fallback click handler
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".navbar")) {
        this.closeMobileMenu();
      }
    });
  }

  setupHamburgerMenu() {
    const hamburgerToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector(".navbar-collapse");

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

  handleDropdownTouchStart = (e) => {
    this.touchTracker.handleStart(e);
  };

  handleDropdownTouchMove = (e) => {
    this.touchTracker.handleMove(e);
  };

  handleDropdownTouchEnd = (e) => {
    const touchResult = this.touchTracker.handleEnd();

    if (touchResult.isTap) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.handleDropdownAction(e.currentTarget);
    }
  };

  handleDropdownClick = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.handleDropdownAction(e.currentTarget);
  };

  handleDropdownAction(toggle) {
    const parentDropdown = toggle.closest(".nav-item.dropdown");
    const targetMenu = parentDropdown?.querySelector(".dropdown-menu");

    if (!targetMenu) return;

    const isCurrentlyOpen = targetMenu.classList.contains("show");

    // Close all dropdowns first
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      menu.classList.remove("show");
    });

    // Open this dropdown if it wasn't open
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
    setTimeout(() => {
      const navbarCollapse = document.querySelector(".navbar-collapse");
      if (!navbarCollapse) return;

      const toggleRect = toggle.getBoundingClientRect();
      const navRect = navbarCollapse.getBoundingClientRect();
      const menuHeight = targetMenu.offsetHeight;

      const togglePosition =
        toggleRect.top - navRect.top + navbarCollapse.scrollTop;
      const availableSpace = navRect.height - (toggleRect.top - navRect.top);

      let scrollTarget;

      if (menuHeight > availableSpace - 50) {
        scrollTarget = togglePosition - (navRect.height - menuHeight - 100);
      } else {
        scrollTarget = togglePosition - 50;
      }

      scrollTarget = Math.max(0, scrollTarget);

      navbarCollapse.scrollTo({
        top: scrollTarget,
        behavior: "smooth",
      });
    }, 100);
  }

  scrollToActiveItem() {
    const navbarCollapse = document.querySelector(".navbar-collapse");
    if (!navbarCollapse) return;

    // Look for active elements in priority order
    const activeDropdownItem = document.querySelector(".dropdown-item.active");
    const activeNavLink = document.querySelector(
      ".nav-link.active:not(.dropdown-toggle)"
    );
    const activeParentDropdown = document.querySelector(
      ".nav-link.dropdown-toggle.active"
    );

    let targetElement = null;

    if (activeDropdownItem) {
      const parentDropdown = activeDropdownItem.closest(".dropdown");
      const parentMenu = parentDropdown?.querySelector(".dropdown-menu");

      if (parentMenu) {
        // Close other dropdowns and open the correct one
        document.querySelectorAll(".dropdown-menu").forEach((menu) => {
          if (menu !== parentMenu) {
            menu.classList.remove("show");
          }
        });
        parentMenu.classList.add("show");
        targetElement = activeDropdownItem;
      }
    } else if (activeNavLink) {
      targetElement = activeNavLink;
    } else if (activeParentDropdown) {
      targetElement = activeParentDropdown;
    }

    if (targetElement) {
      setTimeout(() => {
        try {
          const targetRect = targetElement.getBoundingClientRect();
          const navRect = navbarCollapse.getBoundingClientRect();
          const relativeTop =
            targetRect.top - navRect.top + navbarCollapse.scrollTop;
          const scrollTarget = Math.max(0, relativeTop - 80);

          navbarCollapse.scrollTo({
            top: scrollTarget,
            behavior: "smooth",
          });
        } catch (error) {
          console.error("Scroll error:", error);
        }
      }, 50);
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
    const navbarCollapse = document.querySelector(".navbar-collapse");

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

    // Remove all existing active classes
    navLinks.forEach((link) => link.classList.remove("active"));
    dropdownItems.forEach((item) => item.classList.remove("active"));

    // Set active main nav links (exclude dropdown toggles)
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

    // Set active dropdown items with hash checking
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
        // Both have hash - must match exactly
        isMatch = linkPage === currentPage && linkHash === currentHash;
      } else if (!linkHash && !currentHash) {
        // Neither has hash - match page only
        isMatch =
          linkPage === currentPage && linkPage !== "" && linkPage !== "#";
      } else if (
        linkPage === currentPage &&
        linkPage === "index.html" &&
        !linkHash &&
        !currentHash
      ) {
        // Special case for main index.html page
        isMatch = true;
      }

      if (isMatch) {
        item.classList.add("active");

        // Find and mark parent dropdown as active
        const parentDropdown = item.closest(".dropdown");
        const dropdownToggle = parentDropdown?.querySelector(
          ".nav-link.dropdown-toggle"
        );

        if (dropdownToggle) {
          dropdownToggle.classList.add("active");
        }

        // Auto-open dropdown on mobile if it contains active item
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

// Main initialization
document.addEventListener("DOMContentLoaded", function () {
  const placeholder = document.getElementById("navbar-placeholder");

  // Show loading state
  placeholder.style.minHeight = "100px";
  placeholder.style.backgroundColor = "#f8f9fa";
  placeholder.style.height = placeholder.style.minHeight;

  // Load navbar
  fetch("navbar.html")
    .then((response) => response.text())
    .then((html) => {
      placeholder.innerHTML = html;

      // Add custom hamburger middle line
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

      // Set active links
      navManager.setActiveLinks();
    })
    .catch((error) => {
      console.error("Error loading navbar:", error);
      placeholder.innerHTML =
        '<div style="padding: 1rem; color: #333;">Navigation loading failed</div>';
    });

  // Initialize hero slider if present
  setTimeout(() => {
    if (document.getElementById("sliderTrack")) {
      new HeroSlider();
    }
  }, 100);
});

// Gallery filter functionality
document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const category = this.getAttribute("data-category");

      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Filter gallery items
      galleryItems.forEach((item) => {
        if (
          category === "all" ||
          item.getAttribute("data-category") === category
        ) {
          item.style.display = "block";
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
          }, 10);
        } else {
          item.style.opacity = "0";
          item.style.transform = "scale(0.8)";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });

  // Add transition styles to gallery items
  galleryItems.forEach((item) => {
    item.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  });
});
