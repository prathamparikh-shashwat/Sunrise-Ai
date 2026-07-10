/**
 * Dynamic business analysis utility for the AI Consultant.
 * Maps questionnaire answers to custom strategic insights.
 */

export function analyzeBusiness(businessType, answers) {
  const recommendations = [];
  const insights = [];
  let riskScore = 30; // base score out of 100

  if (businessType === 'tailoring') {
    const employees = parseInt(answers.TQ1) || 0;
    const orders = parseInt(answers.TQ2) || 0;
    const staffChallenge = answers.TQ3;
    const inventoryChallenge = answers.TQ4;
    const operationalChallenge = answers.TQ5;
    const system = answers.TQ6;
    const goal = answers.TQ7;

    // Scale risk score based on size and structure
    if (employees > 10 && system === 'Paper registers') riskScore += 15;
    if (orders > 100 && system === 'No structured system') riskScore += 25;

    // Staff Challenge Insights
    if (staffChallenge === 'Low productivity') {
      recommendations.push({
        area: 'Staffing & Productivity',
        title: 'Introduce Piece-Rate or Incentive-Based Pay',
        desc: 'Instead of fixed salaries, implement a hybrid pay structure with a baseline salary and productivity-based bonuses per completed garment to motivate tailors.'
      });
    } else if (staffChallenge === 'Difficulty finding skilled tailors') {
      recommendations.push({
        area: 'Staffing & Recruitment',
        title: 'Standardize Training & Apprenticeship Program',
        desc: 'Create a 2-week basic training track to onboard semi-skilled tailors, reducing dependency on finding highly experienced external talent.'
      });
    } else if (staffChallenge === 'Attendance issues') {
      recommendations.push({
        area: 'Staffing & Operations',
        title: 'Implement Digital Check-in & Roster Buffers',
        desc: 'Set up a simple digital attendance system and schedule buffer tailors on high-volume days to prevent delivery bottlenecks when absences occur.'
      });
    } else if (staffChallenge === 'Uneven workload distribution') {
      recommendations.push({
        area: 'Workforce Management',
        title: 'Establish a Kanban Board for Workload Tracking',
        desc: 'Use a physical or digital board to visually assign garments to tailors based on current load, ensuring no single tailor is overwhelmed.'
      });
    }

    // Inventory Challenge Insights
    if (inventoryChallenge === 'Fabric wastage') {
      recommendations.push({
        area: 'Material Efficiency',
        title: 'Implement CAD Pattern Nesting',
        desc: 'Utilize computer-aided pattern nesting techniques to layout patterns efficiently on fabric before cutting, reducing off-cuts and wastage by up to 15%.'
      });
      riskScore += 10;
    } else if (inventoryChallenge === 'Running out of materials') {
      recommendations.push({
        area: 'Supply Chain',
        title: 'Establish Reorder Thresholds for Standard Fabrics',
        desc: 'Define minimum stock levels for common lining materials, zippers, and threads. Reorder automatically when stock dips below the threshold.'
      });
    } else if (inventoryChallenge === 'Difficulty tracking materials') {
      recommendations.push({
        area: 'Inventory Control',
        title: 'Adopt Barcode or QR Tags for Fabric Rolls',
        desc: 'Label all fabric rolls with QR codes containing vendor, length, and fiber details, scanning them in/out of the storage room.'
      });
    }

    // Operational Challenge Insights
    if (operationalChallenge === 'Late order delivery') {
      recommendations.push({
        area: 'Delivery & Operations',
        title: 'Establish Lead Time Buffers',
        desc: 'Quote customers a delivery date that includes a mandatory 2-day buffer, allowing tailors to absorb alterations or late materials.'
      });
      riskScore += 15;
    } else if (operationalChallenge === 'Measurement errors') {
      recommendations.push({
        area: 'Quality Control',
        title: 'Implement a Two-Step Verification Protocol',
        desc: 'Have a second tailor verify critical measurements before fabric cutting. Record all measurements digitally in a unified customer database.'
      });
    } else if (operationalChallenge === 'Too much rework or alteration') {
      recommendations.push({
        area: 'Quality Assurance',
        title: 'Intermediate Fit Trials',
        desc: 'Schedule a mid-process fitting trial for complex garments (e.g. suits, bridal) before final stitching to catch issues early and minimize waste.'
      });
    }

    // System Recommendations
    if (system === 'Paper registers' || system === 'No structured system') {
      recommendations.push({
        area: 'Digital Transformation',
        title: 'Transition to Digital Order Management',
        desc: 'Migrate from manual records to a dedicated tailor-shop management software or a tailored spreadsheet. This centralizes orders, sizes, and collection dates.'
      });
      insights.push('Operating with manual/no tracking limits scaling capacity and makes order search highly inefficient.');
    } else {
      insights.push('Using digital tools provides a solid foundation. Focus on integrating inventory tracking with your order list.');
    }

    // Goal recommendations
    if (goal === 'Reduce fabric wastage') {
      recommendations.push({
        area: 'Strategic Goal',
        title: 'Fabric Scrap Upcycling Initiatives',
        desc: 'Collect fabric scraps to create accessories (like pocket squares, scrunchies, or patchwork bags) which can be sold or gifted to customers.'
      });
    } else if (goal === 'Increase repeat customers') {
      recommendations.push({
        area: 'Strategic Goal',
        title: 'Implement automated SMS/WhatsApp alerts',
        desc: 'Send automated updates to customers when order processing starts, is completed, and on birthdays/anniversaries with special discounts.'
      });
    }

  } else if (businessType === 'retail') {
    const employees = parseInt(answers.RQ1) || 0;
    const dailyCustomers = parseInt(answers.RQ2) || 0;
    const staffChallenge = answers.RQ3;
    const inventoryChallenge = answers.RQ4;
    const system = answers.RQ5;
    const salesChallenge = answers.RQ6;
    const goal = answers.RQ7;

    // Scale risk score
    if (employees > 5 && system === 'Paper registers') riskScore += 15;
    if (dailyCustomers > 50 && system === 'No structured system') riskScore += 25;

    // Staff Challenge Insights
    if (staffChallenge === 'Low productivity') {
      recommendations.push({
        area: 'Staff Management',
        title: 'Establish Daily Sales Targets and Commissions',
        desc: 'Motivate employees by establishing clear daily goals for footfall conversion and providing small bonuses for exceeding targets.'
      });
    } else if (staffChallenge === 'Attendance issues') {
      recommendations.push({
        area: 'Staff Operations',
        title: 'Use Collaborative Scheduling Apps',
        desc: 'Use digital scheduling tools where staff can request shift swaps themselves, reducing absenteeism and management overhead.'
      });
    } else if (staffChallenge === 'Poor customer service') {
      recommendations.push({
        area: 'Customer Experience',
        title: 'Structured Customer Service Training',
        desc: 'Conduct short roleplay training sessions focusing on greeting customers, active listening, and addressing customer objections constructively.'
      });
    }

    // Inventory Challenge Insights
    if (inventoryChallenge === 'Dead or unsold stock') {
      recommendations.push({
        area: 'Inventory Optimization',
        title: 'Implement Markdown and Bundling Campaigns',
        desc: 'Group slow-moving inventory with high-demand products as a bundle, or run seasonal clear-out sales to free up shelf space and cash flow.'
      });
      riskScore += 10;
    } else if (inventoryChallenge === 'Running out of popular products') {
      recommendations.push({
        area: 'Stock Procurement',
        title: 'Implement Safety Stock Thresholds',
        desc: 'Calculate lead times for top-selling items and set up alerts to order replacement batches well before current stock hits zero.'
      });
    } else if (inventoryChallenge === 'Difficulty tracking stock') {
      recommendations.push({
        area: 'Store Management',
        title: 'Conduct Weekly Cycle Counts',
        desc: 'Instead of annual inventory audits, audit one category of products every week. This keeps stock records accurate without closing the shop.'
      });
    }

    // Sales Challenge Insights
    if (salesChallenge === 'Low customer footfall') {
      recommendations.push({
        area: 'Marketing & Sales',
        title: 'Optimize Google Business Profile & Local SEO',
        desc: 'Claim your Google Maps listing, update hours, upload pictures of high-quality products, and encourage happy customers to leave reviews.'
      });
      riskScore += 10;
    } else if (salesChallenge === 'Low repeat customers') {
      recommendations.push({
        area: 'Customer Retention',
        title: 'Launch a Simple Phone-Number Loyalty Program',
        desc: 'Offer customers points for every purchase (e.g. 5% cashback in points) retrievable via their phone number. This encourages repeat visits.'
      });
    } else if (salesChallenge === 'Low profit margins') {
      recommendations.push({
        area: 'Pricing Strategy',
        title: 'Optimize Pricing & Focus on High-Margin Bundles',
        desc: 'Audit product margins. Position high-margin items at eye-level on shelves and train staff to upsell them alongside standard purchases.'
      });
    }

    // System Recommendations
    if (system === 'Paper registers' || system === 'No structured system') {
      recommendations.push({
        area: 'Digital Infrastructure',
        title: 'Deploy a Cloud-Based POS System',
        desc: 'Implement a cloud-hosted Point of Sale (POS) system with barcode scanning. This integrates sales tracking and instant inventory deductions.'
      });
      insights.push('Manual checkout and stock-keeping limit checkout speed, hide actual stock levels, and make sales analysis difficult.');
    } else {
      insights.push('Existing POS/billing software provides a strong sales ledger. Ensure it is connected to a live inventory database.');
    }

    // Goal recommendations
    if (goal === 'Improve inventory turnover') {
      recommendations.push({
        area: 'Strategic Goal',
        title: 'First-In, First-Out (FIFO) Shelf Management',
        desc: 'Ensure staff rotate stock on shelves (placing newer products in the back, older products in the front) to maintain freshness and turnover.'
      });
    } else if (goal === 'Open another shop') {
      recommendations.push({
        area: 'Expansion Strategy',
        title: 'Standardize Operations into Playbooks',
        desc: 'Document checkout, inventory receiving, opening/closing, and customer service procedures into standard manuals so a new shop can run independently.'
      });
    }
  } else if (businessType === 'general') {
    const employees = parseInt(answers.GQ1) || 0;
    const monthlyTransactions = parseInt(answers.GQ2) || 0;
    const challenge = answers.GQ3;
    const system = answers.GQ4;
    const goal = answers.GQ5;

    // Scale risk score
    if (employees > 8 && system === 'Paper books and manual registers') riskScore += 15;
    if (monthlyTransactions > 200 && system === 'No structured record system') riskScore += 25;

    // Challenge Insights
    if (challenge === 'Managing team schedules and tasks') {
      recommendations.push({
        area: 'Operations',
        title: 'Adopt Task Management Software',
        desc: 'Implement a shared digital task board (such as Trello, Notion, or Asana) to define milestones, assign responsibilities, and monitor deadlines in real time.'
      });
    } else if (challenge === 'Tracking sales, billing, and financials') {
      recommendations.push({
        area: 'Financial Control',
        title: 'Migrate to Cloud Accounting',
        desc: 'Integrate tools like QuickBooks, Wave, or Xero to automate customer billing, track expenses, and view real-time profit and loss reports.'
      });
      riskScore += 10;
    } else if (challenge === 'Inventory or material tracking') {
      recommendations.push({
        area: 'Resource Planning',
        title: 'Set Up Automated Inventory Counts',
        desc: 'Establish digital stock sheets with automatic warning thresholds that notify you when materials or key assets drop below safety levels.'
      });
    } else if (challenge === 'Customer communication and marketing') {
      recommendations.push({
        area: 'Client Management',
        title: 'Deploy a Simple Customer CRM',
        desc: 'Use a customer relationship manager (CRM) to store contact histories, log interaction notes, and automate follow-ups or feedback requests.'
      });
    }

    // System Recommendations
    if (system === 'Paper books and manual registers' || system === 'No structured record system') {
      recommendations.push({
        area: 'Digital Transformation',
        title: 'Implement Structured Digital Ledgers',
        desc: 'Begin migrating files to secure cloud spreadsheets or specialized databases to ensure operational data is searchable, backed up, and audit-friendly.'
      });
      insights.push('Relying on paper-based or unorganized data structures severely limits administrative scaling and introduces high operational errors.');
    } else {
      insights.push('Using digital software provides a robust audit trail. Focus on integrating task and project data into one portal.');
    }

    // Goal recommendations
    if (goal === 'Reduce operating costs') {
      recommendations.push({
        area: 'Cost Optimization',
        title: 'Audit Variable Costs and Automate Admin Tasks',
        desc: 'Review software subscriptions and material costs quarterly. Automate repetitive onboarding and scheduling tasks to lower labor overhead.'
      });
    } else if (goal === 'Increase sales and customer base') {
      recommendations.push({
        area: 'Growth Strategy',
        title: 'Optimize Digital Channels and Referral Programs',
        desc: 'Launch a customer referral incentive program and optimize local business SEO on search engines to drive inbound traffic.'
      });
    } else if (goal === 'Improve team productivity') {
      recommendations.push({
        area: 'Workforce Strategy',
        title: 'Define Standard Operating Procedures (SOPs)',
        desc: 'Document critical routine workflows into clear checklists so team members can execute operations independently with minimal manager oversight.'
      });
    } else if (goal === 'Expand to new locations or services') {
      recommendations.push({
        area: 'Scale Operations',
        title: 'Standardize Scale Playbook',
        desc: 'Standardize your core business processes and build a training playbook to onboard new team members or branches efficiently.'
      });
    }
  } else if (businessType === 'cattlefeed') {
    const employees = parseInt(answers.CFQ1) || 0;
    const volume = parseInt(answers.CFQ2) || 0;
    const mfgChallenge = answers.CFQ3;
    const supplyChallenge = answers.CFQ4;
    const salesChallenge = answers.CFQ5;
    const system = answers.CFQ6;
    const goal = answers.CFQ7;

    // Scale risk score
    if (employees > 15 && system === 'Paper registers') riskScore += 15;
    if (volume > 100 && system === 'No structured system') riskScore += 25;

    // Manufacturing Challenge Recommendations
    if (mfgChallenge === 'Ingredient mixing accuracy') {
      recommendations.push({
        area: 'Manufacturing & QC',
        title: 'Adopt Digital Batch Formulation Scale Integration',
        desc: 'Connect digital weighing scales with computerized feed formulation software to ensure precise addition of micronutrients and consistent nutritional quality.'
      });
      riskScore += 10;
    } else if (mfgChallenge === 'Machine downtime and maintenance') {
      recommendations.push({
        area: 'Equipment Operations',
        title: 'Implement Preventive Maintenance Scheduling',
        desc: 'Set up a weekly maintenance log for pellet mills, hammer mills, and mixers. Keep critical spares (dies, hammers, bearings) in stock to reduce breakdown time.'
      });
    } else if (mfgChallenge === 'Moisture control and spoilage') {
      recommendations.push({
        area: 'Quality Control',
        title: 'Moisture Sensors & Safe Storage Protocols',
        desc: 'Install real-time moisture sensors at the cooler/dryer exit. Implement strict raw material check-in standards (reject grains with >12-14% moisture) and use raised pallets in warehouses.'
      });
      riskScore += 15;
    } else if (mfgChallenge === 'High electricity and power costs') {
      recommendations.push({
        area: 'Cost Control',
        title: 'Optimize Peak-Demand Scheduling & Power Factor',
        desc: 'Run energy-intensive hammer mills during off-peak hours and install capacitor banks to improve the power factor, reducing utility demand charges.'
      });
    }

    // Supply Chain Challenge Recommendations
    if (supplyChallenge === 'Fluctuating raw material prices (grains, meals)') {
      recommendations.push({
        area: 'Procurement',
        title: 'Implement Raw Material Contracts & Alternative Formulation',
        desc: 'Negotiate forward contracts during harvest season for grains/soybean meal, and use least-cost formulation (LCF) software to dynamically adjust recipes based on pricing.'
      });
    } else if (supplyChallenge === 'Raw material quality inconsistency') {
      recommendations.push({
        area: 'Quality Control',
        title: 'Establish Vendor Specifications & Rapid Testing',
        desc: 'Define clear protein, fiber, and aflatoxin standards for suppliers. Implement rapid diagnostic kits for raw material intake testing before unloading.'
      });
    } else if (supplyChallenge === 'Supplier delivery delays') {
      recommendations.push({
        area: 'Supply Chain',
        title: 'Diversify Supplier Base & Safety Stock',
        desc: 'Maintain active accounts with at least three suppliers per key ingredient (e.g., maize, rice bran) and establish a 10-day safety stock buffer.'
      });
    } else if (supplyChallenge === 'Difficulty tracking raw material stock') {
      recommendations.push({
        area: 'Inventory Control',
        title: 'Digital Raw Material Inventory Register',
        desc: 'Migrate to a digital stock ledger mapping raw material receipt dates, batch numbers, and expirations, using first-in, first-out (FIFO) inventory flow.'
      });
    }

    // Sales Challenge Recommendations
    if (salesChallenge === 'Seasonal demand fluctuations') {
      recommendations.push({
        area: 'Sales Strategy',
        title: 'Promote Preservation Feeds & Off-Season Storage Deals',
        desc: 'Develop high-shelf-life mineral blocks or dry fodder formulations, and offer dealers pre-season discounts or flexible storage schemes during low-demand months.'
      });
    } else if (salesChallenge === 'Outstanding customer credit and collections') {
      recommendations.push({
        area: 'Financial Control',
        title: 'Strict Credit Limits & Cash-Discount Incentives',
        desc: 'Enforce maximum credit limits per dealer. Introduce a 2% discount for cash-on-delivery (COD) or early payments within 7 days to accelerate collections.'
      });
      riskScore += 20;
    } else if (salesChallenge === 'High transport and logistics costs') {
      recommendations.push({
        area: 'Logistics',
        title: 'Optimize Route Planning & Delivery Consolidation',
        desc: 'Establish fixed weekly dispatch routes to consolidate smaller dealer orders into full truckload (FTL) shipments, reducing cost per ton.'
      });
    } else if (salesChallenge === 'Local market competition') {
      recommendations.push({
        area: 'Marketing',
        title: 'Provide Farm-Level Feed Trials & Technical Seminars',
        desc: 'Conduct free demonstration feeding trials at select local dairy farms to prove milk yield improvements, and organize educational village seminars for farmers.'
      });
    } else if (salesChallenge === 'Low dealer/retailer awareness') {
      recommendations.push({
        area: 'Distribution',
        title: 'Dealer Loyalty Program & Visual Merchandising',
        desc: 'Launch a volume-based dealer reward structure and provide dealers with banners, product booklets, and branded display boards.'
      });
    }

    // System Recommendations
    if (system === 'Paper registers' || system === 'No structured system') {
      recommendations.push({
        area: 'Digital Transformation',
        title: 'Deploy Unified Feed ERP or Spreadsheet Ledger',
        desc: 'Transition from paper books to a dedicated business software or custom spreadsheet that links raw material inventory with batch records and customer invoices.'
      });
      insights.push('Relying on manual books limits control over formulation costs, hides stock theft/shrinkage, and complicates credit collection cycles.');
    } else {
      insights.push('Using digital software provides a robust audit trail. Focus on integrating task and project data into one portal.');
    }

    // Goal recommendations
    if (goal === 'Reduce production or formulation costs') {
      recommendations.push({
        area: 'Strategic Goal',
        title: 'Deploy Least-Cost Feed Formulation (LCF) Software',
        desc: 'Adopt LCF software to calculate the most cost-effective ingredient blend that meets the required nutritional values (protein, energy, fiber) based on daily price changes.'
      });
    } else if (goal === 'Reduce credit cycle and improve collections') {
      recommendations.push({
        area: 'Strategic Goal',
        title: 'Transition to Digital Invoicing and Automated Alerts',
        desc: 'Send automated SMS payment reminders to dealers 3 days before credit due dates, and integrate digital payment links (UPI, net banking) for instant settlement.'
      });
    } else if (goal === 'Expand dealer distribution network') {
      recommendations.push({
        area: 'Strategic Goal',
        title: 'Dealer Onboarding Package and Regional Commissions',
        desc: 'Offer attractive first-order margins and sign-up bonuses to new dealers in target districts, supported by regional sales representative visits.'
      });
    } else if (goal === 'Improve feed quality and consistency') {
      recommendations.push({
        area: 'Strategic Goal',
        title: 'Standardize Lab Testing & Quality Control Audits',
        desc: 'Implement weekly lab analysis of finished pellets to verify protein/moisture percentages against packaging claims, creating a quality guarantee seal.'
      });
    } else if (goal === 'Increase production capacity') {
      recommendations.push({
        area: 'Strategic Goal',
        title: 'Equipment Debottlenecking and Automation Upgrade',
        desc: 'Upgrade the pellet die size or pre-conditioner unit to increase mill output without replacing the entire machinery line.'
      });
    }
  }

  // Cap risk score between 10 and 95
  riskScore = Math.max(10, Math.min(95, riskScore));

  return {
    summary: businessType === 'tailoring' 
      ? 'A detailed review of your custom apparel workflows, tailoring operations, and order tracking methods.'
      : businessType === 'retail'
        ? 'A detailed review of your retail shop operations, inventory turnover rates, and customer traffic.'
        : businessType === 'cattlefeed'
          ? 'A detailed review of your cattle feed production operations, milling efficiency, ingredient sourcing, and dealer networks.'
          : 'A comprehensive operational review of your business workflows, productivity metrics, and digital records system.',
    riskScore,
    recommendations,
    insights
  };
}
