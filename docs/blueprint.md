# **App Name**: Admissions Edge

## Core Features:

- User Authentication: Secure user login, token refresh, and role-based access control. Supports Super Admin, Marketing Manager, Admission Manager, Finance, and Admission Executive roles.
- Leads Management: Kanban board and data table views for managing leads with click-to-call functionality and filtering. Supports lead creation, status updates, and assignment to admission executives.
- Campaign Management: Create and manage marketing campaigns with budget allocation, asset uploads, and status tracking. Integrates with asset manager for creatives.
- Budget Approvals: Workflow for budget requests and approvals, allowing marketing to create requests and finance to approve/reject. Supports proof of payment uploads and verification.
- Live Call Monitoring: Real-time monitoring of active calls with actions like listen, whisper, barge, and hang up. Accessible to Admission Managers.
- Call History: Table of past calls with recording playback and scoped access based on user role.
- Encrypted Dynamic Routing: Dynamic routing structure to conceal sensitive user data, increase security, and prevent unauthorized data breaches in urls like '/u/:encryptedUserId/portal'.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082) for a professional and trustworthy feel.
- Background color: Light Gray (#F5F5F5), providing a clean and modern backdrop.
- Accent color: Electric Purple (#BF00FF) to highlight key actions and information.
- Headline font: 'Space Grotesk', a sans-serif font with a modern and slightly technical look, ideal for headings. Body font: 'Inter', a grotesque sans-serif providing a neutral and readable feel for all content.
- Lucide React icons for a consistent and modern look across the application.
- Clean and intuitive layout with a sidebar navigation, card-based design for modules, and clear visual hierarchy.
- Subtle transitions and animations for a smooth user experience when navigating and interacting with elements.