import{j as e}from"./vendor-query-B3_EaVO5.js";import{L as r}from"./vendor-react-7tr2a94F.js";function o(){return e.jsxs("article",{className:"space-y-8",children:[e.jsxs("header",{className:"space-y-2",children:[e.jsx("h1",{className:"font-display text-3xl font-bold text-foreground",children:"Security & Compliance"}),e.jsx("p",{className:"text-muted-foreground",children:"How Monitor Server protects your data and servers."})]}),[{title:"Row Level Security (RLS)",content:`All four Supabase tables (servers, metrics, alerts, alert_rules) have Row Level Security enabled.

Policies enforce that:
- Users can only SELECT, INSERT, UPDATE, DELETE their own servers (WHERE user_id = auth.uid())
- Metrics are accessible only to the owner of the referenced server
- Alerts and alert_rules are scoped the same way

This means even if someone obtained your anon key, they could not read another user's data.`},{title:"Agent Key Authentication",content:`Each server gets a unique agent_key (a UUID). Agents authenticate using only this key — they never use your user credentials.

The metrics table has a trigger (link_server_id_trigger) that resolves the agent_key to a server_id before insert. If the key is unknown, the insert is rejected.

You can regenerate an agent_key at any time from the Server Detail page. The old key immediately stops working.`},{title:"Data Encryption",content:`All data is encrypted at rest using AES-256 by Supabase (backed by AWS RDS). All communications use HTTPS/TLS 1.2+ for REST calls and WSS for realtime subscriptions.

Supabase does not decrypt your data for analytics or advertising.`},{title:"Authentication & Passwords",content:`Passwords are hashed using bcrypt by Supabase Auth. Monitor Server never stores or transmits plaintext passwords.

For password resets, Supabase sends a signed one-time link to your email. The link expires after 1 hour. The new password must meet complexity requirements (8+ chars, uppercase, lowercase, digit, special character).`},{title:"Credential Best Practices",content:`- Never commit your VITE_SUPABASE_ANON_KEY or agent keys to version control
- The anon key has limited permissions by design — it cannot bypass RLS
- Store agent keys securely as environment variables on your servers
- Rotate agent keys periodically using the regenerate button
- Use systemd to run the agent (prevents the key from being exposed in process lists)`},{title:"Data Retention",content:`Metrics are retained indefinitely unless you configure a Supabase database retention policy or a pg_cron job to delete old rows.

To set up automatic retention (e.g., keep only 30 days), run in the Supabase SQL editor:
\`\`\`sql
SELECT cron.schedule(
  'delete-old-metrics',
  '0 3 * * *',
  $$DELETE FROM metrics WHERE timestamp < NOW() - INTERVAL '30 days'$$
);
\`\`\``},{title:"Reporting Vulnerabilities",content:"If you discover a security vulnerability, please report it privately to admin@monitorserver.in before any public disclosure. We aim to acknowledge reports within 48 hours."}].map((t,s)=>e.jsxs("div",{className:"rounded-xl border border-border bg-card p-6 space-y-3",children:[e.jsx("h2",{className:"font-display text-lg font-semibold text-foreground",children:t.title}),e.jsx("p",{className:"text-sm text-muted-foreground leading-relaxed whitespace-pre-line",children:t.content})]},s)),e.jsxs("div",{className:"flex gap-4 pt-4 border-t border-border",children:[e.jsx(r,{to:"/docs/api-reference",className:"text-sm text-primary hover:underline",children:"← API Reference"}),e.jsx(r,{to:"/faq",className:"text-sm text-primary hover:underline ml-auto",children:"FAQ →"})]})]})}export{o as default};
