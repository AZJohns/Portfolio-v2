(function () {
    const ASSISTANT_API_URL = "https://portfolio-v2-ne7x.onrender.com/api/chat"; 
    const VISITOR_ID_STORAGE_KEY = "portfolioVisitorId";
    const CONNECTION_ERROR_MESSAGE =
        "No se pudo conectar con el asistente en este momento. Puedes contactar con John directamente por LinkedIn o email.";
    const LIMIT_REACHED_MESSAGE = "Has alcanzado el límite de 10 preguntas para este asistente.";

    const suggestedQuestions = [
        "¿Qué experiencia tiene John?",
        "¿Qué hizo John en sus prácticas?",
        "¿Qué tecnologías utiliza?",
        "¿Tiene experiencia con React y Node.js?",
        "¿Qué proyectos tiene?",
        "¿Dónde puedo ver su CV?",
        "¿Está abierto a oportunidades?",
        "¿Cómo puedo contactarlo?"
    ];

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
            return `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
    }

    async function askPortfolioAssistant(userMessage) {
        const response = await fetch(ASSISTANT_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: userMessage,
                visitorId: getOrCreateVisitorId()
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "No se pudo obtener respuesta del asistente.");
        }

        return data;
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

    function addMessage(messages, content, type) {
        const message = createElement("div", "portfolio-assistant-message portfolio-assistant-message--" + type);
        message.textContent = content;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;

        return message;
    }

    function buildAssistant() {
        const widget = createElement("section", "portfolio-assistant");
        widget.setAttribute("aria-label", "Asistente del portfolio");

        const toggle = createElement("button", "portfolio-assistant-toggle");
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", "portfolio-assistant-panel");
        toggle.innerHTML = '<i class="fa-solid fa-message" aria-hidden="true"></i><span>Pregúntame</span>';

        const panel = createElement("div", "portfolio-assistant-panel");
        panel.id = "portfolio-assistant-panel";
        panel.setAttribute("hidden", "");

        const header = createElement("div", "portfolio-assistant-header");
        const title = createElement("div", "portfolio-assistant-title", "Asistente del Portfolio");
        const closeButton = createElement("button", "portfolio-assistant-close");
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Cerrar asistente");
        closeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        header.append(title, closeButton);

        const messages = createElement("div", "portfolio-assistant-messages");
        messages.setAttribute("aria-live", "polite");

        const usageStatus = createElement("p", "portfolio-assistant-usage");
        usageStatus.setAttribute("aria-live", "polite");
        usageStatus.hidden = true;

        const suggestions = createElement("div", "portfolio-assistant-suggestions");
        const suggestionButtons = suggestedQuestions.map((question) => {
            const button = createElement("button", "portfolio-assistant-suggestion", question);
            button.type = "button";
            button.addEventListener("click", () => submitQuestion(question));
            suggestions.appendChild(button);
            return button;
        });

        const form = createElement("form", "portfolio-assistant-form");
        const input = createElement("input", "portfolio-assistant-input");
        input.type = "text";
        input.placeholder = "Pregunta sobre John...";
        input.setAttribute("aria-label", "Escribe tu pregunta");
        const submit = createElement("button", "portfolio-assistant-submit");
        submit.type = "submit";
        submit.setAttribute("aria-label", "Enviar pregunta");
        submit.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i>';
        form.append(input, submit);

        let isWaitingForResponse = false;
        let hasReachedLimit = false;

        function setPanelState(isOpen) {
            panel.toggleAttribute("hidden", !isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
            widget.classList.toggle("is-open", isOpen);

            if (isOpen && !input.disabled) {
                input.focus();
            }
        }

        function setLoadingState(isLoading) {
            isWaitingForResponse = isLoading;
            input.disabled = isLoading || hasReachedLimit;
            submit.disabled = isLoading || hasReachedLimit;
            suggestionButtons.forEach((button) => {
                button.disabled = isLoading || hasReachedLimit;
            });
        }

        function updateUsageStatus(remaining, limit) {
            if (Number.isFinite(remaining) && Number.isFinite(limit)) {
                usageStatus.textContent = `Preguntas restantes: ${remaining}/${limit}`;
                usageStatus.hidden = false;
            }
        }

        async function submitQuestion(question) {
            const cleanQuestion = question.trim();

            if (!cleanQuestion || isWaitingForResponse) {
                return;
            }

            if (hasReachedLimit) {
                addMessage(messages, LIMIT_REACHED_MESSAGE, "bot");
                return;
            }

            addMessage(messages, cleanQuestion, "user");
            input.value = "";

            const loadingMessage = addMessage(messages, "Pensando...", "bot");
            setLoadingState(true);

            try {
                const data = await askPortfolioAssistant(cleanQuestion);
                loadingMessage.textContent = data.answer || CONNECTION_ERROR_MESSAGE;
                updateUsageStatus(data.remaining, data.limit);

                if (data.remaining === 0) {
                    hasReachedLimit = true;
                }
            } catch (error) {
                const errorMessage = error.message === LIMIT_REACHED_MESSAGE ? LIMIT_REACHED_MESSAGE : CONNECTION_ERROR_MESSAGE;
                loadingMessage.textContent = errorMessage;

                if (error.message === LIMIT_REACHED_MESSAGE) {
                    hasReachedLimit = true;
                }
            } finally {
                setLoadingState(false);
            }
        }

        toggle.addEventListener("click", () => {
            setPanelState(panel.hasAttribute("hidden"));
        });

        closeButton.addEventListener("click", () => setPanelState(false));

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            submitQuestion(input.value);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !panel.hasAttribute("hidden")) {
                setPanelState(false);
            }
        });

        panel.append(header, messages, usageStatus, suggestions, form);
        widget.append(panel, toggle);
        document.body.appendChild(widget);

        addMessage(
            messages,
            "Hola, soy el asistente del portfolio de John. Respondo preguntas sobre su experiencia, proyectos, tecnologías y CV. Mis respuestas se basan únicamente en la información disponible en este portfolio.",
            "bot"
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", buildAssistant);
    } else {
        buildAssistant();
    }
})();
