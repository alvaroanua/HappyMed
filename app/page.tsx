import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Never Worry About Your Parents' Medications Again
          </h1>
          <p className={styles.heroSubtitle}>
            MedTracker helps you ensure your elderly loved ones take their medications on time, 
            every time. Get instant notifications when they've taken their pills.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/dashboard" className={styles.primaryButton}>
              Get Started Free
            </Link>
            <Link href="/dashboard" className={styles.secondaryButton}>
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose MedTracker?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📞</div>
              <h3 className={styles.featureTitle}>Automated Calls</h3>
              <p className={styles.featureDescription}>
                Our system automatically calls your parents at scheduled times to remind them 
                about their medications and confirm they've taken them.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>✅</div>
              <h3 className={styles.featureTitle}>Real-Time Tracking</h3>
              <p className={styles.featureDescription}>
                Get instant notifications on your phone when your parents take their medication. 
                See daily status at a glance with our visual pill box tracker.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>Weekly Overview</h3>
              <p className={styles.featureDescription}>
                View a complete week of medication history. See which days they took their pills 
                and which days they missed, all in one simple dashboard.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔔</div>
              <h3 className={styles.featureTitle}>Instant Alerts</h3>
              <p className={styles.featureDescription}>
                Receive immediate popup notifications when your parents confirm they've taken 
                their medication. Peace of mind in real-time.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>👥</div>
              <h3 className={styles.featureTitle}>Multiple Grandparents</h3>
              <p className={styles.featureDescription}>
                Track medications for multiple family members. Each grandparent gets their own 
                schedule and tracking system.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔒</div>
              <h3 className={styles.featureTitle}>Secure & Private</h3>
              <p className={styles.featureDescription}>
                Your family's health information is encrypted and secure. Only you can see 
                your parents' medication data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Sign Up & Add Your Parent</h3>
              <p className={styles.stepDescription}>
                Create your free account and add your parent's information, including their 
                medication name and preferred call time.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>We Call Them Automatically</h3>
              <p className={styles.stepDescription}>
                Our system calls your parent at the scheduled time to remind them about 
                their medication and ask if they've taken it.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>You Get Instant Updates</h3>
              <p className={styles.stepDescription}>
                Receive real-time notifications on your dashboard. See green checkmarks when 
                they've taken their medication, and get alerts if they haven't.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Start Tracking Today</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of families who trust MedTracker to keep their loved ones healthy
          </p>
          <Link href="/dashboard" className={styles.ctaButton}>
            Get Started Free →
          </Link>
        </div>
      </section>
    </main>
  )
}

