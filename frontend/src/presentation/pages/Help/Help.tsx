import PageTitle from "#presentation/components/common/PageTitle/PageTitle";
import styles from './Help.module.css';

export function Help() {
    return (
        <>
            <PageTitle title="Help & Support" description="Find answers and contact our support team." />
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.title}>Frequently Asked Questions</div>
                    <div className={styles.subtitle}>Quick answers to common questions about Efsora</div>
                </div>

                <div className={styles.part}>
                    <div className={styles.icon}>
                        <img src="/help/getting-started.svg" alt="getting-started" />
                    </div>
                    <div>Getting Started</div>
                </div>
                <div className={styles.questions}>
                    <div>
                        <div className={styles.question}>
                            What is the Efsora Customer Portal?
                        </div>
                        <div className={styles.answer}>
                            The Efsora Customer Portal is your company’s secure workspace for tracking all ongoing projects with Efsora. It provides real-time visibility into progress, milestones, documents, and invoices all in one organized place. The portal collects scattered emails and spreadsheets to a single, intelligent source of truth.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            How do I invite team members to a project?
                        </div>
                        <div className={styles.answer}>
                            Navigate to the Dashboard from the sidebar menu. Your dashboard displays all active projects, their health status, progress, and key metrics. You can filter projects by status and health using the dropdown filters.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            Can multiple team members from my company use the portal?
                        </div>
                        <div className={styles.answer}>
                            Yes. You can forward us the email addresses of the members you want to add and we will define new profiles with their credentials. 
                        </div>
                    </div>
                </div>

                <div className={styles.part}>
                    <div className={styles.icon}>
                        <img src="/help/projects-and-timeline.svg" alt="projects-and-timeline" />
                    </div>
                    <div>Projects & Timeline</div>
                </div>
                <div className={styles.questions}>
                    <div>
                        <div className={styles.question}>
                            How often are project statuses updated?
                        </div>
                        <div className={styles.answer}>
                            Each task is handled by our talented team. We share our progress on the dashboard as new updated emerge.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            How can I view all my active and completed projects?
                        </div>
                        <div className={styles.answer}>
                            Under the Efsora Labs logo, you can locate your company and the project you are currently viewing. Click on the downward arrow and select your desired project from the dropdown menu. If you don’t see your project there, please contact with us.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            Can I see who’s working on my project?
                        </div>
                        <div className={styles.answer}>
                            Yes, certainly. Go to Your Team tab to see both your company team and Efsora Labs team who are working on the selected project. You can see who is working on which role and what milestone task.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            How are milestones defined and tracked?
                        </div>
                        <div className={styles.answer}>
                            As we agree on Statement of Work documents on each step, we are pulling the milestones from the signed documents.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            Can I request changes or new tasks directly through the portal?
                        </div>
                        <div className={styles.answer}>
                            No. We are working on that.
                        </div>
                    </div>
                </div>
              
               <div className={styles.part}>
                    <div className={styles.icon}>
                        <img src="/help/documents-and-files.svg" alt="documents-and-files" />
                    </div>
                    <div>Documents & Files</div>
                </div>
                <div className={styles.questions}>
                    <div>
                        <div className={styles.question}>
                            Can I upload or share documents with the Efsora team?
                        </div>
                        <div className={styles.answer}>
                            No. We are working on that. For now, please upload documents to the shared Google Drive, Notion, or other designated location and we will receive them from those platforms.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            Are files version-controlled (can I see older versions)?
                        </div>
                        <div className={styles.answer}>
                            Yes. Please select the version you want to view.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            How long do completed project files remain available?
                        </div>
                        <div className={styles.answer}>
                            After we archive the project, you may still see the documents from the designated platform where we shared them.
                        </div>
                    </div>
                </div>

                <div className={styles.part}>
                    <div className={styles.icon}>
                        <img src="/help/billing-and-invoices.svg" alt="billing-and-invoices" />
                    </div>
                    <div>Billing & Invoices</div>
                </div>
                <div className={styles.questions}>
                    <div>
                        <div className={styles.question}>
                            Where can I view my invoices and payment history?
                        </div>
                        <div className={styles.answer}>
                            Go to documents page and select the billing tab. You can see the past and upcoming invoices and paid info.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            Who should I contact for billing or contract questions?
                        </div>
                        <div className={styles.answer}>
                            Please contact your project manager or email billing@efsora.com for assistance.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            Will I receive an email when a new invoice is issued?
                        </div>
                        <div className={styles.answer}>
                            Yes. Please make sure you are not disabling the billing notifications. Check the settings page.
                        </div>
                    </div>
                </div>

                <div className={styles.part}>
                    <div className={styles.icon}>
                        <img src="/help/security-and-privacy.svg" alt="security-and-privacy" />
                    </div>
                    <div>Security & Privacy</div>
                </div>
                <div className={styles.questions}>
                    <div>
                        <div className={styles.question}>
                            How does Efsora protect my company’s data?
                        </div>
                        <div className={styles.answer}>
                            Yes, please read our privacy policy for more information.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            Is my information shared with any third parties?
                        </div>
                        <div className={styles.answer}>
                            No, please read our privacy policy for more information.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            Who can access my company’s files within Efsora?
                        </div>
                        <div className={styles.answer}>
                            Only the employees who are working on your project can see your shared assets. Legal and billing documents are intended for management view only. To learn more, please read our privacy policy.
                        </div>
                    </div>
                </div>

                <div className={styles.part}>
                    <div className={styles.icon}>
                        <img src="/help/account-management.svg" alt="account-management" />
                    </div>
                    <div>Account Management</div>
                </div>
                <div className={styles.questions}>
                    <div>
                        <div className={styles.question}>
                            I forgot my password. How can I reset it?
                        </div>
                        <div className={styles.answer}>
                            Please contact your project manager.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            How do I invite or remove team members from my company?
                        </div>
                        <div className={styles.answer}>
                            Please forward their contact information to your project manager.
                        </div>
                    </div>
                    <div>
                        <div className={styles.question}>
                            How can I change my profile details or contact info?
                        </div>
                        <div className={styles.answer}>
                            You can contact us with the changes. You can change your password from the settings page.
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}