package com.cloudbite.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class SchemaMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public SchemaMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        ensureAutoIncrement("users");
        ensureAutoIncrement("cart");
    }

    private void ensureAutoIncrement(String tableName) {
        Integer tableExists = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = DATABASE() AND table_name = ?
                """,
                Integer.class,
                tableName
        );

        if (tableExists == null || tableExists == 0) {
            return;
        }

        String extra = jdbcTemplate.query(
                """
                SELECT extra
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = ?
                  AND column_name = 'id'
                """,
                rs -> rs.next() ? rs.getString("extra") : null,
                tableName
        );

        if (extra != null && extra.toLowerCase().contains("auto_increment")) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE " + tableName + " MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT");
    }
}
