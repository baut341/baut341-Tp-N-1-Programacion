// tema claro / oscuro
const ThemeManager = {
    init() {
        const saved = localStorage.getItem('lyl_theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
    },
    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('lyl_theme', next);
        this._updateIcon();
    },
    _updateIcon() {
        const theme = document.documentElement.getAttribute('data-theme');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
};

function getBasePath() {
    return window.location.pathname.replace(/\\/g, '/').includes('/pages/') ? '../' : '';
}

// armo el header dinamicamente segun si el usuario esta logueado o no
async function buildHeader() {
    ThemeManager.init();

    const user     = Auth.getUser();
    const loggedIn = Auth.isLoggedIn();
    const isAdmin  = user && user.rol === 'admin';
    const base     = getBasePath();

    // traigo las categorias desde los productos, no necesita token
    let categoriesHTML = `<a href="${base}index.html" class="dropdown-item">Todos los productos</a><hr style="border-color:var(--border);margin:4px 0">`;
    try {
        const products = await API.getProducts();
        const catMap   = new Map();
        products.forEach(p => catMap.set(p.idCategoria, p.categoria));
        catMap.forEach((name, id) => {
            categoriesHTML += `<a href="${base}index.html?categoria=${id}" class="dropdown-item">${name}</a>`;
        });
    } catch { /* si falla no pasa nada, el dropdown queda sin categorias */ }

    const header = document.createElement('header');
    header.id = 'main-header';
    header.innerHTML = `
        <div class="header-left">
            <div class="search-bar">
                <input type="text" id="header-search" placeholder="Buscar productos..." autocomplete="off">
                <button onclick="handleSearch()" title="Buscar">Buscar</button>
            </div>

            <a href="${base}pages/favoritos.html" class="header-btn" title="Favoritos">
                <span class="hide-sm">Favoritos</span>
            </a>

            <div class="dropdown" id="products-dropdown">
                <button class="header-btn" onclick="toggleProductsDropdown(event)">
                    <span class="hide-sm">Productos</span> ▾
                </button>
                <div class="dropdown-menu" id="products-dropdown-menu">${categoriesHTML}</div>
            </div>

            ${isAdmin ? `<a href="${base}pages/admin.html" class="header-btn admin-btn">Gestionar productos</a>` : ''}
        </div>

        <div class="header-center">
            <a href="${base}index.html"><h1>LANA &amp; LINO</h1></a>
        </div>

        <div class="header-right">
            <button class="header-btn" id="theme-toggle" onclick="ThemeManager.toggle()" title="Modo oscuro/claro">🌙</button>

            ${loggedIn
                ? `<button class="header-btn" onclick="handleLogout()"><span class="hide-sm">Salir</span></button>`
                : `<a href="${base}pages/login.html" class="header-btn"><span class="hide-sm">Ingresar</span></a>`
            }

            <a href="${base}pages/carrito.html" class="header-btn" title="Carrito">
                <span class="hide-sm">Carrito</span><span id="cart-badge" class="cart-badge"></span>
            </a>

            ${loggedIn
                ? `<a href="${base}pages/perfil.html" class="header-btn" title="Mis datos">
                       <span class="hide-sm">${user.nombre}</span>
                   </a>`
                : ''
            }
        </div>
    `;

    document.body.insertBefore(header, document.body.firstChild);
    ThemeManager._updateIcon();

    document.getElementById('header-search').addEventListener('keydown', e => {
        if (e.key === 'Enter') handleSearch();
    });

    const badge = document.getElementById('cart-badge');
    if (badge) {
        if (loggedIn) {
            API.getCart(user.id_usuario).then(data => {
                const count = (data.payload || []).length;
                if (count > 0) badge.textContent = count;
            }).catch(() => {});
        } else {
            const count = LocalCart.getItems().length;
            if (count > 0) badge.textContent = count;
        }
    }
}

function handleSearch() {
    const q    = document.getElementById('header-search').value.trim();
    const base = getBasePath();
    if (q) window.location.href = `${base}index.html?search=${encodeURIComponent(q)}`;
}

function toggleProductsDropdown(e) {
    e.stopPropagation();
    const menu = document.getElementById('products-dropdown-menu');
    const isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? '' : 'block';
    if (!isOpen) {
        document.addEventListener('click', function closeDropdown() {
            menu.style.display = '';
            document.removeEventListener('click', closeDropdown);
        }, { once: true });
    }
}

function handleLogout() {
    Auth.logout();
    window.location.href = `${getBasePath()}index.html`;
}

// footer con info de la empresa y los que hicimos el tp
function buildFooter() {
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <div class="footer-grid">
            <div class="footer-section">
                <h3>Lana &amp; Lino</h3>
                <p>Tienda de indumentaria.<br>Moda para todos los estilos.</p>
            </div>
            <div class="footer-section">
                <h3>Contacto</h3>
                <p>info@lanaylino.com</p>
                <p>WhatsApp: +54 9 11 5555-0000</p>
                <p>Tel: (011) 4500-1234</p>
            </div>
            <div class="footer-section">
                <h3>Redes sociales</h3>
                <p>Instagram: @lanaylino</p>
                <p>Facebook: Lana &amp; Lino</p>
            </div>
            <div class="footer-section">
                <h3>Desarrollado por</h3>
                <p>Bautista Badaracco<br>Santiago Aylagas</p>
                <p>Trabajo Práctico N°1<br>Programación</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© 2026 Lana &amp; Lino. Todos los derechos reservados.</p>
        </div>
    `;
    document.body.appendChild(footer);
}
