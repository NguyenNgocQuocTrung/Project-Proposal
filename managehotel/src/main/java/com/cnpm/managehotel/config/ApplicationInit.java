package com.cnpm.managehotel.config;

import com.cnpm.managehotel.constant.UserRole;
import com.cnpm.managehotel.entity.User;
import com.cnpm.managehotel.repository.UserRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class ApplicationInit {

    @NonFinal
    private static final String ADMIN_USER_NAME = "Admin";

    @NonFinal
    private static final String ADMIN_PASSWORD = "admin";

    @NonFinal
    private static final String ADMIN_EMAIL = "admin@gmail.com";

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepo userRepo) {
        log.info("Initializing application.....");
        return args -> {
            if (!userRepo.findByEmail(ADMIN_EMAIL).isPresent()) {

                User user = User.builder()
                        .fullName(ADMIN_USER_NAME)
                        .email(ADMIN_EMAIL)
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .role(UserRole.ADMIN)
                        .build();

                userRepo.save(user);
                log.warn("Admin user has been created with default password: admin, please change it");
            }
            log.info("Application initialization completed .....");
        };
    }
}
