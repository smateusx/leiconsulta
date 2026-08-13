package com.leiconsulta.lei;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeiRepository extends JpaRepository<Lei, Long> {
  List<Lei> findByMunicipioIgnoreCaseOrderByAnoDesc(String municipio);

  List<Lei> findAllByOrderByAnoDescTituloAsc();

  boolean existsByMunicipioIgnoreCaseAndTituloIgnoreCase(String municipio, String titulo);

  boolean existsByMunicipioIgnoreCaseAndTituloIgnoreCaseAndIdNot(
      String municipio, String titulo, Long id);

  boolean existsByMunicipioIgnoreCaseAndNumeroIgnoreCase(String municipio, String numero);

  boolean existsByMunicipioIgnoreCaseAndNumeroIgnoreCaseAndIdNot(
      String municipio, String numero, Long id);
}
