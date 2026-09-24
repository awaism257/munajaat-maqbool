package org.munajaat.maqbool.data

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "settings")

enum class ThemePreference { SYSTEM, LIGHT, DARK }

data class UserPrefs(
    val arabicFontScale: Float = 1.0f,
    val englishFontScale: Float = 1.0f,
    val urduFontScale: Float = 1.0f,
    val arabicLineSpacing: Float = 1.0f,
    val transliterationFontScale: Float = 1.0f,
    val theme: ThemePreference = ThemePreference.SYSTEM,
    val showEnglish: Boolean = true,
    val showUrdu: Boolean = false,
    val showTransliteration: Boolean = false,
    val bookmarks: Set<String> = emptySet()
)

/**
 * Persists user preferences and bookmarks with DataStore Preferences.
 * Bookmarks are stored as "dayId:itemN" keys.
 */
class PrefsRepository(private val appContext: Context) {

    private object Keys {
        val ARABIC_SCALE = floatPreferencesKey("arabic_font_scale")
        val ENGLISH_SCALE = floatPreferencesKey("english_font_scale")
        val URDU_SCALE = floatPreferencesKey("urdu_font_scale")
        val ARABIC_LINE_SPACING = floatPreferencesKey("arabic_line_spacing")
        val TRANSLITERATION_SCALE = floatPreferencesKey("transliteration_font_scale")
        val THEME = stringPreferencesKey("theme")
        val SHOW_ENGLISH = booleanPreferencesKey("show_english")
        val SHOW_URDU = booleanPreferencesKey("show_urdu")
        val SHOW_TRANSLITERATION = booleanPreferencesKey("show_transliteration")
        val BOOKMARKS = stringSetPreferencesKey("bookmarks")
    }

    val prefs: Flow<UserPrefs> = appContext.dataStore.data.map { p ->
        UserPrefs(
            arabicFontScale = p[Keys.ARABIC_SCALE] ?: 1.0f,
            englishFontScale = p[Keys.ENGLISH_SCALE] ?: 1.0f,
            urduFontScale = p[Keys.URDU_SCALE] ?: 1.0f,
            arabicLineSpacing = p[Keys.ARABIC_LINE_SPACING] ?: 1.0f,
            transliterationFontScale = p[Keys.TRANSLITERATION_SCALE] ?: 1.0f,
            theme = p[Keys.THEME]?.let { runCatching { ThemePreference.valueOf(it) }.getOrNull() }
                ?: ThemePreference.SYSTEM,
            showEnglish = p[Keys.SHOW_ENGLISH] ?: true,
            showUrdu = p[Keys.SHOW_URDU] ?: false,
            showTransliteration = p[Keys.SHOW_TRANSLITERATION] ?: false,
            bookmarks = p[Keys.BOOKMARKS] ?: emptySet()
        )
    }

    suspend fun setArabicFontScale(scale: Float) {
        appContext.dataStore.edit { it[Keys.ARABIC_SCALE] = scale.coerceIn(0.8f, 1.6f) }
    }

    suspend fun setEnglishFontScale(scale: Float) {
        appContext.dataStore.edit { it[Keys.ENGLISH_SCALE] = scale.coerceIn(0.8f, 1.6f) }
    }

    suspend fun setUrduFontScale(scale: Float) {
        appContext.dataStore.edit { it[Keys.URDU_SCALE] = scale.coerceIn(0.8f, 1.6f) }
    }

    suspend fun setArabicLineSpacing(scale: Float) {
        appContext.dataStore.edit { it[Keys.ARABIC_LINE_SPACING] = scale.coerceIn(0.8f, 1.6f) }
    }

    suspend fun setTransliterationFontScale(scale: Float) {
        appContext.dataStore.edit { it[Keys.TRANSLITERATION_SCALE] = scale.coerceIn(0.8f, 1.6f) }
    }

    suspend fun setTheme(theme: ThemePreference) {
        appContext.dataStore.edit { it[Keys.THEME] = theme.name }
    }

    suspend fun setShowEnglish(show: Boolean) {
        appContext.dataStore.edit { it[Keys.SHOW_ENGLISH] = show }
    }

    suspend fun setShowUrdu(show: Boolean) {
        appContext.dataStore.edit { it[Keys.SHOW_URDU] = show }
    }

    suspend fun setShowTransliteration(show: Boolean) {
        appContext.dataStore.edit { it[Keys.SHOW_TRANSLITERATION] = show }
    }

    suspend fun toggleBookmark(key: String) {
        appContext.dataStore.edit { p ->
            val current = p[Keys.BOOKMARKS] ?: emptySet()
            p[Keys.BOOKMARKS] = if (key in current) current - key else current + key
        }
    }

    companion object {
        fun bookmarkKey(dayId: String, itemN: Int) = "$dayId:$itemN"
    }
}
