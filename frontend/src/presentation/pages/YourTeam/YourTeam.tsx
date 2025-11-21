import PageTitle from '#presentation/components/common/PageTitle/PageTitle';
import Tag from '#presentation/components/common/Tag/Tag';

import styles from './YourTeam.module.css';

type TagStatus =
    | 'management'
    | 'product'
    | 'legal'
    | 'financial'
    | 'dev'
    | 'testing';

interface TeamMemberData {
    name: string;
    email: string;
    initials: string;
    role: TagStatus;
    project: string;
}

interface TeamMemberProps {
    member: TeamMemberData;
}

// Color mapping for each role to match tag background colors
const getRoleBackgroundColor = (role: TagStatus): string => {
    const colorMap: Record<TagStatus, string> = {
        management: 'var(--color-neutral-grey-800)',
        product: 'var(--color-primary-800)',
        legal: 'var(--color-error-900)',
        financial: 'var(--color-success-700)',
        dev: 'var(--color-info-700)',
        testing: 'var(--color-info-900)',
    };
    return colorMap[role];
};

// Text color mapping for better contrast on different backgrounds
const getRoleTextColor = (role: TagStatus): string => {
    const textColorMap: Record<TagStatus, string> = {
        management: 'var(--color-neutral-grey-300)',
        product: 'var(--color-primary-100)',
        legal: 'var(--color-error-100)',
        financial: 'var(--color-success-100)',
        dev: 'var(--color-info-100)',
        testing: 'var(--color-info-100)',
    };
    return textColorMap[role];
};

function TeamMember({ member }: TeamMemberProps) {
    const ppStyle = {
        backgroundColor: getRoleBackgroundColor(member.role),
        color: getRoleTextColor(member.role),
    };

    return (
        <div className={`container ${styles.teamMemberContainer}`}>
            <div className={styles.topContainer}>
                <div className={styles.pp} style={ppStyle}>
                    {member.initials}
                </div>
                <div>
                    <div className={styles.name}>{member.name}</div>
                    <div className={styles.email}>{member.email}</div>
                    <div className="flex pt-4">
                        <Tag status={member.role} />
                    </div>
                </div>
            </div>

            <div>
                <div className={styles.workingOn}>Working on:</div>
                <div className={styles.project}>{member.project}</div>
            </div>
        </div>
    );
}

// Team data lists
const efsoraTeamList: TeamMemberData[] = [
    {
        name: 'Ceren Cinar',
        email: 'ceren@efsora.com',
        initials: 'CC',
        role: 'dev',
        project: 'Low Fidelity Prototype Design',
    },
    {
        name: 'Sarah Johnson',
        email: 'sarah@efsora.com',
        initials: 'SJ',
        role: 'product',
        project: 'User Research & Analysis',
    },
    {
        name: 'Michael Chen',
        email: 'michael@efsora.com',
        initials: 'MC',
        role: 'dev',
        project: 'API Integration',
    },
    {
        name: 'Emma Williams',
        email: 'emma@efsora.com',
        initials: 'EW',
        role: 'testing',
        project: 'QA & Testing',
    },
    {
        name: 'Alex Rodriguez',
        email: 'alex@efsora.com',
        initials: 'AR',
        role: 'management',
        project: 'Project Management',
    },
    {
        name: 'Lisa Anderson',
        email: 'lisa@efsora.com',
        initials: 'LA',
        role: 'dev',
        project: 'Frontend Development',
    },
    {
        name: 'James Thompson',
        email: 'james@efsora.com',
        initials: 'JT',
        role: 'product',
        project: 'Feature Planning',
    },
    {
        name: 'Rachel Green',
        email: 'rachel@efsora.com',
        initials: 'RG',
        role: 'legal',
        project: 'Compliance Review',
    },
];

const clientTeamList: TeamMemberData[] = [
    {
        name: 'John Smith',
        email: 'john@client.com',
        initials: 'JS',
        role: 'management',
        project: 'Stakeholder Oversight',
    },
    {
        name: 'Maria Garcia',
        email: 'maria@client.com',
        initials: 'MG',
        role: 'product',
        project: 'Requirements Definition',
    },
    {
        name: 'David Brown',
        email: 'david@client.com',
        initials: 'DB',
        role: 'dev',
        project: 'Technical Specifications',
    },
    {
        name: 'Sophie Martin',
        email: 'sophie@client.com',
        initials: 'SM',
        role: 'product',
        project: 'Design Approval',
    },
    {
        name: 'Thomas Wilson',
        email: 'thomas@client.com',
        initials: 'TW',
        role: 'financial',
        project: 'Budget Allocation',
    },
    {
        name: 'Nina Patel',
        email: 'nina@client.com',
        initials: 'NP',
        role: 'dev',
        project: 'Testing Coordination',
    },
    {
        name: 'Christopher Lee',
        email: 'chris@client.com',
        initials: 'CL',
        role: 'legal',
        project: 'Contract Management',
    },
    {
        name: 'Victoria White',
        email: 'victoria@client.com',
        initials: 'VW',
        role: 'management',
        project: 'Deployment Planning',
    },
];

export function YourTeam() {
    return (
        <div>
            <PageTitle
                title="Your Team"
                description="Connect with your Efsora and client team members."
            />

            <div className={styles.teams}>
                <div className={styles.teamContainer}>
                    <div>
                        <div className={styles.teamTitle}>Efsora Team</div>
                        <div className={styles.teamSubtitle}>
                            Your dedicated project team at Efsora.
                        </div>
                    </div>
                    <div className={styles.team}>
                        {efsoraTeamList.map((member, index) => (
                            <TeamMember key={index} member={member} />
                        ))}
                    </div>
                </div>

                <div className={`container ${styles.teamContainer}`}>
                    <div>
                        <div className={styles.teamTitle}>AllSober Team</div>
                        <div className={styles.teamSubtitle}>
                            Team members from your organization.
                        </div>
                    </div>
                    <div className={styles.team}>
                        {clientTeamList.map((member, index) => (
                            <TeamMember key={index} member={member} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
