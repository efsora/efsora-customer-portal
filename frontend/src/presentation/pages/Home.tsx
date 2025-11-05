import Counter from '#components/hello/Counter';
import DisplayCount from '#components/hello/DisplayCount';
import SummaryUser from '#components/user/SummaryUser';

export default function Home() {
    return (
        <>
            <SummaryUser />
            <Counter />
            <DisplayCount />
        </>
    );
}
