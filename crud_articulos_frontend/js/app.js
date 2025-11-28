// ==============================
// CONFIGURACIÓN DE ENDPOINTS
// ==============================
const API_ARTICULOS = "http://localhost:8080/api/articulos";
const API_CATEGORIAS = "http://localhost:8080/api/categorias";
const API_PEDIDOS   = "http://localhost:8080/api/pedidos";

// ==============================
// ESTADO DE LA APP
// ==============================
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ==============================
// INICIALIZACIÓN
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    // Eventos de navegación entre vistas
    document.getElementById("btnVerArticulos").addEventListener("click", () => mostrarVista("articulos"));
    document.getElementById("btnVerCarrito").addEventListener("click", () => mostrarVista("carrito"));

    // Eventos de formulario
    document.getElementById("form-articulo").addEventListener("submit", guardarArticulo);
    document.getElementById("cancelar").addEventListener("click", limpiarFormulario);

    // Eventos de carrito
    document.getElementById("btnVaciarCarrito").addEventListener("click", vaciarCarrito);
    document.getElementById("btnConfirmarPedido").addEventListener("click", confirmarPedido);
    document.getElementById("btnVerPedidos").addEventListener("click", () => mostrarVista("pedidos"));

    // Carga inicial
    cargarCategorias();
    listarArticulos();
    renderCarrito();
    mostrarVista("articulos");
});

// ==============================
// CAMBIAR ENTRE VISTAS
// ==============================
function mostrarVista(vista) {
    const vistaArticulos = document.getElementById("vista-articulos");
    const vistaCarrito   = document.getElementById("vista-carrito");
    const vistaPedidos   = document.getElementById("vista-pedidos");

    vistaArticulos.classList.add("d-none");
    vistaCarrito.classList.add("d-none");
    vistaPedidos.classList.add("d-none");

    if (vista === "articulos") {
        vistaArticulos.classList.remove("d-none");
    } 
    else if (vista === "carrito") {
        vistaCarrito.classList.remove("d-none");
    }
    else if (vista === "pedidos") {
        vistaPedidos.classList.remove("d-none");
        listarPedidos();
    }
}

// ==============================
// CRUD DE ARTÍCULOS
// ==============================
function listarArticulos() {
    fetch(API_ARTICULOS)
        .then(res => res.json())
        .then(articulos => {
            const tbody = document.getElementById("tabla-articulos");
            tbody.innerHTML = "";

            articulos.forEach(articulo => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${articulo.id}</td>
                    <td>${articulo.nombre}</td>
                    <td>$${articulo.precio.toFixed(2)}</td>
                    <td>${articulo.categoria ? articulo.categoria.nombre : "Sin categoría"}</td>
                    <td class="tabla-img">
                    ${articulo.imagenUrl 
                        ? `<img src="${articulo.imagenUrl}" alt="img">` 
                        : `<div class="no-img"></div>`}
                    </td>
                    <td class="text-center">
                        <button class="btn btn-success btn-sm me-1" onclick="agregarAlCarrito(${articulo.id})">Agregar</button>
                        <button class="btn btn-warning btn-sm me-1" onclick="editarArticulo(${articulo.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarArticulo(${articulo.id})">Eliminar</button>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error al listar artículos:", err);
            alert("Error al cargar artículos.");
        });
}

function guardarArticulo(event) {
    event.preventDefault();

    const id          = document.getElementById("idArticulo").value;
    const nombre      = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio      = parseFloat(document.getElementById("precio").value);
    const imagenUrl   = document.getElementById("imagenUrl").value.trim();
    const categoriaId = document.getElementById("categoria").value;

    if (!nombre || isNaN(precio) || precio <= 0 || !categoriaId) {
        alert("Por favor, complete correctamente Nombre, Precio y Categoría.");
        return;
    }

    const articulo = {
        nombre,
        descripcion,
        precio,
        imagenUrl,
        categoria: { id: categoriaId }
    };

    const url    = id ? `${API_ARTICULOS}/${id}` : API_ARTICULOS;
    const metodo = id ? "PUT" : "POST";

    fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articulo)
    })
        .then(res => {
            if (!res.ok) throw new Error("Error al guardar artículo");
            return res.json();
        })
        .then(() => {
            alert("Artículo guardado correctamente.");
            limpiarFormulario();
            listarArticulos();
        })
        .catch(err => {
            console.error(err);
            alert("Ocurrió un error al guardar el artículo.");
        });
}

function editarArticulo(id) {
    fetch(`${API_ARTICULOS}/${id}`)
        .then(res => res.json())
        .then(art => {
            document.getElementById("idArticulo").value    = art.id;
            document.getElementById("nombre").value        = art.nombre;
            document.getElementById("descripcion").value   = art.descripcion || "";
            document.getElementById("precio").value        = art.precio;
            document.getElementById("imagenUrl").value     = art.imagenUrl || "";
            document.getElementById("categoria").value     = art.categoria ? art.categoria.id : "";
            mostrarVista("articulos");
        })
        .catch(err => {
            console.error("Error al obtener artículo:", err);
            alert("No se pudo cargar el artículo para edición.");
        });
}

