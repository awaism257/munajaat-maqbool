package org.munajaat.maqbool.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import org.munajaat.maqbool.data.ThemePreference

/**
 * Arabic font family: the bundled Digital Khatt IndoPak font
 * (assets/fonts/DigitalKhattIndoPak.otf, SIL Open Font License 1.1 —
 * see assets/fonts/OFL-DigitalKhattIndoPak.txt) with the bundled Amiri font
 * (assets/fonts/Amiri-Regular.ttf — see assets/fonts/OFL.txt) as per-glyph
 * fallback for characters Digital Khatt lacks (e.g. U+060C, U+002E).
 * Falls back to the system font if the bundled fonts cannot be loaded.
 */
@Composable
fun arabicFontFamily(): FontFamily {
    val assets = LocalContext.current.assets
    return remember {
        runCatching {
            FontFamily(
                Font("fonts/DigitalKhattIndoPak.otf", assets),
                Font("fonts/Amiri-Regular.ttf", assets)
            )
        }.getOrDefault(FontFamily.Default)
    }
}

/**
 * Urdu font family: the bundled Noto Nastaliq Urdu font
 * (assets/fonts/NotoNastaliqUrdu-Regular.ttf, SIL Open Font License 1.1 —
 * see assets/fonts/OFL-NotoNastaliqUrdu.txt) when it can be loaded,
 * otherwise the system font.
 */
@Composable
fun urduFontFamily(): FontFamily {
    val assets = LocalContext.current.assets
    return remember {
        runCatching { FontFamily(Font("fonts/NotoNastaliqUrdu-Regular.ttf", assets)) }
            .getOrDefault(FontFamily.Default)
    }
}

@Composable
fun MunajaatTheme(
    themePreference: ThemePreference = ThemePreference.SYSTEM,
    content: @Composable () -> Unit
) {
    val dark = when (themePreference) {
        ThemePreference.SYSTEM -> isSystemInDarkTheme()
        ThemePreference.LIGHT -> false
        ThemePreference.DARK -> true
    }
    MaterialTheme(
        colorScheme = if (dark) DarkColors else LightColors,
        typography = Typography(),
        content = content
    )
}
