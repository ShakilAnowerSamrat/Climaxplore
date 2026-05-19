import:py from jaclang.core.llm, fallback_llm;

# Define the state of our weather risk assessment
node weather_context {
    has location: str;
    has temperature: float;
    has activity: str;
    has risk_score: float = 0.0;
}

# Walker to assess the risk using an LLM
walker assess_risk {
    has user_query: str;
    has llm_response: str = "";

    can evaluate_with_llm with weather_context entry {
        # This is where Jac routes the multi-variable data to the Gemini integration
        llm_prompt = f"Assess the risk for {here.activity} in {here.location} with temp {here.temperature}. Query: {self.user_query}";
        
        # Simulated LLM call via Jac
        self.llm_response = fallback_llm(llm_prompt);
        report self.llm_response;
    }
}