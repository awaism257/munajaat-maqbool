package org.munajaat.maqbool.data

import kotlinx.serialization.Serializable

/**
 * Data contract for assets/content/munajaat.json (see SPEC.md).
 */
@Serializable
data class Content(
    val version: Int = 1,
    val title: String = "",
    val days: List<Day> = emptyList()
)

@Serializable
data class Day(
    val id: String,
    val title: String,
    val items: List<DuaItem>
)

@Serializable
data class DuaItem(
    val n: Int,
    val arabic: String,
    val english: String,
    val urdu: String = "",
    val transliteration: String = "",
    val footnotes: List<String> = emptyList()
)

/** Ordered day ids per SPEC. */
val EXPECTED_DAY_IDS = listOf(
    "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"
)
