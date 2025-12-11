/* assets/js/main.js */

document.addEventListener("DOMContentLoaded", function () {
    
    // -------------------------------------------------------
    // 1. Navbar Logic (PC/Mobile Scroll & Glass Effect)
    // -------------------------------------------------------
    const navbar = document.querySelector('.navbar-custom');
    const navbarCollapse = document.getElementById('mainNav');

    function onScroll() {
        // 모바일(window) 또는 PC(snap-scrolling body) 스크롤 위치 감지
        const scrollPosition = window.scrollY || document.body.scrollTop || document.documentElement.scrollTop;
        
        // 20px 이상 스크롤 시 배경색 변경 (.scrolled 클래스 추가)
        if (scrollPosition > 20) {
            navbar.classList.add('scrolled');
        } else {
            // 모바일 메뉴가 열려있지 않을 때만 투명하게 복귀
            if (navbarCollapse && !navbarCollapse.classList.contains('show') && !navbarCollapse.classList.contains('collapsing')) {
                navbar.classList.remove('scrolled');
            }
        }
        
        // Scroll To Top 버튼 표시 로직
        const scrollTopBtn = document.getElementById('btnScrollTop');
        if (scrollTopBtn) {
            if (scrollPosition > 400) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        }
    }

    // 이벤트 리스너 등록
    window.addEventListener('scroll', onScroll);
    document.body.addEventListener('scroll', onScroll); 
    onScroll(); 

    // 모바일 햄버거 메뉴 관련 처리
    if (navbarCollapse) {
        document.addEventListener('click', function(event) {
            const isClickInside = navbar.contains(event.target);
            const isMenuOpen = navbarCollapse.classList.contains('show');

            if (!isClickInside && isMenuOpen) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {toggle: false});
                bsCollapse.hide();
            }
        });
        
        navbarCollapse.addEventListener('show.bs.collapse', () => { 
            navbar.classList.add('scrolled'); 
        });

        navbarCollapse.addEventListener('hidden.bs.collapse', () => { 
            const scrollPosition = window.scrollY || document.body.scrollTop || document.documentElement.scrollTop;
            if (scrollPosition <= 20) navbar.classList.remove('scrolled'); 
        });
    }


    // -------------------------------------------------------
    // 2. Reveal Animation & Progress Bar
    // -------------------------------------------------------
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('reveal-up')) {
                    entry.target.classList.add('active');
                    obs.unobserve(entry.target); 
                }
                if (entry.target.classList.contains('progress-bar')) {
                    entry.target.style.width = entry.target.getAttribute('aria-valuenow') + '%';
                    obs.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
    document.querySelectorAll('.progress-bar').forEach(el => observer.observe(el));


    // -------------------------------------------------------
    // 3. Scroll Indicator Click (Hero Section)
    // -------------------------------------------------------
    document.querySelectorAll('.scroll-indicator').forEach(indicator => {
        indicator.addEventListener('click', function() {
            const currentSection = this.closest('section');
            if (currentSection && currentSection.nextElementSibling) {
                currentSection.nextElementSibling.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });


    // -------------------------------------------------------
    // 4. Scroll To Top Button Click
    // -------------------------------------------------------
    const scrollTopBtn = document.getElementById('btnScrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.scrollTo({ top: 0, behavior: 'smooth' }); 
        });
    }


    // -------------------------------------------------------
    // 5. Blog Fetcher (Medium RSS -> HTML 통합됨)
    // -------------------------------------------------------
    const blogGrid = document.getElementById('blog-grid');
    if (blogGrid) {
        const RSS_URL = 'https://medium.com/feed/@OvenMediaEngine';
        const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
        
        // 화면 크기에 따른 포스트 개수 설정
        const isMobile = window.innerWidth < 768;
        const postCount = isMobile ? 6 : 6;

        // [Resize Logic] 화면 크기 변경 시 새로고침 (반응형 대응)
        let lastWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            const currentWidth = window.innerWidth;
            if ((lastWidth < 992 && currentWidth >= 992) || (lastWidth >= 992 && currentWidth < 992)) {
                location.reload();
            }
            lastWidth = currentWidth;
        });

        // API Fetch & Render
        fetch(`${API_URL}&t=${new Date().getTime()}`)
            .then(r => r.json())
            .then(data => {
                if (data.status === 'ok') {
                    let html = '';
                    
                    // 1. 기존 블로그 포스트 반복문
                    data.items.slice(0, postCount).forEach((item, index) => {
                        const dateObj = new Date(item.pubDate);
                        const dateStr = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                        
                        const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                        const imgUrl = imgMatch ? imgMatch[1] : 'images/og/og_airen.png';
                        
                        const delayClass = index > 0 ? `delay-${Math.min(index * 100, 400)}` : '';

                        html += `
                            <div class="col-md-4 reveal-up ${delayClass}">
                                <a href="${item.link}" target="_blank" class="text-decoration-none">
                                    <div class="card h-100 bg-body border border-darker blog-card">
                                        <div class="card-img-top overflow-hidden" style="height: 180px;">
                                            <img src="${imgUrl}" class="w-100 h-100 object-fit-cover transition-img" alt="Blog Thumb">
                                        </div>
                                        <div class="card-body">
                                            <h5 class="card-title text-white h6 lh-base text-truncate-2 mb-2">${item.title}</h5>
                                            <p class="card-text text-sub small">${dateStr}</p>
                                        </div>
                                    </div>
                                </a>
                            </div>`;
                    });

                    // 2. [추가됨] 맨 끝에 'Read More' 카드 붙이기 (모바일 전용: d-lg-none)
                    html += `
                        <div class="col-md-4 reveal-up delay-500 d-lg-none">
                            <a href="https://medium.com/@OvenMediaEngine" target="_blank" class="text-decoration-none h-100 d-block">
                                <div class="card h-100 bg-surface border border-darker blog-card read-more-card">
                                    <div class="card-body d-flex flex-column align-items-center justify-content-center text-center h-100">
                                        <div class="read-more-icon mb-3">
                                            <i class="ph-bold ph-arrow-right"></i>
                                        </div>
                                        <h5 class="card-title text-white h5 mb-1" style="height: auto !important; min-height: auto !important; -webkit-line-clamp: unset;">Read More</h5>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `;

                    // HTML 주입
                    blogGrid.innerHTML = html;
                    
                    // 동적으로 추가된 카드들에 애니메이션 옵저버 연결
                    const newReveals = document.querySelectorAll('#blog-grid .reveal-up');
                    const blogObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => { 
                            if (entry.isIntersecting) entry.target.classList.add('active'); 
                        });
                    }, { threshold: 0.1 });
                    newReveals.forEach(el => blogObserver.observe(el));

                    // 3. [핵심] 콘텐츠 로드 완료 후 모바일 화살표 로직 강제 재실행
                    if (typeof initMobileScrollArrows === 'function') {
                        initMobileScrollArrows();
                    }
                }
            })
            .catch(() => { 
                blogGrid.innerHTML = '<div class="col-12 text-center text-sub">Load Failed.</div>'; 
            });
    }
});

