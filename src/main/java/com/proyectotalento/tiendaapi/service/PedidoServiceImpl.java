package com.proyectotalento.tiendaapi.service;

import com.proyectotalento.tiendaapi.model.Articulo;
import com.proyectotalento.tiendaapi.model.LineaPedido;
import com.proyectotalento.tiendaapi.model.Pedido;
import com.proyectotalento.tiendaapi.repository.ArticuloRepository;
import com.proyectotalento.tiendaapi.repository.PedidoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ArticuloRepository articuloRepository;

    @Autowired
    public PedidoServiceImpl(PedidoRepository pedidoRepository, ArticuloRepository articuloRepository) {
        this.pedidoRepository = pedidoRepository;
        this.articuloRepository = articuloRepository;
    }

    @Override
    public List<Pedido> listarPedidos() {
        return pedidoRepository.findByActivoTrue();
    }

    @Override
    public Optional<Pedido> obtenerPedidoPorId(Long id) {
        return pedidoRepository.findById(id);
    }

    @Override
    public Pedido crearPedido(Pedido pedido) {
        pedido.setFecha(LocalDateTime.now());

        double total = 0.0;

        for (LineaPedido linea : pedido.getLineas()) {

            Articulo art = articuloRepository.findById(linea.getArticulo().getId())
                    .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

            linea.setPrecioUnitario(art.getPrecio());

            double subtotal = linea.getCantidad() * art.getPrecio();
            linea.setSubtotal(subtotal);

            total += subtotal;

            linea.setPedido(pedido);
        }

        pedido.setTotal(total);
        pedido.setActivo(true);

        return pedidoRepository.save(pedido);
    }

    @Override
    public void eliminarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        pedido.setActivo(false);
        pedidoRepository.save(pedido);
    }
}

