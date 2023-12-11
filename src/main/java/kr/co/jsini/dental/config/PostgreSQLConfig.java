package kr.co.jsini.dental.config;

import java.sql.Connection;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class PostgreSQLConfig  implements ApplicationRunner {
  
    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    public PostgreSQLConfig(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("postgreSQL config Load : {}", dataSource.getClass());
        try (Connection connection = dataSource.getConnection()){
            //System.out.println(" > dataSource Class > " + dataSource.getClass());
            //System.out.println(" > URL > " + connection.getMetaData().getURL());
            //System.out.println(" > userName > " + connection.getMetaData().getUserName());
            
        //log.info("postgreSQL config Load URL : {}", connection.getMetaData().getURL());
        
        //log.info("postgreSQL config Load userName : {}", dataSource.getClass());

            //Statement statement = connection.createStatement();
            //String sql = "CREATE TABLE SMFR.TBL_TEST(NO INTEGER NOT NULL, TEST_NAME VARCHAR(255), PRIMARY KEY (NO))";
            //statement.executeUpdate(sql);
        }

        //jdbcTemplate.execute("INSERT INTO SMFR.TBL_TEST VALUES ( (select max(no)+1 from SMFR.TBL_TEST ) , 'ssjeong')");
    }
}
