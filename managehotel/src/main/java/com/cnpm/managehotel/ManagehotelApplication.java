package com.cnpm.managehotel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class ManagehotelApplication {

	public static void main(String[] args) {
		SpringApplication.run(ManagehotelApplication.class, args);
	}

}
