package com.leiconsulta.lei;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeiRepository extends JpaRepository<Lei, Long> {
  List<Lei> findByMunicipioIgnoreCaseOrderByAnoDesc(String municipio);

  List<Lei> findAllByOrderByAnoDescTituloAsc();
}
