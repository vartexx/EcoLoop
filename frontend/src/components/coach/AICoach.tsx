import { useState, useEffect, useRef } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { CarbonCalculatorInputs, calculateCarbonFootprint } from "../../utils/carbonCalculator";
import type { CoachFeedback } from "../../lib/types";

interface AICoachProps {
  inputs: CarbonCalculatorInputs;
  feedback?: CoachFeedback | null;
}

interface Message {
  id: string;
  sender: "coach" | "user";
  text: string;
  timestamp: Date;
}

export default function AICoach({ inputs, feedback }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Generate localized coaching tips based on user's highest emissions
  const generateInitialTips = (data: CarbonCalculatorInputs): string[] => {
    const results = calculateCarbonFootprint(data);
    const sectors = [
      { name: "Transport", value: results.transport, tip: "🚗 **Optimize Commutes**: Switch to public transit or cycling. Commuting by bus/train emits just 0.03 kg CO2e/km vs 0.17 kg CO2e/km for petrol cars. Replacing 3,000 km of driving with public transit saves ~420 kg CO2e/yr." },
      { name: "Energy", value: results.energy, tip: "💡 **Smart Home Heating & Solar**: Lower your thermostat by 1-2°C to shave up to 10% off heating bills. If possible, explore solar panels, which reduce your grid carbon impact factor from 0.4 kg/kWh to near-zero." },
      { name: "Diet", value: results.diet, tip: "🥗 **Introduce Plant-Based Days**: The food sector is highly impactful. A vegan diet averages ~900 kg CO2e/yr compared to a meat-heavy diet at ~2,800 kg CO2e/yr. Swapping red meat for plant meals 3 days/week offsets ~800 kg CO2e/yr." },
      { name: "Waste", value: results.waste, tip: "♻️ **Compost & Sort**: Landfilled organic waste decomposes anaerobically, generating methane. Composting organic waste and sorting packaging saves up to ~350 kg CO2e/yr from entering the atmosphere." }
    ];

    // Sort by footprint value descending
    sectors.sort((a, b) => b.value - a.value);

    // Return the top 3
    return sectors.slice(0, 3).map(s => s.tip);
  };

  // Initialize Coach on mount/updates
  useEffect(() => {
    let welcomeText = "";
    
    if (feedback) {
      welcomeText = `Hello! I am your AI Sustainability Coach. 🌲 

I've analyzed your carbon profile. Here is your **personalized AI coaching feedback** (${feedback.source === "gemini" ? "GCP Vertex AI" : "Smart Rules"}):

${feedback.summary}

${feedback.recommendations.map((rec, idx) => `**${idx + 1}. ${rec.category.toUpperCase()}**: ${rec.action}
(Potential savings: ${rec.estimated_annual_savings_kg} kg CO₂e/yr)`).join("\n\n")}

How can I help you optimize your carbon savings today? Feel free to ask me about transport, home energy, dieting, or recycling!`;
    } else {
      const tips = generateInitialTips(inputs);
      welcomeText = `Hello! I am your AI Sustainability Coach. 🌲 

I've reviewed your carbon profile, and calculated your initial footprint. Based on your high-emission areas, here are your **top 3 personalized lifestyle adjustments**:

${tips.map((tip, idx) => `${idx + 1}. ${tip}`).join("\n\n")}

How can I help you optimize your carbon savings today? Feel free to ask me about transport, home energy, dieting, or recycling!`;
    }

    setMessages([
      {
        id: "welcome",
        sender: "coach",
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  }, [inputs, feedback]);

  // Dynamic responder logic for sustainability queries
  const getCoachResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("car") || lowerQuery.includes("drive") || lowerQuery.includes("vehicle") || lowerQuery.includes("petrol") || lowerQuery.includes("ev") || lowerQuery.includes("transit") || lowerQuery.includes("flight") || lowerQuery.includes("fly")) {
      return `### Transport Emission Breakdown 🚘
Standard transport emission factors reflect major variances:
* **Petrol Cars**: ~0.17 kg CO2e per km.
* **Electric Vehicles (EV)**: ~0.05 kg CO2e per km (depends on the grid mix).
* **Public Transit (Bus/Train)**: ~0.03 kg CO2e per km.
* **Flights**: Short flights (~150 kg per passenger flight) actually emit more per km than long flights (~1000 kg) due to fuel burned during takeoff.

**Action Tip**: Walking or cycling is completely carbon-free! Try replacing car journeys under 5km with clean transits.`;
    }

    if (lowerQuery.includes("energy") || lowerQuery.includes("electricity") || lowerQuery.includes("solar") || lowerQuery.includes("heating") || lowerQuery.includes("gas") || lowerQuery.includes("bill")) {
      return `### Household Energy Optimization ⚡
Home power and heating are heavy contributors to emissions:
* **Grid Electricity**: Emits ~0.4 kg CO2e per kWh on average. Installing solar offset offsets this to around ~0.05 kg CO2e per kWh.
* **Heating**: Natural gas heating emits ~0.18 kg CO2e per kWh, whereas heating oil is far more carbon-intensive (~2.68 kg CO2e per litre).

**Action Tip**: Adjusting your thermostat down by just 1.5°C during cold months or using high-efficiency Heat Pumps can reduce home emissions by 15-20%. Make sure to unplug standby electronics to eliminate "vampire" energy draw.`;
    }

    if (lowerQuery.includes("diet") || lowerQuery.includes("vegan") || lowerQuery.includes("meat") || lowerQuery.includes("vegetarian") || lowerQuery.includes("food") || lowerQuery.includes("beef")) {
      return `### Dietary Footprint & Offsets 🍽️
What we eat contributes to carbon, methane, and deforestation:
* **Meat-Heavy Diet**: Generates ~2,800 kg CO2e per year per person.
* **Vegan Diet**: Generates just ~900 kg CO2e per year.
* **Vegetarian Diet**: Generates ~1,300 kg CO2e per year.

**Action Tip**: Red meat (especially beef and lamb) has a massive methane footprint. Swapping beef for beans, tofu, or poultry just a few days a week results in significant personal carbon offsets!`;
    }

    if (lowerQuery.includes("waste") || lowerQuery.includes("recycle") || lowerQuery.includes("plastic") || lowerQuery.includes("compost") || lowerQuery.includes("landfill")) {
      return `### Waste Management & Circular Economy ♻️
Municipal waste that ends up in landfills generates methane gas as it decomposes:
* **Standard Trash (No Recycling)**: Contributes up to ~500 kg CO2e per year.
* **Active Recycling**: Lowers trash carbon footprint to ~150 kg CO2e per year.

**Action Tip**: Start composting kitchen scraps. Composting allows organic matter to decompose aerobically, emitting CO2 rather than methane (which is 28x more potent as a greenhouse gas).`;
    }

    return `### Sustainability Advice 🌿
I am here to guide you on any sustainability topic. To get specific advice, try asking:
* "How do electric cars compare to petrol cars?"
* "What is grid electricity carbon factor?"
* "How much carbon does a vegan diet save?"
* "Why does composting help reduce methane?"

You can also lower your carbon score in real time by checking off completed habits in the **Daily Habit Tracker**!`;
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate coach response delay
    setTimeout(() => {
      const responseText = getCoachResponse(text);
      const coachMsg: Message = {
        id: `coach-${Date.now()}`,
        sender: "coach",
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, coachMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/20 shadow-xl flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-border/50 pb-3">
        <div className="p-2 rounded-xl bg-primary text-primary-foreground">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">AI Sustainability Coach</h2>
          <p className="text-[10px] text-muted-foreground flex items-center">
            <Sparkles className="h-3 w-3 mr-1 text-primary animate-pulse" /> Active Analysis Context
          </p>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start space-x-2.5 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div className={`p-2 rounded-lg border flex-shrink-0 ${
              msg.sender === "user" 
                ? "bg-secondary text-secondary-foreground border-secondary/20" 
                : "bg-primary/10 text-primary border-primary/20"
            }`}>
              {msg.sender === "user" ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
            </div>

            <div className={`p-4 rounded-2xl border text-xs leading-relaxed whitespace-pre-line ${
              msg.sender === "user"
                ? "bg-secondary text-secondary-foreground border-secondary/10 rounded-tr-none"
                : "bg-card text-foreground border-border rounded-tl-none"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start space-x-2.5 max-w-[85%]">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="p-4 rounded-2xl border bg-card text-muted-foreground border-border rounded-tl-none flex items-center space-x-1.5 py-3">
              <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 pt-1 border-t border-border/30">
        {[
          { label: "Compare transport", q: "How does petrol vs electric vs bus compare?" },
          { label: "Save energy", q: "How can I optimize household energy?" },
          { label: "Meat vs Vegan", q: "What is the carbon impact of diet choices?" },
          { label: "Recycling guide", q: "Why is food waste in landfills bad?" }
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.q)}
            className="flex-shrink-0 px-3 py-1.5 text-[10px] font-semibold rounded-full border border-border bg-muted/65 hover:bg-accent/40 text-foreground transition cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="flex items-center space-x-2 mt-2 pt-2 border-t border-border/50"
      >
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about carbon offsets..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-input text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20 hover:scale-105 disabled:opacity-40 disabled:scale-100 disabled:shadow-none transition flex items-center justify-center cursor-pointer"
          aria-label="Send Message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
