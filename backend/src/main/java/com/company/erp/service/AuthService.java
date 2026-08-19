package com.company.erp.service;

import com.company.erp.dto.*;
import com.company.erp.entity.PasswordResetToken;
import com.company.erp.entity.User;
import com.company.erp.repository.PasswordResetTokenRepository;
import com.company.erp.repository.UserRepository;
import com.company.erp.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = (User) authentication.getPrincipal();
        String firstName = "";
        String lastName = "";
        Long id = null;
        if (user.getEmployee() != null) {
            firstName = user.getEmployee().getFirstName();
            lastName = user.getEmployee().getLastName();
            id = user.getEmployee().getId();
        }

        return new LoginResponse(jwt, user.getEmail(), user.getRole().name(), firstName, lastName, id);
    }

    @Transactional
    public MessageResponse generateForgotPasswordToken(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            tokenRepository.deleteByUser(user);

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(token);
            resetToken.setUser(user);
            resetToken.setExpiryDate(LocalDateTime.now().plusHours(2)); 

            tokenRepository.save(resetToken);

            System.out.println("==========================================================================");
            System.out.println("PASSWORD RESET TOKEN FOR " + user.getEmail() + ": " + token);
            System.out.println("Use this token to reset your password via POST /api/auth/reset-password");
            System.out.println("==========================================================================");
            
            return new MessageResponse("success", "Password reset link sent successfully. Please check your email (and developer console).");
        }
        
        return new MessageResponse("success", "If that email is registered, a password reset link has been generated and sent.");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(request.getToken());

        if (tokenOpt.isEmpty()) {
            return new MessageResponse("error", "Invalid password reset token.");
        }

        PasswordResetToken resetToken = tokenOpt.get();

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            return new MessageResponse("error", "Password reset token has expired.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return new MessageResponse("success", "Password has been reset successfully. You can now login with your new password.");
    }
}
