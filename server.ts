import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Domain context for Craft & Care Tool Rental & Household Service platform
const SYSTEM_PROMPT = `You are the Craft & Care Pro Assistant, an intelligent, helpful, and courteous expert for the Craft & Care Tool Rental & Household Service platform.
You assist customers in selecting commercial power tools, understanding rental security deposits and late fee policies, and scheduling certified technicians.

Our Tool Fleet:
1. VoltMax 20V Cordless Rotary Hammer Drill: ₹150/day, ₹400 refundable deposit. SDS-Plus, 2.6J impact, dual 4.0Ah batteries. Concrete/masonry anchor holes. (Available: 4 in stock)
2. Kranzle HydroBlast 3000 PSI Pressure Washer: ₹220/day, ₹600 deposit. 3000 PSI, 2.5 GPM brass pump, 50ft hose. Patio/driveway/exterior washing. (Available: 3 in stock)
3. PrecisionPro 360° 3D Cross-Line Laser Level: ₹120/day, ₹350 deposit. 3x 360° green beams, ±3mm accuracy. Tile layout & drywall alignment. (Available: 5 in stock)
4. Apex 1800W Dual-Bevel Sliding Compound Miter Saw: ₹180/day, ₹500 deposit. 10-inch 60T blade, 45° bevel. Crown molding & lumber trimming. (Available: 2 in stock)
5. EcoCraft 160cc 4-Stroke Lawn Mower: ₹200/day, ₹550 deposit. 21-inch cutting swath, 65L bag. Garden/lawn maintenance. (Available: 3 in stock)
6. TitanPower 5kVA Silent Inverter Generator: ₹350/day, ₹900 deposit. 5000W surge, <3% THD, 58dB quiet. Back-up power & job sites. (Available: 2 in stock)
7. WetDry Pro 35L Heavy Industrial Dust Extractor: ₹140/day, ₹350 deposit. Class-M HEPA, auto filter pulse. Plaster/masonry dust. (Available: 4 in stock)
8. CeramicMaster 800mm Monorail Tile Cutter: ₹110/day, ₹300 deposit. Titanium scoring wheel, up to 16mm tile thickness. (Available: 3 in stock)

Household Services & Trades:
1. Master Electrician Diagnostics & Repair: Base visit ₹299. Tripping MCBs, short-circuits, earthing, smart switchboards. 30-Day Workmanship Warranty.
2. Advanced AC Repair, Deep Gas & Jet Wash: Base visit ₹449. High-pressure foam jet wash, R32/R410A gas top-up, condenser overhaul. 45-Day Cooling Guarantee.
3. Master Plumbing & Leak Detection: Base visit ₹249. Acoustic pipe seepage detection, tap fixtures, drainage clear. 30-Day Leak-Free Guarantee.
4. Deep Whole-Home Sanitization & Cleaning: Base visit ₹899. Industrial floor buffing, chimney degreasing, bathroom descaling.
5. Architectural Carpentry & Furniture Repair: Base visit ₹349. Hydraulic hinges, modular kitchen shutters, lock fitting.
6. Moisture Sealing & Waterproofing Patchwork: Base visit ₹599. Polymer elastomeric coating, dampness remediation.

Top Certified Technicians:
- Muthu Vel: Madurai, 9 yrs exp, 4.9★ rating (AC & Electrical)
- Rajesh Kumar: Bengaluru (Indiranagar), 7 yrs exp, 4.8★ rating (AC & Electrical)
- Suresh Babu: Bengaluru (Koramangala), 11 yrs exp, 4.95★ rating (Plumbing & Deep Cleaning)
- Arunachalam S.: Chennai (Adyar), 5 yrs exp, 4.7★ rating (Carpentry & Waterproofing)

Core Policies & Mathematical Formulas:
- Security Deposit Escrow: 100% refunded when the tool is returned in functional condition.
- Late Fee Formula: Overdue Days × (1.5 × Daily Rate).
- Active Promotion: Promo code FESTIVE25 gives 25% OFF all tool leases!

Tone: Concise, warm, professional, practical, and helpful. Always provide specific tool names, prices, and deposit amounts. Keep answers under 3-4 sentences when possible.`;

// AI Assistant Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    // Call Gemini 3.8 Flash via @google/genai SDK
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${message}` }] },
        ],
      });

      const reply = response.text || 'I can help you check tool availability, deposit calculations, or book a certified technician.';
      res.json({ reply });
      return;
    }

    // Fallback response if GEMINI_API_KEY is not configured
    const lower = message.toLowerCase();
    let fallbackReply = "Hello! I am your Craft & Care Assistant. You can rent commercial power tools (drills, pressure washers, generators) with 100% refundable deposits, or book certified technicians for AC repair, electrical, and plumbing.";

    if (lower.includes('drill') || lower.includes('concrete') || lower.includes('hammer')) {
      fallbackReply = "We have the VoltMax 20V Cordless Rotary Hammer Drill in stock (₹150/day, ₹400 refundable deposit). It features 2.6 Joules impact energy and SDS-Plus chuck, perfect for masonry anchor holes.";
    } else if (lower.includes('washer') || lower.includes('clean') || lower.includes('pressure')) {
      fallbackReply = "The Kranzle HydroBlast 3000 PSI Pressure Washer is available at ₹220/day with a ₹600 refundable deposit. It delivers 2.5 GPM water flow and includes a 50ft commercial hose for driveways and courtyards.";
    } else if (lower.includes('deposit') || lower.includes('refund') || lower.includes('late')) {
      fallbackReply = "All security deposits are held in escrow and 100% refunded immediately after return inspection. If a return is delayed, the late fee is calculated as Overdue Days × (1.5 × Daily Rate).";
    } else if (lower.includes('ac') || lower.includes('cooling') || lower.includes('gas')) {
      fallbackReply = "Our Advanced AC Repair & Foam Jet Wash starts at ₹449 with a 45-day cooling guarantee. Master technician Muthu Vel (4.9★ rating) is available for 60-minute dispatch.";
    } else if (lower.includes('plumb') || lower.includes('leak') || lower.includes('pipe')) {
      fallbackReply = "Master Plumbing & Leak Detection starts at ₹249 with acoustic seepage scanning and a 30-day leak-free guarantee. Suresh Babu (4.95★) is available for dispatch.";
    } else if (lower.includes('electric') || lower.includes('power') || lower.includes('short')) {
      fallbackReply = "Certified Electrician Diagnostics start at ₹299 for circuit tripping and switchboard fixes with a 30-day workmanship guarantee.";
    } else if (lower.includes('code') || lower.includes('discount') || lower.includes('festive') || lower.includes('offer')) {
      fallbackReply = "Use promo code FESTIVE25 at checkout to receive 25% OFF all equipment rentals and ₹150 OFF your first technician visit!";
    }

    res.json({ reply: fallbackReply });
  } catch (err: any) {
    console.error('AI chat error:', err);
    res.status(500).json({
      error: 'Failed to process AI response',
      details: err?.message || 'Internal server error',
    });
  }
});

// Mount Vite in development or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Craft & Care server running on port ${port}`);
  });
}

startServer();
