import {
  Add01Icon,
  Home01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Bubble,
  cn,
  Nest,
  NestChat,
  NestGroup,
  NestHead,
  NestLink,
  NestProvider,
  NestToggle,
  Perch,
} from "@mycodemedia/oriole"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import OrioleMark from "../assets/oriole-wordmark.svg?react"

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { chat?: string } => ({
    chat: typeof search.chat === "string" ? search.chat : undefined,
  }),
  component: ChatDemo,
})

type Source = {
  label: string
  /** Omitted when the source is unavailable. */
  href?: string
  /** Research platform the citation comes from, shown as a prefix. */
  provider?: string
  status?: "ok" | "unavailable"
}

type Message = {
  id: number
  role: "user" | "assistant"
  text: string
  /** 0–100. Present when the reply is a forecast; rendered as a chip. */
  confidence?: number
  /** Fake citations backing the insight — demo only, links go nowhere. */
  sources?: Source[]
  /** Where the cited sources conflict; rendered as a plum callout. */
  disagreement?: string
}

type Conversation = {
  id: string
  title: string
  messages: Message[]
}

const conversations: [Conversation, ...Conversation[]] = [
  {
    id: "cookie-segments",
    title: "Cookie segments & seasonality",
    messages: [
      {
        id: 1,
        role: "user",
        text: "I want to find market segments for a cookie product — which age groups are we not reaching?",
      },
      {
        id: 2,
        role: "assistant",
        text: "Your current buyers skew 30–45, and the loyalty card data says that skew has hardened over the last six quarters. Two under-served groups stand out. First, 55+ “afternoon tea” households: they drive 12% of category spend, repurchase on a tight 11-day cycle, and index heavily toward shortbread and oat textures you already produce — yet they barely register in your share. Second, 18–24 students, where single-serve formats over-index 2.3× against your multipack-only lineup and vending/campus channels account for a third of their category purchases.",
        sources: [
          {
            label: "Loyalty panel · cookie category Q2",
            href: "https://panel.example.com/cookies/2026-q2/age-splits",
          },
          {
            label: "Campus channel audit",
            href: "https://insights.example.com/channels/campus-vending-2026",
          },
        ],
      },
      {
        id: 3,
        role: "user",
        text: "Interesting. What about seasonality — is there anything beyond the holiday spike?",
      },
      {
        id: 4,
        role: "assistant",
        text: "Two windows are unexploited. The bigger one is a back-to-school lunchbox surge across August–September: category units rise 18% while your share actually dips, because the winners are portioned multipacks with individually wrapped units. The second is a spring picnic bump in April–May tied to outdoor occasions, where “sharing formats” language on pack drives most of the incremental lift. A parent-aimed lunchbox multipack forecasts a 9–14% unit lift across the first window.",
        confidence: 82,
        sources: [
          {
            label: "Seasonality decomposition, 3-yr",
            href: "https://insights.example.com/models/cookie-seasonality-decomp",
          },
        ],
      },
      {
        id: 5,
        role: "user",
        text: "Which of the two should we pilot first?",
      },
      {
        id: 6,
        role: "assistant",
        text: "Back-to-school. Retailer shelf resets land inside your production lead times — the June reset windows at your top three grocers leave eight weeks of runway — and the picnic window would force a sharing-format redesign you haven't costed yet. Forecasted cannibalization of the core line stays under 2%, mostly because the lunchbox buyer is a new household rather than an existing one trading across.",
        confidence: 74,
        sources: [
          {
            label: "Reset calendar · top grocers",
            href: "https://insights.example.com/retail/reset-calendar-2026",
          },
        ],
      },
    ],
  },
  {
    id: "plant-milk-whitespace",
    title: "Plant-milk whitespace",
    messages: [
      {
        id: 1,
        role: "user",
        text: "Where is the whitespace in the plant-milk category right now?",
      },
      {
        id: 2,
        role: "assistant",
        text: "Oat dominates 41% of new launches and the shelf is saturated at every price tier, so the openings are structural rather than flavor-led. The clearest one: barista-grade pea-protein blends are nearly empty at mainstream price points — only two national SKUs, both premium at $5.99+. There's a secondary gap in shelf-stable multipacks for office and food-service channels, where almond incumbents have been delisting on margin pressure for three straight quarters.",
        sources: [
          {
            label: "Launch tracker · plant milk 2026",
            href: "https://insights.example.com/launches/plant-milk-2026",
          },
          {
            label: "Food-service delisting log",
            href: "https://panel.example.com/foodservice/delistings",
          },
        ],
      },
      {
        id: 3,
        role: "user",
        text: "Is that gap worth entering, or is it empty for a reason?",
      },
      {
        id: 4,
        role: "assistant",
        text: "It reads under-supplied, not unwanted. Search demand for “pea milk coffee” grew 3.1× year over year while shelf supply stayed flat, café operators cite frothing performance as the unmet need, and the two premium incumbents both report supply-constrained velocity rather than weak pull. The niche forecasts to $120M retail within two years, with most of the risk concentrated in taste perception — pea protein still carries a flavor penalty in blind panels.",
        confidence: 68,
        sources: [
          {
            label: "Search demand index",
            href: "https://social.example.com/search-trends/pea-milk",
          },
          {
            label: "Barista blind panel results",
            href: "https://panel.example.com/sensory/barista-blends-r3",
          },
        ],
      },
      {
        id: 5,
        role: "user",
        text: "What price point would we need to hit?",
      },
      {
        id: 6,
        role: "assistant",
        text: "Parity with oat at $4.49/L is the adoption threshold in panel data: at that shelf price, trial intent among lapsed oat buyers reaches 44%. Above $4.99 trial intent drops 38%, and the drop is steepest with the exact households most likely to switch — heavy café-at-home consumers. Your co-packer quotes put landed cost at a workable margin at $4.49 if you commit to the 500k-unit tier.",
        sources: [
          {
            label: "Price ladder study",
            href: "https://panel.example.com/pricing/plant-milk-ladder",
          },
        ],
      },
    ],
  },
  {
    id: "genz-snacking",
    title: "Gen Z snacking insights",
    messages: [
      {
        id: 1,
        role: "user",
        text: "Summarize what we know about Gen Z snacking behavior this quarter.",
      },
      {
        id: 2,
        role: "assistant",
        text: "Three patterns dominate the quarter. Snacks replace meals 4.2 times a week — up from 3.6 a year ago — and the replacement occasions cluster around late-night and mid-afternoon rather than lunch. Flavor novelty beats brand loyalty: 61% will switch brands for a new flavor, and repeat purchase of “limited drop” SKUs runs double the category norm. And “swicy” — sweet-heat — mentions doubled across social listening, with hot honey and chili-mango leading the flavor language.",
        sources: [
          {
            label: "Social listening digest · Q2",
            href: "https://social.example.com/digests/2026-q2-snacking",
          },
          {
            label: "Meal-replacement diary study",
            href: "https://panel.example.com/diary/genz-occasions",
          },
        ],
      },
      {
        id: 3,
        role: "user",
        text: "Does swicy translate into actual purchases, or is it just chatter?",
      },
      {
        id: 4,
        role: "assistant",
        text: "Basket data lags social by about two quarters, but the early signals agree: swicy SKUs grew 24% off a small base, repeat rates sit above category average at 31%, and the growth is broad across retailers rather than driven by one chain's promo calendar. It forecasts to cross from trend to staple within 18 months, which is the same trajectory shape sriracha-adjacent flavors traced in 2019–21.",
        confidence: 71,
        sources: [
          {
            label: "Basket tracker · swicy cohort",
            href: "https://panel.example.com/baskets/swicy-cohort",
          },
        ],
      },
      {
        id: 5,
        role: "user",
        text: "Which formats are they actually buying swicy in?",
      },
      {
        id: 6,
        role: "assistant",
        text: "Salty snacks carry the volume: chips and puffed formats hold 58% of swicy units, with meat snacks a fast second at 19% and growing quickest. Confectionery is lagging badly — sweet-base products with heat added run a 14% repeat rate versus 31% for savory bases, which suggests the cohort wants heat layered on salt, not on sugar. Ready-to-drink is nearly untouched territory with only regional test SKUs.",
        sources: [
          {
            label: "Format split · swicy units",
            href: "https://insights.example.com/formats/swicy-splits",
          },
        ],
      },
      {
        id: 7,
        role: "user",
        text: "What about channel — where does Gen Z actually buy snacks?",
      },
      {
        id: 8,
        role: "assistant",
        text: "Convenience leads at 34% of occasions and is still gaining, but the notable shift is social commerce: TikTok Shop and similar checkout flows now account for 9% of the cohort's snack spend, concentrated in limited drops and creator collabs. Traditional grocery holds share only through self-checkout small-basket trips. Club stores barely register except as the “stock-up parent” proxy purchase.",
        sources: [
          {
            label: "Channel occasions tracker",
            href: "https://panel.example.com/channels/genz-occasions",
          },
          {
            label: "Social commerce spend monitor",
            href: "https://social.example.com/commerce/snack-spend",
          },
        ],
      },
      {
        id: 9,
        role: "user",
        text: "Is private label a threat with this cohort?",
      },
      {
        id: 10,
        role: "assistant",
        text: "Less than you'd expect given their price sensitivity. Private label wins on planned pantry purchases, but Gen Z snack purchases are 70% impulse or social-triggered, where brand codes and drop culture still matter. The exception is one retailer whose store brand behaves like a real brand on social — its swicy line outsold two national brands last quarter. Treat that one as a competitor, not as generic private label.",
        sources: [
          {
            label: "Private label perception study",
            href: "https://panel.example.com/brands/pl-perception",
          },
        ],
      },
      {
        id: 11,
        role: "user",
        text: "What flavor profiles are emerging beyond swicy?",
      },
      {
        id: 12,
        role: "assistant",
        text: "Three are building. Pickle-adjacent sour is the loudest on social but shows the classic spike-and-fade signature, so I'd treat it as a limited-drop play only. Ube and pandan are quieter but compounding steadily quarter over quarter, riding broader Filipino and Southeast Asian food content. Brown-butter “baked nostalgia” profiles are early yet showing unusually strong cross-generation appeal. Ube forecasts to be the strongest durable grower of the three.",
        confidence: 66,
        sources: [
          {
            label: "Flavor emergence index",
            href: "https://social.example.com/flavors/emergence-index",
          },
        ],
      },
      {
        id: 13,
        role: "user",
        text: "How price sensitive is this cohort, really?",
      },
      {
        id: 14,
        role: "assistant",
        text: "Sharply, but asymmetrically. On everyday SKUs they trade down fast — a 50¢ gap moves 22% of the cohort to the cheaper option. On identity purchases (drops, collabs, flavors their feed is talking about) elasticity nearly vanishes: limited SKUs clear at a 40% premium with no measurable resistance. The practical read: hold a sharp entry price on core, and take margin on the drop calendar instead.",
        sources: [
          {
            label: "Elasticity model · snack SKUs",
            href: "https://insights.example.com/models/genz-elasticity",
          },
        ],
      },
      {
        id: 15,
        role: "user",
        text: "So where's the white space we could launch into first?",
      },
      {
        id: 16,
        role: "assistant",
        text: "The intersection the data keeps pointing at: a swicy meat-snack line sold as rotating limited drops through convenience and social checkout. Meat snacks are the fastest-growing swicy format with the fewest credible players, the channel mix matches where the cohort already buys, and the drop mechanic matches how they decide. A two-flavor pilot forecasts $6–9M in first-year retail at national convenience distribution.",
        confidence: 73,
        sources: [
          {
            label: "Whitespace scoring matrix",
            href: "https://insights.example.com/whitespace/snacking-2026",
          },
          {
            label: "Convenience distribution model",
            href: "https://panel.example.com/distribution/c-store-reach",
          },
        ],
      },
      {
        id: 17,
        role: "user",
        text: "What would the pilot actually look like?",
      },
      {
        id: 18,
        role: "assistant",
        text: "Twelve weeks, two flavors (hot-honey original and a chili-mango limited), 800 convenience doors across two regions plus a social checkout storefront. Success gates: 25%+ repeat by week eight, social mention velocity above the swicy category median, and no more than 10% cannibalization of your existing jerky line. Creative brief leans on the drop calendar, not the brand block.",
      },
      {
        id: 19,
        role: "user",
        text: "Good. Keep an eye on competitor launches in that space for me.",
      },
      {
        id: 20,
        role: "assistant",
        text: "Done — I'll track swicy-adjacent and meat-snack launches across the retail and social monitors and drop a summary into this thread every Monday, flagging anything that overlaps the pilot's flavor or channel plan with a threat rating.",
      },
    ],
  },
  {
    id: "iced-tea-demand",
    title: "Iced tea demand forecast",
    messages: [
      {
        id: 1,
        role: "user",
        text: "Forecast regional demand for the iced tea line this summer.",
      },
      {
        id: 2,
        role: "assistant",
        text: "The Southeast leads with a projected 11% unit lift, driven by longer heatwave windows in the seasonal outlook and the convenience distribution you added last fall. The Southwest follows at 6% with strength concentrated in multipacks. The Midwest runs at 3% — normal growth, nothing structural — and the Northwest stays flat against last year, where category softness offsets your gains in natural channel doors.",
        confidence: 87,
        sources: [
          {
            label: "Regional demand model v4",
            href: "https://insights.example.com/models/iced-tea-regional-v4",
          },
          {
            label: "Seasonal climate outlook mirror",
            href: "https://weather.example.com/outlooks/summer-2026",
          },
        ],
      },
      {
        id: 3,
        role: "user",
        text: "What's driving the Southeast number?",
      },
      {
        id: 4,
        role: "assistant",
        text: "Two-thirds is weather-indexed volume: the heat-to-sales elasticity fitted on three years of scan data says every additional 90°F+ day adds roughly 0.8% to weekly units, and the outlook adds 12–15 such days across the region. The remaining third is the convenience-store distribution you gained last fall — those doors are just reaching mature velocity, and summer is when convenience single-serve peaks.",
        sources: [
          {
            label: "Heat-to-sales elasticity fit",
            href: "https://insights.example.com/models/heat-elasticity",
          },
        ],
      },
      {
        id: 5,
        role: "user",
        text: "And if the heatwave doesn't materialize?",
      },
      {
        id: 6,
        role: "assistant",
        text: "The downside case still forecasts a 4% lift from the distribution gains alone, because door maturity is weather-independent. The spread between cases is wide — that's the nature of leaning on a seasonal outlook — but the floor is protected: even the coolest summer in the ten-year record would have produced positive growth on this door count.",
        confidence: 63,
        sources: [
          {
            label: "Scenario band backtest",
            href: "https://insights.example.com/models/iced-tea-scenarios",
          },
        ],
      },
      {
        id: 7,
        role: "user",
        text: "How does the lift split across pack sizes?",
      },
      {
        id: 8,
        role: "assistant",
        text: "Single-serve 500ml carries most of the weather-driven volume — it's the impulse format, and it takes about 70% of the incremental units in the model. Multipacks grow steadily at 4–5% regardless of weather, tracking grocery baskets rather than temperature. The gallon format is flat-to-declining everywhere except club, where it's a promo-driven business that follows your calendar, not the season.",
        sources: [
          {
            label: "Pack architecture tracker",
            href: "https://panel.example.com/packs/iced-tea-splits",
          },
        ],
      },
      {
        id: 9,
        role: "user",
        text: "What about the sugar-free variant specifically?",
      },
      {
        id: 10,
        role: "assistant",
        text: "Sugar-free is the quiet outperformer: it forecasts a 16% lift in the Southeast against the line's 11%, because its buyer base skews toward the exact suburban convenience shopper the new doors reach. Velocity per door already runs 8% above the sweetened core in those accounts. If anything constrains it, it'll be supply — see the capacity question before committing incremental displays.",
        confidence: 78,
        sources: [
          {
            label: "Variant velocity report",
            href: "https://panel.example.com/velocity/sugar-free-tea",
          },
        ],
      },
      {
        id: 11,
        role: "user",
        text: "Do we have the capacity to cover the Southeast lift?",
      },
      {
        id: 12,
        role: "assistant",
        text: "Tight but coverable. Your own lines run at 84% utilization in the June–August window after planned maintenance, which covers the base case. The upside case needs the co-packer option: they've quoted two reserve slots in July that cover up to 400k additional cases, but the reservation deadline is May 15 and the slots are shared with a competitor's bid.",
        sources: [
          {
            label: "Capacity planning sheet",
            href: "https://insights.example.com/ops/capacity-summer-2026",
          },
        ],
      },
      {
        id: 13,
        role: "user",
        text: "What inventory position should we take into June?",
      },
      {
        id: 14,
        role: "assistant",
        text: "Build to five weeks of forward supply on single-serve in the Southeast DCs by the first week of June — that's one week above your normal position, sized to the gap between the base and upside cases. Hold multipacks at normal cover; their demand is stable enough that extra stock just ties up pallets. The carrying-cost penalty of the extra week is roughly a fifth of the stockout cost the model assigns to a July heat spike.",
        confidence: 70,
        sources: [
          {
            label: "Inventory optimization run",
            href: "https://insights.example.com/ops/wos-optimizer",
          },
        ],
      },
      {
        id: 15,
        role: "user",
        text: "Which retailers should get priority allocation if it gets tight?",
      },
      {
        id: 16,
        role: "assistant",
        text: "Rank by velocity-per-door times strategic weight: the two convenience banners from last fall's distribution win come first — shorting them in year one damages the relationship the whole forecast depends on. The regional grocer with the summer end-cap commitment is third; their display contract has a fill-rate clause. National grocery can absorb substitution with the least velocity damage, so they flex last.",
        sources: [
          {
            label: "Allocation priority model",
            href: "https://insights.example.com/retail/allocation-rank",
          },
        ],
      },
      {
        id: 17,
        role: "user",
        text: "Any competitive launches that could eat into this?",
      },
      {
        id: 18,
        role: "assistant",
        text: "Two worth watching. A national competitor is launching a value-priced peach tea into the same convenience channel in June — modeled impact is under 1% of your units because peach skews to a different buyer, but their promo depth could pull impulse trips. And a regional craft brand is expanding across the Southeast with strong natural-channel buzz; small volumes, but they compete directly for the sugar-free shopper. Combined downside stays inside the forecast band.",
        confidence: 69,
        sources: [
          {
            label: "Competitive launch monitor",
            href: "https://social.example.com/launches/beverage-monitor",
          },
        ],
      },
      {
        id: 19,
        role: "user",
        text: "Summarize the plan for the leadership deck.",
      },
      {
        id: 20,
        role: "assistant",
        text: "Headline: Southeast-led summer, 11% regional lift with a protected 4% floor. Actions: reserve the co-packer July slots before May 15, build single-serve to five weeks of supply in Southeast DCs by June, lean displays into sugar-free where velocity supports it, and hold the allocation ranking with the convenience banners on top. Risks: seasonal outlook variance (widest swing), co-packer slot competition, and two competitive launches with modeled impact under 1%.",
        sources: [
          {
            label: "One-page forecast summary",
            href: "https://insights.example.com/exports/iced-tea-summer-onepager",
          },
        ],
      },
    ],
  },
  {
    id: "pricing-gaps",
    title: "Competitor pricing gaps",
    messages: [
      {
        id: 1,
        role: "user",
        text: "Where are competitors leaving pricing gaps in the granola aisle?",
      },
      {
        id: 2,
        role: "assistant",
        text: "Premium is crowded — eleven brands stacked between $6.99 and $8.49 with almost no velocity separation — but the $4.50–$5.50 mid-tier has thinned out: three brands exited it this year, two by trading up their packaging and one by leaving the category outright. Shelf data shows the vacated facings went mostly to private label, which under-delivers on the texture attributes that drive repeat in this aisle.",
        sources: [
          {
            label: "Shelf price ladder · granola",
            href: "https://panel.example.com/pricing/granola-ladder",
          },
          {
            label: "Exit tracker · cereal aisle",
            href: "https://insights.example.com/exits/granola-2026",
          },
        ],
      },
      {
        id: 3,
        role: "user",
        text: "Could we move our family-size SKU into that band?",
      },
      {
        id: 4,
        role: "assistant",
        text: "Yes — repositioning at $5.29 forecasts a 6–9% volume gain, with margin held by the new co-packer rates you locked in March. The gain concentrates in households currently splitting between premium-on-promo and private label; at $5.29 you become their everyday answer rather than their compromise. The model assumes no pack change, which keeps the transition cost to a label revision.",
        confidence: 77,
        sources: [
          {
            label: "Repositioning simulation",
            href: "https://insights.example.com/models/granola-reposition",
          },
        ],
      },
      {
        id: 5,
        role: "user",
        text: "Any risk the premium players price down into us?",
      },
      {
        id: 6,
        role: "assistant",
        text: "Low in the near term: both category leaders just took public price increases and their trade letters lock pricing through Q1, so a reversal inside six months would cost them credibility with the buyers they just negotiated against. The realistic response is deeper promo frequency rather than list-price moves — worth watching, but promo-led defense historically leaks share to exactly the everyday-price position you'd be occupying.",
        sources: [
          {
            label: "Trade letter archive",
            href: "https://panel.example.com/trade/letters-2026",
          },
        ],
      },
    ],
  },
  {
    id: "genz-fitness",
    title: "Gen Z fitness signals",
    messages: [
      {
        id: 1,
        role: "user",
        text: "What cultural signals are shaping Gen Z fitness choices in the U.S., and which are most relevant to Strava? Cite MarketLogic and Nichefire separately, and call out any disagreement or unavailable source.",
      },
      {
        id: 2,
        role: "assistant",
        text: "Three signals dominate. First, run clubs as third places: group runs are absorbing the social role dating apps and bars are losing — MarketLogic's panel has 28% of 18–27s attending a group fitness event monthly, and Nichefire shows “run club” velocity up 4.2× year over year. Second, soft fitness: anti-optimization language (zone 2, “hot girl walks,” rest-day content) is displacing grind culture in social conversation. Third, fitness as documentation: workouts increasingly exist to be posted, with map screenshots and route art functioning as social proof. For Strava, run clubs rank first — they land directly on your social graph — documentation second, soft fitness third.",
        sources: [
          {
            provider: "MarketLogic",
            label: "U.S. fitness culture tracker · wave 14",
            href: "https://marketlogic.example.com/trackers/fitness-wave-14",
          },
          {
            provider: "Nichefire",
            label: "Cultural velocity · fitness signals",
            href: "https://nichefire.example.com/velocity/fitness-2026",
          },
        ],
        disagreement:
          "MarketLogic's panel shows gym memberships in this cohort still rising, while Nichefire's social data shows gym-content velocity declining — behavior and conversation are pointing in opposite directions on the gym.",
      },
      {
        id: 3,
        role: "user",
        text: "Where exactly do they disagree, and which should we trust here?",
      },
      {
        id: 4,
        role: "assistant",
        text: "The conflict is methodological, not factual. MarketLogic aggregates panel and first-party behavioral research — it measures what people do, and lags culture by a quarter or two. Nichefire measures what people talk about, which leads behavior but overweights whatever is novel. Both can be right at once: Gen Z keeps paying for gyms while finding them less worth posting about. For sizing a bet, trust MarketLogic; for catching a shift early, trust Nichefire. For Strava's roadmap that means: let Nichefire steer what you build, and MarketLogic steer how big you build it.",
        sources: [
          {
            provider: "MarketLogic",
            label: "Methodology note · panel design",
            href: "https://marketlogic.example.com/methods/panel-design",
          },
          {
            provider: "Nichefire",
            label: "Methodology note · velocity model",
            href: "https://nichefire.example.com/methods/velocity-model",
          },
        ],
      },
      {
        id: 5,
        role: "user",
        text: "How fresh is the MarketLogic data behind the run-club signal?",
      },
      {
        id: 6,
        role: "assistant",
        text: "Fieldwork ran in March 2026 — n=2,400, U.S. 18–27, mixed online panel with a mobile-diary supplement. That's current enough to stand on, with one caveat: it predates the spring race season, when group-run participation historically peaks, so the 28% monthly-attendance figure is more likely an undercount than an overcount. The claim holds.",
        sources: [
          {
            provider: "MarketLogic",
            label: "Wave 14 fieldwork summary",
            href: "https://marketlogic.example.com/trackers/fitness-wave-14/fieldwork",
          },
        ],
      },
      {
        id: 7,
        role: "user",
        text: "Pull Nichefire's velocity on “run club” for the last 90 days.",
      },
      {
        id: 8,
        role: "assistant",
        text: "I can't complete that pull — Nichefire's velocity endpoint has been unavailable for the past hour, so the 90-day trend is missing from this answer. What I can offer is the cached January snapshot, which showed run-club velocity still accelerating with no plateau signature. On that stale basis alone, the signal's durability through year-end forecasts positive, but treat this as provisional until the live pull lands.",
        confidence: 58,
        sources: [
          {
            provider: "Nichefire",
            label: "Run-club velocity · last 90 days",
            status: "unavailable",
          },
          {
            provider: "Nichefire",
            label: "Cached snapshot · January 2026",
            href: "https://nichefire.example.com/cache/run-club-jan-2026",
          },
        ],
      },
      {
        id: 9,
        role: "user",
        text: "Ok — rank the three signals by relevance to Strava's next two quarters.",
      },
      {
        id: 10,
        role: "assistant",
        text: "First: run clubs. They map directly onto Strava's social graph, the network effects compound if group and event features land before summer race season, and both sources agree on direction even where they disagree on the gym backdrop. Second: fitness as documentation — shareable route art and richer post-run artifacts are low-lift builds on existing assets, and Nichefire has map-screenshot content compounding steadily. Third: soft fitness — real but slower, and it needs metric and language redesign (effort and consistency over pace) that touches more surface area than one roadmap cycle allows.",
        confidence: 72,
        sources: [
          {
            provider: "MarketLogic",
            label: "Feature-relevance crosswalk",
            href: "https://marketlogic.example.com/analysis/strava-crosswalk",
          },
          {
            provider: "Nichefire",
            label: "Signal compounding index",
            href: "https://nichefire.example.com/velocity/compounding-index",
          },
        ],
      },
      {
        id: 11,
        role: "user",
        text: "What evidence would change this ranking?",
      },
      {
        id: 12,
        role: "assistant",
        text: "Three tripwires. If the Nichefire 90-day pull comes back showing run-club velocity flat or negative, the lead signal drops to a hold and documentation moves up. If MarketLogic's June wave shows run-club churn above 30% — people sampling once and not returning — the social-graph bet weakens the same way. And if soft-fitness language starts converting into paid behavior (subscription starts, recovery-gear baskets) rather than just content, it jumps the queue, because monetizable behavior change beats conversation volume.",
      },
      {
        id: 13,
        role: "user",
        text: "Set an alert if any of these signals changes velocity.",
      },
      {
        id: 14,
        role: "assistant",
        text: "Done. Once Nichefire's endpoint is back I'll re-run the 90-day pull and watch all three signals weekly, flagging any velocity move beyond ±20% in this thread. I'll also flag when MarketLogic's June wave publishes so the churn tripwire gets checked against fresh fieldwork rather than the March baseline.",
      },
    ],
  },
]

