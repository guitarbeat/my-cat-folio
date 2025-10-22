# Local Production Preview Steps

To reproduce the production behavior locally:

1. Build the production bundle with `npm run build`.
2. Preview the build using `npm run preview -- --host 0.0.0.0 --port 4173` so other tools (or devices) can access the server.
3. Open the reported local URL (http://localhost:4173/ by default) in your browser and inspect the console for runtime errors.

These steps mirror the commands executed in Vercel's production environment and allow you to quickly investigate issues such as
`Cannot access 'n' before initialization` without waiting for a remote deployment. In the minified production bundle the same
error often surfaces as `Cannot access 'u' before initialization`; both messages point to the same root cause.

## Sample reproduction log

Running the preview build locally and loading it in a Chromium instance results in the following runtime exception in the developer console:

```
pageerror Cannot access 'u' before initialization
```

If you see a similar message, you've successfully replicated the production failure and can debug it locally without another deployment cycle.

> **Latest verification**
>
> Running `npm run preview -- --host 0.0.0.0 --port 4173` and driving a headless Chromium session against `http://127.0.0.1:4173/` with Playwright logged `pageerror: Cannot access 'u' before initialization`, confirming the production error reproduces on the current build.
