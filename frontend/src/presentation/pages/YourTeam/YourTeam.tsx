import PageTitle from '#presentation/components/common/PageTitle/PageTitle';
import styles from './YourTeam.module.css'
import Tag from '#presentation/components/common/Tag/Tag';

function TeamMember() {
    return (
        <div className={styles.teamMemberContainer}>

            <div className={styles.topContainer}>
                <div className={styles.pp}>CC</div>
                <div>
                    <div className={styles.name}>Ceren Cinar</div>
                    <div className={styles.email}>ceren@company.com</div>
                    <div className='flex pt-4'>
                        <Tag status="dev"/>
                    </div>
                </div>
           
            </div>
         

            <div>
                <div className={styles.workingOn}>Working on:</div>
                <div className={styles.project}>Low Fidelity Prototype Design</div>
            </div>
     
        </div>
    );
}

export function YourTeam() {
    return (
         <div>
            <PageTitle title="Your Team" description='Connect with your Efsora and client team members.'/>

            <div className={styles.teams}>
                <div className={styles.teamContainer}>
                    <div>
                        <div className={styles.teamTitle}>Efsora Team</div>
                        <div className={styles.teamSubtitle}>Your dedicated project team at Efsora.</div>
                    </div>
                    <div className={styles.team}>
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                    </div>
                </div>


                <div className={styles.teamContainer}>
                <div>
                    <div className={styles.teamTitle}>Your Team</div>
                    <div className={styles.teamSubtitle}>Team members from your organization.</div>
                </div>
                    <div className={styles.team}>
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                        <TeamMember />
                    </div>
                </div>
            </div>

          

        </div>
    );
}
