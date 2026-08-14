package com.leiconsulta.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class BackupRunner implements ApplicationRunner {
  private static final Logger LOG = LoggerFactory.getLogger(BackupRunner.class);
  private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
  private static final int MANTER = 14;

  @Override
  public void run(ApplicationArguments args) {
    Path origem = Path.of("data", "leis.db");
    if (!Files.exists(origem)) {
      return;
    }
    try {
      Path pasta = Path.of("data", "backups");
      Files.createDirectories(pasta);
      Path destino = pasta.resolve("leis-" + LocalDateTime.now().format(FMT) + ".db");
      Files.copy(origem, destino, StandardCopyOption.REPLACE_EXISTING);
      limparAntigas(pasta);
      LOG.info("Cópia de segurança: {}", destino.toAbsolutePath());
    } catch (IOException ex) {
      LOG.warn("Não foi possível copiar o acervo: {}", ex.getMessage());
    }
  }

  private static void limparAntigas(Path pasta) throws IOException {
    try (Stream<Path> stream = Files.list(pasta)) {
      List<Path> arquivos = stream
          .filter(p -> p.getFileName().toString().startsWith("leis-") && p.getFileName().toString().endsWith(".db"))
          .sorted(Comparator.comparing((Path p) -> p.getFileName().toString()).reversed())
          .toList();
      for (int i = MANTER; i < arquivos.size(); i++) {
        Files.deleteIfExists(arquivos.get(i));
      }
    }
  }
}
