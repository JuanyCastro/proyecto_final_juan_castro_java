package com.proyectotalento.tiendaapi.service;

import com.proyectotalento.tiendaapi.model.Articulo;
import com.proyectotalento.tiendaapi.repository.ArticuloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArticuloServiceImpl implements ArticuloService {

    private final ArticuloRepository articuloRepository;

    @Autowired
    public ArticuloServiceImpl(ArticuloRepository articuloRepository) {
        this.articuloRepository = articuloRepository;
    }

    @Override
    public List<Articulo> listarArticulos() {
        return articuloRepository.findByActivoTrue();
    }

    @Override
    public Optional<Articulo> obtenerArticuloPorId(Long id) {
        return articuloRepository.findById(id);
    }

    @Override
    public Articulo guardarArticulo(Articulo articulo) {
        articulo.setActivo(true);
        return articuloRepository.save(articulo);
    }

    @Override
    public Articulo actualizarArticulo(Long id, Articulo articulo) {
        Articulo existente = articuloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

        existente.setNombre(articulo.getNombre());
        existente.setDescripcion(articulo.getDescripcion());
        existente.setPrecio(articulo.getPrecio());
        existente.setImagenUrl(articulo.getImagenUrl());
        existente.setCategoria(articulo.getCategoria());

        return articuloRepository.save(existente);
    }

    @Override
    public void eliminarArticulo(Long id) {
        Articulo articulo = articuloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

        articulo.setActivo(false);
        articuloRepository.save(articulo);
    }
}
