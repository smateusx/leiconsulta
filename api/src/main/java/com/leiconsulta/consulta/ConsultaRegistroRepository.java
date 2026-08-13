package com.leiconsulta.consulta;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultaRegistroRepository extends JpaRepository<ConsultaRegistro, Long> {
  List<ConsultaRegistro> findAllByOrderByCriadoEmDesc();

  Optional<ConsultaRegistro> findByCodigoIgnoreCase(String codigo);
}
