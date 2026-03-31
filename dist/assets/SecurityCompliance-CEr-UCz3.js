import{j as e}from"./vendor-query-B3_EaVO5.js";import{L as t}from"./vendor-react-7tr2a94F.js";import{A as a}from"./arrow-left-DUR_eGs0.js";import"./index-BIy1Qyhm.js";import"./vendor-charts-CKBrSVQ9.js";function d(){return e.jsxs("article",{className:"space-y-8",children:[e.jsxs("header",{className:"space-y-2",children:[e.jsxs(t,{to:"/docs",className:"inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2",children:[e.jsx(a,{className:"h-3.5 w-3.5"})," Back to Docs"]}),e.jsx("h1",{className:"font-display text-3xl font-bold text-foreground",children:"Security & Compliance"}),e.jsx("p",{className:"text-muted-foreground",children:"How Monitor Server protects your data and servers."})]}),[{title:"Row Level Security",content:`All database tables (users, servers, metrics, alerts, alert_rules, notifications, etc.) are protected with ownership-based access control.

Policies enforce that:
- Users can only access their own servers and data
- Metrics are accessible only to the owner of the referenced server
- Alerts and alert_rules are scoped to the server owner
- API endpoints verify JWT authentication and user ownership before returning data

This means even if someone obtained another user's server ID, they could not read or modify that user's data.`},{title:"Agent Key Authentication",content:`Each server gets a unique agent_key (a UUID). Agents authenticate using only this key — they never use your user credentials.

The backend validates the agent_key against the monitored_servers table before accepting any metric data. If the key is unknown, the request is rejected.

You can regenerate an agent_key at any time from the Server Detail page. The old key immediately stops working.`},{title:"Data Encryption",content:`All data is encrypted at rest using AES-256 on AWS-hosted PostgreSQL. All communications use HTTPS/TLS 1.2+ for REST API calls and WSS for WebSocket connections.

Your data is never shared with third parties or used for analytics or advertising.`},{title:"Authentication & Passwords",content:`Passwords are hashed using bcrypt with a cost factor of 10. Monitor Server never stores or transmits plaintext passwords.

For password resets, the system sends a secure token to your email. The token expires after 1 hour. The new password must meet complexity requirements (8+ chars, uppercase, lowercase, digit, special character).`},{title:"Credential Best Practices",content:`- Never commit agent keys or API keys to version control
- Store agent keys securely as environment variables on your servers
- Rotate agent keys periodically using the regenerate button
- Use systemd to run the agent (prevents the key from being exposed in process lists)
- API keys use prefix-based lookup with bcrypt-hashed values for maximum security`},{title:"Data Retention",content:`Metrics are retained based on your configured retention policy (default: 30 days). The system automatically cleans up old metrics via scheduled tasks.

You can configure the retention period via the METRICS_RETENTION_DAYS environment variable.`},{title:"Reporting Vulnerabilities",content:"If you discover a security vulnerability, please report it privately to admin@monitorserver.in before any public disclosure. We aim to acknowledge reports within 48 hours."}].map((r,s)=>e.jsxs("div",{className:"rounded-xl border border-border bg-card p-6 space-y-3",children:[e.jsx("h2",{className:"font-display text-lg font-semibold text-foreground",children:r.title}),e.jsx("p",{className:"text-sm text-muted-foreground leading-relaxed whitespace-pre-line",children:r.content})]},s)),e.jsxs("div",{className:"flex gap-4 pt-4 border-t border-border",children:[e.jsx(t,{to:"/docs/api-reference",className:"text-sm text-primary hover:underline",children:"← API Reference"}),e.jsx(t,{to:"/faq",className:"text-sm text-primary hover:underline ml-auto",children:"FAQ →"})]})]})}export{d as default};
