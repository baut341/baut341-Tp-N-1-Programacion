const API = {
    // productos
    getProducts: async () => {
        const res = await fetch(`${API_BASE}/obtenerProductos`);
        const data = await res.json();
        return data.payload || [];
    },

    getProduct: async (id) => {
        const res = await fetch(`${API_BASE}/obtenerDatosProducto/${id}`);
        const data = await res.json();
        return data.payload || [];
    },

    getCategories: async () => {
        const res = await fetch(`${API_BASE}/obtenerCategorias`, {
            headers: { Authorization: Auth.getToken() }
        });
        const data = await res.json();
        return data.payload || [];
    },

    createCategory: async (nombre) => {
        const res = await fetch(`${API_BASE}/crearCategoria`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: Auth.getToken() },
            body: JSON.stringify({ nombre })
        });
        return res.json();
    },

    createProduct: async (product) => {
        const res = await fetch(`${API_BASE}/cargarProducto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: Auth.getToken() },
            body: JSON.stringify(product)
        });
        return res.json();
    },

    createInventario: async (inv) => {
        const res = await fetch(`${API_BASE}/crearInventario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: Auth.getToken() },
            body: JSON.stringify(inv)
        });
        return res.json();
    },

    modificarStock: async (id_inventario, stock) => {
        const res = await fetch(`${API_BASE}/modificarStock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: Auth.getToken() },
            body: JSON.stringify({ id_inventario, stock })
        });
        return res.json();
    },

    modificarProducto: async (id, productData) => {
        const res = await fetch(`${API_BASE}/modificarProducto/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: Auth.getToken() },
            body: JSON.stringify(productData)
        });
        return res.json();
    },

    // login y registro
    login: async (email, password) => {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return res.json();
    },

    register: async (userData) => {
        const res = await fetch(`${API_BASE}/registrarUsuario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return res.json();
    },

    // datos del usuario
    getUser: async (id) => {
        const res = await fetch(`${API_BASE}/obtenerDatosUsuario/${id}`, {
            headers: { Authorization: Auth.getToken() }
        });
        return res.json();
    },

    updateUser: async (id, userData) => {
        const res = await fetch(`${API_BASE}/modificarUsuario/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: Auth.getToken() },
            body: JSON.stringify(userData)
        });
        return res.json();
    },

    // carrito
    getCart: async (id_usuario) => {
        const res = await fetch(`${API_BASE}/obtenerProductosCarrito/${id_usuario}`, {
            headers: { Authorization: Auth.getToken() }
        });
        return res.json();
    },

    addToCart: async (id_inventario, id_usuario) => {
        const res = await fetch(`${API_BASE}/agregarACarrito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: Auth.getToken() },
            body: JSON.stringify({ id_inventario, id_usuario })
        });
        return res.json();
    },

    removeFromCart: async (id_usuario, id_inventario) => {
        const res = await fetch(`${API_BASE}/eliminarProductoCarrito`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: Auth.getToken() },
            body: JSON.stringify({ id_usuario, id_inventario })
        });
        return res.json();
    },

    // favoritos
    getFavorites: async (id_usuario) => {
        const res = await fetch(`${API_BASE}/obtenerFavoritos/${id_usuario}`, {
            headers: { Authorization: Auth.getToken() }
        });
        return res.json();
    },

    addToFavorites: async (id_producto, id_usuario) => {
        const res = await fetch(`${API_BASE}/agregarFavorito`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: Auth.getToken() },
            body: JSON.stringify({ id_producto, id_usuario })
        });
        return res.json();
    },

    removeFromFavorites: async (id_usuario, id_producto) => {
        const res = await fetch(`${API_BASE}/eliminarFavorito`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: Auth.getToken() },
            body: JSON.stringify({ id_usuario, id_producto })
        });
        return res.json();
    }
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
}

// carrito local para usuarios no logueados
const LocalCart = {
    KEY: 'lyl_cart_local',
    getItems() {
        try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
        catch { return []; }
    },
    addItem(item) {
        const items = this.getItems();
        if (!items.find(i => i.idInventario === item.idInventario)) {
            items.push(item);
            localStorage.setItem(this.KEY, JSON.stringify(items));
        }
    },
    removeItem(idInventario) {
        const items = this.getItems().filter(i => i.idInventario !== idInventario);
        localStorage.setItem(this.KEY, JSON.stringify(items));
    },
    clear() { localStorage.removeItem(this.KEY); },
    async syncToBackend(id_usuario) {
        const items = this.getItems();
        if (!items.length) return;
        await Promise.all(items.map(i => API.addToCart(i.idInventario, id_usuario).catch(() => {})));
        this.clear();
    }
};
