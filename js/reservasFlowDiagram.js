/*
 * Diagrama del flujo de «Casa John · Reservas».
 *
 * Es un SVG dibujado a mano (sin librerías): los flows son recuadros, las páginas son
 * nodos y las flechas son trazados fijos. Se ilumina el sitio donde va la conversación
 * con la respuesta { flow, page } de la API y se marca el camino recorrido.
 *
 * Conceptos que usa:
 *
 * - SVG: gráfico vectorial descrito con elementos XML (<rect>, <text>, <path>). Se escala sin
 *   perder calidad (viewBox) y se estiliza con CSS como el HTML. Ventaja frente a una imagen:
 *   se puede cambiar el estado de cada pieza por código. Inconveniente: las coordenadas se
 *   calculan a mano, y si cambia el agente hay que retocar este archivo.
 *   Los elementos SVG se crean con createElementNS (con su "namespace"); con createElement
 *   normal el navegador los trataría como HTML desconocido y no se dibujarían.
 *
 * - Grafo y búsqueda en anchura (BFS): las flechas forman un grafo dirigido. CX atraviesa
 *   varias páginas dentro de un mismo turno (p. ej. «Datos de la reserva» → «Comprobar
 *   disponibilidad» → «Datos del cliente») y la API solo devuelve la última. Para marcar
 *   también las intermedias, se busca el camino más corto entre la página anterior y la
 *   nueva sobre este grafo. Inconveniente: es una DEDUCCIÓN, no un dato de CX; si el agente
 *   salta por un camino que aquí no está dibujado, solo se marca la página de destino.
 *
 * MANTENIMIENTO (si cambia el agente): editar FLOWS, NODES y EDGES de aquí abajo.
 *   - `pageName` debe coincidir con el displayName de CX (se ignoran mayúsculas y tildes:
 *     en el agente real la página se llama «Que cambiar», sin tilde).
 *   - Páginas comprobadas con el agente real: Start Page, Horario, Modificar, Datos de la reserva,
 *     Datos del cliente, Pedir Nota, Escribir Nota, Confirmar, Que cambiar, Localizar Reserva,
 *     End Session.
 *   - NO comprobadas (CX las cruza en el mismo turno o necesitan datos reales, así que la API
 *     nunca las devolvió como página final): Comprobar disponibilidad, Crear reserva,
 *     Buscar reserva, Confirmar cancelación, Cancelar reserva. Se marcan por deducción.
 */
