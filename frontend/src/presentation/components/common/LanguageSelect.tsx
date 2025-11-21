import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LANGUAGES } from '#constants/languages';
import MenuDropdown from './MenuDropdown/MenuDropdown';

/**
 * Language selector dropdown
 * Refactored from native select to centralized MenuDropdown component
 */
export default function LanguageSelect() {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);

    const handleLanguageChange = (languageCode: string) => {
        setLanguage(languageCode);
        i18n.changeLanguage(languageCode);
    };

    const menuItems = LANGUAGES.map(({ code, label }) => ({
        type: 'button' as const,
        label,
        onClick: () => handleLanguageChange(code),
    }));

    const currentLanguageLabel =
        LANGUAGES.find(({ code }) => code === language)?.label || language;

    return (
        <MenuDropdown
            trigger={<span>{currentLanguageLabel}</span>}
            items={menuItems}
            align="right"
        />
    );
}
