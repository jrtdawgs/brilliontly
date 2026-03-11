export const metadata = {
  title: 'Contact Us - Brilliontly',
  description: 'Get in touch with the Brilliontly team.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-400 mb-8">
          Have questions or need support? Reach out and we will get back to you.
        </p>
        <a
          href="mailto:jrtdawgs@gmail.com"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Email Us
        </a>
        <p className="text-gray-500 mt-6 text-sm">jrtdawgs@gmail.com</p>
      </div>
    </div>
  );
}
