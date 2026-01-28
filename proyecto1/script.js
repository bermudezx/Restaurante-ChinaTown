/// script.js - China Town (archivo unificado y corregido)
(function () {
    'use strict';

    // -------------------------
    // Helpers
    // -------------------------
    const safeQuery = (sel, parent = document) => parent.querySelector(sel);
    const safeQueryAll = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

    // -------------------------
    // DOMContentLoaded - asegurar DOM listo
    // -------------------------
    document.addEventListener('DOMContentLoaded', () => {

        // -------------------------
        // NAVEGACIÓN / MENÚ MÓVIL
        // -------------------------
        let isScrolled = false;
        const navigation = document.getElementById('navigation');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        if (navigation) {
            window.addEventListener('scroll', () => {
                const scrolled = window.scrollY > 50;
                if (scrolled !== isScrolled) {
                    isScrolled = scrolled;
                    navigation.classList.toggle('scrolled', isScrolled);
                }
            });
        }

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
            });
        }

        // Smooth scroll for nav links (only anchors starting with #)
        const navLinks = safeQueryAll('.nav-link, .nav-link-mobile, .footer-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        if (mobileMenu) mobileMenu.classList.remove('active');
                    }
                }
            });
        });

        // -------------------------
        // CARRUSEL
        // -------------------------
        const carouselContainer = document.querySelector('.carousel-container');
        const slides = safeQueryAll('.carousel-slide');
        let dots = safeQueryAll('.dot');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        let currentSlide = 0;
        const intervalo = 5000;
        let autoPlayInterval = null;

        const totalSlides = slides.length;

        // Si no hay slides, salir
        if (totalSlides === 0) {
            console.warn('Carrusel: no se encontraron elementos .carousel-slide');
        } else {
            // Si no hay dots en HTML, crearlos dinámicamente
            if (dots.length === 0 && carouselContainer) {
                const dotsWrap = document.createElement('div');
                dotsWrap.className = 'carousel-dots';
                slides.forEach((s, i) => {
                    const btn = document.createElement('button');
                    btn.className = 'dot' + (i === 0 ? ' active' : '');
                    btn.dataset.slide = String(i);
                    dotsWrap.appendChild(btn);
                });
                carouselContainer.appendChild(dotsWrap);
                dots = safeQueryAll('.dot');
            }

            function showSlide(index) {
                if (index < 0) index = 0;
                if (index >= totalSlides) index = totalSlides - 1;
                slides.forEach((slide, i) => {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
                currentSlide = index;
            }

            function nextSlide() {
                currentSlide = (currentSlide + 1) % totalSlides;
                showSlide(currentSlide);
            }

            function prevSlide() {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                showSlide(currentSlide);
            }

            // AutoPlay control
            function startAutoPlay() {
                stopAutoPlay();
                autoPlayInterval = setInterval(nextSlide, intervalo);
            }

            function stopAutoPlay() {
                if (autoPlayInterval) {
                    clearInterval(autoPlayInterval);
                    autoPlayInterval = null;
                }
            }

            function resetAutoPlay() {
                startAutoPlay();
            }

            // Eventos botones
            if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
            if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });

            // Eventos dots
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const idx = parseInt(dot.dataset.slide, 10);
                    if (!isNaN(idx)) {
                        showSlide(idx);
                        resetAutoPlay();
                    }
                });
            });

            // Pausar al hover
            if (carouselContainer) {
                carouselContainer.addEventListener('mouseenter', stopAutoPlay);
                carouselContainer.addEventListener('mouseleave', startAutoPlay);
            }

            // Touch gestures
            let touchStartX = 0;
            let touchEndX = 0;
            if (carouselContainer) {
                carouselContainer.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });

                carouselContainer.addEventListener('touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipe();
                }, { passive: true });
            }

            function handleSwipe() {
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) nextSlide();
                    else prevSlide();
                    resetAutoPlay();
                }
            }

            // Iniciar carrusel
            showSlide(0);
            startAutoPlay();
        }

        // -------------------------
        // MODAL DEL MENÚ
        // -------------------------
        const menuModal = document.getElementById('menuModal');
        const openMenuBtns = safeQueryAll('[id^="openMenuBtn"]');
        const fullMenuBtn = document.getElementById('fullMenuBtn');
        const closeMenuModal = document.getElementById('closeMenuModal');
        const modalBackdrop = document.querySelector('.menu-modal-backdrop');
        const modalContainer = document.querySelector('.menu-modal-container');

        function openModal() {
            if (!menuModal) return;
            menuModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            if (!menuModal) return;
            menuModal.classList.remove('active');
            document.body.style.overflow = '';
        }

        openMenuBtns.forEach(btn => btn.addEventListener('click', openModal));
        if (fullMenuBtn) fullMenuBtn.addEventListener('click', openModal);
        if (closeMenuModal) closeMenuModal.addEventListener('click', closeModal);
        if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
        if (modalContainer) modalContainer.addEventListener('click', (e) => e.stopPropagation());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuModal && menuModal.classList.contains('active')) {
                closeModal();
            }
        });

        // -------------------------
        // ANIMACIONES / OBSERVERS / LAZY
        // -------------------------
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = safeQueryAll('.feature-card, .menu-item, .gallery-item, .contact-card');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Lazy loading
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        const images = safeQueryAll('img');
        images.forEach(img => imageObserver.observe(img));

        // Smooth scroll fallback
        if (!('scrollBehavior' in document.documentElement.style)) {
            const scrollToElement = (element) => {
                const targetPosition = element.offsetTop;
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = 1000;
                let start = null;

                const ease = (t, b, c, d) => {
                    t /= d / 2;
                    if (t < 1) return c / 2 * t * t + b;
                    t--;
                    return -c / 2 * (t * (t - 2) - 1) + b;
                };

                const animation = (currentTime) => {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const run = ease(timeElapsed, startPosition, distance, duration);
                    window.scrollTo(0, run);
                    if (timeElapsed < duration) requestAnimationFrame(animation);
                };

                requestAnimationFrame(animation);
            };

            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) scrollToElement(target);
                });
            });
        }

        // -------------------------
        // UTILIDADES / ACCESIBILIDAD / PERFORMANCE
        // -------------------------
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') document.body.classList.add('keyboard-navigation');
        });
        document.addEventListener('mousedown', () => document.body.classList.remove('keyboard-navigation'));

        const style = document.createElement('style');
        style.textContent = `
            body:not(.keyboard-navigation) *:focus { outline: none; }
            body.keyboard-navigation *:focus { outline: 3px solid #fbbf24; outline-offset: 2px; }
        `;
        document.head.appendChild(style);

        // Prefetch
        setTimeout(() => {
            const menuImg = new Image();
            menuImg.src = 'images/menu-full.png';
        }, 2000);

        // Handle image errors
        images.forEach(img => {
            img.addEventListener('error', function () {
                console.warn('Error al cargar imagen:', this.src);
            });
        });

        // Easter egg
        let konamiBuffer = '';
        const konamiCode = 'dragon';
        let konamiTimeout;
        document.addEventListener('keypress', (e) => {
            clearTimeout(konamiTimeout);
            konamiBuffer += e.key.toLowerCase();
            if (konamiBuffer.includes(konamiCode)) {
                document.body.style.animation = 'rainbow 2s ease-in-out';
                setTimeout(() => document.body.style.animation = '', 2000);
                konamiBuffer = '';
            }
            konamiTimeout = setTimeout(() => konamiBuffer = '', 1000);
        });

        const rainbowStyle = document.createElement('style');
        rainbowStyle.textContent = `
            @keyframes rainbow { 
                0% { filter: hue-rotate(0deg); } 
                50% { filter: hue-rotate(180deg); } 
                100% { filter: hue-rotate(360deg); } 
            }
        `;
        document.head.appendChild(rainbowStyle);

        // Performance log
        window.addEventListener('load', () => {
            const loadTime = Math.round(performance.now());
            console.log(`✅ Página cargada completamente en ${loadTime}ms`);
        });

        // Detect browser
        (function detectBrowser() {
            const ua = navigator.userAgent;
            let browserName = 'unknown';
            if (ua.indexOf('Firefox') > -1) browserName = 'firefox';
            else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) browserName = 'chrome';
            else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browserName = 'safari';
            else if (ua.indexOf('Edg') > -1) browserName = 'edge';
            else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) browserName = 'ie';
            document.body.classList.add('browser-' + browserName);
        })();

        // WhatsApp analytics
        const whatsappLinks = safeQueryAll('a[href*="wa.me"]');
        whatsappLinks.forEach(link => link.addEventListener('click', () => {
            console.log('📱 Usuario hizo clic en enlace de WhatsApp');
        }));

    }); // fin DOMContentLoaded

})(); // fin IIFE
