"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "es" | "en" | "fr";

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    "dashboard.title": "Quality Assurance Dashboard",
    "dashboard.subtitle": "Real-time overview of test execution and quality metrics.",
    "kpi.projects": "Active Projects",
    "kpi.coverage": "Test Coverage",
    "kpi.execution": "Execution Rate",
    "kpi.defects": "Critical Defects",
    "btn.generate": "Generate Plan",
    "btn.browse": "Browse Files",
    "nav.dashboard": "Dashboard",
    "nav.projects": "Projects",
    "nav.designer": "Designer",
    "nav.executor": "Executor",
    "nav.reporter": "Reporter",
    "nav.chat": "AI Copilot",
    "status.passed": "Passed",
    "status.failed": "Failed",
    "status.blocked": "Blocked",
    "status.skipped": "Skipped",
    "welcome": "Welcome back",
    "role.admin": "Administrator",
    "role.tester": "QA Tester",
    "search.placeholder": "Search anything (Ctrl+K)...",
    "recent.activity": "Recent Activity",
    "defect.severity": "Defect Severity",
    "test.suites": "Test Suites",
    "test.cases": "Test Cases",
    "total": "Total",
  },
  es: {
    "dashboard.title": "Panel de Control QA",
    "dashboard.subtitle": "Visión en tiempo real de la ejecución de pruebas y métricas de calidad.",
    "kpi.projects": "Proyectos Activos",
    "kpi.coverage": "Cobertura de Pruebas",
    "kpi.execution": "Tasa de Ejecución",
    "kpi.defects": "Defectos Críticos",
    "btn.generate": "Generar Plan",
    "btn.browse": "Explorar Archivos",
    "nav.dashboard": "Inicio",
    "nav.projects": "Proyectos",
    "nav.designer": "Diseñador",
    "nav.executor": "Ejecutor",
    "nav.reporter": "Reportes",
    "nav.chat": "Copilot IA",
    "status.passed": "Exitoso",
    "status.failed": "Fallido",
    "status.blocked": "Bloqueado",
    "status.skipped": "Omitido",
    "welcome": "Bienvenido de nuevo",
    "role.admin": "Administrador",
    "role.tester": "Tester QA",
    "search.placeholder": "Buscar cualquier cosa (Ctrl+K)...",
    "recent.activity": "Actividad Reciente",
    "defect.severity": "Severidad de Defectos",
    "test.suites": "Suites de Prueba",
    "test.cases": "Casos de Prueba",
    "total": "Total",
  },
  fr: {
    "dashboard.title": "Tableau de Bord QA",
    "dashboard.subtitle": "Aperçu en temps réel de l'exécution des tests et des métriques qualité.",
    "kpi.projects": "Projets Actifs",
    "kpi.coverage": "Couverture de Test",
    "kpi.execution": "Taux d'Exécution",
    "kpi.defects": "Défauts Critiques",
    "btn.generate": "Générer Plan",
    "btn.browse": "Parcourir Fichiers",
    "nav.dashboard": "Tableau de Bord",
    "nav.projects": "Projets",
    "nav.designer": "Concepteur",
    "nav.executor": "Exécuteur",
    "nav.reporter": "Rapports",
    "nav.chat": "Copilote IA",
    "status.passed": "Succès",
    "status.failed": "Échec",
    "status.blocked": "Bloqué",
    "status.skipped": "Ignoré",
    "welcome": "Bon retour",
    "role.admin": "Administrateur",
    "role.tester": "Testeur QA",
    "search.placeholder": "Rechercher (Ctrl+K)...",
    "recent.activity": "Activité Récente",
    "defect.severity": "Sévérité des Défauts",
    "test.suites": "Suites de Tests",
    "test.cases": "Cas de Test",
    "total": "Total",
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("es");

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLang must be used within a LanguageProvider");
  }
  return context;
}
