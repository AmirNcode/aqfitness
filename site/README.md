# Aquam Fitness website

Run commands from `site/`: `npm run check`, `npm test`, `npm run build`, and `npm run links`.

## Forms and email

- Contact requests use Netlify Forms. Contact-only submission notifications are configured in Netlify to go to `alejandrorivasvanga@gmail.com`.
- Newsletter and free-guide signups use the same HubSpot form: portal `342144230`, region `na3`, form `17bd968e-fe05-408c-8a3f-f7b01e7739ac`.
- `HubSpotForm.astro` contains the shared embed. `BaseLayout.astro` loads the HubSpot script once per page. The guide page has both a main signup and a footer signup.
- Manage form fields, consent, styling, success messages, and the follow-up email in HubSpot. Configure the follow-up email with the actual guide download link; embedding the form does not configure email delivery.
- Allow the website domain in HubSpot's form settings if required. Verify a real signup and guide-email delivery after deployment.
- Resend is no longer used. The old submission-triggered function has been removed so contact submissions do not also trigger Resend emails. Old Resend environment variables can be removed from hosting settings.