(function () {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const VIEW_WIDTH = 560;
    const VIEW_HEIGHT = 530;
    const NODE_HEIGHT = 28;

    // Recuadros de flow. `flowName` = displayName del flow en CX.
    const FLOWS = [
        { flowName: "Default Start Flow", title: "Default Start Flow", x: 10, y: 10, w: 540, h: 78 },
        { flowName: "Reservar", title: "Reservar", x: 10, y: 112, w: 310, h: 354 },
        { flowName: "Gestionar", title: "Gestionar", x: 340, y: 112, w: 210, h: 222 },
        { flowName: "Pasar a una persona", title: "Pasar a una persona", x: 340, y: 350, w: 210, h: 76 }
    ];

    // Nodos (páginas). `flowOnly`: representa al flow entero (no tiene una página propia que se vea).
    const NODES = [
        { id: "start", flowName: "Default Start Flow", pageName: "Start Page", label: "Start Page", x: 220, y: 44, w: 120 },
        { id: "horario", flowName: "Default Start Flow", pageName: "Horario", label: "Horario", x: 47, y: 44, w: 120 },
        { id: "modificar", flowName: "Default Start Flow", pageName: "Modificar", label: "Modificar", x: 385, y: 44, w: 120 },

        { id: "datos", flowName: "Reservar", pageName: "Datos de la reserva", label: "Datos de la reserva", x: 22, y: 150, w: 170 },
        { id: "comprobar", flowName: "Reservar", pageName: "Comprobar disponibilidad", label: "Comprobar disponibilidad", x: 22, y: 196, w: 170 },
        { id: "cliente", flowName: "Reservar", pageName: "Datos del cliente", label: "Datos del cliente", x: 22, y: 242, w: 170 },
        { id: "nota", flowName: "Reservar", pageName: "Pedir Nota", label: "Pedir Nota", x: 22, y: 288, w: 170 },
        { id: "escribir", flowName: "Reservar", pageName: "Escribir Nota", label: "Escribir Nota", x: 214, y: 334, w: 94 },
        { id: "confirmar", flowName: "Reservar", pageName: "Confirmar", label: "Confirmar", x: 22, y: 380, w: 170 },
        { id: "cambiar", flowName: "Reservar", pageName: "Que cambiar", label: "Qué cambiar", x: 214, y: 380, w: 94 },
        { id: "crear", flowName: "Reservar", pageName: "Crear reserva", label: "Crear reserva", x: 22, y: 426, w: 170 },

        { id: "localizar", flowName: "Gestionar", pageName: "Localizar Reserva", label: "Localizar reserva", x: 355, y: 150, w: 180 },
        { id: "buscar", flowName: "Gestionar", pageName: "Buscar reserva", label: "Buscar reserva", x: 355, y: 196, w: 180 },
        { id: "confirmarc", flowName: "Gestionar", pageName: "Confirmar cancelación", label: "Confirmar cancelación", x: 355, y: 242, w: 180 },
        { id: "cancelar", flowName: "Gestionar", pageName: "Cancelar reserva", label: "Cancelar reserva", x: 355, y: 288, w: 180 },

        { id: "persona", flowName: "Pasar a una persona", flowOnly: true, label: "Derivar a una persona", x: 355, y: 378, w: 180 },

        { id: "end", pageName: "End Session", label: "End Session", x: 10, y: 490, w: 540, h: 32, isEnd: true }
    ];

    // Flechas: from → to, con el trazado SVG (d) que las dibuja. Varias comparten tramos a propósito
    // (el "bus" horizontal de y=100 sale de Start Page hacia los flows).
    const EDGES = [
        { from: "start", to: "horario", d: "M220,58 H167" },
        { from: "start", to: "modificar", d: "M340,58 H385" },
        { from: "horario", to: "datos", d: "M107,72 V150" },
        { from: "start", to: "datos", d: "M280,72 V100 H107 V150" },
        { from: "modificar", to: "localizar", d: "M445,72 V150" },
        { from: "start", to: "localizar", d: "M280,72 V100 H445 V150" },
        { from: "start", to: "persona", d: "M280,72 V100 H556 V392 H535" },

        { from: "datos", to: "comprobar", d: "M107,178 V196" },
        { from: "comprobar", to: "cliente", d: "M107,224 V242" },
        { from: "cliente", to: "nota", d: "M107,270 V288" },
        { from: "nota", to: "escribir", d: "M192,302 H261 V334" },
        { from: "nota", to: "confirmar", d: "M107,316 V380" },
        { from: "escribir", to: "confirmar", d: "M214,348 H150 V380" },
        { from: "confirmar", to: "cambiar", d: "M192,388 H214" },
        { from: "cambiar", to: "confirmar", d: "M214,402 H192" },
        { from: "confirmar", to: "crear", d: "M107,408 V426" },
        { from: "crear", to: "end", d: "M107,454 V490" },

        { from: "localizar", to: "buscar", d: "M445,178 V196" },
        { from: "buscar", to: "confirmarc", d: "M445,224 V242" },
        { from: "confirmarc", to: "cancelar", d: "M445,270 V288" },
        { from: "cancelar", to: "end", d: "M355,302 H330 V490" },

        { from: "persona", to: "end", d: "M445,406 V490" }
    ];

    // Sin tildes, sin mayúsculas, sin espacios sobrantes: «Qué cambiar» == «Que cambiar».
    function normalize(text) {
        return String(text ?? "")
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .trim()
            .toLowerCase();
    }

    function svgElement(tagName, attributes, className) {
        const element = document.createElementNS(SVG_NS, tagName);
        Object.entries(attributes || {}).forEach(([name, value]) => element.setAttribute(name, value));
        if (className) {
            element.setAttribute("class", className);
        }
        return element;
    }

    // Qué nodo corresponde a lo que devuelve la API. null si no lo conocemos (agente cambiado, etc.).
    function findNodeId(flow, page) {
        const flowKey = normalize(flow);
        const pageKey = normalize(page);

        // Al terminar, CX devuelve «End Session» tanto para Reservar como para la derivación.
        const endNode = NODES.find((node) => node.isEnd);
        if (pageKey === normalize(endNode.pageName)) {
            return endNode.id;
        }

        const exact = NODES.find(
            (node) => node.pageName && normalize(node.flowName) === flowKey && normalize(node.pageName) === pageKey
        );
        if (exact) {
            return exact.id;
        }

        return NODES.find((node) => node.flowOnly && normalize(node.flowName) === flowKey)?.id ?? null;
    }

    // BFS: camino más corto from → to sobre las flechas. Devuelve una lista de flechas, o null si no hay camino.
    function findPath(fromId, toId) {
        const queue = [fromId];
        const cameFrom = new Map([[fromId, null]]); // nodo → flecha con la que se llegó

        while (queue.length > 0) {
            const nodeId = queue.shift();

            if (nodeId === toId) {
                const path = [];
                let step = cameFrom.get(nodeId);
                while (step) {
                    path.unshift(step);
                    step = cameFrom.get(step.from);
                }
                return path;
            }

            EDGES.filter((edge) => edge.from === nodeId && !cameFrom.has(edge.to)).forEach((edge) => {
                cameFrom.set(edge.to, edge);
                queue.push(edge.to);
            });
        }

        return null;
    }

    function create() {
        const visitedNodes = new Set();
        const walkedEdges = new Set();
        let currentNodeId = null;
        let currentFlow = null;

        const nodeElements = new Map();
        const edgeElements = new Map();
        const groupElements = [];

        // --- Contenedor, botón de plegar (solo móvil) y cuerpo ---
        const root = document.createElement("aside");
        root.className = "reservas-flow";
        root.setAttribute("aria-label", "Diagrama del flujo de la conversación");

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "reservas-flow-toggle";
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML =
            '<span><i class="fa-solid fa-diagram-project" aria-hidden="true"></i> Ver diagrama del flujo</span>' +
            '<i class="fa-solid fa-chevron-down reservas-flow-chevron" aria-hidden="true"></i>';

        const body = document.createElement("div");
        body.className = "reservas-flow-body";

        // --- SVG ---
        const svg = svgElement("svg", {
            viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`,
            role: "img",
            "aria-label": "Flows y páginas del agente de reservas de Casa John"
        }, "reservas-flow-svg");

        // Cabeza de flecha (dos colores: normal y camino recorrido).
        const defs = svgElement("defs");
        [["reservas-flow-arrow", "reservas-flow-arrowhead"], ["reservas-flow-arrow-walked", "reservas-flow-arrowhead reservas-flow-arrowhead--walked"]].forEach(([id, cls]) => {
            const marker = svgElement("marker", {
                id, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse"
            });
            marker.appendChild(svgElement("path", { d: "M0,0 L10,5 L0,10 z" }, cls));
            defs.appendChild(marker);
        });
        svg.appendChild(defs);

        // Orden de dibujado = orden de apilado en SVG (no hay z-index): fondos, flechas y, encima, nodos.
        FLOWS.forEach((flow) => {
            const group = svgElement("g", {}, "reservas-flow-group");
            group.appendChild(svgElement("rect", { x: flow.x, y: flow.y, width: flow.w, height: flow.h, rx: 8 }));
            const title = svgElement("text", { x: flow.x + 12, y: flow.y + 17 }, "reservas-flow-group-title");
            title.textContent = flow.title;
            group.appendChild(title);
            svg.appendChild(group);
            groupElements.push({ flowName: flow.flowName, element: group });
        });

        EDGES.forEach((edge) => {
            const path = svgElement("path", { d: edge.d }, "reservas-flow-edge");
            svg.appendChild(path);
            edgeElements.set(edge, path);
        });

        NODES.forEach((node) => {
            const height = node.h ?? NODE_HEIGHT;
            const group = svgElement("g", {}, "reservas-flow-node" + (node.isEnd ? " reservas-flow-node--end" : ""));
            group.appendChild(svgElement("rect", { x: node.x, y: node.y, width: node.w, height, rx: 6 }));
            const label = svgElement("text", { x: node.x + node.w / 2, y: node.y + height / 2, dy: "0.35em", "text-anchor": "middle" });
            label.textContent = node.label;
            group.appendChild(label);
            svg.appendChild(group);
            nodeElements.set(node.id, group);
        });

        // --- Leyenda y texto de estado (para lectores de pantalla y para páginas que no conozcamos) ---
        const caption = document.createElement("p");
        caption.className = "reservas-flow-caption";
        caption.setAttribute("aria-live", "polite");

        const legend = document.createElement("ul");
        legend.className = "reservas-flow-legend";
        [["current", "Paso actual"], ["visited", "Ya recorrido"], ["pending", "Sin visitar"]].forEach(([kind, text]) => {
            const item = document.createElement("li");
            const swatch = document.createElement("span");
            swatch.className = "reservas-flow-swatch reservas-flow-swatch--" + kind;
            swatch.setAttribute("aria-hidden", "true");
            item.append(swatch, text);
            legend.appendChild(item);
        });

        body.append(svg, caption, legend);
        root.append(toggle, body);

        toggle.addEventListener("click", () => {
            const isOpen = root.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        // --- Estado → clases CSS (los colores viven en el CSS, no aquí) ---
        function render() {
            nodeElements.forEach((element, id) => {
                element.classList.toggle("is-current", id === currentNodeId);
                element.classList.toggle("is-visited", visitedNodes.has(id) && id !== currentNodeId);
            });
            edgeElements.forEach((element, edge) => {
                element.classList.toggle("is-walked", walkedEdges.has(edge));
            });
            groupElements.forEach(({ flowName, element }) => {
                element.classList.toggle("is-active", currentFlow !== null && normalize(flowName) === normalize(currentFlow));
            });
        }

        function describe(flow, page) {
            if (!flow && !page) {
                return "Aún no has empezado la conversación.";
            }
            if (normalize(page) === "end session") {
                return `La conversación ha terminado (${flow} › ${page}).`;
            }
            return `Estás en: ${flow} › ${page}`;
        }

        function update(flow, page) {
            const targetId = findNodeId(flow, page);
            currentFlow = flow ?? null;

            if (targetId) {
                // Páginas intermedias: si veníamos de otra, marcamos el camino más corto hasta la nueva.
                if (currentNodeId && currentNodeId !== targetId) {
                    const path = findPath(currentNodeId, targetId);
                    path?.forEach((edge) => {
                        walkedEdges.add(edge);
                        visitedNodes.add(edge.from);
                        visitedNodes.add(edge.to);
                    });
                }
                visitedNodes.add(targetId);
            }

            // Si la página no está en el diagrama (null), no se ilumina ningún nodo; el texto sigue informando.
            currentNodeId = targetId;
            caption.textContent = describe(flow, page);
            render();
        }

        function reset() {
            visitedNodes.clear();
            walkedEdges.clear();
            currentNodeId = null;
            currentFlow = null;
            caption.textContent = describe(null, null);
            render();
        }

        reset();

        return { element: root, update, reset };
    }

    window.ReservasFlowDiagram = { create };
})();
