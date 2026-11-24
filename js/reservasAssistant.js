/*
 * Widget «Casa John · Reservas»: chat de demo conectado al agente de Dialogflow CX
 * a través de la API del portfolio (POST /api/reservas/chat).
 *
 * Conceptos que usa (por si te los preguntan en una entrevista):
 *
 * - Delegación de eventos: en vez de poner un listener en cada botón «Probar demo»,
 *   hay UN listener en document que mira si el clic vino de un elemento con
 *   [data-reservas-open]. Ventaja: funciona con botones que se añadan después y no
 *   hay que tocar este JS para añadir otro botón. Inconveniente: el listener recibe
 *   TODOS los clics de la página (aquí es un coste despreciable).
 *
 * - Construcción perezosa (lazy): el widget no se crea hasta el primer clic.
 *   Ventaja: cero coste si el visitante nunca abre la demo.
 *
 * - sessionId: identifica la conversación en CX. Mismo sessionId = CX recuerda el
 *   paso en que va. Es un UUID generado en el navegador. No es un secreto ni
 *   autentica a nadie: solo separa conversaciones.
 *
 * - visitorId: el mismo de localStorage que usa el chat del CV ("portfolioVisitorId").
 *   El servidor lo usa para el límite de mensajes (no para la conversación).
 *
 * Todo el texto del agente se escribe con textContent (nunca innerHTML): así, aunque
 * la respuesta contuviera HTML, se mostraría como texto y no se ejecutaría (evita XSS).
 */
