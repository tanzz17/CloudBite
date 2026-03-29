package com.cloudbite.config;

public class JwtConstant {

    // Best practice: Store this in application.properties/yml
    // For now, this is okay for development purposes.
    public static final String SECRET_KEY = "Your_Very_Long_And_Secure_Secret_Key_That_Should_Be_At_Least_256Bits";

    public static final String TOKEN_PREFIX = "Bearer ";

    public static final String HEADER_STRING = "Authorization";

}