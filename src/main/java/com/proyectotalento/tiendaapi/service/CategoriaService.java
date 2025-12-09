package com.proyectotalento.tiendaapi.service;

import com.proyectotalento.tiendaapi.model.Categoria;
import java.util.List;
import java.util.Optional;

public interface CategoriaService {

    List<Categoria> listarCategorias();

    Optional<Categoria> obtenerCategoriaPorId(Long id);

    Categoria guardarCategoria(Categoria categoria);

    Categoria actualizarCategoria(Long id, Categoria categoria);

    void eliminarCategoria(Long id);
}
