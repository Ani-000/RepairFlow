package com.repairflow.config;

import com.repairflow.entity.User;
import com.repairflow.repository.UserRepository;
import com.repairflow.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.extractClaims(header.substring(7).trim());
                String email = claims.getSubject();
                if (email == null || email.isBlank()) throw new IllegalArgumentException("Invalid token subject");

                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new IllegalArgumentException("Account not found"));

                var authentication = new UsernamePasswordAuthenticationToken(
                        user.email, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + user.role.name())));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception exception) {
                SecurityContextHolder.clearContext();
                log.warn("JWT authentication failed for {} {}: {}",
                        request.getMethod(), request.getRequestURI(), exception.getClass().getSimpleName());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