(function () {
    // Misma base de Render que el chat del CV; solo cambia la ruta.
    // Para probar contra tu API local sin tocar este archivo, pon en el botón:
    //   data-reservas-api-url="http://localhost:3000/api/reservas/chat"
    // (la API local necesitará FRONTEND_ORIGIN igual al origen desde el que sirvas el portfolio).
    const DEFAULT_API_URL = "https://portfolio-v2-ne7x.onrender.com/api/reservas/chat";
    const VISITOR_ID_STORAGE_KEY = "portfolioVisitorId";
    const MAX_TEXT_LENGTH = 256; // mismo límite que valida el servidor

    const GREETING_MESSAGE =
        "Esta es una demo del asistente de reservas de Casa John, un restaurante ficticio. " +
        "Puedes hacer o cancelar una reserva. Escribe «hola» o elige una opción para empezar.";
    const TYPING_MESSAGE = "Escribiendo…";
    const COLD_START_MESSAGE = "Activando servidor, puede tardar un minuto...";
    const CONNECTION_ERROR_MESSAGE =
        "No se pudo conectar con el asistente de reservas en este momento. Inténtalo de nuevo en unos segundos.";
    const LIMIT_REACHED_MESSAGE = "Has alcanzado el límite de mensajes de la demo de reservas.";
    const ENDED_NOTE = "La conversación ha terminado. Pulsa «Empezar de nuevo» para probar otra vez.";

    const suggestedMessages = [
        "Hola",
        "Quiero hacer una reserva",
        "Quiero cancelar una reserva"
    ];

    // --- Utilidades ---------------------------------------------------------

    // Copia de la función del widget del CV (no la comparto para no tocar ese archivo).
    // Usa la misma clave de localStorage, así que es el mismo visitante en los dos chats.
    function getOrCreateVisitorId() {
        try {
            let visitorId = localStorage.getItem(VISITOR_ID_STORAGE_KEY);

            if (!visitorId) {
                visitorId =
                    window.crypto?.randomUUID?.() ||
                    `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;

                localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId);
            }

            return visitorId;
        } catch (error) {
            // localStorage puede estar bloqueado (modo privado, políticas del navegador).
            return `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
    }

    // El servidor EXIGE formato UUID para el sessionId, así que el plan B tiene que
    // generar un UUID v4 válido. crypto.randomUUID() solo existe en contextos seguros
    // (https o localhost); getRandomValues está disponible en más sitios.
    function createSessionId() {
        if (window.crypto?.randomUUID) {
            return window.crypto.randomUUID();
        }

        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // versión 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC 4122

        const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        if (text) {
            element.textContent = text;
        }
        return element;
    }

    // --- Llamada a la API ---------------------------------------------------

    async function sendReservasMessage(apiUrl, sessionId, text) {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sessionId,
                text,
                visitorId: getOrCreateVisitorId()
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // El servidor devuelve mensajes públicos en español (429, 502, 503…): se muestran tal cual.
            // Guardo el status para distinguir el límite alcanzado (429) de otros fallos.
            const error = new Error(data.error || CONNECTION_ERROR_MESSAGE);
            error.status = response.status;
            error.data = data; // el 429 trae { remaining: 0, limit } para actualizar el contador
            throw error;
        }

        return data;
    }

    // --- Construcción del widget -------------------------------------------

    function buildReservasAssistant() {
        let apiUrl = DEFAULT_API_URL;
        let sessionId = null;
        let started = false;
        let isWaitingForResponse = false;
        let hasEnded = false;        // CX llegó a End Session (ended = true)
        let hasReachedLimit = false; // límite por visitante: NO se reinicia con «Empezar de nuevo»
        let isFirstRequest = true;   // para avisar del arranque en frío de Render solo la primera vez
        let lastTrigger = null;      // botón que abrió el widget, para devolverle el foco al cerrar

        // Fondo oscuro + diálogo centrado (modal): bloquea la interacción con la página de detrás.
        const overlay = createElement("div", "reservas-assistant");
        overlay.hidden = true;

        const panel = createElement("section", "reservas-assistant-panel");
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "true");
        panel.setAttribute("aria-labelledby", "reservas-assistant-title");

        // Las clases portfolio-assistant-* se reutilizan del widget del CV (css/portfolioAssistant.css)
        // para que ambos tengan el mismo aspecto; lo propio de este widget lleva el prefijo reservas-assistant-*.
        const header = createElement("div", "portfolio-assistant-header");
        const title = createElement("div", "portfolio-assistant-title", "Casa John · Reservas");
        title.id = "reservas-assistant-title";

        const headerActions = createElement("div", "reservas-assistant-header-actions");
        const restartButton = createElement("button", "reservas-assistant-restart");
        restartButton.type = "button";
        restartButton.innerHTML = '<i class="fa-solid fa-rotate-left" aria-hidden="true"></i><span>Empezar de nuevo</span>';
        const closeButton = createElement("button", "portfolio-assistant-close");
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Cerrar demo de reservas");
        closeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        headerActions.append(restartButton, closeButton);
        header.append(title, headerActions);

        const messages = createElement("div", "portfolio-assistant-messages");
        messages.setAttribute("aria-live", "polite");

        const usageStatus = createElement("p", "portfolio-assistant-usage");
        usageStatus.hidden = true;

        const suggestions = createElement("div", "reservas-assistant-suggestions");
        const suggestionButtons = suggestedMessages.map((text) => {
            const button = createElement("button", "portfolio-assistant-suggestion", text);
            button.type = "button";
            button.addEventListener("click", () => submitMessage(text));
            suggestions.appendChild(button);
            return button;
        });

        const form = createElement("form", "portfolio-assistant-form");
        const input = createElement("input", "portfolio-assistant-input");
        input.type = "text";
        input.maxLength = MAX_TEXT_LENGTH;
        input.autocomplete = "off";
        input.placeholder = "Escribe tu mensaje...";
        input.setAttribute("aria-label", "Escribe tu mensaje");
        const submit = createElement("button", "portfolio-assistant-submit");
        submit.type = "submit";
        submit.setAttribute("aria-label", "Enviar mensaje");
        submit.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i>';
        form.append(input, submit);

        // Estructura: cabecera + cuerpo. El cuerpo tiene el diagrama del flujo y la columna del chat.
        // El diagrama (js/reservasFlowDiagram.js) es opcional: si ese archivo no cargara, el chat funciona igual.
        const chat = createElement("div", "reservas-assistant-chat");
        chat.append(messages, usageStatus, suggestions, form);

        const flowDiagram = window.ReservasFlowDiagram?.create();
        const body = createElement("div", "reservas-assistant-body");
        if (flowDiagram) {
            body.appendChild(flowDiagram.element);
        }
        body.appendChild(chat);

        panel.append(header, body);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // --- Mensajes y estado ---

        function addMessage(content, type) {
            const message = createElement("div", "portfolio-assistant-message portfolio-assistant-message--" + type);
            message.textContent = content;
            messages.appendChild(message);
            messages.scrollTop = messages.scrollHeight;

            return message;
        }

        // Aviso del sistema (fin de la conversación, límite…): distinto de un mensaje del agente.
        function addNote(content) {
            const note = createElement("div", "reservas-assistant-note", content);
            messages.appendChild(note);
            messages.scrollTop = messages.scrollHeight;
        }

        // Un único sitio decide qué se puede usar: así no se olvida desactivar nada.
        function updateControls() {
            const canWrite = !isWaitingForResponse && !hasEnded && !hasReachedLimit;

            input.disabled = !canWrite;
            submit.disabled = !canWrite;
            suggestionButtons.forEach((button) => {
                button.disabled = !canWrite;
            });
            // Reiniciar mientras hay una petición en curso mezclaría la respuesta con la conversación nueva.
            restartButton.disabled = isWaitingForResponse;
        }

        function updateUsageStatus(remaining, limit) {
            if (Number.isFinite(remaining) && Number.isFinite(limit)) {
                usageStatus.textContent = `Mensajes restantes: ${remaining}/${limit}`;
                usageStatus.hidden = false;
            }
        }

        function startConversation() {
            sessionId = createSessionId();
            hasEnded = false;
            flowDiagram?.reset(); // el diagrama vuelve a empezar con la conversación nueva
            messages.replaceChildren();
            suggestions.hidden = false;
            addMessage(GREETING_MESSAGE, "bot");

            if (hasReachedLimit) {
                addNote(LIMIT_REACHED_MESSAGE);
            }

            updateControls();
        }

        async function submitMessage(rawText) {
            const text = rawText.trim();

            if (!text || isWaitingForResponse || hasEnded || hasReachedLimit) {
                return;
            }

            suggestions.hidden = true;
            addMessage(text, "user");
            input.value = "";

            // Burbuja provisional («escribiendo…») que luego se sustituye por la primera respuesta.
            const pending = addMessage(isFirstRequest ? COLD_START_MESSAGE : TYPING_MESSAGE, "bot");
            pending.classList.add("reservas-assistant-message--pending");
            isWaitingForResponse = true;
            updateControls();

            try {
                const data = await sendReservasMessage(apiUrl, sessionId, text);
                isFirstRequest = false;

                // Un turno puede traer varios mensajes del agente: la primera burbuja reutiliza
                // la provisional y el resto se añaden debajo, en orden.
                const replies = Array.isArray(data.messages) ? data.messages.filter(Boolean) : [];

                if (replies.length === 0) {
                    pending.remove();
                } else {
                    pending.textContent = replies[0];
                    replies.slice(1).forEach((reply) => addMessage(reply, "bot"));
                }

                updateUsageStatus(data.remaining, data.limit);
                flowDiagram?.update(data.flow, data.page); // ilumina el flow/página actual y marca el camino

                if (data.remaining === 0) {
                    hasReachedLimit = true;
                }

                if (data.ended === true) {
                    hasEnded = true;
                    addNote(ENDED_NOTE);
                } else if (hasReachedLimit) {
                    addNote(LIMIT_REACHED_MESSAGE);
                }
            } catch (error) {
                pending.textContent = error.status ? error.message : CONNECTION_ERROR_MESSAGE;

                if (error.status === 429) {
                    hasReachedLimit = true;
                    updateUsageStatus(error.data?.remaining, error.data?.limit);
                }
            } finally {
                pending.classList.remove("reservas-assistant-message--pending");
                isWaitingForResponse = false;
                updateControls();

                if (!input.disabled && !overlay.hidden) {
                    input.focus(); // un input deshabilitado pierde el foco: se lo devolvemos
                }
            }
        }

        // --- Abrir / cerrar ---

        function open(trigger) {
            lastTrigger = trigger || null;
            apiUrl = trigger?.dataset.reservasApiUrl || DEFAULT_API_URL;

            // La conversación se crea en la primera apertura y se conserva si cierras y vuelves a abrir.
            if (!started) {
                started = true;
                startConversation();
            }

            overlay.hidden = false;
            document.body.classList.add("reservas-assistant-open");

            if (!input.disabled) {
                input.focus();
            } else {
                closeButton.focus();
            }
        }

        function close() {
            overlay.hidden = true;
            document.body.classList.remove("reservas-assistant-open");
            lastTrigger?.focus(); // accesibilidad: el foco vuelve al botón que abrió el diálogo
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            submitMessage(input.value);
        });

        restartButton.addEventListener("click", startConversation);
        closeButton.addEventListener("click", close);

        // Clic en el fondo oscuro (no dentro del panel) cierra. Se usa pointerdown y no click:
        // si seleccionas texto dentro del panel y sueltas fuera, "click" se dispararía en el fondo.
        overlay.addEventListener("pointerdown", (event) => {
            if (event.target === overlay) {
                close();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (overlay.hidden) {
                return;
            }

            if (event.key === "Escape") {
                close();
                return;
            }

            // Trampa de foco: en un diálogo modal, Tab no debe salir hacia la página de detrás.
            if (event.key === "Tab") {
                const focusable = Array.from(panel.querySelectorAll("button:not([disabled]), input:not([disabled])"))
                    .filter((element) => element.offsetParent !== null);

                if (focusable.length === 0) {
                    event.preventDefault();
                    return;
                }

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        return { open };
    }

    // --- Arranque: delegación de eventos + construcción perezosa ------------

    let assistant = null;

    document.addEventListener("click", (event) => {
        const trigger = event.target.closest?.("[data-reservas-open]");

        if (!trigger) {
            return;
        }

        event.preventDefault();

        if (!assistant) {
            assistant = buildReservasAssistant();
        }

        assistant.open(trigger);
    });
})();
