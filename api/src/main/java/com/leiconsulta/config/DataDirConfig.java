package com.leiconsulta.config;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.stereotype.Component;

@Component
public class DataDirConfig {
  @PostConstruct
  public void criarPasta() throws Exception {
    Files.createDirectories(Path.of("data"));
  }
}
