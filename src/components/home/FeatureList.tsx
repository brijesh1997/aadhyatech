"use client"

export default function FeatureList() {
    const features = [
        {
            number: "01",
            title: "Manage your data efficiently",
            description: "Streamline your data architecture with our advanced management solutions."
        },
        {
            number: "02",
            title: "Built with neat utility features",
            description: "Tools designed to enhance productivity and simplify complex workflows."
        },
        {
            number: "03",
            title: "Futuristic interactive designs",
            description: "Engage your users with state-of-the-art UI/UX patterns."
        }
    ]

    return (
        <section className="py-24 bg-light-50">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {features.map((item, idx) => (
                        <div key={idx} className="group cursor-default">
                            <span className="block text-accent-blue/30 text-6xl font-display font-bold mb-6 transition-colors group-hover:text-accent-blue">
                                {item.number}
                            </span>
                            <h3 className="text-2xl font-display font-bold text-dark-900 mb-4 pr-10">
                                {item.title}
                            </h3>
                            <p className="text-gray-500 font-body leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
