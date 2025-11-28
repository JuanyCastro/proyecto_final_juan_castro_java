package com.proyectotalento.tiendaapi.service;

import com.proyectotalento.tiendaapi.model.Pedido;
import java.util.List;
import java.util.Optional;

public interface PedidoService {

    List<Pedido> listarPedidos();

    Optional<Pedido> obtenerPedidoPorId(Long id);

    Pedido crearPedido(Pedido pedido);

    void eliminarPedido(Long id);
}