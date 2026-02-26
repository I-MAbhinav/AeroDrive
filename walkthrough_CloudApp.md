# Walkthrough: AWS Cloud Storage Application

We successfully built a modern, highly interactive Cloud Storage application (like Google Drive) using **React** and **AWS Amplify**. 

## What We Accomplished
1. **Frontend Architecture**: Initialized a highly responsive Single Page Application using Vite + React with a custom *Glassmorphism* CSS design system.
2. **Authentication (Cognito)**: Integrated Amazon Cognito to handle secure user sign-ups, email verification, and logins.
3. **Cloud Storage (S3)**: Configured private AWS S3 buckets where users can securely upload, download, and delete their files.
4. **Metadata & Folders (DynamoDB)**: Implemented an AWS AppSync GraphQL API with DynamoDB to track files and allow users to create deeply nested hierarchical folders.
5. **Modern UI Polish**: Added loading spinners, button disabling during uploads, and smooth cascading fade-in animations for the file grid.

### Verification Results
- **Authentication**: Verified user pools correctly require email validation before granting access.
- **Upload Flow**: Verified files are sent to S3 using private, user-specific path prefixes (`private/{identityId}/...`).
- **Dynamic Folders**: Verified DynamoDB correctly handles parent-child folder paths and renders Breadcrumbs for easy sub-folder navigation.

This serverless architecture is highly scalable and ready for production usage on AWS!