/* =========================================
   Mobile Horizontal Scroll Arrows Logic (Refactored)
   ========================================= */

// 1. 화살표 생성 및 관리 함수 정의
function initMobileScrollArrows() {
    // PC면 실행 안 함
    if (window.innerWidth >= 992) return;

    const scrollContainers = document.querySelectorAll('.mobile-horizontal-scroll');

    scrollContainers.forEach(container => {
        // [중요] 이미 화살표가 달려있으면 건너뛰기 (중복 생성 방지)
        if (container.parentElement.classList.contains('arrow-wrapper-added')) {
            // 대신 스크롤 상태만 업데이트 (블로그 로딩 후 화살표 보이게 하기 위해)
            // 강제로 스크롤 이벤트 발생시켜 상태 업데이트
            container.dispatchEvent(new Event('scroll'));
            return; 
        }

        // 1. Wrapper 생성
        const wrapper = document.createElement('div');
        wrapper.className = 'position-relative w-100 arrow-wrapper-added';
        
        container.parentNode.insertBefore(wrapper, container);
        wrapper.appendChild(container);

        // 2. 화살표 UI 생성
        const navOverlay = document.createElement('div');
        navOverlay.className = 'scroll-nav-overlay';
        navOverlay.innerHTML = `
            <div class="nav-arrow nav-left"><i class="ph-bold ph-caret-left"></i></div>
            <div class="nav-arrow nav-right"><i class="ph-bold ph-caret-right"></i></div>
        `;
        wrapper.appendChild(navOverlay);

        const leftArrow = navOverlay.querySelector('.nav-left');
        const rightArrow = navOverlay.querySelector('.nav-right');

        // 3. 화살표 상태 업데이트 함수
        const updateArrows = () => {
            const scrollLeft = container.scrollLeft;
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            const buffer = 5; 

            // 내용이 충분하지 않으면 숨김
            if (maxScrollLeft <= 0) {
                leftArrow.classList.remove('show');
                rightArrow.classList.remove('show');
                return;
            }

            // 왼쪽 화살표
            if (scrollLeft > buffer) {
                leftArrow.classList.add('show');
            } else {
                leftArrow.classList.remove('show');
            }

            // 오른쪽 화살표
            if (scrollLeft < maxScrollLeft - buffer) {
                rightArrow.classList.add('show');
            } else {
                rightArrow.classList.remove('show');
            }
        };

        // 4. 클릭 이벤트
        leftArrow.addEventListener('click', () => {
            container.scrollBy({ left: -container.clientWidth * 0.7, behavior: 'smooth' });
        });
        rightArrow.addEventListener('click', () => {
            container.scrollBy({ left: container.clientWidth * 0.7, behavior: 'smooth' });
        });

        // 5. 이벤트 리스너
        container.addEventListener('scroll', updateArrows);
        
        // [핵심] ResizeObserver: 콘텐츠(블로그) 로드 시 즉시 감지
        const resizeObserver = new ResizeObserver(() => {
            updateArrows();
        });
        resizeObserver.observe(container);
        
        // 초기 실행
        updateArrows();
    });
}

// 2. 페이지 로드 시 최초 실행
document.addEventListener("DOMContentLoaded", initMobileScrollArrows);


    document.addEventListener("DOMContentLoaded", function() {
            const sections = document.querySelectorAll(".eula-section");
            const navLinks = document.querySelectorAll(".doc-nav-link");

            // Use IntersectionObserver for better performance and accuracy
            const observerOptions = {
                root: null,
                rootMargin: "-20% 0px -70% 0px", // Trigger when section is near top of viewport
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Remove active class from all links
                        navLinks.forEach(link => link.classList.remove("active"));
                        
                        // Add active class to corresponding link
                        const id = entry.target.getAttribute("id");
                        const activeLink = document.querySelector(`.doc-nav-link[href="#${id}"]`);
                        if (activeLink) {
                            activeLink.classList.add("active");
                        }
                    }
                });
            }, observerOptions);

            sections.forEach(section => observer.observe(section));
        });