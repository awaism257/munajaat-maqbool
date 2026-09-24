package org.munajaat.maqbool.data

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

/** Thrown when the bundled content asset is missing or invalid. */
class ContentException(message: String, cause: Throwable? = null) : Exception(message, cause)

/**
 * Loads and validates the offline content asset
 * `assets/content/munajaat.json`, parsing exactly the contract in SPEC.md.
 */
class ContentRepository(private val appContext: Context) {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = false
    }

    /**
     * @throws ContentException if the asset is missing, cannot be parsed, or
     * fails structural validation.
     */
    suspend fun load(): Content = withContext(Dispatchers.IO) {
        val text = try {
            appContext.assets.open(ASSET_PATH).bufferedReader(Charsets.UTF_8).use { it.readText() }
        } catch (e: Exception) {
            throw ContentException(
                "Bundled content '$ASSET_PATH' is not available. " +
                    "Rebuild the app with app/src/main/assets/content/munajaat.json " +
                    "(see assets/content/munajaat.sample.json for the expected format).",
                e
            )
        }
        val content = try {
            json.decodeFromString(Content.serializer(), text)
        } catch (e: Exception) {
            throw ContentException("Content file '$ASSET_PATH' is not valid per the data contract.", e)
        }
        validate(content)
        content
    }

    private fun validate(content: Content) {
        if (content.days.size != 7) {
            throw ContentException("Expected exactly 7 days, found ${content.days.size}.")
        }
        content.days.forEachIndexed { index, day ->
            if (day.id != EXPECTED_DAY_IDS[index]) {
                throw ContentException(
                    "Day ${index + 1} must be '${EXPECTED_DAY_IDS[index]}', found '${day.id}'."
                )
            }
            if (day.items.isEmpty()) {
                throw ContentException("Day '${day.id}' has no items.")
            }
            day.items.forEachIndexed { i, item ->
                if (item.n != i + 1) {
                    throw ContentException(
                        "Day '${day.id}': item numbers must be sequential from 1; " +
                            "expected ${i + 1}, found ${item.n}."
                    )
                }
                if (item.arabic.isBlank() || item.english.isBlank()) {
                    throw ContentException(
                        "Day '${day.id}' item ${item.n}: arabic and english must be non-empty."
                    )
                }
            }
        }
    }

    companion object {
        const val ASSET_PATH = "content/munajaat.json"
    }
}
