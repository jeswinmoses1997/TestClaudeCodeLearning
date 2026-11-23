export const TIERS = [
  { id: "S", color: "#e5392c", fg: "#ffffff" },
  { id: "A", color: "#f08a1c", fg: "#14181f" },
  { id: "B", color: "#f4c51b", fg: "#14181f" },
  { id: "C", color: "#2d9c5a", fg: "#ffffff" },
  { id: "D", color: "#2e69de", fg: "#ffffff" },
] as const;

export type TierId = (typeof TIERS)[number]["id"];

export type Concept = {
  id: string;
  name: string;
  icon: string;
  what: string;
  when: string;
  tools: string;
};

/** Local logo path; files live in public/logos/<slug>.svg (same names as the reference). */
export const iconUrl = (slug: string) => `/logos/${slug}.svg`;

export const CONCEPTS: Concept[] = [
  {
    "id": "graphql",
    "name": "GraphQL",
    "icon": "graphql",
    "what": "A query language for APIs that lets clients ask for exactly the fields they need, no more, no less.",
    "when": "When you have many client types (mobile, web, internal) and over-fetching or chatty REST calls become painful.",
    "tools": "Apollo, Relay, Hasura, urql, GraphQL Yoga"
  },
  {
    "id": "microservices",
    "name": "Microservices",
    "icon": "kubernetes",
    "what": "Splitting your app into small, independently deployable services that communicate over the network.",
    "when": "When your team and codebase are big enough that a monolith slows shipping, and you can afford the operational complexity.",
    "tools": "Kubernetes, Docker, gRPC, Service meshes (Istio, Linkerd)"
  },
  {
    "id": "realtime",
    "name": "Real-time Architecture",
    "icon": "kafka",
    "what": "Systems that push data to clients the moment it changes: chats, live dashboards, presence, notifications.",
    "when": "When stale data breaks the UX: live scores, trading, chat, collaborative editing.",
    "tools": "Kafka, Redis Pub/Sub, Pusher, Ably, Server-Sent Events"
  },
  {
    "id": "search",
    "name": "Search",
    "icon": "elasticsearch",
    "what": "Indexed full-text search with ranking, fuzzy matching, typo tolerance, filters, and facets.",
    "when": "When `WHERE column LIKE '%x%'` stops scaling, or you need relevance ranking and faceted filters.",
    "tools": "Elasticsearch, OpenSearch, Algolia, Meilisearch, Typesense"
  },
  {
    "id": "serverless",
    "name": "Serverless",
    "icon": "aws-lambda",
    "what": "Run code in response to events. No servers to manage, pay per invocation.",
    "when": "Bursty or low-volume workloads, webhooks, cron jobs, glue code. Anywhere a 24/7 server is overkill.",
    "tools": "AWS Lambda, Vercel Functions, Cloudflare Workers, Google Cloud Functions"
  },
  {
    "id": "object-storage",
    "name": "Object Storage",
    "icon": "aws-s3",
    "what": "Durable, HTTP-addressable storage for blobs like images, video, backups, and static assets. Effectively infinite.",
    "when": "Anytime you store files. Cheaper, more durable, and more scalable than disks.",
    "tools": "AWS S3, Cloudflare R2, Google Cloud Storage, Azure Blob"
  },
  {
    "id": "queues",
    "name": "Queues",
    "icon": "aws-sqs",
    "what": "Decouple producers from consumers by putting work on a queue and processing it asynchronously.",
    "when": "Slow or flaky downstream work, retries, absorbing traffic spikes, background jobs.",
    "tools": "AWS SQS, RabbitMQ, BullMQ, Sidekiq, Google Pub/Sub"
  },
  {
    "id": "load-balancers",
    "name": "Load Balancers",
    "icon": "aws-elb",
    "what": "Distribute incoming traffic across many servers for redundancy and horizontal scale.",
    "when": "More than one backend instance. Also for TLS termination, health checks, zero-downtime deploys.",
    "tools": "AWS ALB/NLB, Nginx, HAProxy, Cloudflare Load Balancer"
  },
  {
    "id": "rest",
    "name": "REST APIs",
    "icon": "aws-api-gateway",
    "what": "HTTP APIs organized around resources and verbs (GET/POST/PUT/DELETE). The default for public APIs.",
    "when": "Simple CRUD, public APIs, anywhere you want broad client support and cacheability.",
    "tools": "Express, FastAPI, Hono, Rails, Spring Boot, or any HTTP framework"
  },
  {
    "id": "cdns",
    "name": "CDNs",
    "icon": "aws-cloudfront",
    "what": "A global network that caches your content at the edge, closer to users.",
    "when": "Any public web app. Cache static assets, offload origin, cut latency, mitigate DDoS.",
    "tools": "Cloudflare, AWS CloudFront, Fastly, Akamai, Vercel Edge Network"
  },
  {
    "id": "databases",
    "name": "Databases",
    "icon": "postgresql",
    "what": "Structured, durable storage. Rows, documents, key-value, graph. Pick the shape that fits your data.",
    "when": "Always. The real question is which type: transactional (OLTP), analytical (OLAP), or specialized.",
    "tools": "Postgres, MySQL, MongoDB, DynamoDB, Supabase, Neon, PlanetScale"
  },
  {
    "id": "caching",
    "name": "Caching",
    "icon": "redis",
    "what": "Store frequently-read data in fast memory to avoid recomputing or re-fetching it.",
    "when": "Hot reads, expensive computations, rate limiting, session storage. The #1 perf lever.",
    "tools": "Redis, Memcached, Cloudflare Cache, HTTP Cache-Control, in-process LRU"
  },
  {
    "id": "websockets",
    "name": "WebSockets",
    "icon": "websocket",
    "what": "A persistent, bidirectional TCP connection between client and server.",
    "when": "Chat, live collab, multiplayer games, trading UIs. Anywhere polling is too slow.",
    "tools": "Socket.IO, ws, Pusher, Ably, Supabase Realtime"
  },
  {
    "id": "monitoring",
    "name": "Monitoring",
    "icon": "grafana",
    "what": "Metrics, logs, and traces from your systems, visualized and alerted on.",
    "when": "Production, always. If you can't see what's happening, you can't fix it.",
    "tools": "Grafana, Prometheus, Datadog, New Relic, Sentry, OpenTelemetry"
  },
  {
    "id": "auth",
    "name": "Authentication",
    "icon": "auth0",
    "what": "Proving who a user is: email and password, OAuth, magic links, or session and token based auth.",
    "when": "Any app with users. Don't roll your own.",
    "tools": "Auth0, Clerk, Supabase Auth, NextAuth, Okta, AWS Cognito"
  },
  {
    "id": "cicd",
    "name": "CI/CD",
    "icon": "github-actions",
    "what": "Automated pipelines that build, test, and deploy code on every change.",
    "when": "Any codebase with more than one contributor. Shipping safely at speed.",
    "tools": "GitHub Actions, GitLab CI, CircleCI, Vercel Deploys, Jenkins"
  },
  {
    "id": "containers",
    "name": "Containers",
    "icon": "docker",
    "what": "Package your app + dependencies into a portable, isolated unit that runs identically everywhere.",
    "when": "Anything deployed to servers. Standardized, reproducible runtime.",
    "tools": "Docker, Podman, OCI images, Kubernetes (for orchestration)"
  },
  {
    "id": "data-warehouse",
    "name": "Data Warehouse",
    "icon": "snowflake",
    "what": "Storage optimized for analytical queries over huge historical datasets, using columnar storage and parallel execution.",
    "when": "BI dashboards, reporting, ML features, when your OLTP DB buckles under analytics.",
    "tools": "Snowflake, BigQuery, Redshift, Databricks, ClickHouse"
  },
  {
    "id": "feature-flags",
    "name": "Feature Flags",
    "icon": "launchdarkly",
    "what": "Runtime switches that turn features on/off without redeploying.",
    "when": "Gradual rollouts, A/B tests, kill switches, trunk-based dev, user targeting.",
    "tools": "LaunchDarkly, GrowthBook, Flagsmith, Unleash, Statsig"
  },
  {
    "id": "data-pipelines",
    "name": "Data Pipelines",
    "icon": "airflow",
    "what": "Move data from A to B, often transforming along the way (ETL / ELT).",
    "when": "Syncing OLTP → warehouse, ingesting events, feeding ML models, periodic reports.",
    "tools": "Airflow, dbt, Fivetran, Dagster, Prefect, Airbyte"
  }
];
