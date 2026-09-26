import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Compass,
  LayoutDashboard,
  Package,
  Layers,
  ScrollText,
  PackagePlus,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  FlaskConical,
  Radio,
  Warehouse,
  Bell,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface PageDirectoryItem {
  id: string;
  title: string;
  route: string;
  icon: any;
  category: 'Operations' | 'Intelligence' | 'Inventory' | 'Management' | 'Core';
  purpose: string;
  whereToViewWhat: string[];
  invariants: string;
  recommendedQueries: string[];
}

export const AppGuidePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const pages: PageDirectoryItem[] = [
    {
      id: 'dashboard',
      title: 'Executive Overview Dashboard',
      route: '/dashboard',
      icon: LayoutDashboard,
      category: 'Core',
      purpose: 'High-level executive pulse of inventory value, health score, urgent stockout risks, and rapid action triggers.',
      whereToViewWhat: [
        'Total inventory asset valuation across all warehouses',
        'Top urgent stockout risks with remaining days of cover',
        'Historical vs 30-day projected outbound demand trends',
        'One-click launch to What-If simulation for critical SKUs'
      ],
      invariants: 'Read-only aggregation. Computes real-time KPI metrics from current database balances.',
      recommendedQueries: ['Where is total inventory value?', 'How do I see high-level stockout alerts?']
    },
    {
      id: 'receipts',
      title: 'Inbound Receipts (Suppliers)',
      route: '/operations/receipts',
      icon: PackagePlus,
      category: 'Operations',
      purpose: 'Receive goods from external suppliers into warehouse intake locations (e.g., WH/Input or WH/Stock).',
      whereToViewWhat: [
        'Pending and completed supplier purchase orders',
        'Draft receipt creation with supplier and destination location picker',
        'Validation button to atomically receive stock and credit the audit ledger'
      ],
      invariants: 'Draft → Done state machine. Stock is strictly credited only upon human validation, appending an auditable RECEIPT ledger movement.',
      recommendedQueries: ['Where do I receive shipments from suppliers?', 'How to create an inbound receipt?']
    },
    {
      id: 'deliveries',
      title: 'Outbound Deliveries (Customers)',
      route: '/operations/deliveries',
      icon: Truck,
      category: 'Operations',
      purpose: 'Process customer orders and shipments out of warehouse storage locations.',
      whereToViewWhat: [
        'Outbound fulfillment orders and status (Draft, Waiting, Ready, Done)',
        'Real-time physical stock availability check per line',
        'Validation button to atomically deduct stock and write DELIVERY audit entry'
      ],
      invariants: 'Strict physical availability validation. Prevents negative stock balances by disallowing shipment validation if on-hand stock is insufficient.',
      recommendedQueries: ['Where do I fulfill customer orders?', 'Why is an outbound delivery blocked?']
    },
    {
      id: 'transfers',
      title: 'Inter-Warehouse Transfers',
      route: '/operations/transfers',
      icon: ArrowLeftRight,
      category: 'Operations',
      purpose: 'Rebalance inventory between warehouses to avert localized stockouts without placing new purchase orders.',
      whereToViewWhat: [
        'AI-recommended transfer proposals between surplus and deficit warehouses',
        'Cross-warehouse transfer order creation with source and destination selectors',
        'One-click execution of recommended transfers'
      ],
      invariants: 'Law of Conservation of Inventory. Single atomic database transaction deducts stock from Source and credits Destination with paired ledger movements sharing an identical transfer_link_id.',
      recommendedQueries: ['Where do I transfer stock between warehouses?', 'How to execute an AI transfer recommendation?']
    },
    {
      id: 'adjustments',
      title: 'Physical Count Adjustments',
      route: '/operations/adjustments',
      icon: SlidersHorizontal,
      category: 'Operations',
      purpose: 'Align theoretical system inventory with physical shelf reality during cycle counts or scrap reconciliation.',
      whereToViewWhat: [
        'Historical log of signed adjustments (counted vs system)',
        'Cycle count modal with mandatory reason codes (Damaged, Theft, Count Error, Expired)',
        'Signed variance delta calculation (+ / -)'
      ],
      invariants: 'Audit accountability. Directly recalibrates physical count, logging explicit signed delta variance and mandatory operational reason in the append-only ledger.',
      recommendedQueries: ['Where do I report damaged or lost items?', 'Physical stock does not match the app']
    },
    {
      id: 'what-if',
      title: 'What-If Decision Lab',
      route: '/intelligence/scenarios',
      icon: FlaskConical,
      category: 'Intelligence',
      purpose: 'Stress-test inventory strategies, simulate demand shocks (+/- 50%), and test supplier lead time delays without modifying live operational data.',
      whereToViewWhat: [
        'Interactive scenario simulation knobs (Demand shifts, Supplier delays, Proposed transfers)',
        'Simulated trajectory charts showing projected stockout day comparisons',
        'Zero-mutation verification badge confirming no database state was altered'
      ],
      invariants: 'Zero-Mutation Sandbox. Read-only projection using ephemeral memory models; guaranteed is_mutation_performed: false.',
      recommendedQueries: ['Where can I test what happens if demand spikes?', 'How to simulate a supplier delay?']
    },
    {
      id: 'radar',
      title: 'Risk & Reorder Radar',
      route: '/intelligence/radar',
      icon: Radio,
      category: 'Intelligence',
      purpose: 'Ranked list of inventory risks prioritizing critical components with explainable formulas for days of cover and reorder quantities.',
      whereToViewWhat: [
        'Impact-weighted risk scores factoring in business criticality (1.5x multiplier)',
        'Exact formula breakdown: (Outbound Velocity x Lead Time) + Safety Stock',
        'Direct links to either reorder from supplier or transfer from surplus warehouse'
      ],
      invariants: 'Explainable AI. Every recommendation provides transparent mathematical derivations, avoiding black-box assertions.',
      recommendedQueries: ['Which products need urgent reordering?', 'Why is an item marked as critical risk?']
    },
    {
      id: 'stock-levels',
      title: 'Multi-Warehouse Stock Matrix',
      route: '/inventory/stock-levels',
      icon: Layers,
      category: 'Inventory',
      purpose: 'Inspect granular physical stock distributions across all warehouses and storage locations.',
      whereToViewWhat: [
        'Cross-warehouse inventory matrix by product and location',
        'On-hand, reserved, and available stock quantities',
        'Location-level breakdown (e.g. WH-MAIN/STOCK, WH-ANNEX/STOCK)'
      ],
      invariants: 'Physical stock isolation. Stock belongs strictly to an exact location within a specific warehouse.',
      recommendedQueries: ['Where is stock located across warehouses?', 'How much available stock do I have?']
    },
    {
      id: 'ledger',
      title: 'Immutable Audit Ledger',
      route: '/inventory/ledger',
      icon: ScrollText,
      category: 'Inventory',
      purpose: 'Complete auditable history of every inventory change that has ever occurred in the workspace.',
      whereToViewWhat: [
        'Chronological movement ledger with filter by movement type',
        'Signed quantities (+ for receipts/transfer-in, - for deliveries/transfer-out)',
        'Paired transfer link IDs, timestamp, and CSV export functionality'
      ],
      invariants: 'Append-Only Immutability. Ledger records cannot be updated or deleted. Any corrective action must be entered as a new adjustment movement.',
      recommendedQueries: ['Where is the transaction audit trail?', 'How to prove inventory compliance for auditors?']
    },
    {
      id: 'warehouses',
      title: 'Warehouse & Facility Management',
      route: '/management/warehouses',
      icon: Warehouse,
      category: 'Management',
      purpose: 'Manage physical facilities, add new warehouses, and define internal bin/dock locations.',
      whereToViewWhat: [
        'Active warehouse list and address locations',
        'Creation of new internal, input, and output storage locations',
        'Location hierarchy management'
      ],
      invariants: 'Location integrity. Warehouses must contain at least one internal storage location to hold inventory.',
      recommendedQueries: ['Where do I add a new warehouse?', 'How do I add a new storage rack or bin?']
    },
    {
      id: 'alerts',
      title: 'Operational Alert Center',
      route: '/management/alerts',
      icon: Bell,
      category: 'Management',
      purpose: 'Triage, acknowledge, and resolve real-time operational notifications and stock alerts.',
      whereToViewWhat: [
        'Critical, warning, and informational system alerts',
        'Unacknowledged vs acknowledged alerts toggle',
        'Direct resolution shortcuts'
      ],
      invariants: 'Deterministic generation. Alerts fire automatically when days of cover dip below supplier replenishment lead times.',
      recommendedQueries: ['Where are system alerts?', 'How to silence or acknowledge an alert?']
    }
  ];

  const faqs = [
    {
      q: 'Where do I find why an item is flagged with a Critical Stockout Risk?',
      a: 'Navigate to the Risk & Reorder Radar (/intelligence/radar) or Product Profile (/products/:id). You will see the exact explainable formula: Daily Demand is calculated exclusively from validated outbound customer deliveries over the last 30 days. Days of Cover = (Current Stock / Daily Demand). If Days of Cover is less than the Supplier Lead Time, the item will stock out before new orders can arrive.'
    },
    {
      q: 'Can I simulate a change in demand or a supplier delay without altering real inventory?',
      a: 'Yes! That is the exact purpose of the What-If Decision Lab (/intelligence/scenarios). It operates as an ephemeral sandbox with a strict zero-mutation guarantee (is_mutation_performed: false). You can drag demand sliders, simulate 5-day supplier delays, and evaluate proposed transfer quantities with zero risk to your operational database.'
    },
    {
      q: 'How does StockSense ensure inventory is never accidentally deleted or fabricated?',
      a: 'Through the Double-Entry Conservation Invariant. Every single movement in the app (Receipts, Deliveries, Transfers, Adjustments) writes to an append-only audit ledger (StockMovement). For inter-warehouse transfers, a single atomic PostgreSQL transaction decrements the source and increments the destination with a shared transfer_link_id. Net company balance delta is guaranteed 0.0.'
    },
    {
      q: 'Physical inventory on my shelf does not match what the computer says. Where do I fix this?',
      a: 'Navigate to Physical Count Adjustments (/operations/adjustments). Enter the actual quantity counted on the shelf and select an operational reason (Damaged Goods, Cycle Count Error, Theft, Expired). The system atomically updates the stock level and writes an auditable signed adjustment entry (+ or -) to the ledger.'
    },
    {
      q: 'How do I talk to the AI Inventory Copilot using my voice?',
      a: 'Click "Ask Copilot" in the top navbar or sidebar. In the drawer, click the Microphone button to activate voice recognition. Speak your question (e.g., "Which items should I reorder this week?"), and the Copilot will analyze your live database and speak the answer back with interactive audio waveform visualization.'
    }
  ];

  // Filtering
  const filteredPages = pages.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.whereToViewWhat.some(w => w.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.recommendedQueries.some(q => q.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl border border-white/10 bg-neutral-950 dark:bg-black p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-mono text-zinc-300">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Interactive App Directory & Query Navigator</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Where to View What <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">
              in StockSense.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
            Have a question about where an operational feature lives, how formulas work, or which invariant protects your data? Type your doubt below or explore the comprehensive directory.
          </p>

          {/* Interactive Search Bar */}
          <div className="pt-2 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search: 'Where do I receive shipments?', 'Transfer stock', 'What-If Lab'..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-neutral-900 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills using LayoutId */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Core', 'Operations', 'Intelligence', 'Inventory', 'Management'].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-white text-black font-bold shadow-md'
                : 'bg-neutral-900/60 dark:bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Page Directory Cards Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPages.map(item => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-neutral-950 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="space-y-4">
                  {/* Top line with Icon and Category */}
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                      {item.title}
                    </h3>
                    <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {item.route}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                    {item.purpose}
                  </p>

                  {/* Where to view what checklist */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">
                      What you can view & do here:
                    </div>
                    {item.whereToViewWhat.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  {/* Invariant guarantee */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">Invariant: </span>
                    {item.invariants}
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => navigate(item.route)}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Open {item.title.split(' ')[0]}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Frequently Asked Doubts Section (Accordions with Motion layout) */}
      <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-zinc-500">
            <HelpCircle className="h-4 w-4" />
            <span>Operational FAQ & Manager Doubts</span>
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Frequently Asked Doubts
          </h2>
          <p className="text-xs text-zinc-500">
            Quick clarity on supply chain logic, calculation rules, and operational safeguards.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <motion.div
                key={idx}
                layout
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-neutral-950 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light border-t border-zinc-100 dark:border-zinc-900 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
