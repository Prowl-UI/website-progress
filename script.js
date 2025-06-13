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

document.addEventListener("DOMContentLoaded", function () {
  const placeholder = document.getElementById("navbar-placeholder");

  // Show loading state with proper height for mobile
  placeholder.style.minHeight = "100px";
  placeholder.style.backgroundColor = "#0a0a0a";
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
          let isOpen = false;

          // Hover functionality (existing)
          dropdown.addEventListener("mouseenter", () => {
            dropdownMenu.classList.add("show");
            dropdownMenu.style.display = "block";
            isOpen = true;
          });

          dropdown.addEventListener("mouseleave", () => {
            // Only close on mouse leave if not clicked open
            if (!dropdown.classList.contains("clicked-open")) {
              dropdownMenu.classList.remove("show");
              dropdownMenu.style.display = "none";
              isOpen = false;
            }
          });

          // Click functionality (new)
          dropdownToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Close other dropdowns first
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

            // Toggle current dropdown
            if (dropdown.classList.contains("clicked-open")) {
              dropdown.classList.remove("clicked-open");
              dropdownMenu.classList.remove("show");
              dropdownMenu.style.display = "none";
              isOpen = false;
            } else {
              dropdown.classList.add("clicked-open");
              dropdownMenu.classList.add("show");
              dropdownMenu.style.display = "block";
              isOpen = true;
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
        // Mobile dropdown click functionality
        const dropdownToggleList = [].slice.call(
          document.querySelectorAll(".dropdown-toggle")
        );
        dropdownToggleList.map(function (dropdownToggleEl) {
          return new bootstrap.Dropdown(dropdownToggleEl);
        });
      }

      // Set active link based on current page
      const currentPage =
        window.location.pathname.split("/").pop() || "index.html";
      const navLinks = document.querySelectorAll(".nav-link");
      const dropdownItems = document.querySelectorAll(".dropdown-item");

      // Handle main nav links
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (
          href === currentPage ||
          (currentPage === "" && href === "index.html")
        ) {
          link.classList.add("active");
        }
      });

      // Handle dropdown items and show parent dropdown if active
      dropdownItems.forEach((item) => {
        const href = item.getAttribute("href");
        if (href === currentPage) {
          item.classList.add("active");

          // Find the parent dropdown and mark it as active
          const parentDropdown = item.closest(".dropdown");
          if (parentDropdown) {
            const dropdownToggle = parentDropdown.querySelector(
              ".nav-link.dropdown-toggle"
            );
            if (dropdownToggle) {
              dropdownToggle.classList.add("active");
            }

            // On mobile, automatically show the dropdown if it contains active item
            if (window.innerWidth <= 991) {
              const dropdownMenu =
                parentDropdown.querySelector(".dropdown-menu");
              if (dropdownMenu) {
                dropdownMenu.classList.add("show");
              }
            }
          }
        }
      });
    })
    .catch((error) => {
      console.error("Error loading navbar:", error);
      placeholder.innerHTML =
        '<div style="padding: 1rem; color: var(--white);">Navigation loading failed</div>';
    });

  // Initialize photo gallery functionality
  initializePhotoGallery();

  // Initialize hero slider
  setTimeout(() => {
    new HeroSlider();
  }, 100);
});
