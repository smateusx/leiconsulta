package com.leiconsulta.acesso;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AcessoController {
  public static final String COOKIE = "lc_gabinete";

  private final AcessoService acesso;

  public AcessoController(AcessoService acesso) {
    this.acesso = acesso;
  }

  @GetMapping("/acesso")
  public Map<String, Object> status(HttpServletRequest request) {
    return acesso.status(lerCookie(request));
  }

  @PostMapping("/login")
  public Map<String, Object> login(
      @RequestBody Map<String, String> body, HttpServletResponse response) {
    String senha = body == null ? null : body.get("senha");
    String token = acesso.entrar(senha);
    Cookie cookie = new Cookie(COOKIE, token);
    cookie.setHttpOnly(true);
    cookie.setPath("/");
    cookie.setMaxAge(12 * 60 * 60);
    response.addCookie(cookie);
    return Map.of("ok", true);
  }

  @PostMapping("/sair")
  public Map<String, Object> sair(HttpServletRequest request, HttpServletResponse response) {
    acesso.sair(lerCookie(request));
    Cookie cookie = new Cookie(COOKIE, "");
    cookie.setHttpOnly(true);
    cookie.setPath("/");
    cookie.setMaxAge(0);
    response.addCookie(cookie);
    return Map.of("ok", true);
  }

  static String lerCookie(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null) {
      return null;
    }
    for (Cookie cookie : cookies) {
      if (COOKIE.equals(cookie.getName())) {
        return cookie.getValue();
      }
    }
    return null;
  }
}
