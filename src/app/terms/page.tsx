import Link from "next/link";

export const metadata = { title: "Terms of Service | Game Ranker" };

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

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4 text-sm leading-relaxed">
      <div>
        <h1 className="font-mono text-xl font-bold">Terms of Service</h1>
        <p className="mt-1 text-muted">Effective date: July 5, 2026</p>
      </div>

      <Section title="Agreement">
        <p>
          These terms are an agreement between you and the operator of Game
          Ranker (&quot;we&quot;), covering your use of the service at
          ranker.jadenlabs.me. By creating an account or using the service you
          agree to these terms and to the{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
          . If you do not agree, do not use the service.
        </p>
      </Section>

      <Section title="The service">
        <p>
          Game Ranker lets you build a ranked list of up to ten favorite
          games, publish it on a public profile page, and compare lists with
          other players. The service is provided free of charge.
        </p>
      </Section>

      <Section title="Accounts">
        <ul className="list-disc space-y-2 pl-5">
          <li>You must be at least 13 years old to create an account.</li>
          <li>
            Provide accurate information and keep your sign-in credentials
            secure. You are responsible for activity on your account.
          </li>
          <li>
            Usernames must not impersonate others, infringe trademarks, or
            contain offensive language.
          </li>
        </ul>
      </Section>

      <Section title="Acceptable use">
        <p>When using the service, you agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>break any law or infringe the rights of others,</li>
          <li>
            attempt to access accounts or data that do not belong to you,
          </li>
          <li>
            interfere with the service, circumvent rate limits, or scrape it
            at scale,
          </li>
          <li>create accounts in bulk or by automated means.</li>
        </ul>
      </Section>

      <Section title="Your content">
        <p>
          Your rankings and username are published publicly as part of the
          service. By saving a ranking you grant us the right to store and
          display it. You can edit or remove your ranking, or delete your
          account entirely, at any time.
        </p>
      </Section>

      <Section title="Game data">
        <p>
          Game titles, release information, and cover artwork are provided by
          the IGDB API and belong to their respective publishers and rights
          holders. They are used for identification only. Rights holders can
          contact us to request removal.
        </p>
      </Section>

      <Section title="Termination">
        <p>
          You can stop using the service or delete your account at any time.
          We may suspend or remove accounts that violate these terms or that
          put the service or its users at risk.
        </p>
      </Section>

      <Section title="Disclaimers">
        <p>
          The service is provided as is, without warranties of any kind. It is
          a free service and availability is not guaranteed; features may
          change and data may be lost. Keep your own record of anything you
          would not want to lose.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, we are not liable for any
          indirect, incidental, or consequential damages arising from your use
          of the service. Our total liability for any claim is limited to the
          amount you paid us in the twelve months before the claim, which is
          zero for this free service.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update these terms. Material changes will be posted on this
          page with a new effective date, and continued use of the service
          after a change means you accept the updated terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of the United States. If a
          provision of these terms is found unenforceable, the remaining
          provisions stay in effect.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
