import PageTitle from '#presentation/components/common/PageTitle/PageTitle';
import { CurrentMilestone } from '#presentation/components/dashboard/CurrentMilestone/CurrentMilestone';

export default function Home() {

    return (
        <>
            <PageTitle title="Dashboard" description="Welcome back! Here's an overview of your projects." />
            <CurrentMilestone />
        </>
    );
}
