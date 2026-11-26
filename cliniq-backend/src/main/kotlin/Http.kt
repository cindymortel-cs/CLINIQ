package com.cliniq

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.response.*

object JwtConfig {
    const val SECRET = "cliniq-local-wifi-secret-key-2026"
    const val ISSUER = "http://0.0.0.0:8080"
    const val AUDIENCE = "cliniq-users"
    const val REALM = "CLINIQ Clinic System"
    val algorithm: Algorithm = Algorithm.HMAC256(SECRET)

    fun generateToken(userId: Int, role: String, fullName: String): String =
        JWT.create()
            .withAudience(AUDIENCE)
            .withIssuer(ISSUER)
            .withClaim("userId", userId)
            .withClaim("role", role)
            .withClaim("fullName", fullName)
            .sign(algorithm)
}

fun Application.configureHttp() {
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        anyHost() // Required so Android phones & staff laptops on local Wi-Fi can connect
    }

    install(Authentication) {
        jwt("auth-jwt") {
            realm = JwtConfig.REALM
            verifier(
                JWT.require(JwtConfig.algorithm)
                    .withAudience(JwtConfig.AUDIENCE)
                    .withIssuer(JwtConfig.ISSUER)
                    .build()
            )
            validate { credential ->
                if (credential.payload.getClaim("userId").asInt() != null) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid or expired session token"))
            }
        }
    }
}