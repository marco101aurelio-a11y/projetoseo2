import os
from google import genai
from google.genai import types

class AgentSquadOrchestrator:
    def __init__(self):
        # A chave é pega automaticamente da variável de ambiente GEMINI_API_KEY
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = genai.Client() if self.api_key else None
        
        # Calcula a raiz do projeto e aponta pra pasta de skills reais
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.skills_dir = os.path.join(base_dir, ".agent", "skills", "ia-agente-mkt2")
        
        self.skills = self._load_all_skills()
        self.model = "gemini-1.5-flash"

    def _load_all_skills(self):
        skills = {}
        if not os.path.exists(self.skills_dir):
            print(f"[Aviso] Pasta de skills não encontrada em: {self.skills_dir}")
            return skills
            
        for filename in os.listdir(self.skills_dir):
            if filename.endswith(".md"):
                file_path = os.path.join(self.skills_dir, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        skills[filename] = f.read()
                except Exception as e:
                    print(f"Erro ao carregar skill {filename}: {e}")
        return skills
    
    def chat_with_agent(self, agent_name: str, chat_history: list, user_input: str) -> str:
        if not self.client:
            return "[Offline Ativo no Python] A chave GEMINI_API_KEY não foi encontrada no .env do servidor."
            
        system_prompt = self._get_system_prompt_for_agent(agent_name)
        
        # Formata o histórico como texto corrido
        history_text = ""
        for msg in chat_history:
            # Pula mensagens de sistema puro (aha_moment json)
            if msg.get("type") == "aha_moment":
                continue
            role = "Empresário" if msg.get("role") == "user" else "Você"
            history_text += f"{role}: {msg.get('content')}\n"
            
        prompt = f"""
        {system_prompt}
        
        INSTRUÇÃO RÍGIDA: Você está conversando diretamente com o Empresário na interface do "Estúdio Capvi".
        NÃO envie JSON. Formule respostas diretas, opinativas, táticas e arrojadas como o consultor que você é.
        
        HISTÓRICO RECENTE DO CHAT MANTIDO EM MEMÓRIA:
        {history_text}
        
        PERGUNTA ATUAL DO EMPRESÁRIO:
        {user_input}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt
            )
            return response.text
        except Exception as e:
            return f"[Sistema FastAPI] Ocorreu uma interrupção na conexão com a nuvem do Google: {str(e)}"
            
    def _get_system_prompt_for_agent(self, agent_name: str) -> str:
        # Mapeia qual Skill em Markdown cada agente deve ler do HD
        skill_file = None
        if agent_name == "Google Ads Engine":
            skill_file = "seo_agent.md"
        elif agent_name == "Growth Engine":
            skill_file = "growth_agent.md"
        elif agent_name == "Financeiro":
            skill_file = "finance_agent.md"
        elif agent_name == "Retention Engine":
            skill_file = "retention_agent.md"
            
        if skill_file and skill_file in self.skills:
            return self.skills[skill_file]
            
        # Fallback genérico militar caso não encontre
        return "Você é a Capvi IA, uma inteligência de Elite na área de " + agent_name + ". Decida como especialista usando Kotler e V4 Company e dê conselhos sem rodeios."
