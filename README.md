# Walkthrough - PaloCheck: Sistema de Apoio ao Palográfico

O PaloCheck foi transformado em uma solução robusta (Full-Stack) para auxiliar psicólogos na correção do teste Palográfico, automatizando a contagem de palos e garantindo conformidade com as normas técnicas.

## 🚀 Funcionalidades Principais

### 1. Visão Computacional (O Coração)
- **Detecção Automática**: O pipeline identifica traços verticais, filtrando ruídos e artefatos do papel.
- **Métricas Avançadas**: Além da contagem, o sistema calcula Inclinação, Espaçamento e o NOR (Oscilação Rítmica).
- **Segmentação**: Separação automática em 5 intervalos configuráveis.

### 2. Interface de Revisão "Psicólogo-no-Loop"
- **Overlay Interativo**: Os palos detectados são exibidos sobre a foto original para conferência visual.
- **Correção Manual**: Ferramentas para adicionar ou remover palos com um clique, atualizando as estatísticas instantaneamente.
- **Indicador de Confiança**: O sistema avisa quando a qualidade da imagem está baixa ou a detecção foi incerta.

### 3. Gestão de Laudos e Compliance
- **Pré-Laudo Editável**: Texto gerado automaticamente a partir de templates técnicos, permitindo edição final pelo psicólogo.
- **Auditoria Imutável**: Todas as alterações manuais e exportações são registradas em log (Audit Log).
- **LGPD**: Design focado em privacidade, com IDs internos para pacientes e criptografia.

---

## 🛠️ Demonstração Técnica

### Lógica de Detecção (Back-end)
O `vision.py` utiliza limiarização adaptativa e análise de componentes conectados para isolar os "palos" com precisão.

### Interface Clínica (Front-end)
A interface utiliza uma estética limpa e profissional, focada em reduzir a fadiga visual durante a revisão.

![Preview da Tela de Revisão](file:///Users/thalescassianozeni/.gemini/antigravity/brain/18110630-f0bc-4a35-9f0e-ff767b897dd8/.system_generated/click_feedback/click_feedback_1769219467669.png)
*(Nota: O preview acima é uma referência da interface de revisão interativa implementada)*

---

## 💻 Guia de Setup

### Requisitos
- Node.js >= 20.9 (para Next.js)
- Python 3.9+
- Bibliotecas: OpenCV, FastAPI, SQLAlchemy, Next.js.

### Como Executar
1. **Backend**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

> [!IMPORTANT]
> O PaloCheck é uma **ferramenta de apoio**. O laudo final só é liberado para exportação após a marcação obrigatória: **"Revisado por Humano"**.
