// Photo gallery modal functionality
function initializePhotoGallery() {
  const photoModal = document.getElementById("photoModal");
  if (photoModal) {
    const modalImage = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");

    photoModal.addEventListener("show.bs.modal", function (event) {
      const trigger = event.relatedTarget;
      const imageSrc = trigger.getAttribute("data-image");
      const imageTitle = trigger.getAttribute("data-title");

      if (modalImage && modalTitle) {
        modalImage.src = imageSrc;
        modalImage.alt = imageTitle;
        modalTitle.textContent = imageTitle;
      }
    });
  }
}

// Hero Slider Class
class HeroSlider {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = 5;
    this.sliderTrack = document.getElementById("sliderTrack");
    this.indicators = document.querySelectorAll(".indicator");
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.autoSlideInterval = null;

    this.init();
  }

  init() {
    // Add event listeners
    this.prevBtn.addEventListener("click", () => this.prevSlide());
    this.nextBtn.addEventListener("click", () => this.nextSlide());

    // Indicator click events
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => this.goToSlide(index));
    });

    // Start auto-slide
    this.startAutoSlide();

    // Pause auto-slide on hover
    const sliderContainer = document.querySelector(".slider-container");
    sliderContainer.addEventListener("mouseenter", () => this.pauseAutoSlide());
    sliderContainer.addEventListener("mouseleave", () => this.startAutoSlide());

    // Touch events for mobile
    this.addTouchEvents();
  }

  goToSlide(slideIndex) {
    this.currentSlide = slideIndex;
    const translateX = -slideIndex * 20; // 20% per slide
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

  addTouchEvents() {
    let startX = 0;
    let endX = 0;

    const sliderContainer = document.querySelector(".slider-container");

    sliderContainer.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    sliderContainer.addEventListener("touchend", (e) => {
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
    this.startY = 0;
    this.startX = 0;
    this.startTime = 0;
    this.isScrolling = false;
    this.touchMoved = false;
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

    // If user moved more than 10px in any direction, consider it scrolling/movement
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

document.addEventListener("DOMContentLoaded", function () {
  const placeholder = document.getElementById("navbar-placeholder");

  // Show loading state with proper height for mobile
  placeholder.style.minHeight = "100px";
  placeholder.style.backgroundColor = "#f8f9fa"; // Light gray background
  placeholder.style.height = placeholder.style.minHeight;

  // Load navbar
  fetch("navbar.html")
    .then((response) => response.text())
    .then((html) => {
      placeholder.innerHTML = html;

      // Add custom hamburger middle line for Kenya flag colors
      const hamburgerButton = document.querySelector(".navbar-toggler");
      if (hamburgerButton) {
        // Create middle white line
        const middleLine = document.createElement("span");
        middleLine.className = "hamburger-middle";
        hamburgerButton.appendChild(middleLine);
      }

      // Initialize dropdown behavior for desktop
      if (window.innerWidth >= 992) {
        const dropdowns = document.querySelectorAll(".dropdown");
        dropdowns.forEach((dropdown) => {
          const dropdownMenu = dropdown.querySelector(".dropdown-menu");
          const dropdownToggle = dropdown.querySelector(".dropdown-toggle");

          // Hover functionality
          dropdown.addEventListener("mouseenter", () => {
            // Close all other dropdowns first on hover
            document.querySelectorAll(".dropdown").forEach((otherDropdown) => {
              if (otherDropdown !== dropdown) {
                otherDropdown.classList.remove("clicked-open");
                const otherMenu = otherDropdown.querySelector(".dropdown-menu");
                if (otherMenu) {
                  otherMenu.classList.remove("show");
                  otherMenu.style.display = "none";
                }
              }
            });

            dropdownMenu.classList.add("show");
            dropdownMenu.style.display = "block";
          });

          dropdown.addEventListener("mouseleave", () => {
            // Only close on mouse leave if not clicked open
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

            // Close ALL dropdowns first
            document.querySelectorAll(".dropdown").forEach((otherDropdown) => {
              otherDropdown.classList.remove("clicked-open");
              const otherMenu = otherDropdown.querySelector(".dropdown-menu");
              if (otherMenu) {
                otherMenu.classList.remove("show");
                otherMenu.style.display = "none";
              }
            });

            // If this dropdown wasn't open, open it
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
            document.querySelectorAll(".dropdown").forEach((dropdown) => {
              dropdown.classList.remove("clicked-open");
              const menu = dropdown.querySelector(".dropdown-menu");
              if (menu) {
                menu.classList.remove("show");
                menu.style.display = "none";
              }
            });
          }
        });
      } else {
        // Mobile dropdown functionality - ENHANCED WITH TOUCH TRACKING

        // Initialize touch tracker
        const touchTracker = new TouchTracker();

        // Wait for DOM to be fully ready
        setTimeout(() => {
          // Handle dropdown toggle clicks with touch tracking
          const dropdownToggles = document.querySelectorAll(
            ".nav-link.dropdown-toggle"
          );

          dropdownToggles.forEach(function (toggle) {
            // Remove any existing listeners
            toggle.removeEventListener("click", handleDropdownClick);
            toggle.removeEventListener("touchstart", handleDropdownTouchStart);
            toggle.removeEventListener("touchmove", handleDropdownTouchMove);
            toggle.removeEventListener("touchend", handleDropdownTouchEnd);

            // Add new listeners with touch tracking
            toggle.addEventListener("touchstart", handleDropdownTouchStart, {
              passive: true,
            });
            toggle.addEventListener("touchmove", handleDropdownTouchMove, {
              passive: true,
            });
            toggle.addEventListener("touchend", handleDropdownTouchEnd);
            toggle.addEventListener("click", handleDropdownClick);
          });

          function handleDropdownTouchStart(e) {
            touchTracker.handleStart(e);
          }

          function handleDropdownTouchMove(e) {
            touchTracker.handleMove(e);
          }

          function handleDropdownTouchEnd(e) {
            const touchResult = touchTracker.handleEnd();

            // Only proceed with dropdown action if it was a clear tap
            if (touchResult.isTap) {
              e.preventDefault();
              e.stopImmediatePropagation();
              handleDropdownAction(e.currentTarget);
            }
          }

          function handleDropdownClick(e) {
            // For mouse clicks or as fallback
            e.preventDefault();
            e.stopImmediatePropagation();
            handleDropdownAction(e.currentTarget);
          }

          function handleDropdownAction(toggle) {
            const parentDropdown = toggle.closest(".nav-item.dropdown");
            const targetMenu = parentDropdown
              ? parentDropdown.querySelector(".dropdown-menu")
              : null;

            if (!targetMenu) {
              return;
            }

            const isCurrentlyOpen = targetMenu.classList.contains("show");

            // Close ALL dropdowns first
            document
              .querySelectorAll(".dropdown-menu")
              .forEach(function (menu) {
                menu.classList.remove("show");
              });

            // If this one wasn't open, open it
            if (!isCurrentlyOpen) {
              targetMenu.classList.add("show");

              // Scroll the clicked dropdown into view with smart positioning
              setTimeout(() => {
                const navbarCollapse =
                  document.querySelector(".navbar-collapse");
                if (navbarCollapse) {
                  const toggleRect = toggle.getBoundingClientRect();
                  const navRect = navbarCollapse.getBoundingClientRect();
                  const menuHeight = targetMenu.offsetHeight;

                  // Calculate if dropdown content would go below visible area
                  const togglePosition =
                    toggleRect.top - navRect.top + navbarCollapse.scrollTop;
                  const availableSpace =
                    navRect.height - (toggleRect.top - navRect.top);

                  let scrollTarget;

                  if (menuHeight > availableSpace - 50) {
                    // If dropdown is too big for remaining space, scroll to show dropdown content
                    scrollTarget =
                      togglePosition - (navRect.height - menuHeight - 100);
                  } else {
                    // Otherwise, just scroll to show the toggle nicely
                    scrollTarget = togglePosition - 50;
                  }

                  // Ensure we don't scroll past the beginning
                  scrollTarget = Math.max(0, scrollTarget);

                  navbarCollapse.scrollTo({
                    top: scrollTarget,
                    behavior: "smooth",
                  });
                }
              }, 100);
            }
          }

          // Handle dropdown item clicks with touch tracking
          const dropdownItems = document.querySelectorAll(".dropdown-item");
          const itemTouchTracker = new TouchTracker();

          dropdownItems.forEach(function (item) {
            // Add touch tracking for dropdown items
            item.addEventListener(
              "touchstart",
              function (e) {
                itemTouchTracker.handleStart(e);
              },
              { passive: true }
            );

            item.addEventListener(
              "touchmove",
              function (e) {
                itemTouchTracker.handleMove(e);
              },
              { passive: true }
            );

            item.addEventListener("touchend", function (e) {
              const touchResult = itemTouchTracker.handleEnd();

              // Only navigate if it was a clear tap
              if (touchResult.isTap) {
                e.preventDefault();
                e.stopPropagation();

                const href = this.getAttribute("href");

                if (href && href !== "#" && href.trim() !== "") {
                  // Close the mobile menu first
                  const navbarCollapse =
                    document.querySelector(".navbar-collapse");
                  if (navbarCollapse) {
                    navbarCollapse.classList.remove("show");
                  }

                  // Navigate after a short delay
                  setTimeout(function () {
                    window.location.href = href;
                  }, 150);
                }
              }
            });

            // Fallback click handler
            item.addEventListener("click", function (e) {
              e.preventDefault();
              e.stopPropagation();

              const href = this.getAttribute("href");

              if (href && href !== "#" && href.trim() !== "") {
                // Close the mobile menu first
                const navbarCollapse =
                  document.querySelector(".navbar-collapse");
                if (navbarCollapse) {
                  navbarCollapse.classList.remove("show");
                }

                // Navigate after a short delay
                setTimeout(function () {
                  window.location.href = href;
                }, 150);
              }
            });
          });

          // Handle regular nav-link clicks (non-dropdown) with touch tracking
          const regularNavLinks = document.querySelectorAll(
            ".nav-link:not(.dropdown-toggle)"
          );
          const navLinkTouchTracker = new TouchTracker();

          regularNavLinks.forEach(function (link) {
            // Add touch tracking for regular nav links
            link.addEventListener(
              "touchstart",
              function (e) {
                navLinkTouchTracker.handleStart(e);
              },
              { passive: true }
            );

            link.addEventListener(
              "touchmove",
              function (e) {
                navLinkTouchTracker.handleMove(e);
              },
              { passive: true }
            );

            link.addEventListener("touchend", function (e) {
              const touchResult = navLinkTouchTracker.handleEnd();

              // Only navigate if it was a clear tap
              if (touchResult.isTap) {
                const href = this.getAttribute("href");

                if (href && href !== "#" && href.trim() !== "") {
                  e.preventDefault();

                  // Close the mobile menu
                  const navbarCollapse =
                    document.querySelector(".navbar-collapse");
                  if (navbarCollapse) {
                    navbarCollapse.classList.remove("show");
                  }

                  // Navigate
                  setTimeout(function () {
                    window.location.href = href;
                  }, 150);
                }
              }
            });

            // Fallback click handler
            link.addEventListener("click", function (e) {
              const href = this.getAttribute("href");

              if (href && href !== "#" && href.trim() !== "") {
                e.preventDefault();

                // Close the mobile menu
                const navbarCollapse =
                  document.querySelector(".navbar-collapse");
                if (navbarCollapse) {
                  navbarCollapse.classList.remove("show");
                }

                // Navigate
                setTimeout(function () {
                  window.location.href = href;
                }, 150);
              }
            });
          });
        }, 500);

        // Handle hamburger menu opening
        const hamburgerToggler = document.querySelector(".navbar-toggler");
        const navbarCollapse = document.querySelector(".navbar-collapse");

        if (hamburgerToggler && navbarCollapse) {
          // Listen for hamburger click
          hamburgerToggler.addEventListener("click", function () {
            setTimeout(() => {
              if (navbarCollapse.classList.contains("show")) {
                scrollToActiveItemFast();
              }
            }, 50);
          });

          // Also listen for Bootstrap's collapse event as backup
          navbarCollapse.addEventListener("shown.bs.collapse", function () {
            scrollToActiveItemFast();
          });
        }

        // Function to scroll to active nav item
        function scrollToActiveItemFast() {
          // Look for active elements
          const activeDropdownItem = document.querySelector(
            ".dropdown-item.active"
          );
          const activeNavLink = document.querySelector(
            ".nav-link.active:not(.dropdown-toggle)"
          );
          const activeParentDropdown = document.querySelector(
            ".nav-link.dropdown-toggle.active"
          );

          let targetElement = null;

          // Priority 1: Active dropdown item
          if (activeDropdownItem) {
            const parentDropdown = activeDropdownItem.closest(".dropdown");
            if (parentDropdown) {
              const parentMenu = parentDropdown.querySelector(".dropdown-menu");

              if (parentMenu) {
                // Close other dropdowns and open the correct one
                document
                  .querySelectorAll(".dropdown-menu")
                  .forEach(function (menu) {
                    if (menu !== parentMenu) {
                      menu.classList.remove("show");
                    }
                  });
                parentMenu.classList.add("show");
                targetElement = activeDropdownItem;
              }
            }
          }
          // Priority 2: Active nav link
          else if (activeNavLink) {
            targetElement = activeNavLink;
          }
          // Priority 3: Active parent dropdown toggle
          else if (activeParentDropdown) {
            targetElement = activeParentDropdown;
          }

          // Scroll to the target element
          if (targetElement && navbarCollapse) {
            setTimeout(() => {
              try {
                const targetRect = targetElement.getBoundingClientRect();
                const navRect = navbarCollapse.getBoundingClientRect();
                const relativeTop =
                  targetRect.top - navRect.top + navbarCollapse.scrollTop;

                // Position the active item near the top
                const scrollTarget = Math.max(0, relativeTop - 80);

                // Smooth scroll
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

        // Close dropdowns when clicking outside
        document.addEventListener("click", function (e) {
          if (!e.target.closest(".navbar")) {
            document
              .querySelectorAll(".dropdown-menu")
              .forEach(function (menu) {
                menu.classList.remove("show");
              });
          }
        });
      }

      // Set active link based on current page
      const currentPage =
        window.location.pathname.split("/").pop() || "index.html";
      const currentHash = window.location.hash;
      const navLinks = document.querySelectorAll(".nav-link");
      const dropdownItems = document.querySelectorAll(".dropdown-item");

      console.log("🔍 Current page detected:", currentPage);
      console.log("🔍 Current hash:", currentHash);

      // Remove all existing active classes first
      navLinks.forEach((link) => link.classList.remove("active"));
      dropdownItems.forEach((item) => item.classList.remove("active"));

      // Handle main nav links (Gallery, Expression of Interest, etc.)
      // EXCLUDE dropdown toggles which have href="#" or empty href
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const isDropdownToggle = link.classList.contains("dropdown-toggle");

        if (href && !isDropdownToggle) {
          const linkPage = href.split("/").pop().split("#")[0];
          console.log("🔗 Nav link check:", linkPage, "vs", currentPage);

          // Exact match only for non-dropdown nav links
          if (linkPage === currentPage) {
            link.classList.add("active");
            console.log("✅ Set nav link active:", link.textContent.trim());
          }
        }
      });

      // Handle dropdown items - INCLUDE HASH CHECKING
      let activeItemsFound = 0;
      dropdownItems.forEach((item) => {
        const href = item.getAttribute("href");
        if (href) {
          const fullHref = href.split("/").pop(); // Keep the full part including hash
          const linkPage = fullHref.split("#")[0];
          const linkHash = fullHref.includes("#")
            ? "#" + fullHref.split("#")[1]
            : "";

          console.log(
            "🔗 Dropdown item check:",
            fullHref,
            "vs",
            currentPage + currentHash
          );

          // Check for exact match including hash fragments
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
            // Special case for main index.html page (no hash)
            isMatch = true;
          }

          if (isMatch) {
            activeItemsFound++;
            item.classList.add("active");
            console.log(
              "✅ Set dropdown item active:",
              item.textContent.trim()
            );

            // Find the parent dropdown and mark it as active
            const parentDropdown = item.closest(".dropdown");
            if (parentDropdown) {
              const dropdownToggle = parentDropdown.querySelector(
                ".nav-link.dropdown-toggle"
              );
              if (dropdownToggle) {
                dropdownToggle.classList.add("active");
                console.log(
                  "✅ Set parent dropdown active:",
                  dropdownToggle.textContent.trim()
                );
              }

              // On mobile, automatically show the dropdown if it contains active item
              if (window.innerWidth <= 991) {
                const dropdownMenu =
                  parentDropdown.querySelector(".dropdown-menu");
                if (dropdownMenu) {
                  dropdownMenu.classList.add("show");
                  console.log("📱 Auto-opened dropdown on mobile");
                }
              }
            }
          }
        }
      });

      console.log("📊 Total active items found:", activeItemsFound);
    })
    .catch((error) => {
      console.error("Error loading navbar:", error);
      placeholder.innerHTML =
        '<div style="padding: 1rem; color: #333;">Navigation loading failed</div>';
    });

  // Initialize photo gallery functionality
  initializePhotoGallery();

  // Initialize hero slider
  setTimeout(() => {
    // Only initialize slider if the slider elements exist (homepage only)
    if (document.getElementById("sliderTrack")) {
      new HeroSlider();
    }
  }, 100);
});
