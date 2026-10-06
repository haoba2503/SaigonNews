/**
 * Saigon News - JavaScript Logic
 * Handles dynamic content rendering and micro-animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Articles data is loaded from data.js into window.ARTICLES_DATA
    const articles = window.ARTICLES_DATA || [];
    
    const prArticles = articles.filter(a => a.type === 'pr');
    const newsArticles = articles.filter(a => a.type === 'kenh14');
    
    // --- Render Views ---
    const homeView = document.getElementById('home-view');
    const articleView = document.getElementById('article-view');
    
    function showArticle(id) {
        const article = articles.find(a => a.id === id);
        if (!article) return;
        
        document.getElementById('detail-title').innerText = article.title;
        document.getElementById('detail-sapo').innerText = article.sapo;
        document.getElementById('detail-content').innerHTML = article.content;
        
        homeView.style.display = 'none';
        articleView.style.display = 'block';
        window.scrollTo(0, 0);
    }
    
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            homeView.style.display = 'block';
            articleView.style.display = 'none';
            window.scrollTo(0, 0);
        });
    }

    // Helper to generate card HTML
    function createCardHTML(article, isHero = false) {
        if (isHero) {
            return `
                <div class="article-link" data-id="${article.id}" style="display:block; width:100%; height:100%; cursor:pointer;">
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
            <div class="article-card article-link" data-id="${article.id}" style="cursor:pointer;">
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

    // --- Render Hero Article ---
    // Use the first Kenh14 article as hero, or fallback to PR
    const heroArticle = newsArticles.length > 0 ? newsArticles[0] : (prArticles.length > 0 ? prArticles[0] : null);
    const heroSection = document.getElementById('hero-article');
    
    if (heroSection && heroArticle) {
        heroSection.innerHTML = createCardHTML(heroArticle, true);
    }

    // --- Render PR Grid ---
    const prGrid = document.getElementById('pr-grid');
    if (prGrid && prArticles.length > 0) {
        prGrid.innerHTML = prArticles.map(a => createCardHTML(a)).join('');
    }

    // --- Render News Grid ---
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid && newsArticles.length > 0) {
        // Skip the first one if it's used as hero
        const restNews = newsArticles.slice(1);
        newsGrid.innerHTML = restNews.map(a => createCardHTML(a)).join('');
    }
    
    // --- Attach Click Events ---
    document.querySelectorAll('.article-link').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const id = el.getAttribute('data-id');
            showArticle(id);
        });
    });

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
