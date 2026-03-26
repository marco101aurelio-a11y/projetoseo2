import os
# Define o JAX como backend do Keras ANTES de importar o Keras
os.environ["KERAS_BACKEND"] = "jax"

import keras
import keras_nlp

class GemmaIntelligence:
    def __init__(self, model_id="gemma_2b_en"):
        print(f"📦 Carregando modelo {model_id} via Keras (JAX Backend)...")
        # KerasNLP gerencia o download e carregamento de forma otimizada
        self.model = keras_nlp.models.GemmaCausalLM.from_preset(model_id)
        print(f"✅ Gemma pronto com backend JAX!")

    def generate_response(self, prompt, max_length=256):
        """
        Gera uma resposta baseada no prompt fornecido.
        """
        return self.model.generate(prompt, max_length=max_length)

if __name__ == "__main__":
    # Exemplo de uso
    print("🤖 Iniciando teste do Gemma com JAX Backend...")
    gemma = GemmaIntelligence()
    response = gemma.generate_response("Como otimizar o SEO usando matemática avançada?")
    print(f"Gemma (JAX): {response}")

if __name__ == "__main__":
    # Exemplo de uso
    # Nota: Para rodar isso, o usuário precisa de acesso ao modelo no Hugging Face
    # e ter feito login via `huggingface-cli login`.
    print("🤖 Iniciando teste do Gemma...")
    gemma = GemmaIntelligence()
    response = gemma.generate_response("Como otimizar o SEO para uma loja de eletrônicos no Brasil?")
    print(f"Gemma: {response}")
