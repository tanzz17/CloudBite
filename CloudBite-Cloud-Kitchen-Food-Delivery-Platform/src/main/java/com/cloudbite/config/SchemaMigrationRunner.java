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
        ensureIdGeneratorTable();
        ensureIdGeneratorRow("users");
        ensureIdGeneratorRow("cart");
        ensureUserFavoritesTable();
    }

    private void ensureIdGeneratorTable() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS id_generator (
                    entity_name VARCHAR(100) NOT NULL PRIMARY KEY,
                    next_id BIGINT NOT NULL
                )
                """);
    }

    private void ensureIdGeneratorRow(String tableName) {
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

        Integer generatorRowExists = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM id_generator
                WHERE entity_name = ?
                """,
                Integer.class,
                tableName
        );

        if (generatorRowExists != null && generatorRowExists > 0) {
            return;
        }

        Long nextId = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(id), 0) + 1 FROM " + tableName,
                Long.class
        );

        jdbcTemplate.update(
                "INSERT INTO id_generator (entity_name, next_id) VALUES (?, ?)",
                tableName,
                nextId == null ? 1L : nextId
        );
    }

    private void ensureUserFavoritesTable() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS user_favorites (
                    user_id BIGINT NOT NULL,
                    kitchen_id BIGINT NOT NULL,
                    PRIMARY KEY (user_id, kitchen_id)
                )
                """);
    }
}
