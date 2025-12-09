package com.proyectotalento.tiendaapi.repository;

import com.proyectotalento.tiendaapi.model.Articulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticuloRepository extends JpaRepository<Articulo, Long> {
    List<Articulo> findByActivoTrue();
}

