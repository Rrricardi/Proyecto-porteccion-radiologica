// Datos constantes
const U = 1;
const P = 0.02;

const blindaje_primario = {
    'camilla': { 'alfa': 0.03994, 'beta': 0.1448, 'gamma': 0.4231, 'Kp1': 5.2 },
    'bucky de pared': { 'alfa': 0.03552, 'beta': 0.1177, 'gamma': 0.6007, 'Kp1': 2.3 }
};

const blindaje_secundario = {
    'camilla': { 'alfa': 0.0392, 'beta': 0.1464, 'gamma': 0.4486 },
    'bucky de pared': { 'alfa': 0.0356, 'beta': 0.1079, 'gamma': 0.7705 }
};

const K_p_secundario = { 'directo': 0.049, 'indirecto': 0.034 };

const areas_protegidas = `Seleccione el área protegida:
1. Oficinas
2. Salas de trabajo
3. Salas de espera
4. Laboratorios
5. Enfermería
6. Estaciones de trabajo
7. Pasillos públicos fuera de la sala de rayos X
8. Baños
9. Algunas áreas de hospitalización
10. Pasillos privados
11. Salas de descanso personal
12. Cuartos de almacenamiento poco usados
13. Techos
14. Áreas exteriores
15. Cuartos de mantenimiento
16. Almacenamiento sin personal frecuente`;

const T_values = [1, 0.2, 0.125, 0.025];

// Función principal
function calcularBlindaje() {
    let barrera = prompt("Barrera primaria o secundaria:").toLowerCase();
    let procedimiento = prompt("Procedimiento bucky de pared o camilla:").toLowerCase();
    let dp = parseFloat(prompt("Introduzca la distancia de la fuente de radiación a la persona (m):"));
    let area = parseInt(prompt(areas_protegidas));
    let N = parseInt(prompt("Introduzca el número de personas en el área:"));

    let T;
    if (area >= 1 && area <= 6) T = T_values[0];
    else if (area >= 7 && area <= 9) T = T_values[1];
    else if (area >= 10 && area <= 12) T = T_values[2];
    else if (area >= 13 && area <= 16) T = T_values[3];
    else {
        alert("Área no válida.");
        return;
    }

    let a, b, c, Kp;

    if (barrera === "primaria") {
        let datos = blindaje_primario[procedimiento];
        a = datos.alfa;
        b = datos.beta;
        c = datos.gamma;
        Kp = (datos.Kp1 * U * N) / (dp ** 2);
    } else if (barrera === "secundaria") {
        let contacto = prompt("Contacto directo o indirecto:").toLowerCase();
        let datos = blindaje_secundario[procedimiento];
        a = datos.alfa;
        b = datos.beta;
        c = datos.gamma;
        Kp = (K_p_secundario[contacto] * U * N) / (dp ** 2);
    } else {
        alert("Tipo de barrera no válido.");
        return;
    }

    let Bp = P / (T * Kp);
    let X = (1 / (a * c)) * Math.log(((1 / Bp) ** c + (b / a)) / (1 + (b / a)));

    document.getElementById("resultado").innerText = `Resultado: Barrera ${barrera}, Procedimiento ${procedimiento}, X = ${X.toFixed(4)} mm (concreto)`;
}

// Asignar evento al botón
document.getElementById("calcularBtn").addEventListener("click", calcularBlindaje);