# Ghus Meter (घूस Meter)

A transparency and accountability tool for tracking and reporting corruption.

## Live Project

The application is deployed and accessible at:

[https://hack-a-week-2026.vercel.app/](https://hack-a-week-2026.vercel.app/)

### Note on Data
The current deployment at [hack-a-week-2026.vercel.app](https://hack-a-week-2026.vercel.app/) uses mock data. The reports, maps, and statistics displayed are for demonstration purposes.

## Overview

Ghus Meter is a platform for collecting reports on delays and bribes in public and private sector institutions. Citizens can submit anonymous reports of bribes paid for services, creating a geographic record of corruption patterns to inform the public and authorities about areas with systemic issues.

## Features

* **Anonymous Reporting:** Report incidents without personal identification.
* **Geographic Visualization:** Map reports by location to identify patterns in specific offices or regions.
* **Statistics Dashboard:** View aggregate data including report counts, average amounts, and common service delays.
* **Public Data:** Reports are publicly available for institutional accountability.

## Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** Tailwind CSS
* **Mapping:** Leaflet.js
* **Database:** [Neon Postgres](https://neon.tech/) (Serverless Postgres)
* **Deployment:** Vercel

## Privacy & Security

* **Identity Protection:** No personal identifying information is collected during reporting.
* **Data Security:** Reports are stored in a relational database with standard data protection measures.

## Contributing

To contribute to this project:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/description`).
3. Commit your changes (`git commit -m 'Description of changes'`).
4. Push to the branch (`git push origin feature/description`).
5. Open a pull request.

## Acknowledgments

Developed during the LOCUS Hack-A-Week 2026 event.
