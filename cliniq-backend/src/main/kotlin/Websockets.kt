package com.cliniq

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.Collections
import kotlin.time.Duration.Companion.seconds

object QueueBroadcaster {
    private val sessions = Collections.synchronizedSet(LinkedHashSet<DefaultWebSocketServerSession>())
    private val json = Json { encodeDefaults = true }

    fun register(session: DefaultWebSocketServerSession) {
        sessions.add(session)
    }

    fun unregister(session: DefaultWebSocketServerSession) {
        sessions.remove(session)
    }

    suspend fun broadcast(wsEvent: WsEvent) {
        val payload = json.encodeToString(wsEvent)
        val deadSessions = mutableListOf<DefaultWebSocketServerSession>()
        val snapshot = synchronized(sessions) { sessions.toList() }
        for (session in snapshot) {
            try {
                session.send(Frame.Text(payload))
            } catch (_: Exception) {
                deadSessions.add(session)
            }
        }
        if (deadSessions.isNotEmpty()) {
            synchronized(sessions) { sessions.removeAll(deadSessions.toSet()) }
        }
    }
}

fun Application.configureWebsockets() {
    install(WebSockets) {
        pingPeriod = 15.seconds
        timeout = 30.seconds
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    routing {
        webSocket("/ws/queue") {
            QueueBroadcaster.register(this)
            try {
                send(Frame.Text("""{"event":"CONNECTED","message":"Connected to CLINIQ Real-Time Queue"}"""))
                for (frame in incoming) {
                    if (frame is Frame.Text && frame.readText() == "PING") {
                        send(Frame.Text("PONG"))
                    }
                }
            } finally {
                QueueBroadcaster.unregister(this)
            }
        }
    }
}