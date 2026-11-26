package com.cliniq

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.SqlExpressionBuilder.inList
import org.jetbrains.exposed.sql.SqlExpressionBuilder.neq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insertIgnore
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

object DatabaseFactory {
    fun init() {
        val envUrl = System.getenv("DB_URL")?.takeIf { it.isNotBlank() }
        val envUser = System.getenv("DB_USER")?.takeIf { it.isNotBlank() }
        val envPass = System.getenv("DB_PASSWORD")

        val config = HikariConfig().apply {
            driverClassName = "com.mysql.cj.jdbc.Driver"
            jdbcUrl = envUrl
                ?: "jdbc:mysql://127.0.0.1:3306/cliniq_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Manila"
            username = envUser ?: "root"
            password = envPass ?: ""
            maximumPoolSize = 5
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        val dataSource = HikariDataSource(config)
        Database.connect(dataSource)

        transaction {
            SchemaUtils.create(
                UsersTable,
                ClinicServicesTable,
                QueueTicketsTable,
                AnnouncementsTable,
                EnrolledStudentsTable
            )

            ClinicServicesTable.update({
                (ClinicServicesTable.serviceCode eq "D") and (ClinicServicesTable.name neq "Other inquiries")
            }) {
                it[serviceCode] = "E"
            }

            ClinicServicesTable.update({ ClinicServicesTable.name eq "Other inquiries" }) {
                it[serviceCode] = "D"
            }

            EnrolledStudentsTable.deleteWhere {
                srCode inList listOf("23-12345", "23-54321", "24-11223")
            }

            val enrolledStudentsList = listOf(
                listOf("24-01919", "Cindy Pauleen Mortel", "CICS", "3rd Year"),
                listOf("24-09958", "Kate Hannah Bem De Leon", "CICS", "3rd Year"),
                listOf("24-09850", "Rechel Umali", "CICS", "3rd Year")
            )

            enrolledStudentsList.forEach { s ->
                EnrolledStudentsTable.insertIgnore {
                    it[srCode] = s[0]
                    it[fullName] = s[1]
                    it[collegeDepartment] = s[2]
                    it[yearLevel] = s[3]
                    it[isEnrolled] = true
                }
            }
        }

        println("✅ CLINIQ Backend successfully connected to MySQL!")
    }

    suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO) { block() }
}