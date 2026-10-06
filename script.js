/**
 * Saigon News - JavaScript Logic
 * Handles dynamic content rendering, SPA routing with SEO-friendly Slugs, and category filtering.
 */

// Utility: Convert Vietnamese string to friendly slug
function createSlug(str) {
    str = str.toLowerCase();
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
    str = str.replace(/(đ)/g, 'd');
    str = str.replace(/([^0-9a-z-\s])/g, '');
    str = str.replace(/(\s+)/g, '-');
    str = str.replace(/^-+/g, '');
    str = str.replace(/-+$/g, '');
    return str;
}

// Utility: Shuffle Array for fake category demo
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Articles data is loaded from data.js into window.ARTICLES_DATA
    const articles = window.ARTICLES_DATA || [];
    
    // Pre-process articles to add slugs
    articles.forEach(a => {
        a.slug = a.title ? createSlug(a.title) : a.id;
    });
    
    const prArticles = articles.filter(a => a.type === 'pr');
    const newsArticles = articles.filter(a => a.type === 'kenh14');
    
    // --- Render Views ---
    const homeView = document.getElementById('home-view');
    const articleView = document.getElementById('article-view');
    
    // Sections to toggle during category view
    const heroSection = document.getElementById('hero-article');
    const prGridSection = document.getElementById('pr-grid');
    const prTitleSection = prGridSection ? prGridSection.previousElementSibling : null;
    const newsTitleH2 = document.querySelector('#news-grid').previousElementSibling.querySelector('h2');
    
    // --- SPA Routing (History API) with Slugs ---
    function showArticle(slug, pushHistory = true) {
        const article = articles.find(a => a.slug === slug);
        if (!article) {
            showHome(pushHistory);
            return;
        }
        
        document.getElementById('detail-title').innerText = article.title;
        document.getElementById('detail-sapo').innerText = article.sapo;
        document.getElementById('detail-content').innerHTML = article.content;
        
        homeView.style.display = 'none';
        articleView.style.display = 'block';
        window.scrollTo(0, 0);

        if (pushHistory) {
            const newUrl = window.location.pathname + '?post=' + slug;
            window.history.pushState({ view: 'article', slug: slug }, '', newUrl);
        }
    }
    
    function showHome(pushHistory = true) {
        homeView.style.display = 'block';
        articleView.style.display = 'none';
        
        // Reset category to "Trang Chủ"
        document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
        document.querySelector('.nav-menu a').classList.add('active'); // First link is Trang Chủ
        renderCategory("Trang Chủ");
        
        window.scrollTo(0, 0);

        if (pushHistory) {
            window.history.pushState({ view: 'home' }, '', window.location.pathname);
        }
    }

    // Handle browser's Back and Forward buttons
    window.addEventListener('popstate', (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('post');
        
        if (slug) {
            showArticle(slug, false);
        } else {
            showHome(false);
        }
    });

    // Handle Logo click
    const logoBtn = document.getElementById('logo-btn');
    if (logoBtn) {
        logoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showHome(true);
        });
    }

    // Handle Back Button in Article View
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showHome(true);
        });
    }

    // --- Helper to generate card HTML ---
    function createCardHTML(article, isHero = false) {
        if (isHero) {
            return `
                <div class="article-link" data-slug="${article.slug}" style="display:block; width:100%; height:100%; cursor:pointer;">
                    <img src="${article.image || 'https://picsum.photos/1200/800'}" alt="${article.title}" class="hero-bg" loading="lazy">
                    <div class="hero-overlay"></div>
                    <div class="hero-content">
                        <span class="badge">Nổi Bật</span>
                        <h1 class="hero-title">${article.title}</h1>
                        <p class="hero-sapo">${article.sapo}</p>
                        <div class="read-more">
                            Đọc tiếp
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="article-card article-link" data-slug="${article.slug}" style="cursor:pointer;">
                <div class="card-img-wrapper">
                    <img src="${article.image || 'https://picsum.photos/600/400?random=' + Math.random()}" alt="${article.title}" class="card-img" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${article.title}</h3>
                    <p class="card-sapo">${article.sapo}</p>
                    <div class="read-more">
                        Đọc tiếp
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    }

    // Function to attach click events to newly rendered cards
    function attachArticleClicks() {
        document.querySelectorAll('.article-link').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const slug = el.getAttribute('data-slug');
                showArticle(slug, true);
            });
        });
    }

    // --- Render Category Function ---
    function renderCategory(categoryName) {
        const newsGrid = document.getElementById('news-grid');
        if (!newsGrid) return;
        
        if (categoryName === "Trang Chủ") {
            // Show Home View Elements
            if (heroSection) heroSection.style.display = 'block';
            if (prGridSection) prGridSection.style.display = 'grid';
            if (prTitleSection) prTitleSection.style.display = 'block';
            if (newsTitleH2) newsTitleH2.innerText = 'Tin Tức Tổng Hợp';
            
            // Render Hero
            const heroArticle = newsArticles.length > 0 ? newsArticles[0] : (prArticles.length > 0 ? prArticles[0] : null);
            if (heroSection && heroArticle) {
                heroSection.innerHTML = createCardHTML(heroArticle, true);
            }
            
            // Render PR
            if (prGridSection && prArticles.length > 0) {
                prGridSection.innerHTML = prArticles.map(a => createCardHTML(a)).join('');
            }
            
            // Render News
            const restNews = newsArticles.slice(1);
            newsGrid.innerHTML = restNews.map(a => createCardHTML(a)).join('');
            
        } else {
            // Hide Home Elements
            if (heroSection) heroSection.style.display = 'none';
            if (prGridSection) prGridSection.style.display = 'none';
            if (prTitleSection) prTitleSection.style.display = 'none';
            
            if (newsTitleH2) newsTitleH2.innerText = 'Chuyên mục ' + categoryName;
            
            // Shuffle news to simulate category data
            const categoryNews = shuffleArray(newsArticles);
            newsGrid.innerHTML = categoryNews.map(a => createCardHTML(a)).join('');
        }
        
        attachArticleClicks();
    }

    // --- Category Menu Clicks ---
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryName = e.target.innerText;
            
            document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
            
            // Ensure we are on home view first
            homeView.style.display = 'block';
            articleView.style.display = 'none';
            window.history.pushState({ view: 'home' }, '', window.location.pathname);
            
            renderCategory(categoryName);
            window.scrollTo(0, 0);
        });
    });

    // --- Initialize View on Page Load ---
    const urlParams = new URLSearchParams(window.location.search);
    const initialSlug = urlParams.get('post');
    if (initialSlug) {
        // We still need to render the home grid in background
        renderCategory("Trang Chủ");
        showArticle(initialSlug, false);
    } else {
        renderCategory("Trang Chủ");
        window.history.replaceState({ view: 'home' }, '', window.location.pathname);
    }

    // --- Dynamic Cursor Glow Effect ---
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                cursorGlow.style.left = e.clientX + 'px';
                cursorGlow.style.top = e.clientY + 'px';
            });
            if (cursorGlow.style.opacity === '0' || cursorGlow.style.opacity === '') {
                cursorGlow.style.opacity = '1';
            }
        });
        document.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });
    }
});
