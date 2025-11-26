import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LANGUAGES } from '#constants/languages';

/**
 * Language selector dropdown
 * Refactored from native select to shadcn DropdownMenu component
 */
export default function LanguageSelect() {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);

    const handleLanguageChange = (languageCode: string) => {
        setLanguage(languageCode);
        i18n.changeLanguage(languageCode);
    };

    const currentLanguageLabel =
        LANGUAGES.find(({ code }) => code === language)?.label || language;

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <span style={{ cursor: 'pointer' }}>{currentLanguageLabel}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {LANGUAGES.map(({ code, label }) => (
                    <DropdownMenuItem
                        key={code}
                        onSelect={() => handleLanguageChange(code)}
                    >
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
