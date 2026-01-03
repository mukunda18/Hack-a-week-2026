import PageHeader from '../components/common/PageHeader';
import ContentSection from '../components/common/ContentSection';

export default function About() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <PageHeader title="About Ghush-Meter">
                <p className="text-gray-700 mb-5 text-lg">
                    <strong>Ghush-Meter</strong> is a civic technology platform designed
                    to visualize and analyze public perceptions of corruption in
                    government offices. The platform allows citizens to anonymously
                    report experiences involving unofficial payments during public
                    service delivery.
                </p>
            </PageHeader>

            <ContentSection>
                <p>
                    Rather than focusing on individuals, Ghush-Meter highlights
                    <strong> locations, service types, and recurring patterns</strong>.
                    By aggregating reports, the platform helps identify offices where
                    corruption is frequently perceived, encouraging transparency,
                    public awareness, and data-driven governance reforms.
                </p>
            </ContentSection>

            <ContentSection title="How Ghush-Meter Works">
                <p>
                    Ghush-Meter operates on a simple, privacy-focused, and anonymous
                    reporting model:
                </p>

                <ol className="list-decimal list-inside text-gray-700 mb-5 space-y-3 pl-4">
                    <li>
                        <strong>Anonymous Submission:</strong> Users submit reports
                        describing the office location, type of service, and the
                        approximate amount of unofficial payment requested or paid.
                        No personal identity, login, or device information is stored.
                    </li>

                    <li>
                        <strong>Location Mapping:</strong> Each report is associated
                        with a geographic location. Reports are aggregated per office
                        and displayed on an interactive map for easy visualization.
                    </li>

                    <li>
                        <strong>Data Aggregation:</strong> Multiple submissions for
                        the same office are combined to calculate a relative
                        corruption intensity score. Individual reports are never
                        shown separately.
                    </li>

                    <li>
                        <strong>Heatmap Visualization:</strong> Offices with higher
                        report frequency or higher average amounts appear more
                        prominently on the map, allowing users to identify high-risk
                        locations at a glance.
                    </li>

                    <li>
                        <strong>Public Awareness:</strong> Aggregated data can be used
                        by citizens, researchers, and policymakers to understand
                        trends and promote accountability.
                    </li>
                </ol>
            </ContentSection>

            <ContentSection title="Data Ethics & Limitations">
                <p>
                    All information on Ghush-Meter is user-reported and reflects
                    public perception, not verified legal evidence. The platform does
                    not name individuals or make legal accusations.
                </p>

                <p>
                    Ghush-Meter is developed as an academic and social innovation
                    initiative, intended to support ethical governance, transparency,
                    and informed discussion through technology.
                </p>
            </ContentSection>
        </div>
    );
}
