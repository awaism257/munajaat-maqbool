package org.munajaat.maqbool.data

import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** Verifies the model parses exactly the SPEC data contract. */
class ContentParseTest {

    private val json = Json { ignoreUnknownKeys = true }

    private val sample = """
    {
      "version": 1,
      "title": "Munajaat-e-Maqbool",
      "days": [
        {
          "id": "saturday",
          "title": "Saturday",
          "items": [
            { "n": 1, "arabic": "بِسْمِ اللَّهِ", "english": "In the name of Allah", "footnotes": ["note"] }
          ]
        }
      ]
    }
    """.trimIndent()

    @Test
    fun parsesContract() {
        val content = json.decodeFromString(Content.serializer(), sample)
        assertEquals(1, content.version)
        assertEquals("Munajaat-e-Maqbool", content.title)
        assertEquals(1, content.days.size)
        val day = content.days[0]
        assertEquals("saturday", day.id)
        assertEquals(1, day.items.size)
        val item = day.items[0]
        assertEquals(1, item.n)
        assertTrue(item.arabic.isNotBlank())
        assertTrue(item.english.isNotBlank())
        assertEquals(listOf("note"), item.footnotes)
    }

    @Test
    fun footnotesDefaultToEmpty() {
        val withoutFootnotes = sample.replace(", \"footnotes\": [\"note\"]", "")
        val content = json.decodeFromString(Content.serializer(), withoutFootnotes)
        assertTrue(content.days[0].items[0].footnotes.isEmpty())
    }

    @Test
    fun urduDefaultsToEmptyWhenAbsent() {
        val content = json.decodeFromString(Content.serializer(), sample)
        assertEquals("", content.days[0].items[0].urdu)
    }

    @Test
    fun urduParsedWhenPresent() {
        val withUrdu = sample.replace(
            "\"english\": \"In the name of Allah\"",
            "\"english\": \"In the name of Allah\", \"urdu\": \"اللہ کے نام سے\""
        )
        val content = json.decodeFromString(Content.serializer(), withUrdu)
        assertEquals("اللہ کے نام سے", content.days[0].items[0].urdu)
    }

    @Test
    fun bookmarkKeyFormat() {
        assertEquals("friday:13", PrefsRepository.bookmarkKey("friday", 13))
    }

    @Test
    fun expectedDayOrder() {
        assertEquals(
            listOf("saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"),
            EXPECTED_DAY_IDS
        )
    }
}
