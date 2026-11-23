export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-orange-600/10 via-rose-500/5 to-transparent py-16 px-8 text-center rounded-3xl border border-orange-500/10 mb-2">
      <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full tracking-wider">
        Global E-Commerce Hub
      </span>
      <h1 className="text-4xl md:text-5xl font-black mt-4 mb-3 tracking-tight">
        Shop Smarter, Live Better
      </h1>
      <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
        Discover millions of items with smart AI recommendations, real-time shipment tracking, and secure merchant checkout.
      </p>
    </section>
  );
}