const cannedReply =
  "Got it — this is a canned reply. Wire up real responses in the app, not here."

/* slot: Chip component */
function ConfidenceChip({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "mt-1.5 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums",
        value >= 80
          ? "border-fern-300 bg-fern-50 text-fern-900"
          : value >= 65
            ? "border-nectarine-200 bg-nectarine-50 text-nectarine-900"
            : "border-driftwood-300 bg-driftwood-50 text-driftwood-900",
      )}
    >
      Forecast · {value}% confidence
    </span>
  )
}

/* Fake citations — demo only, so navigation is suppressed. */
function SourceLinks({ sources }: { sources: Source[] }) {
  return (
    <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
      {sources.map((source) => {
        const label = source.provider
          ? `${source.provider} · ${source.label}`
          : source.label
        return source.status === "unavailable" ? (
          <span
            key={label}
            className="text-xs italic text-driftwood-500"
            title="This source could not be reached"
          >
            {label} · unavailable
          </span>
        ) : (
          <a
            key={label}
            href={source.href}
            onClick={(event) => event.preventDefault()}
            className="text-xs font-medium text-plum-800 underline underline-offset-2 hover:text-plum-900"
          >
            {label} ↗
          </a>
        )
      })}
    </span>
  )
}

/* slot: Callout component */
function DisagreementNote({ text }: { text: string }) {
  return (
    <span className="mt-1.5 block w-fit rounded-lg border border-plum-300 bg-plum-50 px-2.5 py-1.5 text-xs leading-relaxed text-plum-900">
      <span className="font-semibold">Sources disagree — </span>
      {text}
    </span>
  )
}

