package com.leiconsulta.acesso;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(1)
public class AcessoFilter extends OncePerRequestFilter {
  private final AcessoService acesso;

  public AcessoFilter(AcessoService acesso) {
    this.acesso = acesso;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      return true;
    }
    String path = request.getRequestURI();
    return "/api/login".equals(path)
        || "/api/acesso".equals(path)
        || "/api/health".equals(path)
        || !path.startsWith("/api/");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    if (!acesso.precisaSenha() || acesso.tokenValido(AcessoController.lerCookie(request))) {
      chain.doFilter(request, response);
      return;
    }
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setCharacterEncoding("UTF-8");
    response.getWriter().write("{\"error\":\"Entre com a senha do gabinete.\"}");
  }
}
