import Link from "next/link";

export const metadata = { title: "Privacy Policy | Game Ranker" };

const CONTACT_EMAIL = "jadenlabs@proton.me";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-mono text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4 text-sm leading-relaxed">
      <div>
        <h1 className="font-mono text-xl font-bold">Privacy Policy</h1>
        <p className="mt-1 text-muted">Effective date: July 5, 2026</p>
      </div>

      <Section title="Overview">
        <p>
          Game Ranker (the &quot;service&quot;), available at
          ranker.jadenlabs.me, lets you build a ranked list of your favorite
          games, share it on a public profile, and compare it with other
          players. This policy explains what information the service collects,
          why, and what your choices are. If you have any questions, contact{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section title="Information we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Account details.</strong> Your email address, display name,
            and username. If you sign up with email and password, the password
            is stored only as a salted hash, never in plain text.
          </li>
          <li>
            <strong>Sign-in providers.</strong> If you sign in with Google or
            Discord, we receive your name, email address, and profile picture
            as shared by that provider. We do not receive or request anything
            else from those accounts.
          </li>
          <li>
            <strong>Your content.</strong> The game rankings you create.
          </li>
          <li>
            <strong>Technical data.</strong> Session records include your IP
            address and browser user agent, kept for account security. Rate
            limiting counters are kept to prevent abuse. Our hosting providers
            keep standard server logs.
          </li>
          <li>
            <strong>Game searches.</strong> When you search for a game, the
            search text is sent to the IGDB API (operated by Twitch) to return
            results. We do not store your search queries.
          </li>
        </ul>
      </Section>

      <Section title="How we use information">
        <p>
          We use this information only to operate the service: signing you in,
          showing your public profile, preventing abuse, and keeping the
          service secure. We do not sell personal information, show
          advertising, or use third party analytics or tracking.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          The service uses essential cookies only, to keep you signed in.
          There are no tracking or advertising cookies.
        </p>
      </Section>

      <Section title="What is public">
        <p>
          Your username and your game ranking are public and visible to anyone
          who visits your profile page. Your email address and sign-in details
          are never shown publicly.
        </p>
      </Section>

      <Section title="Service providers">
        <p>
          The service runs on infrastructure from a small number of providers,
          each of which processes only what is needed to provide their part:
          Vercel (web hosting), Neon (database hosting on AWS in the United
          States), Google and Discord (optional sign-in), and Twitch/IGDB
          (game data and cover images). Data is processed and stored in the
          United States.
        </p>
      </Section>

      <Section title="Data retention and deletion">
        <p>
          Your information is kept for as long as your account exists. You can
          delete your account at any time from the My Top 10 page, which
          permanently removes your account, sessions, sign-in connections, and
          rankings. You can also request deletion by email.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can access, correct, or delete your personal information. We
          honor these rights for all users regardless of location, including
          rights under the GDPR and the CCPA. To exercise a right that is not
          available in the app, contact{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section title="Children">
        <p>
          The service is not directed to children under 13, and you must be at
          least 13 to create an account. If we learn that a child under 13 has
          created an account, we will delete it.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If this policy changes, the updated version will be posted on this
          page with a new effective date.
        </p>
      </Section>

      <p className="border-t border-edge pt-4 text-muted">
        See also the{" "}
        <Link href="/terms" className="text-accent hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
