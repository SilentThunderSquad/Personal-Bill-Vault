import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Users, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy - Bill Vault';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy Policy for Bill Vault - Learn how we collect, use, and protect your personal information and bill data.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Privacy Policy for Bill Vault - Learn how we collect, use, and protect your personal information and bill data.';
      document.head.appendChild(meta);
    }
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <>
          <p className="mb-4">
            Welcome to Bill Vault ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our bill management and warranty tracking application and related services (collectively, the "Service").
          </p>
          <p className="mb-4">
            Bill Vault is a personal finance management tool that helps you organize bills, track warranties, and manage important documents. We are committed to protecting your privacy and ensuring transparency about our data practices.
          </p>
          <p>
            By using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, do not use our Service.
          </p>
        </>
      )
    },
    {
      id: 'data-collection',
      title: 'Information We Collect',
      icon: <Eye className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Email address (for account creation and authentication)</li>
            <li>Full name (optional, for personalization)</li>
            <li>Profile picture (optional, via Google OAuth)</li>
            <li>Authentication tokens from third-party providers</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bill and Document Data</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Uploaded bill images and documents</li>
            <li>Extracted text data from bills using OCR technology</li>
            <li>Bill metadata (vendor names, amounts, dates, categories)</li>
            <li>Warranty information and expiration dates</li>
            <li>Custom tags and notes you add to bills</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Usage Information</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Application usage patterns and feature interactions</li>
            <li>Device information (browser type, operating system)</li>
            <li>IP address and general location for security purposes</li>
            <li>Login timestamps and session data</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Automatically Collected Data</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Cookies and similar tracking technologies</li>
            <li>Application performance and error logs</li>
            <li>Feature usage analytics to improve our service</li>
          </ul>
        </>
      )
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Information',
      icon: <Users className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Service Provision</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Provide and maintain our bill management service</li>
            <li>Process and store your uploaded documents securely</li>
            <li>Extract text from bills using OCR technology</li>
            <li>Send warranty expiration notifications</li>
            <li>Enable search and categorization of your bills</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Communication</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Send important service updates and notifications</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Notify you of warranty expirations (if enabled)</li>
            <li>Send security alerts for account activity</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Improvement and Analytics</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Analyze usage patterns to improve our service</li>
            <li>Debug issues and optimize application performance</li>
            <li>Develop new features based on user needs</li>
            <li>Ensure security and prevent fraudulent activity</li>
          </ul>
        </>
      )
    },
    {
      id: 'data-storage',
      title: 'Data Storage and Security',
      icon: <Lock className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Storage Infrastructure</h3>
          <p className="mb-4">
            Your data is securely stored using Supabase, a trusted cloud database provider. All data is encrypted in transit using industry-standard SSL/TLS protocols and encrypted at rest using AES-256 encryption.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Security Measures</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Row Level Security (RLS) ensures users can only access their own data</li>
            <li>Multi-factor authentication support for enhanced account security</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Automated backups and disaster recovery procedures</li>
            <li>Strict access controls for administrative functions</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Location</h3>
          <p className="mb-4">
            Your data is primarily stored in secure data centers located in the United States. We ensure that all data handling complies with applicable privacy laws and regulations.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Retention</h3>
          <p>
            We retain your personal information for as long as your account remains active or as needed to provide our services. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain certain information for legal compliance.
          </p>
        </>
      )
    },
    {
      id: 'third-party',
      title: 'Third-Party Services',
      icon: <Globe className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Authentication Providers</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>Google OAuth:</strong> For secure login using your Google account</li>
            <li><strong>GitHub OAuth:</strong> For secure login using your GitHub account (admin users)</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Technology Services</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>Tesseract.js:</strong> OCR processing performed locally in your browser</li>
            <li><strong>Supabase:</strong> Database, authentication, and file storage services</li>
            <li><strong>Vercel:</strong> Application hosting and content delivery</li>
            <li><strong>Google Fonts:</strong> Typography and design elements</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Sharing</h3>
          <p className="mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties, except as described in this policy. We may share information with trusted service providers who assist us in operating our application, conducting our business, or serving our users.
          </p>

          <p>
            All service providers are contractually obligated to keep your information confidential and use it only for the purposes we specify.
          </p>
        </>
      )
    },
    {
      id: 'user-rights',
      title: 'Your Privacy Rights',
      icon: <Shield className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Access and Control</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>View and download all your personal data through your account settings</li>
            <li>Update or correct your personal information at any time</li>
            <li>Delete individual bills or your entire account</li>
            <li>Control notification preferences and privacy settings</li>
            <li>Export your data in common formats before deletion</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Portability</h3>
          <p className="mb-4">
            You have the right to receive your personal data in a structured, commonly used format. You can export your bills, categories, and settings through the application's export feature.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Withdrawal of Consent</h3>
          <p className="mb-4">
            You may withdraw your consent to our processing of your personal data at any time by deleting your account. However, this may limit your ability to use certain features of our service.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">California Privacy Rights (CCPA)</h3>
          <p>
            If you are a California resident, you have additional rights under the California Consumer Privacy Act, including the right to request information about our data practices and the right to opt-out of certain data processing activities.
          </p>
        </>
      )
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      icon: <Globe className="h-5 w-5" />,
      content: (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Essential Cookies</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Authentication tokens to keep you logged in</li>
            <li>Session cookies for application functionality</li>
            <li>Security cookies to prevent fraud and abuse</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preference Cookies</h3>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Theme preferences (dark/light mode)</li>
            <li>Language and localization settings</li>
            <li>User interface customizations</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Analytics</h3>
          <p>
            We use minimal analytics to understand how our application is used and to identify areas for improvement. All analytics data is anonymized and cannot be linked back to individual users.
          </p>
        </>
      )
    },
    {
      id: 'updates',
      title: 'Policy Updates',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <>
          <p className="mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          <p className="mb-4">
            We encourage you to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
          <p>
            If you continue to use our service after any changes become effective, you agree to be bound by the revised Privacy Policy.
          </p>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          {...fadeInUp}
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <Shield className="h-12 w-12 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last Updated: March 20, 2026
          </p>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-indigo-600 dark:text-indigo-400">
                  {section.icon}
                </div>
                <span className="text-gray-700 dark:text-gray-300">{section.title}</span>
              </a>
            ))}
          </nav>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              id={section.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <div className="text-indigo-600 dark:text-indigo-400">
                    {section.icon}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Contact Information */}
        <motion.div
          className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-8 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Email:</strong> privacy@billvault.com
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Subject Line:</strong> "Privacy Policy Inquiry - Bill Vault"
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            We will respond to all privacy-related inquiries within 30 days.
          </p>
        </motion.div>
      </div>
    </div>
  );
}