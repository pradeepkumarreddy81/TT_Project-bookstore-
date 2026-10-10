package com.bookstore.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
public class StartupLogger {

    private final Environment environment;

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    public StartupLogger(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logStartupInfo() {
        String[] activeProfiles = environment.getActiveProfiles();
        String profilesString = (activeProfiles.length > 0) ? String.join(", ", activeProfiles) : "default";

        String hostPort = extractHostAndPort(datasourceUrl);

        log.info("================================================================================");
        log.info("ONLINE BOOKSTORE API STARTED");
        log.info("Active Profile(s) : [{}]", profilesString);
        log.info("Database Host/Port: {}", hostPort);
        log.info("================================================================================");
    }

    private String extractHostAndPort(String url) {
        if (url == null || url.isBlank()) {
            return "UNKNOWN (url not configured)";
        }
        try {
            // Match pattern like jdbc:mysql://(user:pass@)?host(:port)?/...
            Pattern pattern = Pattern.compile("jdbc:[a-zA-Z0-9]+://(?:[^@/]+@)?([^/?#:]+)(?::(\\d+))?");
            Matcher matcher = pattern.matcher(url);
            if (matcher.find()) {
                String host = matcher.group(1);
                String port = matcher.group(2) != null ? matcher.group(2) : "3306";
                return host + ":" + port;
            }
        } catch (Exception e) {
            log.warn("Could not parse database host/port from URL: {}", e.getMessage());
        }
        return "UNKNOWN";
    }
}
