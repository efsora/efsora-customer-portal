import { MilestoneList } from '#components/timeline/MilestoneList/MilestoneList';
import PageTitle from '#presentation/components/common/PageTitle/PageTitle';

export default function Timeline() {
    return (
        <div>
            <PageTitle
                title="Timeline"
                description="Track milestones and events in chronological order."
            />
            <MilestoneList />
        </div>
    );
}
