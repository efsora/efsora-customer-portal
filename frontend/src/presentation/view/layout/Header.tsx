import LanguageSelect from '#components/common/LanguageSelect';

export default function Header() {
    return (
        <div className="bg-gray-200 flex justify-between items-center p-4">
            <div>Header</div>
            <div className="flex items-center gap-4">
                <LanguageSelect />
            </div>
        </div>
    );
}
