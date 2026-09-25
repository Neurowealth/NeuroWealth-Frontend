import assert from "node:assert/strict";
import test from "node:test";
import { AppLocale, dictionaries } from "@/lib/i18n/messages";

/**
 * Test suite for i18n system covering locale switching and key consistency
 */

test("i18n: all locales have the same keys as the default locale", () => {
    const enKeys = getDeepKeys(dictionaries.en);
    const frKeys = getDeepKeys(dictionaries.fr);

    // Both should have identical key paths
    assert.deepEqual(
        enKeys.sort(),
        frKeys.sort(),
        "English and French dictionaries must have the same key structure"
    );
});

test("i18n: all locales export non-empty string values", () => {
    const locales: AppLocale[] = ["en", "fr"];

    for (const locale of locales) {
        const dict = dictionaries[locale];
        const emptyKeys: string[] = [];

        walkValues(dict, "", (key, value) => {
            if (typeof value === "string" && value.trim() === "") {
                emptyKeys.push(key);
            }
        });

        assert.equal(
            emptyKeys.length,
            0,
            `${locale}: empty string values found at keys: ${emptyKeys.join(", ")}`
        );
    }
});

test("i18n: locale options match supported locales", () => {
    const supported: AppLocale[] = ["en", "fr"];
    const optionKeys = Object.keys(dictionaries.en.locale.options);

    assert.deepEqual(
        optionKeys.sort(),
        supported.sort(),
        "locale.options must include all supported locales"
    );
});

test("i18n: no missing or extra keys in locale.options", () => {
    for (const locale of ["en", "fr"] as const) {
        const dict = dictionaries[locale];
        const optionKeys = Object.keys(dict.locale.options);

        for (const key of optionKeys) {
            assert.ok(
                key === "en" || key === "fr",
                `${locale}: unexpected locale key '${key}' in locale.options`
            );
        }
    }
});

test("i18n: array types are consistent across locales", () => {
    assert.equal(
        dictionaries.en.hero.stats.length,
        dictionaries.fr.hero.stats.length,
        "hero.stats array length must match"
    );

    assert.equal(
        dictionaries.en.features.items.length,
        dictionaries.fr.features.items.length,
        "features.items array length must match"
    );

    assert.equal(
        dictionaries.en.howItWorks.steps.length,
        dictionaries.fr.howItWorks.steps.length,
        "howItWorks.steps array length must match"
    );

    assert.equal(
        dictionaries.en.strategies.items.length,
        dictionaries.fr.strategies.items.length,
        "strategies.items array length must match"
    );

    assert.equal(
        dictionaries.en.security.items.length,
        dictionaries.fr.security.items.length,
        "security.items array length must match"
    );

    assert.equal(
        dictionaries.en.cta.trust.length,
        dictionaries.fr.cta.trust.length,
        "cta.trust array length must match"
    );
});

test("i18n: object shapes in feature/strategy items are consistent", () => {
    const enFeatures = dictionaries.en.features.items;
    const frFeatures = dictionaries.fr.features.items;

    assert.equal(enFeatures.length, frFeatures.length);

    for (let i = 0; i < enFeatures.length; i++) {
        const enItem = enFeatures[i];
        const frItem = frFeatures[i];

        assert.ok(enItem.icon === frItem.icon, `features[${i}]: icon must match`);
        assert.ok(
            enItem.accent === frItem.accent,
            `features[${i}]: accent must match`
        );
        assert.ok(enItem.bg === frItem.bg, `features[${i}]: bg must match`);
    }
});

test("i18n: dashboard nested objects have required keys", () => {
    const dashboards = [
        dictionaries.en.dashboard.portfolio,
        dictionaries.fr.dashboard.portfolio,
    ];

    for (const dashboard of dashboards) {
        assert.ok(dashboard.overview, "portfolio must have 'overview' key");
        assert.ok(
            dashboard.allocationTitle,
            "portfolio must have 'allocationTitle' key"
        );
        assert.ok(
            dashboard.activityTitle,
            "portfolio must have 'activityTitle' key"
        );
    }
});

test("i18n: settings nested structure consistency", () => {
    const enSettings = dictionaries.en.settings;
    const frSettings = dictionaries.fr.settings;

    // Both should have index and preferences
    assert.ok(enSettings.index, "en settings must have index");
    assert.ok(enSettings.preferences, "en settings must have preferences");
    assert.ok(frSettings.index, "fr settings must have index");
    assert.ok(frSettings.preferences, "fr settings must have preferences");

    // Preferences should have common structure
    const commonKeys = ["title", "subtitle", "savedSuccess", "saveError"];
    for (const key of commonKeys) {
        assert.ok(
            enSettings.preferences[key as keyof typeof enSettings.preferences],
            `en.preferences must have '${key}'`
        );
        assert.ok(
            frSettings.preferences[key as keyof typeof frSettings.preferences],
            `fr.preferences must have '${key}'`
        );
    }
});

test("i18n: dashboard.realtime status keys exist", () => {
    const enStatus = dictionaries.en.dashboard.realtime.status;
    const frStatus = dictionaries.fr.dashboard.realtime.status;

    const statusKeys = ["live", "paused", "idle"];
    for (const key of statusKeys) {
        assert.ok(enStatus[key as keyof typeof enStatus], `en status must have '${key}'`);
        assert.ok(frStatus[key as keyof typeof frStatus], `fr status must have '${key}'`);
    }
});

test("i18n: no placeholder or untranslated markers in strings", () => {
    const locales: AppLocale[] = ["en", "fr"];
    const markers = ["TODO", "FIXME", "PLACEHOLDER", "[untranslated]"];

    for (const locale of locales) {
        const dict = dictionaries[locale];
        const found: string[] = [];

        walkValues(dict, "", (key, value) => {
            if (typeof value === "string") {
                for (const marker of markers) {
                    if (value.includes(marker)) {
                        found.push(`${key}: "${value}"`);
                    }
                }
            }
        });

        assert.equal(
            found.length,
            0,
            `${locale}: found untranslated markers: ${found.join("; ")}`
        );
    }
});

/**
 * Helper: recursively collect all dot-notation keys from an object
 */
function getDeepKeys(obj: unknown, prefix = ""): string[] {
    const keys: string[] = [];

    if (typeof obj !== "object" || obj === null) {
        return keys;
    }

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            keys.push(...getDeepKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys;
}

/**
 * Helper: walk through all values in an object and invoke callback
 */
function walkValues(
    obj: unknown,
    prefix: string,
    callback: (key: string, value: unknown) => void
): void {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
        return;
    }

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
                // For arrays, just skip or check items
                callback(fullKey, value);
            } else {
                walkValues(value, fullKey, callback);
            }
        } else {
            callback(fullKey, value);
        }
    }
}
