package com.leiconsulta.acesso;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AcessoService {
  private static final long DURACAO_MS = 12 * 60 * 60 * 1000L;
  private final ConcurrentHashMap<String, Long> sessoes = new ConcurrentHashMap<>();

  @Value("${leiconsulta.senha:}")
  private String senha;

  public boolean precisaSenha() {
    return senha != null && !senha.isBlank();
  }

  public boolean tokenValido(String token) {
    if (!precisaSenha()) {
      return true;
    }
    if (token == null || token.isBlank()) {
      return false;
    }
    Long expira = sessoes.get(token);
    if (expira == null || expira < Instant.now().toEpochMilli()) {
      sessoes.remove(token);
      return false;
    }
    return true;
  }

  public String entrar(String tentativa) {
    if (!precisaSenha()) {
      return "";
    }
    if (tentativa == null || !senha.equals(tentativa)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Senha incorreta.");
    }
    String token = UUID.randomUUID().toString();
    sessoes.put(token, Instant.now().toEpochMilli() + DURACAO_MS);
    return token;
  }

  public void sair(String token) {
    if (token != null) {
      sessoes.remove(token);
    }
  }

  public Map<String, Object> status(String token) {
    boolean logado = tokenValido(token);
    return Map.of(
        "precisaSenha", precisaSenha(),
        "logado", !precisaSenha() || logado);
  }
}
