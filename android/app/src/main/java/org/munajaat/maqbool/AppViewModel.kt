package org.munajaat.maqbool

import android.app.Application
import android.media.AudioAttributes
import android.media.MediaPlayer
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
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

data class AudioPlaybackState(
    val dayId: String? = null,
    val isPlaying: Boolean = false,
    val isBuffering: Boolean = false,
    val currentPositionMs: Int = 0,
    val durationMs: Int = 0
)

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

    /* ================= Audio Player ================= */
    private var mediaPlayer: MediaPlayer? = null
    private var trackerJob: Job? = null
    private val _audioState = MutableStateFlow(AudioPlaybackState())
    val audioState: StateFlow<AudioPlaybackState> = _audioState

    fun toggleAudio(dayId: String) {
        val current = _audioState.value
        if (current.dayId == dayId && mediaPlayer != null) {
            if (current.isPlaying) {
                try { mediaPlayer?.pause() } catch (_: Exception) {}
                _audioState.value = current.copy(isPlaying = false)
            } else {
                try {
                    mediaPlayer?.start()
                    _audioState.value = current.copy(isPlaying = true)
                    startPositionTracker()
                } catch (_: Exception) {}
            }
        } else {
            stopAndReleasePlayer()
            _audioState.value = AudioPlaybackState(dayId = dayId, isBuffering = true)
            try {
                val player = MediaPlayer()
                mediaPlayer = player
                player.setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .build()
                )
                val url = "https://audio.munajaat.app/full/$dayId.mp3"
                player.setDataSource(url)
                player.setOnPreparedListener { mp ->
                    if (mediaPlayer == mp) {
                        try {
                            mp.start()
                            _audioState.value = AudioPlaybackState(
                                dayId = dayId,
                                isPlaying = true,
                                isBuffering = false,
                                currentPositionMs = mp.currentPosition,
                                durationMs = mp.duration
                            )
                            startPositionTracker()
                        } catch (_: Exception) {
                            _audioState.value = AudioPlaybackState()
                        }
                    }
                }
                player.setOnCompletionListener {
                    _audioState.value = AudioPlaybackState(dayId = dayId, isPlaying = false, currentPositionMs = 0, durationMs = player.duration)
                }
                player.setOnErrorListener { _, _, _ ->
                    _audioState.value = AudioPlaybackState()
                    true
                }
                player.prepareAsync()
            } catch (e: Exception) {
                _audioState.value = AudioPlaybackState()
            }
        }
    }

    private fun startPositionTracker() {
        trackerJob?.cancel()
        trackerJob = viewModelScope.launch {
            while (true) {
                delay(500)
                val mp = mediaPlayer
                if (mp != null && _audioState.value.isPlaying) {
                    try {
                        val pos = mp.currentPosition
                        val dur = mp.duration
                        _audioState.value = _audioState.value.copy(
                            currentPositionMs = pos,
                            durationMs = if (dur > 0) dur else _audioState.value.durationMs
                        )
                    } catch (_: Exception) {
                        break
                    }
                } else {
                    break
                }
            }
        }
    }

    private fun stopAndReleasePlayer() {
        trackerJob?.cancel()
        trackerJob = null
        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
        } catch (_: Exception) {}
        mediaPlayer = null
    }

    override fun onCleared() {
        super.onCleared()
        stopAndReleasePlayer()
    }
}
