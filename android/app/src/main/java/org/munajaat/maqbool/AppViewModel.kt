package org.munajaat.maqbool

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.munajaat.maqbool.data.Content
import org.munajaat.maqbool.data.ContentRepository
import org.munajaat.maqbool.data.PrefsRepository
import org.munajaat.maqbool.data.ThemePreference
import org.munajaat.maqbool.data.UserPrefs

/** UI state for the content asset. */
sealed interface ContentState {
    data object Loading : ContentState
    data class Ready(val content: Content) : ContentState
    data class Error(val message: String) : ContentState
}

data class SearchResult(
    val dayId: String,
    val dayTitle: String,
    val itemN: Int,
    val arabic: String,
    val english: String
)

class AppViewModel(application: Application) : AndroidViewModel(application) {

    private val contentRepository = ContentRepository(application)
    private val prefsRepository = PrefsRepository(application)

    private val _contentState = MutableStateFlow<ContentState>(ContentState.Loading)
    val contentState: StateFlow<ContentState> = _contentState

    val prefs: StateFlow<UserPrefs> = prefsRepository.prefs
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), UserPrefs())

    init {
        reload()
    }

    fun reload() {
        viewModelScope.launch {
            _contentState.value = ContentState.Loading
            _contentState.value = try {
                ContentState.Ready(contentRepository.load())
            } catch (e: Exception) {
                ContentState.Error(e.message ?: "Failed to load content.")
            }
        }
    }

    /**
     * Normalize Arabic/Urdu text for forgiving search matching: strips harakat
     * (diacritics), tatweel, and unifies letter variants (أإآ→ا, ة→ه, ى→ي,
     * Urdu ی→ي, ک→ك, ہ/ھ→ه). The stored/displayed text is never modified —
     * this runs in memory only, on both the query and the content.
     */
    private fun normalizeArabicUrdu(s: String): String {
        val b = StringBuilder(s.length)
        for (ch in s) {
            when (ch) {
                in '؋'..'ؚ', in 'ۖ'..'ۭ', 'ٰ', 'ـ' -> Unit // strip harakat, quranic marks, tatweel
                'أ', 'إ', 'آ', 'ٱ' -> b.append('ا')
                'ة' -> b.append('ه')
                'ى' -> b.append('ي')
                'ی', 'ے' -> b.append('ي')
                'ک' -> b.append('ك')
                'ہ', 'ھ', 'ۃ' -> b.append('ه')
                'ؤ' -> b.append('و')
                'ئ' -> b.append('ي')
                else -> b.append(ch)
            }
        }
        return b.toString()
    }

    fun search(query: String): List<SearchResult> {
        val q = query.trim()
        if (q.isEmpty()) return emptyList()
        val content = (_contentState.value as? ContentState.Ready)?.content ?: return emptyList()
        val qLower = q.lowercase()
        val qNorm = normalizeArabicUrdu(q)
        return buildList {
            for (day in content.days) {
                for (item in day.items) {
                    if (item.english.lowercase().contains(qLower) ||
                        normalizeArabicUrdu(item.arabic).contains(qNorm) ||
                        normalizeArabicUrdu(item.urdu).contains(qNorm)
                    ) {
                        add(
                            SearchResult(
                                dayId = day.id,
                                dayTitle = day.title,
                                itemN = item.n,
                                arabic = item.arabic,
                                english = item.english
                            )
                        )
                    }
                }
            }
        }
    }

    fun isBookmarked(dayId: String, itemN: Int): Boolean =
        PrefsRepository.bookmarkKey(dayId, itemN) in prefs.value.bookmarks

    fun toggleBookmark(dayId: String, itemN: Int) {
        viewModelScope.launch {
            prefsRepository.toggleBookmark(PrefsRepository.bookmarkKey(dayId, itemN))
        }
    }

    fun setArabicFontScale(scale: Float) =
        viewModelScope.launch { prefsRepository.setArabicFontScale(scale) }

    fun setEnglishFontScale(scale: Float) =
        viewModelScope.launch { prefsRepository.setEnglishFontScale(scale) }

    fun setUrduFontScale(scale: Float) =
        viewModelScope.launch { prefsRepository.setUrduFontScale(scale) }

    fun setTheme(theme: ThemePreference) =
        viewModelScope.launch { prefsRepository.setTheme(theme) }

    fun setShowEnglish(show: Boolean) =
        viewModelScope.launch { prefsRepository.setShowEnglish(show) }

    fun setShowUrdu(show: Boolean) =
        viewModelScope.launch { prefsRepository.setShowUrdu(show) }

    fun setShowTransliteration(show: Boolean) =
        viewModelScope.launch { prefsRepository.setShowTransliteration(show) }

    fun setTransliterationFontScale(scale: Float) =
        viewModelScope.launch { prefsRepository.setTransliterationFontScale(scale) }

    fun setArabicLineSpacing(scale: Float) =
        viewModelScope.launch { prefsRepository.setArabicLineSpacing(scale) }
}
