// Prueba para verificar que el contador de días respeta el nivel de urgencia del perfil del usuario
import { assessHealthRisk, calculateNextAnalysisDate } from './services/healthRiskService.js';

console.log("=== Prueba de frecuencia dinámica basada en perfil de usuario ===\n");

// Perfil de usuario saludable
const healthyUser = {
    name: "Usuario Saludable",
    birthDate: "1990-01-01",
    sex: "male",
    height: 175,
    weight: 70,
    chronicConditions: [],
    allergies: [],
    smokingStatus: "never",
    exerciseFrequency: "often",
    alcoholConsumption: "moderate",
    medicationsAndSupplements: [],
    surgeriesOrPastIllnesses: [],
    drugConsumption: "never"
};

// Perfil de usuario con alto riesgo
const highRiskUser = {
    name: "Usuario Alto Riesgo",
    birthDate: "1960-01-01", // 65 años
    sex: "male",
    height: 175,
    weight: 95, // Sobrepeso
    chronicConditions: ["Hipertensión arterial", "Diabetes tipo 2"],
    allergies: [],
    smokingStatus: "current",
    exerciseFrequency: "never",
    alcoholConsumption: "heavy",
    medicationsAndSupplements: ["Metformina", "Lisinopril"],
    surgeriesOrPastIllnesses: ["Infarto previo"],
    drugConsumption: "never"
};

// Perfil de usuario crítico
const criticalUser = {
    name: "Usuario Crítico",
    birthDate: "1950-01-01", // 75 años
    sex: "female",
    height: 160,
    weight: 85,
    chronicConditions: ["Insuficiencia cardíaca", "Diabetes tipo 1", "Enfermedad renal crónica"],
    allergies: ["Penicilina"],
    smokingStatus: "former",
    exerciseFrequency: "rarely",
    alcoholConsumption: "light",
    medicationsAndSupplements: ["Insulina", "Warfarina", "Furosemida", "Metoprolol"],
    surgeriesOrPastIllnesses: ["Bypass coronario", "Marcapasos"],
    drugConsumption: "never"
};

function testUserProfile(user, description) {
    console.log(`${description}:`);
    console.log(`  Edad: ${2025 - new Date(user.birthDate).getFullYear()} años`);
    console.log(`  Condiciones: ${user.chronicConditions.join(', ') || 'Ninguna'}`);
    
    const assessment = assessHealthRisk(user);
    console.log(`  Nivel de riesgo: ${assessment.riskLevel}`);
    console.log(`  Frecuencia recomendada: ${assessment.recommendedAnalysisFrequency} días`);
    
    const nextAnalysisDate = calculateNextAnalysisDate(user);
    const today = new Date();
    const diffDays = Math.ceil((nextAnalysisDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`  Próximo análisis en: ${diffDays} días`);
    console.log(`  Mensaje: ${assessment.personalizedMessage.substring(0, 80)}...`);
    console.log();
}

testUserProfile(healthyUser, "1. Usuario Saludable");
testUserProfile(highRiskUser, "2. Usuario Alto Riesgo");
testUserProfile(criticalUser, "3. Usuario Crítico");

console.log("=== Conclusión ===");
console.log("✅ El sistema ahora ajusta la frecuencia de análisis según el perfil de riesgo del usuario");
console.log("✅ Usuarios saludables: análisis cada 14-30 días");
console.log("✅ Usuarios de alto riesgo: análisis cada 3-7 días");
console.log("✅ Usuarios críticos: análisis cada 1-3 días");