function ChatDemo() {
  const { chat } = Route.useSearch()
  const navigate = Route.useNavigate()
  const active =
    conversations.find((conversation) => conversation.id === chat) ??
    conversations[0]

  const [threads, setThreads] = useState<Record<string, Message[]>>(() =>
    Object.fromEntries(
      conversations.map((conversation) => [
        conversation.id,
        conversation.messages,
      ]),
    ),
  )
  const messages = threads[active.id] ?? active.messages
  const [draft, setDraft] = useState("")
  const nextId = useRef(100)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length > 0) {
      threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight })
    }
  }, [messages.length])

  function send() {
    const text = draft.trim()
    if (!text) return
    setThreads((prev) => ({
      ...prev,
      [active.id]: [
        ...(prev[active.id] ?? active.messages),
        { id: nextId.current++, role: "user", text },
        { id: nextId.current++, role: "assistant", text: cannedReply },
      ],
    }))
    setDraft("")
  }

  return (
    <NestProvider>
      <div className="flex h-[calc(100vh-8rem)] items-start gap-2">
        <Nest className="h-full">
          <NestHead>
            <OrioleMark aria-hidden />
          </NestHead>
          <NestGroup hideOnCollapse={false}>
            <NestLink
              icon={<HugeiconsIcon icon={Add01Icon} size={18} />}
              shortcut="⌘N"
            >
              New chat
            </NestLink>
            <NestLink icon={<HugeiconsIcon icon={Home01Icon} size={18} />}>
              Home
            </NestLink>
            <NestLink
              icon={<HugeiconsIcon icon={UserAdd01Icon} size={18} />}
              detail="3/10"
            >
              Invite users
            </NestLink>
          </NestGroup>
          <NestGroup title="Chats" searchable>
            {conversations.map((conversation) => (
              <NestChat
                key={conversation.id}
                className={cn(
                  conversation.id === active.id && "bg-card/80 text-foreground",
                )}
                onPress={() => navigate({ search: { chat: conversation.id } })}
              >
                {conversation.title}
              </NestChat>
            ))}
          </NestGroup>
        </Nest>

        <Perch className="relative flex h-full min-w-0 flex-1">
          <NestToggle className="absolute left-2 top-2 z-10" />
          <div className="flex min-w-0 flex-1 flex-col">
            <div
              ref={threadRef}
              className="flex flex-1 flex-col overflow-y-auto py-4 ps-12 pe-6 mt-4 scrollbar-track-transparent scrollbar-thumb-driftwood-300/50"
            >
              {/* experiment: mt-auto pins short threads to the bottom,
                  IM-style, while long threads scroll normally */}
              <ul className="mx-auto mt-auto flex w-full max-w-4xl flex-col gap-4">
                {messages.map((message) => (
                  <li key={message.id} className="flex flex-col">
                    <Bubble from={message.role === "user" ? "user" : "system"}>
                      {message.text}
                      {message.sources?.length ? (
                        <div>
                          <SourceLinks sources={message.sources} />
                        </div>
                      ) : null}
                      {message.disagreement ? (
                        <div>
                          <DisagreementNote text={message.disagreement} />
                        </div>
                      ) : null}
                      {message.confidence != null ? (
                        <div>
                          <ConfidenceChip value={message.confidence} />
                        </div>
                      ) : null}
                    </Bubble>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-border p-4">
              <form
                className="mx-auto flex max-w-2xl items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  send()
                }}
              >
                {/* slot: TextField / TextArea */}
                <textarea
                  aria-label="Message"
                  rows={1}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      send()
                    }
                  }}
                  placeholder="Message the assistant…"
                  className="min-h-10 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {/* slot: Button */}
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  disabled={!draft.trim()}
                >
                  Send
                </button>
              </form>
            </footer>
          </div>
        </Perch>
      </div>
    </NestProvider>
  )
}
