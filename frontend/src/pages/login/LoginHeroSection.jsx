/**
 * ./pages/login/LoginHeroSection.jsx
 *
 * Static marketing/branding section displayed on the left side of the login page.
 * Provides responsive headings and descriptive text.
 *
 * Dependencies:
 * - None beyond
 */

export default function LoginHeroSection() {
    return (
        <section className="pt-8 pl-8 pr-8 pb-3 md:p-10 text-left">
            {/* Mobile-only brand header */}
            <h1 className="font-bold text-primary mb-10 mt-5 text-xl sm:text-2xl md:text-3xl block md:hidden">
                Book<span className="text-secondary">Atlas</span>
            </h1>

            {/* Hero message line 1 */}
            <h1 className="text-primary text-3xl sm:text-4xl md:text-5xl font-bold">
                Map your
            </h1>

            {/* Hero message line 2 */}
            <h1 className="text-secondary text-3xl sm:text-4xl md:text-5xl font-bold">
                reading world.
            </h1>

            {/* Desktop-only supporting text */}
            <h2 className="hidden md:block text-tertiary text-base md:text-lg max-w-xs mt-4">
                Step back into the space where your books, your thoughts, and your
                community come together. Continue building the library that grows with you.
            </h2>
        </section>
    );
}