// Enhanced Portfolio Website Scripts with Fixed Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing portfolio scripts');
    
    // DOM Elements
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('section');
    const skillItems = document.querySelectorAll('.skill-item');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    const scrollTopBtn = document.querySelector('.scroll-top');
    
    // Force all sections to be initially visible for better user experience
    document.body.classList.add('loaded');
    
    // Fix for sections not becoming visible
    setTimeout(() => {
        sections.forEach(section => {
            section.classList.add('visible');
        });
        
        // Make skill items visible with staggered delay
        skillItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 100);
        });
    }, 300);
    
    // Intersection Observer for sections - with fallback
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // If it's the skills section, animate the skill items
                    if (entry.target.id === 'skills') {
                        skillItems.forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('visible');
                            }, index * 100);
                        });
                    }
                    
                    // Find all animatable elements within the section
                    const animatables = entry.target.querySelectorAll('[data-animation]');
                    animatables.forEach(element => {
                        const animation = element.dataset.animation || 'fade-in';
                        element.classList.add(animation);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '-50px 0px'
        });
        
        // Observe each section
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        sections.forEach(section => {
            section.classList.add('visible');
            const animatables = section.querySelectorAll('[data-animation]');
            animatables.forEach(element => {
                const animation = element.dataset.animation || 'fade-in';
                element.classList.add(animation);
            });
        });
        
        skillItems.forEach(item => {
            item.classList.add('visible');
        });
    }
    
    // Improved scroll event handling for better performance
    let lastScrollTop = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        lastScrollTop = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll(lastScrollTop);
                ticking = false;
            });
            ticking = true;
        }
    });
    
    function handleScroll(scrollY) {
        // Header shadow on scroll
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Show/hide scroll-to-top button
        if (scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
        
        // Manually check visibility for browsers without IntersectionObserver
        if (!('IntersectionObserver' in window)) {
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.offsetHeight;
                const sectionBottom = sectionTop + sectionHeight;
                
                if (scrollY >= sectionTop && scrollY <= sectionBottom) {
                    section.classList.add('visible');
                    
                    // If it's the skills section, animate the skill items
                    if (section.id === 'skills') {
                        skillItems.forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('visible');
                            }, index * 100);
                        });
                    }
                }
            });
        }
    }
    
    // Trigger initial scroll handling to set initial states
    handleScroll(window.scrollY);
    
    // Improved smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            console.log('Nav link clicked:', this.getAttribute('href'));
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (mobileNav && mobileNav.classList.contains('open')) {
                    closeMobileNav();
                }
                
                // Smooth scroll to target
                const headerOffset = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerOffset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Fixed Mobile navigation toggle
    function toggleMobileNav() {
        console.log('Mobile nav toggle clicked');
        mobileNav.classList.toggle('open');
        overlay.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
        
        // Toggle aria-expanded attribute
        const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
        mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
    }
    
    // Close mobile navigation
    function closeMobileNav() {
        mobileNav.classList.remove('open');
        overlay.classList.remove('open');
        document.body.classList.remove('no-scroll');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
    }
    
    // Event listeners for mobile navigation
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', toggleMobileNav);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileNav);
    }
    
    // Close mobile menu when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
    
    // Scroll to top button functionality
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Add touch and keyboard support for better accessibility
    // Touch swipe detection for mobile gallery navigation
    let touchStartX = 0;
    let touchEndX = 0;
    
    const galleryContainers = document.querySelectorAll('.gallery-container');
    galleryContainers.forEach(container => {
        container.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        container.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe(container);
        }, { passive: true });
    });
    
    function handleSwipe(container) {
        const threshold = 50;
        const prevBtn = container.querySelector('.gallery-prev');
        const nextBtn = container.querySelector('.gallery-next');
        
        if (touchEndX < touchStartX - threshold) {
            // Swipe left - go to next
            if (nextBtn) nextBtn.click();
        } else if (touchEndX > touchStartX + threshold) {
            // Swipe right - go to previous
            if (prevBtn) prevBtn.click();
        }
    }
    
    // Gallery navigation (if present)
    const galleries = document.querySelectorAll('.portfolio-gallery');
    galleries.forEach(gallery => {
        const prevBtn = gallery.querySelector('.gallery-prev');
        const nextBtn = gallery.querySelector('.gallery-next');
        const slides = gallery.querySelectorAll('.gallery-item');
        let currentIndex = 0;
        
        if (prevBtn && nextBtn && slides.length > 0) {
            // Update slide visibility
            function updateSlides() {
                slides.forEach((slide, index) => {
                    if (index === currentIndex) {
                        slide.classList.add('active');
                    } else {
                        slide.classList.remove('active');
                    }
                });
            }
            
            // Initialize
            updateSlides();
            
            // Previous button
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateSlides();
            });
            
            // Next button
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlides();
            });
            
            // Keyboard navigation for gallery
            gallery.setAttribute('tabindex', '0');
            gallery.addEventListener('keydown', e => {
                if (e.key === 'ArrowLeft') {
                    prevBtn.click();
                } else if (e.key === 'ArrowRight') {
                    nextBtn.click();
                }
            });
        }
    });
    
    // Form validation and submission handling
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const nameField = contactForm.querySelector('[name="name"]');
            const emailField = contactForm.querySelector('[name="email"]');
            const messageField = contactForm.querySelector('[name="message"]');
            
            let isValid = true;
            const errorMessages = [];
            
            // Reset previous errors
            contactForm.querySelectorAll('.error-message').forEach(el => el.remove());
            contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            
            // Validate name
            if (nameField && !nameField.value.trim()) {
                showError(nameField, 'Please enter your name');
                isValid = false;
            }
            
            // Validate email
            if (emailField) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailField.value.trim() || !emailPattern.test(emailField.value)) {
                    showError(emailField, 'Please enter a valid email address');
                    isValid = false;
                }
            }
            
            // Validate message
            if (messageField && !messageField.value.trim()) {
                showError(messageField, 'Please enter your message');
                isValid = false;
            }
            
            // If form is valid, submit it
            if (isValid) {
                // Show loading state
                const submitBtn = contactForm.querySelector('[type="submit"]');
                if (submitBtn) {
                    const originalText = submitBtn.textContent;
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';
                    
                    // Simulate form submission (replace with actual AJAX submission)
                    setTimeout(() => {
                        contactForm.reset();
                        
                        // Show success message
                        const successMsg = document.createElement('div');
                        successMsg.className = 'success-message';
                        successMsg.textContent = 'Thank you! Your message has been sent successfully.';
                        contactForm.appendChild(successMsg);
                        
                        // Remove success message after some time
                        setTimeout(() => {
                            successMsg.remove();
                        }, 5000);
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }, 1500);
                }
            }
            
            function showError(field, message) {
                field.classList.add('error');
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.textContent = message;
                field.parentNode.appendChild(errorElement);
            }
        });
    }
    
    // Lazy loading images for performance
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
            img.classList.add('loaded');
        });
    }
    
    // Dark mode toggle (if present)
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    if (darkModeToggle) {
        // Check for saved theme preference or respect OS preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        // Apply initial theme
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
            document.body.classList.add('dark-mode');
            darkModeToggle.setAttribute('aria-pressed', 'true');
        }
        
        // Toggle theme on click
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            darkModeToggle.setAttribute('aria-pressed', isDarkMode.toString());
        });
    }
    
    // Handle browser resize for responsive layouts
    let resizeTimer;
    window.addEventListener('resize', () => {
        // Debounce resize events for performance
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Adjust any elements that need fixing on resize
            
            // Close mobile menu if window is resized to desktop size
            if (window.innerWidth > 768 && mobileNav && mobileNav.classList.contains('open')) {
                closeMobileNav();
            }
            
            // Reset any transform animations that might break on resize
            document.body.classList.add('resize-transition-stopper');
            setTimeout(() => {
                document.body.classList.remove('resize-transition-stopper');
            }, 400);
        }, 250);
    });
    
    // Add custom cursor for desktop (if present)
    const customCursor = document.querySelector('.custom-cursor');
    if (customCursor && window.matchMedia('(pointer: fine)').matches) {
        // Only enable custom cursor on devices with fine pointer (mouse)
        document.addEventListener('mousemove', e => {
            customCursor.style.left = `${e.clientX}px`;
            customCursor.style.top = `${e.clientY}px`;
            customCursor.classList.add('active');
        });
        
        document.addEventListener('mouseout', () => {
            customCursor.classList.remove('active');
        });
        
        // Add hover effect on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .interactive');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                customCursor.classList.add('hover');
            });
            
            el.addEventListener('mouseleave', () => {
                customCursor.classList.remove('hover');
            });
        });
    }
    
    // Initialize portfolio filters if they exist
    const filterButtons = document.querySelectorAll('.portfolio-filter button');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                const filter = button.getAttribute('data-filter');
                
                // Filter items
                portfolioItems.forEach(item => {
                    if (filter === 'all' || item.classList.contains(filter)) {
                        item.style.display = '';
                        // Use timeout to create staggered animation effect
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, 50);
                    } else {
                        item.classList.remove('visible');
                        // Use timeout to hide after animation completes
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
    
    // Add page transition effects
    const pageTransition = document.querySelector('.page-transition');
    if (pageTransition) {
        // Add page loaded animation
        window.addEventListener('load', () => {
            pageTransition.classList.add('loaded');
            
            // Remove transition overlay after animation
            setTimeout(() => {
                pageTransition.style.display = 'none';
            }, 1000);
        });
    }
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Disable animations for users who prefer reduced motion
        document.body.classList.add('reduced-motion');
    }
});
