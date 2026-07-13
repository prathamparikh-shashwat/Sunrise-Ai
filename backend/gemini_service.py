import os
import json
import requests
from typing import Dict, Any, List

def load_questions_for_business(business_type: str) -> Dict[str, Any]:
    """
    Attempt to load questionnaire JSON mapping from the frontend data files.
    """
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    # The frontend data folder is at ../frontend/src/data relative to the backend folder
    frontend_data_dir = os.path.abspath(os.path.join(backend_dir, "..", "frontend", "src", "data"))
    
    file_map = {
        "tailoring": "tailoring.json",
        "retail": "retail.json",
        "cattlefeed": "cattlefeed.json",
        "general": "general.json"
    }
    
    file_name = file_map.get(business_type.lower())
    if not file_name:
        return {}
        
    full_path = os.path.join(frontend_data_dir, file_name)
    if os.path.exists(full_path):
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading JSON file {full_path}: {e}")
            
    return {}

def get_questions_and_answers(business_type: str, answers: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Map short-code answers (e.g. TQ1, RQ1) to the actual questionnaire texts.
    """
    config = load_questions_for_business(business_type)
    qa_list = []
    
    if config and "questions" in config:
        for q in config["questions"]:
            q_id = q.get("id")
            q_text = q.get("question")
            ans_val = answers.get(q_id, "")
            if ans_val:
                qa_list.append({
                    "question": q_text,
                    "answer": str(ans_val)
                })
    else:
        # Fallback if config files are not accessible: use key-value directly
        for key, value in answers.items():
            if key != "business_type":
                qa_list.append({
                    "question": key,
                    "answer": str(value)
                })
                
    return qa_list

def get_fallback_suggestions(business_type: str, answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Return high-quality software recommendations from the Sunrise suite locally if GenAI API is unreachable.
    """
    b_type = business_type.lower()
    
    # 1. Tailoring Business -> Sunrise TailorFlow
    if b_type == "tailoring":
        employees = answers.get("TQ1", "0")
        orders = answers.get("TQ2", "0")
        emp_count = int(employees) if str(employees).isdigit() else 0
        order_count = int(orders) if str(orders).isdigit() else 0
        
        # Decide Tier
        if emp_count <= 4:
            tier = "Starter Plan"
            price = "$29"
            base_features = ["Digital Order Ledger", "Basic Customer Profiles", "Order Status Tracking", "Single User Access"]
        elif emp_count <= 15:
            tier = "Professional Plan"
            price = "$79"
            base_features = ["Kanban Workload Board", "Basic Inventory Thresholds", "Up to 5 User Logins", "Advanced Order Search"]
        else:
            tier = "Enterprise Plan"
            price = "$149"
            base_features = ["Multi-Location Support", "Advanced Capacity Planning", "Unlimited Tailor Logins", "API & Webhook Access"]
            
        tier_rationale = f"Recommended the {tier} ({price}/mo) because your business has {emp_count} tailors and processes approximately {order_count} orders/month. This tier matches your capacity requirements."
        
        solutions = []
        
        staff_challenge = answers.get("TQ3", "")
        if staff_challenge == 'Low productivity':
            solutions.append({
                "challenge": "Low staff productivity",
                "solution_title": "Tailor Incentive Hub",
                "description": "Transition tailors to performance-based pay. Track garment completion counts and automate baseline vs. incentive payroll.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "High"
            })
        elif staff_challenge == 'Difficulty finding skilled tailors':
            solutions.append({
                "challenge": "Difficulty finding skilled tailors",
                "solution_title": "Standard Onboarding Hub",
                "description": "Utilize our built-in training flows and template pattern checklists to bring apprentice tailors up to speed in weeks.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "Medium"
            })
        else:
            solutions.append({
                "challenge": "Staff coordination",
                "solution_title": "Visual Kanban Garment Tracker",
                "description": "Use the visual Kanban workload board to assign garments and balance tailoring queues across active staff.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "Medium"
            })
            
        inventory_challenge = answers.get("TQ4", "")
        if inventory_challenge == 'Fabric wastage':
            solutions.append({
                "challenge": "Fabric wastage",
                "solution_title": "CAD Pattern Nesting Module",
                "description": "Apply computer-aided pattern nesting directly from our tablet module to optimize fabric cuts and reduce waste by up to 15%.",
                "pricing": "$25/mo",
                "is_addon": True,
                "impact": "High"
            })
        else:
            solutions.append({
                "challenge": "Inventory shortages",
                "solution_title": "Inventory Threshold Alerts",
                "description": "Define minimum stock levels for threads, common lining fabrics, and buttons. Automatically flag items for restock.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "Medium"
            })
            
        ops_challenge = answers.get("TQ5", "")
        if ops_challenge == 'Late order delivery':
            solutions.append({
                "challenge": "Late order delivery",
                "solution_title": "Buffer Scheduler Engine",
                "description": "Use automated order alerts and 2-day buffer calculations at order intake to keep your workshop on schedule.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "High"
            })
        elif ops_challenge == 'Measurement errors':
            solutions.append({
                "challenge": "Measurement errors",
                "solution_title": "Measurement Vault Sync",
                "description": "Digitally lock customer sizing history. Enforce a mandatory second-tailor double-check confirmation within the app.",
                "pricing": "$10/mo",
                "is_addon": True,
                "impact": "High"
            })
            
        goal = answers.get("TQ7", "")
        if goal == 'Increase repeat customers':
            solutions.append({
                "challenge": "Low repeat customer rate",
                "solution_title": "WhatsApp/SMS Notify & Campaigns",
                "description": "Send automated SMS or WhatsApp alerts when garments start cutting, are stitched, and trigger marketing offers on birthdays.",
                "pricing": "$15/mo",
                "is_addon": True,
                "impact": "High"
            })
            
        return {
            "software_name": "Sunrise TailorFlow",
            "tagline": "The ultimate workshop management and order tracking suite for tailors & designers.",
            "recommended_tier": tier,
            "base_price": price,
            "billing_cycle": "monthly",
            "tier_rationale": tier_rationale,
            "base_features": base_features,
            "solutions": solutions
        }
        
    # 2. Retail Business -> Sunrise StoreWise POS
    elif b_type == "retail":
        employees = answers.get("RQ1", "0")
        daily_customers = answers.get("RQ2", "0")
        emp_count = int(employees) if str(employees).isdigit() else 0
        cust_count = int(daily_customers) if str(daily_customers).isdigit() else 0
        
        if emp_count <= 2 and cust_count <= 20:
            tier = "Starter POS"
            price = "$39"
            base_features = ["Single Register Billing", "Up to 1,000 SKUs", "Basic Sales Reports", "Digital Receipts"]
        elif emp_count <= 5 or cust_count <= 100:
            tier = "Growth POS"
            price = "$89"
            base_features = ["Up to 3 Registers", "Up to 10,000 SKUs", "Barcode Scanner Support", "Purchase Order Management"]
        else:
            tier = "Enterprise POS"
            price = "$179"
            base_features = ["Unlimited Registers", "Unlimited SKUs", "Central Warehouse Sync", "Loyalty Program Support"]
            
        tier_rationale = f"Recommended the {tier} ({price}/mo) because your retail shop employs {emp_count} staff and serves about {cust_count} customers daily. This tier accommodates your transaction scale."
        
        solutions = []
        
        staff_challenge = answers.get("RQ3", "")
        if staff_challenge == 'Low productivity':
            solutions.append({
                "challenge": "Low staff productivity",
                "solution_title": "POS Staff Target Tracker",
                "description": "Establish clear sales targets and automatically calculate daily retail staff commissions based on transaction conversions.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "High"
            })
        else:
            solutions.append({
                "challenge": "Staff training",
                "solution_title": "Customer Service Trainer Hub",
                "description": "Access interactive scripts and training guides inside the POS app to upskill cashiers on upselling and client service.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "Medium"
            })
            
        inventory_challenge = answers.get("RQ4", "")
        if inventory_challenge == 'Dead or unsold stock':
            solutions.append({
                "challenge": "Dead or unsold stock",
                "solution_title": "DeadStock Analytics Module",
                "description": "Use the smart dashboard to flag slow-moving items and auto-generate promotional discount bundles for the checkout lane.",
                "pricing": "$15/mo",
                "is_addon": True,
                "impact": "High"
            })
        else:
            solutions.append({
                "challenge": "Stockouts",
                "solution_title": "Auto-Restock Engine",
                "description": "Set safety thresholds and replenishment lead times for core items. Let the system generate restock orders automatically.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "High"
            })
            
        sales_challenge = answers.get("RQ6", "")
        if sales_challenge == 'Low customer footfall':
            solutions.append({
                "challenge": "Low customer footfall",
                "solution_title": "Local Footfall Booster (Google SEO & Maps)",
                "description": "Run customer loyalty campaigns and set up automatic SMS invitations requesting online reviews to boost local Google Maps search visibility.",
                "pricing": "$20/mo",
                "is_addon": True,
                "impact": "High"
            })
        elif sales_challenge == 'Low repeat customers':
            solutions.append({
                "challenge": "Low repeat customers",
                "solution_title": "Customer Loyalty & Rewards Engine",
                "description": "Enroll customers in a point-based loyalty program using their phone numbers, offering cash-back redeemable points on repeat checkouts.",
                "pricing": "$20/mo",
                "is_addon": True,
                "impact": "High"
            })
            
        system = answers.get("RQ5", "")
        if system in ['Paper registers', 'No structured system']:
            solutions.append({
                "challenge": "Manual billing and bookkeeping",
                "solution_title": "Cloud Smart Checkout",
                "description": "Transition checkouts to our cloud POS software to support barcode scanning and instant sales-tax reconciliation.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "High"
            })
            
        return {
            "software_name": "Sunrise StoreWise POS",
            "tagline": "The modern retail point-of-sale and live inventory management solution.",
            "recommended_tier": tier,
            "base_price": price,
            "billing_cycle": "monthly",
            "tier_rationale": tier_rationale,
            "base_features": base_features,
            "solutions": solutions
        }
        
    # 3. Cattle Feed Business -> Sunrise FeedFlow ERP
    elif b_type == "cattlefeed":
        employees = answers.get("CFQ1", "0")
        volume = answers.get("CFQ2", "0")
        emp_count = int(employees) if str(employees).isdigit() else 0
        volume_count = int(volume) if str(volume).isdigit() else 0
        
        if emp_count <= 5 and volume_count <= 10:
            tier = "Mill Starter"
            price = "$149"
            base_features = ["Raw Material Reception Log", "Dispatch Register", "Basic Formulation Spreadsheet Sync"]
        elif emp_count <= 15 or volume_count <= 50:
            tier = "Factory Pro"
            price = "$299"
            base_features = ["Distributor Credit Caps", "Batching Production Sheets", "Inventory Audits", "Multiple Logins (up to 10)"]
        else:
            tier = "Enterprise ERP"
            price = "$599"
            base_features = ["Multi-plant Warehouse Sync", "Automated Formulation Scales Link", "Field Sales Agent App", "Full Accounting Integration"]
            
        tier_rationale = f"Recommended the {tier} ({price}/mo) based on {emp_count} active employees and production volume of {volume_count} tons/day. This ensures proper tracking of your manufacturing scale."
        
        solutions = []
        
        mfg_challenge = answers.get("CFQ3", "")
        if mfg_challenge == 'Ingredient mixing accuracy':
            solutions.append({
                "challenge": "Ingredient mixing accuracy",
                "solution_title": "NutriMix Scale Integration",
                "description": "Connect your mill's digital scales to our batching module to ensure micro-ingredients are mixed precisely to formula specs.",
                "pricing": "$49/mo",
                "is_addon": True,
                "impact": "High"
            })
        elif mfg_challenge == 'Machine downtime and maintenance':
            solutions.append({
                "challenge": "Machine downtime and maintenance",
                "solution_title": "Preventive Machine Maintenance Module",
                "description": "Log runtime hours for pellet dies and hammer mills to trigger scheduled maintenance alerts before costly breakdowns occur.",
                "pricing": "$29/mo",
                "is_addon": True,
                "impact": "Medium"
            })
        else:
            solutions.append({
                "challenge": "Production quality control",
                "solution_title": "Batch & Formulation Logs",
                "description": "Standardize batch sheets within the system, recording raw material intake and pellet quality reports dynamically.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "Medium"
            })
            
        supply_challenge = answers.get("CFQ4", "")
        if supply_challenge == 'Fluctuating raw material prices (grains, meals)':
            solutions.append({
                "challenge": "Fluctuating raw material prices",
                "solution_title": "Least-Cost Formulation (LCF) Engine",
                "description": "Use the built-in LCF calculator to dynamically adjust feed ingredient ratios based on market prices while locking in nutritional standards.",
                "pricing": "$79/mo",
                "is_addon": True,
                "impact": "High"
            })
            
        sales_challenge = answers.get("CFQ5", "")
        if sales_challenge == 'Outstanding customer credit and collections':
            solutions.append({
                "challenge": "Outstanding distributor credit",
                "solution_title": "Distributor Ledger & Credit Caps",
                "description": "Enforce maximum credit ceilings per distributor and set up automated email/SMS reminders for payment deadlines.",
                "pricing": "$39/mo",
                "is_addon": True,
                "impact": "High"
            })
            
        system = answers.get("CFQ6", "")
        if system in ['Paper registers', 'No structured system']:
            solutions.append({
                "challenge": "Paper-based inventory logs",
                "solution_title": "Batch & Inventory Control",
                "description": "Replace manual logbooks with digital tracking of grain bags from initial intake to final distributor dispatch.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "High"
            })
            
        return {
            "software_name": "Sunrise FeedFlow ERP",
            "tagline": "End-to-end mill management, recipe formulation, and distributor billing for feed manufacturers.",
            "recommended_tier": tier,
            "base_price": price,
            "billing_cycle": "monthly",
            "tier_rationale": tier_rationale,
            "base_features": base_features,
            "solutions": solutions
        }
        
    # 4. General Business -> Sunrise BizSuite
    else:
        employees = answers.get("GQ1", "0")
        transactions = answers.get("GQ2", "0")
        emp_count = int(employees) if str(employees).isdigit() else 0
        tx_count = int(transactions) if str(transactions).isdigit() else 0
        
        if emp_count <= 4:
            tier = "Starter Plan"
            price = "$19"
            base_features = ["Shared Task Board", "Customer Contact Registry", "Basic File Vault (5GB)"]
        elif emp_count <= 20:
            tier = "Standard Plan"
            price = "$49"
            base_features = ["Invoicing Ledger", "Shared Team Roster", "File Vault (50GB)", "Up to 20 Users"]
        else:
            tier = "Enterprise Plan"
            price = "$99"
            base_features = ["Automated Workflows & Approvals", "API Integration", "Unlimited Users", "Custom Security Policies"]
            
        tier_rationale = f"Recommended the {tier} ({price}/mo) matching your workforce of {emp_count} members and administrative transaction load of {tx_count}/month."
        
        solutions = []
        
        challenge = answers.get("GQ3", "")
        if challenge == 'Managing team schedules and tasks':
            solutions.append({
                "challenge": "Managing team schedules and tasks",
                "solution_title": "Team Portal Taskboard & Schedules",
                "description": "Coordinate project owners and timelines inside the team portal. Track milestones and assignments in real-time.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "High"
            })
        elif challenge == 'Tracking sales, billing, and financials':
            solutions.append({
                "challenge": "Tracking sales, billing, and financials",
                "solution_title": "Smart Invoicing & Ledger Sync",
                "description": "Sync billing and expenses to get a live dashboard of cash flow, outstanding receivables, and business profit margins.",
                "pricing": "$19/mo",
                "is_addon": True,
                "impact": "High"
            })
        elif challenge == 'Customer communication and marketing':
            solutions.append({
                "challenge": "Customer communication & marketing",
                "solution_title": "Client CRM & WhatsApp Campaigns",
                "description": "Keep detailed records of client communications and send newsletters or custom updates directly from the admin dashboard.",
                "pricing": "$25/mo",
                "is_addon": True,
                "impact": "High"
            })
            
        goal = answers.get("GQ5", "")
        if goal == 'Improve team productivity':
            solutions.append({
                "challenge": "Standardizing operating procedures",
                "solution_title": "SOP Vault & Training Hub",
                "description": "Document operational checklists in the cloud library so team members can execute daily tasks consistently.",
                "pricing": "$15/mo",
                "is_addon": True,
                "impact": "High"
            })
            
        if not solutions:
            solutions.append({
                "challenge": "Operations tracking",
                "solution_title": "Business Performance Dashboard",
                "description": "Set up a clean KPI overview to track monthly team progress and revenue milestones.",
                "pricing": "Included in plan",
                "is_addon": False,
                "impact": "Medium"
            })
            
        return {
            "software_name": "Sunrise BizSuite",
            "tagline": "The unified operational dashboard for task tracking, secure documents, and team coordination.",
            "recommended_tier": tier,
            "base_price": price,
            "billing_cycle": "monthly",
            "tier_rationale": tier_rationale,
            "base_features": base_features,
            "solutions": solutions
        }

def get_gemini_suggestions(business_type: str, answers: Dict[str, Any]) -> Dict[str, Any]:

    api_key = os.getenv("GemAI_API_Key") or os.getenv("GEMINI_API_KEY")
    router_api_key = os.getenv("Router_Api_key")
    
    qa_list = get_questions_and_answers(business_type, answers)
    
    # Build prompt
    prompt = f"""
You are a senior business consultant and strategic advisor at Sunrise.
Your task is to recommend one of our four software suites to help solve the customer's business challenges, choose the appropriate pricing tier, and list solutions (both included features and optional paid add-ons).

Our Product Suite:
1. Sunrise TailorFlow (for Tailoring Business)
   - Tiers: Starter Plan ($29/mo), Professional Plan ($79/mo), Enterprise Plan ($149/mo).
   - Add-ons: CAD Pattern Nesting Module ($25/mo), WhatsApp/SMS Notify Add-on ($15/mo), Measurement Vault Sync ($10/mo).
2. Sunrise StoreWise POS (for Retail Shop)
   - Tiers: Starter POS ($39/mo), Growth POS ($89/mo), Enterprise POS ($179/mo).
   - Add-ons: DeadStock Analytics Module ($15/mo), Local Footfall Booster ($20/mo), Customer Loyalty & Rewards Engine ($20/mo), Auto-Restock & Supplier Sync ($19/mo).
3. Sunrise FeedFlow ERP (for Cattle Feed Business)
   - Tiers: Mill Starter ($149/mo), Factory Pro ($299/mo), Enterprise ERP ($599/mo).
   - Add-ons: NutriMix Scale Integration ($49/mo), Preventive Machine Maintenance Module ($29/mo), Least-Cost Formulation (LCF) Engine ($79/mo), Distributor Credit Caps & Automated SMS Reminders ($39/mo).
4. Sunrise BizSuite (for General Business)
   - Tiers: Starter Plan ($19/mo), Standard Plan ($49/mo), Enterprise Plan ($99/mo).
   - Add-ons: Smart Invoicing & Ledger Sync ($19/mo), Client CRM & WhatsApp Campaigns ($25/mo), SOP Vault & Training Hub ($15/mo).

Rules for Plan Selection:
- Recommend Starter if employee count is small (e.g. <=4) and transaction volume is low.
- Recommend Pro/Standard/Growth for mid-sized operations.
- Recommend Enterprise for larger operations.

Your response MUST be a JSON object containing the recommended software configuration.

Business Type: {business_type.capitalize()}

Questionnaire Responses:
"""
    for qa in qa_list:
        prompt += f"- Question: {qa['question']}\n  Answer: {qa['answer']}\n"
        
    prompt += """
Please analyze their responses, challenges, and goals. Select the recommended Sunrise product, tier, and pricing.
Then, map their specific challenges to specific features/modules of the recommended software.
Classify each solution as either a paid add-on (set `is_addon` to true, specify pricing like "$15/mo", "$25/mo", etc.) or an included feature (set `is_addon` to false, specify pricing like "Included").

Format the output strictly as a JSON object matching this schema:
{
  "software_name": "Sunrise TailorFlow",
  "tagline": "Short action-oriented marketing tagline.",
  "recommended_tier": "Professional Plan",
  "base_price": "$79",
  "billing_cycle": "monthly",
  "tier_rationale": "Explanation of why this plan fits their team size and order volume.",
  "base_features": ["Feature A", "Feature B", "Feature C"],
  "solutions": [
    {
      "challenge": "Fabric wastage",
      "solution_title": "CAD Pattern Nesting Module",
      "description": "Detailed explanation of how this module addresses the challenge.",
      "pricing": "$25/mo",
      "is_addon": true,
      "impact": "High"
    }
  ]
}

Return raw JSON only. Do not wrap the JSON output in markdown blocks or HTML tags.
"""

    # Helper function to clean and parse JSON response
    def parse_json_response(text: str) -> Dict[str, Any]:
        text = text.strip()
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
        return json.loads(text)

    # 1. Try calling Gemini
    if api_key:
        try:
            print("Attempting to call Gemini API...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            
            # Configure strict output schema mapping
            schema = {
                "type": "OBJECT",
                "properties": {
                    "suggestions": {
                        "type": "OBJECT",
                        "properties": {
                            "software_name": { "type": "STRING" },
                            "tagline": { "type": "STRING" },
                            "recommended_tier": { "type": "STRING" },
                            "base_price": { "type": "STRING" },
                            "billing_cycle": { "type": "STRING" },
                            "tier_rationale": { "type": "STRING" },
                            "base_features": {
                                "type": "ARRAY",
                                "items": { "type": "STRING" }
                            },
                            "solutions": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "challenge": { "type": "STRING" },
                                        "solution_title": { "type": "STRING" },
                                        "description": { "type": "STRING" },
                                        "pricing": { "type": "STRING" },
                                        "is_addon": { "type": "BOOLEAN" },
                                        "impact": { "type": "STRING" }
                                    },
                                    "required": ["challenge", "solution_title", "description", "pricing", "is_addon", "impact"]
                                }
                            }
                        },
                        "required": [
                            "software_name", "tagline", "recommended_tier", "base_price", "billing_cycle", 
                            "tier_rationale", "base_features", "solutions"
                        ]
                    }
                },
                "required": ["suggestions"]
            }
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "responseSchema": schema
                }
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=20)
            response.raise_for_status()
            res_data = response.json()
            
            candidates = res_data.get("candidates", [])
            if candidates:
                text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                parsed_data = parse_json_response(text)
                return {
                    "suggestions": parsed_data.get("suggestions", {}),
                    "source": "genai",
                    "message": "AI suggestions successfully generated by Gemini."
                }
            else:
                raise ValueError("No candidates returned from Gemini API.")
        except Exception as e:
            print(f"Error calling Gemini API: {e}.")
            # Proceed to fallback

    # 2. Try calling OpenRouter fallback
    if router_api_key:
        print("Attempting to call OpenRouter fallback API (openai/gpt-4o)...")
        try:
            url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {router_api_key}"
            }
            
            payload = {
                "model": "openai/gpt-4o",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "response_format": {
                    "type": "json_object"
                }
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=20)
            response.raise_for_status()
            res_data = response.json()
            
            choices = res_data.get("choices", [])
            if choices:
                text = choices[0].get("message", {}).get("content", "").strip()
                parsed_data = parse_json_response(text)
                return {
                    "suggestions": parsed_data.get("suggestions", {}),
                    "source": "openrouter",
                    "message": "AI suggestions successfully generated by OpenRouter (fallback)."
                }
            else:
                raise ValueError("No choices returned from OpenRouter API.")
        except Exception as e:
            print(f"Error calling OpenRouter API: {e}.")
            # Proceed to offline fallback

    # 3. Final Offline Fallback
    print("Both Gemini and OpenRouter failed or are not configured. Reverting to offline suggestions.")
    reason = "Keys not configured"
    if api_key or router_api_key:
        reason = "API calls failed"
    return {
        "suggestions": get_fallback_suggestions(business_type, answers),
        "source": "offline_fallback",
        "message": f"GenAI API call failed or was not configured ({reason}). Reverted to offline rule-based suggestions."
    }
