document.addEventListener("DOMContentLoaded", () => {
  const productosContainer = document.getElementById("productos-container");
  const agregarBtn = document.getElementById("agregar");
  const filtroSelect = document.getElementById("filtro-seccion");
  const buscarInput = document.getElementById("buscar");
  const buscarBtn = document.getElementById("buscar-btn");

  agregarBtn.addEventListener("click", agregarProducto);
  filtroSelect.addEventListener("change", filtrarProductos);
  buscarBtn.addEventListener("click", buscarProducto);

  // Cargar productos del local storage al cargar la página
  cargarProductos();

  // Función para agregar un nuevo producto
  function agregarProducto() {
    const nombre = document.getElementById("nombre").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const seccion = document.getElementById("seccion").value;
    const stock = parseInt(document.getElementById("stock").value);
    const imagen = document.getElementById("imagen").files[0];

    // Validar campos
    if (nombre && !isNaN(valor) && seccion && !isNaN(stock) && imagen) {
      const reader = new FileReader();
      reader.onload = function () {
        const producto = {
          nombre,
          valor,
          seccion,
          stock,
          imagen: reader.result,
        };

        let productos = JSON.parse(localStorage.getItem("productos")) || [];
        productos.push(producto);
        localStorage.setItem("productos", JSON.stringify(productos));

        // Notificación SweetAlert de éxito
        Swal.fire({
          icon: "success",
          title: "Producto Agregado",
          text: "El producto ha sido agregado exitosamente.",
        }).then(() => {
          limpiarFormulario();
          cargarProductos();
        });
      };
      reader.readAsDataURL(imagen);
    } else {
      // Notificación SweetAlert de error
      Swal.fire({
        icon: "error",
        title: "Campos Incompletos",
        text: "Por favor complete todos los campos.",
      });
    }
  }

  // Función para limpiar el formulario
  function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("seccion").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("imagen").value = "";
  }

  // Función para cargar los productos desde el localStorage
  function cargarProductos() {
    productosContainer.innerHTML = "";

    const productos = JSON.parse(localStorage.getItem("productos")) || [];

    productos.forEach((producto, index) => {
      const card = crearProductoCard(producto, index);
      productosContainer.appendChild(card);
    });
  }

  // Función para crear una tarjeta de producto
  function crearProductoCard(producto, index) {
    const card = document.createElement("div");
    card.className = "producto-card";

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    card.appendChild(imagen);

    const nombre = document.createElement("p");
    nombre.contentEditable = true; // Permite editar directamente en la card
    nombre.textContent = producto.nombre;
    card.appendChild(nombre);

    const seccion = document.createElement("p");
    seccion.contentEditable = true; 
    seccion.textContent = producto.seccion;
    card.appendChild(seccion);

    const precio = document.createElement("p");
    precio.contentEditable = true; 
    precio.textContent = `Precio: $${producto.valor.toFixed(2)}`;
    card.appendChild(precio);

    const stock = document.createElement("p");
    stock.contentEditable = true; 
    stock.textContent = `Stock: ${producto.stock}`;
    card.appendChild(stock);

    const accionesDiv = document.createElement("div");
    accionesDiv.className = "acciones";

    const editarBtn = document.createElement("button");
    editarBtn.className = "editar";
    editarBtn.textContent = "Editar";
    editarBtn.addEventListener("click", () => confirmarEditar(index, card));
    accionesDiv.appendChild(editarBtn);

    const eliminarBtn = document.createElement("button");
    eliminarBtn.className = "eliminar";
    eliminarBtn.textContent = "Eliminar";
    eliminarBtn.addEventListener("click", () => confirmarEliminar(index));
    accionesDiv.appendChild(eliminarBtn);

    card.appendChild(accionesDiv);

    return card;
  }

  // Función para editar un producto
  function confirmarEditar(index, card) {
    Swal.fire({
      icon: "warning",
      title: "¿Está seguro?",
      text: "Esta acción editará el producto.",
      showCancelButton: true,
      confirmButtonText: "Sí, editar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        editarProducto(index, card);
      }
    });
  }

  function editarProducto(index, card) {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const producto = productos[index];

    producto.nombre = card.querySelector("p:nth-child(2)").textContent;
    producto.seccion = card.querySelector("p:nth-child(3)").textContent;
    producto.valor = parseFloat(
      card.querySelector("p:nth-child(4)").textContent.split(": $")[1]
    );
    producto.stock = parseInt(
      card.querySelector("p:nth-child(5)").textContent.split(": ")[1]
    );

    localStorage.setItem("productos", JSON.stringify(productos));

    cargarProductos();

    Swal.fire({
      icon: "success",
      title: "Producto Editado",
      text: "El producto ha sido editado exitosamente.",
    });
  }

  // Función para confirmar la eliminación de un producto
  function confirmarEliminar(index) {
    // Notificación SweetAlert de confirmación
    Swal.fire({
      icon: "warning",
      title: "¿Está seguro?",
      text: "Esta acción eliminará el producto.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarProducto(index);
      }
    });
  }

  // Función para eliminar un producto
  function eliminarProducto(index) {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    productos.splice(index, 1);
    localStorage.setItem("productos", JSON.stringify(productos));

    // Notificación SweetAlert de éxito
    Swal.fire({
      icon: "success",
      title: "Producto Eliminado",
      text: "El producto ha sido eliminado exitosamente.",
    }).then(() => {
      cargarProductos();
    });
  }

  // Función para filtrar productos por sección
  function filtrarProductos() {
    const seccionSeleccionada = filtroSelect.value;

    if (seccionSeleccionada === "todos") {
        cargarProductos(); // Mostrar todos los productos
    } else {
        const productos = JSON.parse(localStorage.getItem("productos")) || [];
        const productosFiltrados = productos.filter(producto => producto.seccion === seccionSeleccionada);

        if (productosFiltrados.length > 0) {
            mostrarProductosFiltrados(productosFiltrados);
        } else {
            Swal.fire({
                icon: "info",
                title: "Sin Resultados",
                text: "No se encontraron productos en esta sección."
            }).then(() => {
                cargarProductos();
            });
        }
    }
}

  // Función para mostrar productos filtrados
  function mostrarProductosFiltrados(productosFiltrados) {
    productosContainer.innerHTML = "";

    productosFiltrados.forEach((producto, index) => {
      const card = crearProductoCard(producto, index);
      productosContainer.appendChild(card);
    });
  }

  // Función para buscar productos por término de búsqueda
  function buscarProducto() {
    const terminoBusqueda = buscarInput.value.toLowerCase();

    const productos = JSON.parse(localStorage.getItem("productos")) || [];

    const productosEncontrados = productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(terminoBusqueda)
    );

    if (productosEncontrados.length > 0) {
      mostrarProductosFiltrados(productosEncontrados);
    } else {
      // Notificación SweetAlert de información
      Swal.fire({
        icon: "info",
        title: "Sin Resultados",
        text: "No se encontró el producto buscado.",
      }).then(() => {
        cargarProductos();
      });
    }
  }
});
