import { ActiveMilestone } from './ActiveMilestone/ActiveMilestone';
import styles from './CurrentMilestone.module.css';



export function CurrentMilestone() {
    return (
        <div className={styles.currentMilestoneContainer}>
            <p className={styles.currentMilestoneText}>Current Milestone</p>
            <div className={styles.milestones}>

                <div className={styles.milestoneItem}> 
                    <div className='flex items-center gap-2 text-gray-500 text-sm'>
                        <div className='iconPlaceholder'/>
                        <div>Previous</div>
                    </div>
                    <p className={styles.milestoneItemDescription}>Kickoff Meeting Completed</p>
                    <p className={styles.milestoneItemDate}>Oct 15, 2025</p>
                </div>

                <ActiveMilestone />

                <div className={styles.milestoneItem}> 
                    <div className='flex items-center gap-2 text-gray-500 text-sm'>
                        <div className='iconPlaceholder'/>
                        <div>Next</div>
                    </div>
                    <p className={styles.milestoneItemDescription}>Development Sprint 1</p>
                    <p className={styles.milestoneItemDate}>Oct 25, 2025</p>
                </div>
                
            </div>
        </div>
    );
}
