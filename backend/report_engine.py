import re
from typing import Dict, Any, List

class ReportEngine:
    def __init__(self, ruleset: Dict[str, Any]):
        """
        ruleset structure:
        {
            "thresholds": {"high_cv": 15, "high_nor": 8, "low_nor": 4},
            "templates": {
                "intro": "Análise técnica do Teste Palográfico do paciente {{patient_id}}.",
                "nor_stable": "O Nível de Oscilação Rítmica (NOR) foi de {{nor}}%, indicando estabilidade emocional e equilíbrio no ritmo de trabalho.",
                "nor_unstable": "O Nível de Oscilação Rítmica (NOR) foi de {{nor}}%, sugerindo possíveis flutuações no ritmo produtivo e instabilidade emocional.",
                "productivity": "A produtividade total foi de {{total}} palos, com média de {{mean}} por intervalo."
            }
        }
        """
        self.ruleset = ruleset

    def _replace_placeholders(self, text: str, data: Dict[str, Any]) -> str:
        for key, value in data.items():
            text = text.replace(f"{{{{{key}}}}}", str(value))
        return text

    def generate_draft(self, metrics: Dict[str, Any], context: Dict[str, Any]) -> str:
        templates = self.ruleset.get("templates", {})
        thresholds = self.ruleset.get("thresholds", {})
        
        sections = []
        
        # 1. Identification
        sections.append(f"## LAUDO TRIBUTÁRIO DE AVALIAÇÃO PALOGRÁFICA (DRAFT)")
        sections.append(self._replace_placeholders(templates.get("intro", ""), context))
        
        # 2. Quantitative Data
        sections.append("\n### 1. Produtividade e Ritmo")
        sections.append(self._replace_placeholders(templates.get("productivity", ""), metrics))
        
        # CV Analysis
        cv = metrics.get("cv", 0)
        if cv > thresholds.get("high_cv", 15):
            sections.append(f"- **Irregularidade Produtiva:** O Coeficiente de Variação (CV) de {cv}% ultrapassa o limite de 15%, sugerindo oscilações significativas no rendimento ou instabilidade no esforço.")
        else:
            sections.append(f"- **Regularidade Produtiva:** O CV de {cv}% indica um ritmo de trabalho constante e controlado.")

        # Trend Analysis
        trend = metrics.get("trend", 0)
        if trend > 0.5:
            sections.append("- **Tendência de Rendimento:** Curva ascendente identificada. Sugere boa adaptação à tarefa e aumento do esforço ao longo do tempo.")
        elif trend < -0.5:
            sections.append("- **Tendência de Rendimento:** Curva descendente identificada. Pode indicar fadiga física/mental ou desmotivação precoce.")
        
        # 3. Equilíbrio Emocional (NOR)
        sections.append("\n### 2. Equilíbrio Emocional (NOR)")
        nor = metrics.get("nor", 0)
        if nor <= thresholds.get("high_nor", 8):
            sections.append(self._replace_placeholders(templates.get("nor_stable", ""), metrics))
        else:
            sections.append(self._replace_placeholders(templates.get("nor_unstable", ""), metrics))
            
        # 4. Aspectos Vetoriais e Layout (Phase 2)
        sections.append("\n### 3. Aspectos Gráficos e Layout")
        
        # Slant (Inclinação)
        slant = metrics.get("slant", 90)
        if 85 <= slant <= 95:
            sections.append(f"- **Inclinação:** {slant}° (Vertical/Regular). Sugere estabilidade e controle dos impulsos.")
        elif slant > 95:
            sections.append(f"- **Inclinação:** {slant}° (Inclinado à Direita). Sugere extroversão, sociabilidade ou maior impulsividade.")
        else:
            sections.append(f"- **Inclinação:** {slant}° (Inclinado à Esquerda). Sugere introversão, contenção ou possível oposição.")

        # Interlines
        interline = metrics.get("interline_avg_mm", "N/A")
        if interline != "N/A":
            sections.append(f"- **Distância entre Linhas:** {interline}mm. Reflete a organização espacial e o respeito a limites.")

        # Pressure and Spacing
        sections.append(self._replace_placeholders(templates.get("pressure_analysis", ""), metrics))
        sections.append(self._replace_placeholders(templates.get("spacing_analysis", ""), metrics))

        # Qualitative Flags
        if metrics.get("tremor_suggested"):
            sections.append("- **Alerta Técnico:** Sinais de tremor detectados nos traçados. Recomenda-se avaliação detalhada de firmeza motora.")
        if metrics.get("crossings_detected"):
            sections.append("- **Alerta Técnico:** Identificada proximidade excessiva ou toque entre linhas (invasão de zona).")

        # 5. Clinical Synthesis (Draft)
        sections.append("\n### 4. Síntese Interpretativa Sugerida")
        sections.append("> [!IMPORTANT]")
        sections.append("> Esta seção é gerada automaticamente como suporte à decisão. A interpretação final é de responsabilidade EXCLUSIVA do psicólogo.")
        
        synthesis = "O examinando demonstra "
        if nor <= 8 and cv <= 15:
            synthesis += "equilíbrio rítmico e estabilidade produtiva. "
        else:
            synthesis += "labilidade no ritmo de trabalho com possíveis flutuações de tônus. "
            
        if trend < -0.5:
            synthesis += "Observa-se queda de rendimento sinalizando fadiga situacional. "
        
        if slant > 95:
            synthesis += "O direcionamento gráfico à direita indica receptividade ao meio. "
            
        sections.append(synthesis + "\n\n**Conclusão do Profissional:**\n__________________________________________________________________")
        
        # Legal Warning
        sections.append("\n---\n*PaloCheck v3 - Ferramenta de Apoio Clínico. Em conformidade com auditoria v2401.*")
        
        return "\n".join(sections)

    def generate_comparison_report(self, auto_metrics: Dict[str, Any], manual_metrics: Dict[str, Any]) -> str:
        """
        Generates a comparison between automated detection and manual review.
        """
        report = [
            "# Relatório de Auditoria e Ajuste (De -> Para)",
            f"\nData da Auditoria: {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            "\n| Métrica | Automático | Manual | Diferença |",
            "| :--- | :---: | :---: | :---: |",
            f"| Contagem Total | {auto_metrics['total']} | {manual_metrics['total']} | {manual_metrics['total'] - auto_metrics['total']} |",
            f"| NOR | {auto_metrics['nor']}% | {manual_metrics['nor']}% | {round(manual_metrics['nor'] - auto_metrics['nor'], 2)}% |",
            f"| CV | {auto_metrics['cv']}% | {manual_metrics['cv']}% | {round(manual_metrics['cv'] - auto_metrics['cv'], 2)}% |",
            "\n**Observação**: Todas as alterações foram registradas no log de auditoria imutável.",
        ]
        return "\n".join(report)

# Default Rule Set for v3
DEFAULT_RULESET = {
    "thresholds": {
        "high_nor": 8,
        "low_nor": 4,
        "high_cv": 15
    },
    "templates": {
        "intro": "Referência: Caso {{patient_id}}. Avaliação conduzida pelo profissional responsável.",
        "nor_stable": "Métrica NOR de {{nor}}%. Indica equilíbrio emocional e capacidade de manter o tônus vital estável durante a atividade.",
        "nor_unstable": "Métrica NOR de {{nor}}%. Sugere flutuações no controle de impulsos ou labilidade emocional sob condições de esforço contínuo.",
        "productivity": "Produção Total de {{total}} palos. A média por intervalo foi de {{mean}} unidades.",
        "pressure_analysis": "Pressão/Intensidade: Valor médio de {{avg_pressure}}. Reflete a energia e vitalidade despendida no traçado.",
        "spacing_analysis": "Espaçamento Inter-palas: Média de {{avg_spacing_mm}}mm. Indica a organização espacial e ritmo de impulsão horizontal."
    }
}