function eliminarArticulo(id) {
    if (!confirm("¿Deseás eliminar este artículo?")) return;

    fetch(`${API_ARTICULOS}/${id}`, { method: "DELETE" })
        .then(res => {
            if (!res.ok) throw new Error("Error al eliminar artículo");
            listarArticulos();
        })
        .catch(err => {
            console.error(err);
            alert("Ocurrió un error al eliminar el artículo.");
        });
}

function limpiarFormulario() {
    document.getElementById("form-articulo").reset();
    document.getElementById("idArticulo").value = "";
}

// ==============================
// CATEGORÍAS
// ==============================
function cargarCategorias() {
    fetch(API_CATEGORIAS)
        .then(res => res.json())
        .then(categorias => {
            const select = document.getElementById("categoria");
            select.innerHTML = `<option value="">Seleccione una categoría...</option>`;

            categorias.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.nombre;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Error al cargar categorías:", err);
            alert("Error al cargar categorías.");
        });
}

// ==============================
// CARRITO
// ==============================
function agregarAlCarrito(idArticulo) {
    // Traemos el artículo desde la API para tener nombre y precio actualizados
    fetch(`${API_ARTICULOS}/${idArticulo}`)
        .then(res => res.json())
        .then(art => {
            const existente = carrito.find(item => item.id === art.id);

            if (existente) {
                existente.cantidad += 1;
            } else {
                carrito.push({
                    id: art.id,
                    nombre: art.nombre,
                    precio: art.precio,
                    cantidad: 1
                });
            }

            guardarCarrito();
            alert("Artículo agregado al carrito.");
        })
        .catch(err => {
            console.error("Error al agregar al carrito:", err);
            alert("No se pudo agregar el artículo al carrito.");
        });
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
}

function renderCarrito() {
    const tbody = document.getElementById("tabla-carrito");
    const totalSpan = document.getElementById("total-carrito");

    if (!tbody || !totalSpan) return; // por si la vista aún no está cargada

    tbody.innerHTML = "";
    let total = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="cambiarCantidad(${index}, -1)">-</button>
                <span>${item.cantidad}</span>
                <button class="btn btn-sm btn-outline-primary ms-1" onclick="cambiarCantidad(${index}, 1)">+</button>
            </td>
            <td>$${subtotal.toFixed(2)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${index})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    totalSpan.textContent = total.toFixed(2);
}

function cambiarCantidad(index, delta) {
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
        carrito[index].cantidad = 1;
    }
    guardarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
}

function vaciarCarrito() {
    if (!confirm("¿Vaciar todo el carrito?")) return;
    carrito = [];
    guardarCarrito();
}

// ==============================
// CONFIRMAR PEDIDO (POST a /api/pedidos)
// ==============================
function confirmarPedido() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const pedido = {
        lineas: carrito.map(item => ({
            articulo: { id: item.id },
            cantidad: item.cantidad
        }))
    };

    fetch(API_PEDIDOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
    })
        .then(res => {
            if (!res.ok) throw new Error("Error al crear pedido");
            return res.json();
        })
        .then(data => {
            alert(`Pedido creado correctamente.\nTotal: $${data.total.toFixed(2)}`);
            carrito = [];
            guardarCarrito();
            mostrarVista("articulos");
        })
        .catch(err => {
            console.error("Error al confirmar pedido:", err);
            alert("Ocurrió un error al confirmar el pedido.");
        });
}

function listarPedidos() {
    fetch(API_PEDIDOS)
        .then(res => res.json())
        .then(pedidos => {
            const tbody = document.getElementById("tabla-pedidos");
            tbody.innerHTML = "";

            pedidos.forEach(p => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${p.id}</td>
                    <td>${p.fecha ? p.fecha.replace("T", " ") : "-"}</td>
                    <td>$${p.total.toFixed(2)}</td>
                    <td>${p.lineas.length}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="mostrarDetallePedido(${p.id})">
                            Ver detalle
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });

        })
        .catch(err => {
            console.error("Error al listar pedidos:", err);
            alert("No se pudieron cargar los pedidos.");
        });
}

function mostrarDetallePedido(id) {
    fetch(`${API_PEDIDOS}/${id}`)
        .then(res => res.json())
        .then(pedido => {

            const divDetalle = document.getElementById("detalle-pedido");
            const tbody = document.getElementById("tabla-detalle-pedido");

            tbody.innerHTML = "";

            pedido.lineas.forEach(l => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${l.articulo.nombre}</td>
                    <td>$${l.precioUnitario.toFixed(2)}</td>
                    <td>${l.cantidad}</td>
                    <td>$${l.subtotal.toFixed(2)}</td>
                `;

                tbody.appendChild(tr);
            });

            divDetalle.classList.remove("d-none");

        })
        .catch(err => {
            console.error("Error al obtener detalle:", err);
            alert("No se pudo cargar el detalle del pedido.");
        });
}